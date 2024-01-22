import { useCallback, useContext, useState } from 'react';
import { CashbookContext } from '../../../pages';
import { Wrapper } from './style';
import { Button, Input } from 'antd';
import { useBoolean } from 'ahooks';
import { updateAccount } from '../../services';
import { genId } from '@utils/tools';

const AccountList = () => {
  const { cashbook } = useContext(CashbookContext);

  const [inputVisible, { setTrue: showInput, setFalse: hideInput }] =
    useBoolean(false);

  const [inputName, setInputName] = useState('');

  const onCreate = useCallback(async () => {
    const params = { id: genId(), name: inputName };
    await updateAccount(params);
    cashbook.createAccount(params);
    setInputName('');
    hideInput();
  }, []);

  return (
    <Wrapper>
      {inputVisible ? (
        <div>
          <div className="account-item">
            <div className="account-name">
              <Input
                className="acount-input"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                maxLength={10}
                showCount
              />
              <Button
                type="primary"
                className="confirm-create-btn"
                onClick={onCreate}
                disabled={
                  !inputName ||
                  cashbook.accounts.some(({ name }) => name === inputName)
                }>
                确认
              </Button>
              <Button onClick={hideInput}>取消</Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {cashbook.accounts.length ? null : (
            <span className="empty-text">暂无账户</span>
          )}
          <Button onClick={showInput}>新建账户</Button>
        </>
      )}
      {cashbook.accounts.map(({ name, amount }) => (
        <div className="account-item" key={name}>
          <div className="account-name">{name}</div>
          <div className="account-amount">{amount}</div>
        </div>
      ))}
    </Wrapper>
  );
};

export default AccountList;
