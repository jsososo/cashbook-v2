import type { NextApiRequest, NextApiResponse } from 'next';
import { getBatchRow, getRow, putRow } from '../../common/services/client';
import { TableName } from '@consts/service';
import { ServiceKanban } from '../../common/services';
import { ReqBody, ResBody } from '@types';

const getBatchByIdsFunc = (ids: string, tableName: TableName) =>
  getBatchRow(
    tableName,
    ids
      .split(',')
      .filter(Boolean)
      .map(id => ({ id })),
  );

export default async function handler(
  req: NextApiRequest,
  res: ResBody<{ kanbanList: ServiceKanban[] }>,
) {
  const { ids, token } = req?.body as ReqBody<{ ids: string }>;

  const { id: user_id } = (await getRow(TableName.token, { token })) as {
    id: string;
  };

  if (!user_id) {
    res.send({
      success: false,
      message: '未登陆',
      code: 403,
    });
    return;
  }

  const idArr = (ids as string)
    .split(',')
    .filter(Boolean)
    .map(id => ({ id }));

  if (!idArr.length) {
    return res.send({
      success: true,
      data: {
        kanbanList: [],
      },
    });
  }

  const kanbanList = (await getBatchRow(TableName.kanban, idArr)) as {
    id: string;
    settings: string;
    deleted: boolean;
    name: string;
    updated: number;
  }[];

  res.send({
    success: true,
    data: {
      kanbanList: kanbanList
        .filter(({ deleted }) => !deleted)
        .sort((a, b) => b.updated - a.updated)
        .map(({ id, settings, deleted, name }) => ({
          name,
          id,
          settings: JSON.parse(settings),
        })),
    },
  });
}
