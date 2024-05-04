import { request } from '@utils/request';
import type { RequestType } from '@utils/request';
import { IncomeOrCost } from '@consts';
import { RespUserInfo } from '../../pages/api/getUserInfo';
import { ResBody } from '@types';

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
  user_id?: string;
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
  user_id?: string;
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
  user_id?: string;
};
export const updateBilling = (params: ServiceBilling) =>
  request({
    url: '/updateBilling',
    params,
    requestType: 'post',
  });

export type ServiceUserInfo = {
  categories: ServiceCategory[];
  accounts: ServiceAccount[];
  billings: ServiceBilling[];
  kanban_ids: string[];
};

const am2Number = (str: string) => {
  const [n1, n2] = str.split('.');
  return parseInt(n1, 36) + parseInt(n2 || '0', 36) / 100;
};

export const getUserInfo = () =>
  request<RespUserInfo>({
    url: '/getUserInfo',
    requestType: 'post',
  }).then(res => ({
    success: true,
    data: {
      billings: (res.data?.billings || []).map((v: string) => {
        const [ai, ci, am, time, id, inr = '0', ...r] = v.split('_');

        return {
          // @ts-ignore
          account_id: res.data?.accounts?.[parseInt(ai, 36)]?.id,
          // @ts-ignore
          category_id: res.data?.categories?.[parseInt(ci, 36)]?.id,
          amount: am2Number(am),
          time: parseInt(time, 36) * 1000,
          remark: r.join('_'),
          is_none_rountine: !!Number(inr),
          id,
        };
      }) as ServiceBilling[],
      categories: res.data?.categories || [],
      accounts: res.data?.accounts || [],
      kanban_ids: res.data?.kanban_ids || [],
    },
  }));

export type ServiceKanban = {
  id?: string;
  name?: string;
  updated?: number;
  deleted?: string;
  uid?: string;
  settings: {
    category_ids?: string[];
    include_none_rountine?: boolean;
    show_total?: boolean;
    show_all_sum?: boolean;
    show_all_cat?: boolean;
  };
};

export const getKanban = (params: { ids: string }) =>
  request<{ kanbanList: ServiceKanban[] }>({
    url: '/getKanban',
    params,
    requestType: 'post',
  });

export const updateKanban = (params: ServiceKanban) =>
  request<{ id: string }>({
    url: '/updateKanban',
    params,
    requestType: 'post',
  });
