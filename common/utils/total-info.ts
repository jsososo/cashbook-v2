import RecordInfo from './record-info';
import { RawRecord } from '@types';
import { IncomeOrCost } from '@consts/index';
import dayjs from 'dayjs';

export default class TotalInfo extends RecordInfo {
  constructor() {
    super('总额');
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
        type: '总额',
        amount: rawRecord['金额'] + (latest?.amount || 0),
        date,
      });
    }
  }

  getAmount(startDate: number, endDate: number, filters?: string[]) {
    const { list } = this;
    let i = list.findIndex(record => {
      return record.date >= endDate;
    });
    const record = list[i];
    if (record && record?.date !== endDate) {
      i -= 1;
    }
    if (i === -1 && endDate > list[0].date) {
      i = list.length - 1;
    }

    return i >= 0 ? Math.round(list[i].amount * 100) / 100 : 0;
  }
}
