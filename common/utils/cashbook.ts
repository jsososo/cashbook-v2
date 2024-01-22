import { IncomeOrCost, incomeOrCostInfoMap } from '@consts';
import { RawRecord } from '@types';
import dayjs from 'dayjs';
import { EChartsOption } from 'echarts';
import { ServiceAccount, ServiceBilling, ServiceCategory } from '../services';
import Account, { IAccountProps } from './account';
import Billing, { IBillingProps } from './billing';
import BillingCategory, { IBillingCategoryProps } from './billing-category';
import { abs, num } from './math';
import RecordInfo from './chart/record-info';
import SurplusInfo from './chart/surplus-info';
import TotalInfo from './chart/total-info';

type DateData = {
  date: dayjs.Dayjs;
  totalIncome: number;
  totalCost: number;
  records: Billing[];
};

type CashbookInitialData = {
  accounts: ServiceAccount[];
  billings: ServiceBilling[];
  categories: ServiceCategory[];
};

/**
 * lineData 原数据数组
 * [
 *    ['Type', '22.01', '22.02', ...],
 *    ['收入', 1, 2.1, 3, ...],
 *    ...
 * ]
 */
type ResultArr = any[][];

type TotalLineData = {
  result: ResultArr;
  costMap: {
    [IncomeOrCost.income]: Set<string>;
    [IncomeOrCost.cost]: Set<string>;
    0: Set<string>;
  };
};

export type Options = {
  filters?: string[];
  dateCount?: number;
  unit: 'd' | 'M' | 'y';
};

const sum = (
  array: number[],
  i: number = 0,
  j: number = array.length,
): number => {
  const result = array
    .slice(i, j)
    .reduce((value, current) => value + current, 0);
  return Number(Number(result).toFixed(2));
};

export default class Cashbook {
  constructor(initialData?: CashbookInitialData) {
    this.createCategory = this.createCategory.bind(this);
    this.getAndCreateCategory = this.getAndCreateCategory.bind(this);
    this.createAccount = this.createAccount.bind(this);
    this.getAndCreateAccount = this.getAndCreateAccount.bind(this);
    this.createBilling = this.createBilling.bind(this);

    if (initialData) {
      initialData.accounts.forEach(v => this.getAndCreateAccount(v));
      initialData.categories.forEach(v =>
        this.getAndCreateCategory({ ...v, isTransfer: v.is_transfer }),
      );
      initialData.billings
        .sort((a, b) => b.time - a.time)
        .forEach(({ category_id, account_id, time, ...rest }, index) => {
          this.createBilling(
            {
              ...rest,
              time: dayjs(time),
              category: this.getAndCreateCategory({ id: category_id }),
              account: this.getAndCreateAccount({ id: account_id }),
              isNonRountine: rest.is_none_rountine,
            },
            index < 100 ? 1 : 0,
          );
        });
    }

    this.isInit = false;
    this.updateAt = Date.now();
  }

  private _updateAt = Date.now();

  private isInit = true;

  set updateAt(v: number) {
    this._updateAt = v;
    if (this.isInit) {
      return;
    }

    const { billings } = this;
    const resultMap: Record<string, RecordInfo> = {
      总额: new TotalInfo(),
      支出: new RecordInfo('支出', IncomeOrCost.cost),
      收入: new RecordInfo('收入', IncomeOrCost.income),
      盈余: new SurplusInfo(),
    };

    let startDate = dayjs().valueOf();

    [...billings]
      .sort((a, b) => a.time.valueOf() - b.time.valueOf())
      .forEach(val => {
        if (val.isTransfer) {
          return;
        }
        const incomeOrCost = incomeOrCostInfoMap[val.type];
        const name = val.category.name;
        const key = `${name}-${incomeOrCost.str}`;
        const reverseKey = `${name}-${
          incomeOrCostInfoMap[incomeOrCost.reverse].str
        }`;
        if (!resultMap[key]) {
          resultMap[key] = new RecordInfo(name, incomeOrCost.val);
          if (resultMap[reverseKey]) {
            resultMap[key].setDuplicate();
            resultMap[key].setDuplicate();
          }
        }
        if (resultMap[key]) {
          resultMap[key].push(val);
        }
        incomeOrCost.val === IncomeOrCost.income && resultMap['收入'].push(val);
        incomeOrCost.val === IncomeOrCost.cost && resultMap['支出'].push(val);
        resultMap['总额'].push(val);
        resultMap['盈余'].push(val);
        startDate = Math.min(startDate, val.time.startOf('d').valueOf());
      });
  }

