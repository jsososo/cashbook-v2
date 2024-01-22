import RecordInfo from './record-info';
import Billing from '../billing';
import { IncomeOrCost } from '@consts';
import BillingCategory from '@utils/billing-category';

const commonCate = new BillingCategory({ type: IncomeOrCost.income });

export default class SurplusInfo extends RecordInfo {
  constructor() {
    super('盈余');
  }

  push(rawRecord: Billing) {
    const { list } = this;
    const latest = list.slice(-1).pop();
    const newBilling = new Billing({
      account: rawRecord.account,
      category: commonCate,
      time: rawRecord.time,
      amount:
        rawRecord.amount * rawRecord.incomeOrCost +
        (latest?.date === rawRecord.date ? latest?.amount ?? 0 : 0),
    });
    if (latest?.date === rawRecord.date) {
      this.list[list.length - 1] = newBilling;
    } else {
      this.list.push(newBilling);
    }
  }
}
