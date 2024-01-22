import { IncomeOrCost, incomeOrCostInfoMap } from '@consts/index';
import { RecordDetail, RawRecord } from '@types';
import dayjs from 'dayjs';
import Billing from '../billing';

export const getItemKey = (item: Record<string, any>) => {
  return `${item['时间']}_${item['账目分类']}_${item['金额']}_${
    item['备注'] || '-'
  }`;
};

// 账目分类记录 图标用
export default class RecordInfo {
  constructor(name: string, incomeOrCost?: IncomeOrCost) {
    this._name = name;
    this.incomeOrCost = incomeOrCost;
  }
  private _name: string;
  private _duplicate: boolean = false;

  list: Billing[] = [];

  getItemKey = getItemKey;

  get name() {
    const { _name, _duplicate, incomeOrCost } = this;
    return _duplicate && incomeOrCost
      ? `${_name}(${incomeOrCostInfoMap[incomeOrCost].str})`
      : _name;
  }

  setDuplicate() {
    this._duplicate = true;
  }

  push(billing: Billing) {
    const { incomeOrCost } = this;

    this.list.push(billing);
  }

  getAmount(startDate: number, endDate: number, filters?: string[]) {
    let amount = 0;
    for (let record of this.list) {
      if (filters?.includes(record.id || '')) {
        continue;
      }
      if (record.time.valueOf() < startDate) {
        continue;
      }
      if (record.time.valueOf() >= endDate) {
        break;
      }

      amount += record.amount;
    }
    return Math.round(amount * 100) / 100;
  }

  incomeOrCost?: IncomeOrCost;
}
