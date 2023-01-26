import { IncomeOrCost, IncomeOrCostStr } from '@consts';

export type RecordDetail = {
  incomeOrCost: IncomeOrCost;
  type: string;
  amount: number;
  date: number;
  ignore?: boolean;
  desc?: string;
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
