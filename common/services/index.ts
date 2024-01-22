import { request } from '@utils/request';
import type { RequestType } from '@utils/request';
import { IncomeOrCost } from '@consts';

type ServiceFunc = (
  params?: Record<string, any>,
  options?: {
    handleLoading?: RequestType['handleLoading'];
  },
) => Promise<any>;

export const getDataFromEmail: ServiceFunc = (params, options) =>
  request({
    url: '/getDataFromEmail',
    params,
    requestType: 'post',
    handleLoading: options?.handleLoading,
  });

type ServiceUser = {
  name: string;
  key: string;
};

export const createUser = (params: ServiceUser & { create?: boolean }) =>
  request({
    url: '/login',
    params,
    requestType: 'post',
  });

export type ServiceAccount = {
  id?: string;
  name?: string;
  icon?: string;
  deleted?: boolean;
};
export const updateAccount = (params: ServiceAccount) =>
  request({
    url: '/updateAccount',
    params,
    requestType: 'post',
  });

export type ServiceCategory = {
  id?: string;
  name?: string;
  icon?: string;
  deleted?: boolean;
  is_transfer?: boolean;
  type: IncomeOrCost;
};

export const updateCategory = (params: ServiceCategory) =>
  request({
    url: '/updateCategory',
    params,
    requestType: 'post',
  });

export type ServiceBilling = {
  name?: string;
  id?: string;
  deleted?: boolean;
  is_none_rountine?: boolean;
  time: number;
  category_id: string;
  account_id: string;
  amount: number;
  remark?: string;
};
export const updateBilling = (params: ServiceBilling) =>
  request({
    url: '/updateBilling',
    params,
    requestType: 'post',
  });

export const updateRelation = (params: {
  relation: {
    category_ids: string;
    account_ids: string;
    billing_ids: string;
  };
}) =>
  request({
    url: '/updateRelation',
    params,
    requestType: 'post',
  });

export type ServiceUserInfo = {
  categories: ServiceCategory[];
  accounts: ServiceAccount[];
  billings: (ServiceBilling & {
    a: string;
    c: string;
    am: number;
    t: string;
    n?: string;
    r?: string;
    in?: boolean;
    i?: string;
  })[];
};

export const getUserInfo = () =>
  request<ServiceUserInfo>({
    url: '/getUserInfo',
    requestType: 'post',
  }).then(res => {
    // @ts-ignore
    res.data.billings = (res.data?.billings || []).map(
      ({ a, c, am, t, n, r, i, ...rest }) => ({
        // @ts-ignore
        account_id: res.data?.accounts?.[a]?.id,
        // @ts-ignore
        category_id: res.data?.categories?.[c]?.id,
        amount: am,
        time: parseInt(t, 36),
        name: n || '',
        remark: r || '',
        is_none_rountine: rest.in || false,
        id: i,
      }),
    );
    return res;
  });
