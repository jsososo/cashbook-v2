import type { NextApiRequest, NextApiResponse } from 'next';
import { getRow, putRow } from '../../common/services/client';
import { TableName } from '@consts/service';
import { genId } from '@utils/tools';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const { name, key, create } = req?.body;

  const id = genId();

  const token = genId();

  const user = (await getRow(TableName.user, { name })) as {
    id?: string;
    name?: string;
  };
  if (!create) {
    if (user.id) {
      putRow(TableName.token, { token }, { id: user.id, time: Date.now() });
      res.send({ success: true, data: { token } });
    } else {
      res.send({ success: false, message: '用户名或密码错误' });
    }
    return;
  }
  if (user.id) {
    res.send({ success: false, message: '用户名已存在' });
    return;
  }
  await putRow(TableName.user, { name }, { id, key });
  putRow(TableName.token, { token }, { id: user.id, time: Date.now() });
  res.send({ success: true, data: { token } });
}
