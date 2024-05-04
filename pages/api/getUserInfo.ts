import type { NextApiRequest, NextApiResponse } from 'next';
import { getBatchRow, getRow, putRow } from '../../common/services/client';
import { TableName } from '@consts/service';
import {
  ServiceAccount,
  ServiceBilling,
  ServiceCategory,
} from '../../common/services';
import { ResBody } from '@types';

const getBatchByIdsFunc = <T>(ids: string, tableName: TableName) =>
  getBatchRow<T>(
    tableName,
    ids
      .split(',')
      .filter(Boolean)
      .map(id => ({ id })),
  );

export type RespUserInfo = {
  categories: ServiceCategory[];
  accounts: ServiceAccount[];
  billings: string[];
  kanban_ids: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: ResBody<RespUserInfo>,
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
    kanban_ids = '',
  } = (await getRow(TableName.relation, { user_id })) as {
    user_id?: string;
    category_ids?: string;
    billing_ids?: string;
    account_ids?: string;
    kanban_ids?: string;
  };
  const result: RespUserInfo = {
    categories: [],
    billings: [],
    accounts: [],
    kanban_ids: [],
  };

  if (!id) {
    await putRow(
      TableName.relation,
      { user_id },
      { category_ids: '', billing_ids: '', account_ids: '', kanban_ids: '' },
    );
    res.send({
      success: true,
      data: result,
    });
    return;
  }

  const [responseCategories, billings, responseAccounts] = await Promise.all([
    getBatchByIdsFunc<ServiceCategory>(category_ids, TableName.category),
    getBatchByIdsFunc<ServiceBilling>(billing_ids, TableName.billing),
    getBatchByIdsFunc<ServiceAccount>(account_ids, TableName.account),
  ]);

  const cMap = new Map<string, number>();

  const categories = responseCategories
    .filter(v => !v.deleted)
    .map(({ user_id, deleted, ...rest }, i) => {
      cMap.set(rest.id || '', i);
      return rest;
    });

  const aMap = new Map<string, number>();

  const accounts = responseAccounts
    .filter(v => !v.deleted)
    .map(({ user_id, deleted, ...rest }, i) => {
      aMap.set(rest.id || '', i);
      return rest;
    });

  const amount2str = (num: number) => {
    return num % 1
      ? `${Math.floor(num).toString(36)}.${Math.round((num % 1) * 100).toString(
          36,
        )}`
      : Math.floor(num).toString(36);
  };

  res.send({
    success: true,
    data: {
      categories,
      billings: billings
        .filter(v => !v.deleted)
        .map(
          ({
            category_id,
            account_id,
            amount,
            time,
            remark,
            id,
            is_none_rountine,
          }) => {
            const result = `${aMap.get(account_id)?.toString(36)}_${cMap
              .get(category_id)
              ?.toString(36)}_${amount2str(amount)}_${Math.round(
              time / 1000,
            ).toString(36)}_${id}${
              is_none_rountine || remark ? `_${Number(!!is_none_rountine)}` : ''
            }${remark ? `_${remark}` : ''}`;

            return result;
          },
        ),
      accounts,
      kanban_ids: kanban_ids.split(',').filter(Boolean),
    },
  });
}
