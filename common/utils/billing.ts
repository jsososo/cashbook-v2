import dayjs from 'dayjs';
import Account from './account';
import BillingCategory from './billing-category';
import { genId } from './tools';

export interface IBillingProps {
  category: BillingCategory;
  account: Account;
  remark?: string;
  time: dayjs.Dayjs;
  // 是否常规性支出
  isNonRountine?: boolean;
  amount: number;
  id?: string;
}

export default class Billing {
  constructor(props: IBillingProps) {
    const {
      category,
      isNonRountine = false,
      remark,
      amount,
      time,
      account,
      id,
    } = props;
    this.category = category;
    this._amount = Number((amount || 0).toFixed(2));
    this.time = time;
    this.remark = remark;
    this.isNoneRountine = isNonRountine;
    this.account = account;
    this.id = id || genId();
  }

  isNoneRountine: boolean;

  id: string;

  time: dayjs.Dayjs;

  category: BillingCategory;

  account: Account;

  remark?: string;

  private _amount: number;

  get amount() {
    return this._amount;
  }

  get type() {
    return this.category.type;
  }

  get isTransfer() {
    return this.category.isTransfer;
  }

  get incomeOrCost() {
    return this.category.type;
  }

  get date() {
    return this.time.format('YYYY-MM-DD');
  }

  get month() {
    return this.time.format('YYYY-MM');
  }

  get calChartAmount() {
    return this.isTransfer ? 0 : this.incomeOrCost * this.amount;
  }
}
