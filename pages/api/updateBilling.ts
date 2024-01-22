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
    deleted = false,
    is_none_rountine = false,
    time = 0,
    category_id = '',
    account_id = '',
    remark = '',
    amount = 0,
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

  const billing = {
    name,
    deleted,
    user_id,
    is_none_rountine,
    time,
    category_id,
    account_id,
    remark,
    amount,
  };

  await putRow(TableName.billing, { id }, billing);
  const billing_ids = new Set(relation.billing_ids?.split(',').filter(Boolean));
  billing_ids.add(id);
  relation.billing_ids = Array.from(billing_ids).join(',');
  await putRow(TableName.relation, { user_id }, relation);

  res.send({
    success: true,
  });
}
