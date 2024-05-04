import { IncomeOrCost, IncomeOrCostStr } from '@consts';
import { NextApiResponse } from 'next';

export type RecordDetail = {
  incomeOrCost: IncomeOrCost;
  type: string;
  amount: number;
  date: number;
  ignore?: boolean;
  desc?: string;
  key?: string;
};

export type RawRecord = {
  时间: string;
  收支类型: string;
  账目分类: string;
  金额: number;
  账户: string;
  账户类型: string;
  账本: string;
  备注?: string;
};

export type IncomeOrCostInfo = {
  val: IncomeOrCost;
  str: IncomeOrCostStr;
  reverse: IncomeOrCost;
};

export type UserInfo = {
  email: string;
  key: string;
};

export type ReqBody<T> = {
  token: string;
} & T;

export type ResBody<T> = NextApiResponse<{
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}>;

export type ServiceRelation = {
  user_id?: string;
  category_ids?: string;
  billing_ids?: string;
  account_ids?: string;
  kanban_ids?: string;
};
