import { IncomeOrCostInfo } from '@types';

export const enum IncomeOrCost {
  income = 1,
  cost = -1,
}
export const enum IncomeOrCostStr {
  income = '收入',
  cost = '支出',
}

export const incomeOrCostInfoMap: Record<IncomeOrCost, IncomeOrCostInfo> = {
  [IncomeOrCost.income]: {
    val: IncomeOrCost.income,
    str: IncomeOrCostStr.income,
    reverse: IncomeOrCost.cost,
  },
  [IncomeOrCost.cost]: {
    val: IncomeOrCost.cost,
    str: IncomeOrCostStr.cost,
    reverse: IncomeOrCost.income,
  },
};