  get updateAt() {
    return this._updateAt;
  }

  billings: Billing[] = [];

  accounts: Account[] = [];

  categories: BillingCategory[] = [];

  sortNum: Record<string, number> = {};

  listBillingsByDate(): DateData[] {
    let activeDate: DateData;
    return this.billings.reduce((result, billing) => {
      const key = {
        [IncomeOrCost.cost]: 'totalCost',
        [IncomeOrCost.income]: 'totalIncome',
      }[billing.type] as 'totalCost' | 'totalIncome' | undefined;

      if (key) {
        if (!activeDate || !activeDate.date.isSame(billing.time.startOf('D'))) {
          activeDate = {
            date: billing.time.startOf('D'),
            totalIncome: 0,
            totalCost: 0,
            records: [] as Billing[],
          };
        }
        activeDate[key] = num(activeDate[key] + billing.amount);
        activeDate.records.push(billing);
        result.push(activeDate);
      }
      return result;
    }, [] as DateData[]);
  }

  createBilling(props: IBillingProps, updateSort?: number) {
    const newBilling = new Billing(props);
    this.deleteBilling(newBilling?.id);
    this.billings.push(newBilling);
    newBilling.account.amount += newBilling.type * newBilling.amount;
    this.updateAt = Date.now();
    this.sortNum[newBilling.account.id] =
      (this.sortNum[newBilling.account.id] || 0) + (updateSort || 0);
    this.sortNum[newBilling.category.id] =
      (this.sortNum[newBilling.category.id] || 0) + (updateSort || 0);
    return newBilling;
  }

  deleteBilling(id: string) {
    const index = this.billings.findIndex(({ id: _id }) => _id === id);
    if (index > -1) {
      const [b] = this.billings.splice(index, 1);
      this.updateAt = Date.now();
      b.account.amount -= b.type * b.amount;
    }
  }

  deleteCategory(id: string) {
    const index = this.categories.findIndex(({ id: _id }) => _id === id);
    if (index > -1) {
      this.categories.splice(index, 1);
      this.updateAt = Date.now();
    }
  }

  get billingsDateMap() {
    const map: { [key: string]: Billing[] } = {};
    this.billings.forEach(b => {
      map[b.date] = map[b.date] || [];
      map[b.date].push(b);
    });
    return map;
  }

  createCategory(props: IBillingCategoryProps) {
    const newCategory = new BillingCategory(props);
    const { categories } = this;
    categories.push(newCategory);
    return newCategory;
  }

  // 获取分类，如果无则创建
  getAndCreateCategory(props: IBillingCategoryProps) {
    const existCategory = this.categories.find(({ id }) => id === props.id);

    return existCategory || this.createCategory(props);
  }

  createAccount(props: IAccountProps) {
    const newAccount = new Account(props);
    const { accounts } = this;
    accounts.push(newAccount);
    return newAccount;
  }

  // 获取账户，如果无则创建
  getAndCreateAccount(props: IAccountProps) {
    const existAccount = this.accounts.find(({ id }) => id === props.id);

    return existAccount || this.createAccount(props);
  }

  importExcel(rawRecords: RawRecord[]) {
    const { getAndCreateCategory, getAndCreateAccount, createBilling } = this;
    rawRecords.forEach(v => {
      const category = getAndCreateCategory({
        name: v.账目分类,
        type: v.收支类型 === '收入' ? IncomeOrCost.income : IncomeOrCost.cost,
        isTransfer: v.账目分类 === '转账',
      });
      const account = getAndCreateAccount({
        name: v.账户,
      });
      createBilling({
        time: dayjs(v.时间),
        amount: abs(v.金额),
        category: category,
        account: account,
      });
    });
  }

  getCategoryOpts = (type: IncomeOrCost) => {
    const { sortNum, categories } = this;
    return categories
      .sort((a, b) => (sortNum[b.id] || 0) - (sortNum[a.id] || 0))
      .filter(({ type: t, isTransfer }) => t === type && !isTransfer)
      .map(({ id, name }) => ({ label: name, value: id }));
  };

  getAccountOpts = (id?: string) => {
    const { sortNum, accounts } = this;
    return accounts
      .sort((a, b) => (sortNum[b.id] || 0) - (sortNum[a.id] || 0))
      .filter(({ id: _id }) => _id !== id)
      .map(({ id: _id, name, amount }) => ({
        label: `${name}${new Array(12 - name.length)
          .fill(' ')
          .join('')}【¥${amount}】`,
        value: _id,
      }));
  };
}
