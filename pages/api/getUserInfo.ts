import type { NextApiRequest, NextApiResponse } from 'next';
import { getBatchRow, getRow, putRow } from '../../common/services/client';
import { TableName } from '@consts/service';
import {
  ServiceAccount,
  ServiceBilling,
  ServiceCategory,
} from '../../common/services';

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
  res: NextApiResponse<any>,
) {
  const { token } = req?.body;

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

  const {
    user_id: id,
    category_ids = '',
    billing_ids = '',
    account_ids = '',
  } = (await getRow(TableName.relation, { user_id })) as {
    user_id?: string;
    category_ids?: string;
    billing_ids?: string;
    account_ids?: string;
  };
  const result: Record<string, any[]> = {
    categories: [],
    billings: [],
    accounts: [],
  };

  if (!id) {
    await putRow(
      TableName.relation,
      { user_id },
      { category_ids: '', billing_ids: '', account_ids: '' },
    );
    res.send({
      success: true,
      data: result,
    });
    return;
  }

  const [responseCategories, billings, responseAccounts] = await Promise.all([
    getBatchByIdsFunc(category_ids, TableName.category),
    getBatchByIdsFunc(billing_ids, TableName.billing),
    getBatchByIdsFunc(account_ids, TableName.account),
  ]);

  const cMap = new Map<string, number>();

  const categories = (
    responseCategories as (ServiceCategory & { user_id: string })[]
  )
    .filter(v => !v.deleted)
    .map(({ user_id, deleted, ...rest }, i) => {
      cMap.set(rest.id || '', i);
      return rest;
    });

  const aMap = new Map<string, number>();

  const accounts = (
    responseAccounts as (ServiceAccount & { user_id: string })[]
  )
    .filter(v => !v.deleted)
    .map(({ user_id, deleted, ...rest }, i) => {
      aMap.set(rest.id || '', i);
      return rest;
    });
  res.send({
    success: true,
    data: {
      categories,
      billings: (billings as (ServiceBilling & { user_id: string })[])
        .filter(v => !v.deleted)
        .map(
          ({
            user_id,
            category_id,
            account_id,
            amount,
            time,
            name,
            remark,
            id,
            is_none_rountine,
          }) => {
            const result = {
              a: aMap.get(account_id),
              c: cMap.get(category_id),
              am: amount,
              t: time.toString(36),
              n: name,
              r: remark,
              i: id,
              in: is_none_rountine || undefined,
            };
            !name && delete result.n;
            !remark && delete result.r;
            !is_none_rountine && delete result.in;
            return result;
          },
        ),
      accounts,
    },
  });
}
