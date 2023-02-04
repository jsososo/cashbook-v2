import Imap from 'node-imap';
import { MailParser } from 'mailparser';
import dayjs from 'dayjs';
import fs from 'fs-extra';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Headers, AttachmentStream } from 'mailparser';
import xlsx from 'xlsx';
import path from 'path';
import { decode } from '@utils/private-key';

type EmailUserInfo = {
  user: string;
  password: string;
  host: string;
};

type EmailData = {
  headers?: Headers;
  data?: AttachmentStream;
};

function getMail({ user, password, host }: EmailUserInfo): Promise<EmailData> {
  return new Promise((resolve, reject) => {
    try {
      const imap = new Imap({
        user,
        password,
        host,
        port: 993,
        tls: true,
        authTimeout: 60000,
        connTimeout: 30000,
      });

      const handleErr = (err: Error) => {
        imap.end();
        reject(err);
      };

      imap.once('ready', function () {
        imap.openBox('INBOX', true, function (err: Error) {
          if (err) {
            return reject(err);
          }
          const dateCount = 30;
          const startDate = dayjs()
            .subtract(dateCount, 'd')
            .format('MMM D, YYYY');

          imap.search(
            [
              ['SINCE', startDate],
              ['FROM', 'export@data.qeeniao.com'],
            ],
            function (err, results) {
              err =
                !results || !results.length
                  ? err ||
                    new Error(
                      `近${dateCount}日内没有收到 export@data.qeeniao.com 的邮件`,
                    )
                  : err;
              if (err) {
                return handleErr(err);
              }

              const f = imap.fetch(results.slice(-1), { bodies: '' });

              f.on('message', function (msg) {
                const mailparser = new MailParser();
                const mailInfo: EmailData = {};
                msg.on('body', function (stream) {
                  stream.pipe(mailparser);

                  //邮件头内容
                  mailparser.on('headers', function (headers) {
                    console.log(headers.get('date'));
                    mailInfo.headers = headers;
                  });

                  //邮件内容
                  mailparser.on('data', function (data) {
                    if (data.type === 'attachment') {
                      mailInfo.data = data;
                      resolve(mailInfo);
                    } else {
                      handleErr(new Error('邮件不包含附件'));
                    }
                  });
                });
                msg.once('error', handleErr);
              });
              f.once('error', handleErr);
              f.once('end', function () {
                imap.end();
              });
            },
          );
        });
      });

      imap.once('error', function (err) {
        console.log('imap error');
        reject(err);
      });

      imap.connect();
    } catch (err) {
      reject(err);
    }
  });
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const [user, password, host] = decode(req?.body?.key || '');

  getMail({
    user,
    password,
    host,
  }).then(
    ({ data }) => {
      if (data?.content && data?.filename) {
        const jsonFIlePath = path.join(
          process.cwd(),
          'data',
          data.filename?.replace(/\.xls$/, '.json') || 'test.json',
        );
        if (fs.existsSync(jsonFIlePath)) {
          const result = fs.readJSONSync(jsonFIlePath);
          return res.status(200).json({
            success: true,
            code: 0,
            data: result,
          });
        }
        let buffers: readonly Uint8Array[] = [];
        data.content.on('data', data => (buffers = [...buffers, data]));
        data.content.on('end', () => {
          const workBook = xlsx.read(Buffer.concat(buffers), {
            type: 'buffer',
          });

          const result = xlsx.utils.sheet_to_json(workBook.Sheets['收支记录']);

          res.status(200).json({
            success: true,
            code: 0,
            data: result,
          });
        });
      } else {
        res
          .status(200)
          .json({ message: '没有找到附件', success: false, code: 100 });
      }
    },
    err => {
      const code = err.message.includes(
        '没有收到 export@data.qeeniao.com 的邮件',
      )
        ? 100
        : 200;
      res.status(200).json({ message: err.message, success: false, code });
      console.log('err', err.message);
    },
  );
}
