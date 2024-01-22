import type { NextApiRequest, NextApiResponse } from 'next';
import { getRow, putRow } from '../../common/services/client';
import { TableName } from '@consts/service';
import { genId } from '@utils/tools';

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

  const { user_id: _, ...relation } = (await getRow(TableName.relation, {
    user_id,
  })) as {
    user_id?: string;
    category_ids?: string;
    billing_ids?: string;
    account_ids?: string;
  };

  const result: Record<string, any[]> = {
    categries: [],
    billings: [],
    accounts: [],
  };

  const account = { name, icon, deleted, user_id };

  await putRow(TableName.account, { id }, account);
  const account_ids = new Set(relation.account_ids?.split(',').filter(Boolean));
  account_ids.add(id);
  relation.account_ids = Array.from(account_ids).join(',');
  await putRow(TableName.relation, { user_id }, relation);

  res.send({
    success: true,
  });
}
