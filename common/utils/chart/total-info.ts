import RecordInfo from './record-info';
import { RawRecord } from '@types';
import { IncomeOrCost } from '@consts/index';
import dayjs from 'dayjs';
import Billing from '../billing';
import BillingCategory from '@utils/billing-category';

const commonCate = new BillingCategory({ type: IncomeOrCost.income });

export default class TotalInfo extends RecordInfo {
  constructor() {
    super('总额');
  }

  push(rawRecord: Billing) {
    const { list } = this;
    const latest = list.slice(-1).pop();
    const newBilling = new Billing({
      account: rawRecord.account,
      category: commonCate,
      time: rawRecord.time,
      amount: rawRecord.amount * rawRecord.incomeOrCost + (latest?.amount ?? 0),
    });
    if (latest?.date === rawRecord.date) {
      this.list[list.length - 1] = newBilling;
    } else {
      this.list.push(newBilling);
    }
  }

  getAmount(startDate: number, endDate: number, filters?: string[]) {
    const { list } = this;
    let i = list.findIndex(record => {
      return record.time.valueOf() >= endDate;
    });
    const record = list[i];
    if (record && record.time.startOf('d').valueOf() !== endDate) {
      i -= 1;
    }
    if (i === -1 && endDate > list[0].time.valueOf()) {
      i = list.length - 1;
    }

    return i >= 0 ? Math.round(list[i].amount * 100) / 100 : 0;
  }
}
