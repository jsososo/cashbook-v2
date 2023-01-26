import { IncomeOrCost, incomeOrCostInfoMap } from '@consts/index';
import { RecordDetail, RawRecord } from '@types';
import dayjs from 'dayjs';

export default class RecordInfo {
  constructor(name: string, incomeOrCost?: IncomeOrCost) {
    this._name = name;
    this.incomeOrCost = incomeOrCost;
  }
  private _name: string;
  private _duplicate: boolean = false;

  list: RecordDetail[] = [];

  get name() {
    const { _name, _duplicate, incomeOrCost } = this;
    return _duplicate && incomeOrCost
      ? `${_name}(${incomeOrCostInfoMap[incomeOrCost].str})`
      : _name;
  }

  setDuplicate() {
    this._duplicate = true;
  }

  push(rawRecord: RawRecord) {
    const { incomeOrCost } = this;
    const record: RecordDetail = {
      incomeOrCost:
        incomeOrCost || rawRecord['金额'] > 0
          ? IncomeOrCost.income
          : IncomeOrCost.cost,
      type: this._name,
      amount: Math.abs(rawRecord['金额']),
      date: dayjs(rawRecord['时间'], 'YYYY/MM/DD').valueOf(),
      desc: rawRecord['备注'],
    };
    this.list.push(record);
  }

  getAmount(startDate: number, endDate: number) {
    let amount = 0;

    for (let record of this.list) {
      if (record.date < startDate) {
        continue;
      }
      if (record.date >= endDate) {
        break;
      }
      amount += record.amount * (this.incomeOrCost ? 1 : record.incomeOrCost);
    }
    return Math.round(amount * 100) / 100;
  }

  incomeOrCost?: IncomeOrCost;
}
