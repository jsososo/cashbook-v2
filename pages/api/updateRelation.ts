import type { NextApiRequest, NextApiResponse } from 'next';
import { getRow, putRow } from '../../common/services/client';
import { TableName } from '@consts/service';
import { genId } from '@utils/tools';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const { token, relation } = req?.body;

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

  await putRow(TableName.relation, { user_id }, relation);

  res.send({
    success: true,
  });
}
