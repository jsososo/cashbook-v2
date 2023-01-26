import RecordInfo from './record-info';
import { RawRecord } from '@types';
import { IncomeOrCost } from '@consts/index';
import dayjs from 'dayjs';

export default class SurplusInfo extends RecordInfo {
  constructor() {
    super('盈余');
  }

  push(rawRecord: RawRecord) {
    const { list } = this;
    const latest = list.slice(-1).pop();
    const date = dayjs(rawRecord['时间'], 'YYYY/MM/DD').valueOf();
    if (latest?.date === date) {
      latest.amount += rawRecord['金额'];
    } else {
      this.list.push({
        incomeOrCost: IncomeOrCost.income,
        type: '盈余',
        amount: rawRecord['金额'],
        date,
      });
    }
  }
}
