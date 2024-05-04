import { IncomeOrCost } from '@consts';
import { ReactNode } from 'react';
import { genId } from './tools';

export interface IBillingCategoryProps {
  name?: string;
  type?: IncomeOrCost;
  id?: string;
  icon?: ReactNode;
  isDelete?: boolean;
  // 是否为转账类型
  isTransfer?: boolean;
}

// 账目类型
export default class BillingCategory {
  constructor(props: IBillingCategoryProps) {
    const {
      name = '',
      type,
      icon,
      isDelete = false,
      isTransfer = false,
      id,
    } = props;

    this.name = name;
    this.type = type || IncomeOrCost.cost;
    this.icon = icon || name[0];
    this.isDelete = isDelete;
    this.isTransfer = isTransfer;
    this.id = id || genId();
  }

  update(info: IBillingCategoryProps) {
    const { name = this.name } = info;

    this.name = name;
    this.icon = name[0];
  }

  id: string;

  name: string;

  type: IncomeOrCost;

  icon: ReactNode;

  isDelete: boolean;

  isTransfer: boolean;

  get hidden() {
    return this.isDelete && this.isTransfer;
  }
}
