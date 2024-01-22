import { ReactNode } from 'react';
import { genId } from './tools';

export interface IAccountProps {
  name?: string;
  id?: string;
  icon?: ReactNode;
}

// 账户
export default class Account {
  constructor(props: IAccountProps) {
    const { name = '', icon, id } = props;

    this.name = name;

    this.icon = icon || name[0];

    this.id = id || genId();
  }

  id: string;

  name: string;

  icon?: ReactNode;

  _amount = 0;

  set amount(v: number) {
    this._amount = Number(v.toFixed(2));
  }
  get amount() {
    return this._amount;
  }
}
