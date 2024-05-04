import type { NextApiRequest, NextApiResponse } from 'next';
import { getRow, putRow } from '../../common/services/client';
import { TableName } from '@consts/service';
import { genId } from '@utils/tools';
import { ServiceRelation } from '@types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const {
    token,
    id = genId(),
    name = '',
    icon = '',
    deleted = false,
    type = 0,
    is_transfer = false,
  } = req?.body;

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

  const { user_id: _, ...relation } = await getRow<ServiceRelation>(
    TableName.relation,
    {
      user_id,
    },
  );

  const category = { name, icon, deleted, user_id, is_transfer, type };

  await putRow(TableName.category, { id }, category);
  const category_ids = new Set(
    relation.category_ids?.split(',').filter(Boolean),
  );
  category_ids.add(id);
  relation.category_ids = Array.from(category_ids).join(',');
  await putRow(TableName.relation, { user_id }, relation);

  res.send({
    success: true,
  });
}
