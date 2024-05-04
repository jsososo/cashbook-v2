import { useCallback, useContext, useMemo, useState } from 'react';
import { CashbookContext } from '../../../pages';
import { Wrapper } from './style';
import { Button, Input } from 'antd';
import { useBoolean } from 'ahooks';
import { updateAccount } from '../../services';
import { genId } from '@utils/tools';
import { FormOutlined } from '@ant-design/icons';
import Account from '@utils/account';

const AccountList = () => {
  const { cashbook } = useContext(CashbookContext);

  useBoolean(false);
  const [editIndex, setEditIndex] = useState(-1);

  const [inputName, setInputName] = useState('');

  const onCreate = useCallback(async () => {
    const params = {
      id: cashbook.accounts[editIndex - 1]?.id || genId(),
      name: inputName,
    };
    await updateAccount(params);
    if (editIndex > 0) {
      cashbook.accounts[editIndex - 1].update(params);
    } else {
      cashbook.createAccount(params);
    }
    setInputName('');
    setEditIndex(-1);
  }, [cashbook, inputName, editIndex]);

  const onClickCreate = useCallback(() => {
    setEditIndex(0);
    setInputName('');
  }, []);

  const onCancelInput = useCallback(() => {
    setEditIndex(-1);
    setInputName('');
  }, []);

  const onClickEdit = useCallback(
    (index: number) => {
      setEditIndex(index);
      setInputName(cashbook.accounts[index - 1]?.name);
    },
    [cashbook.accounts],
  );

  return (
    <Wrapper>
      {editIndex === 0 ? null : (
        <>
          {cashbook.accounts.length ? null : (
            <span className="empty-text">暂无账户</span>
          )}
          <Button onClick={onClickCreate}>新建账户</Button>
        </>
      )}
      {/* @ts-ignore */}
      {[{}, ...cashbook.accounts].map(({ name, amount, id }, index) =>
        (index === 0 && editIndex === index) || !!index ? (
          <div className="account-item" key={`${id}_${index}`}>
            {editIndex === index ? (
              <>
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
                <Button onClick={onCancelInput}>取消</Button>
              </>
            ) : (
              <>
                <FormOutlined
                  className="edit-button"
                  rev=""
                  onClick={() => onClickEdit(index)}
                />
                <div className="account-name">{name}</div>
                <div className="account-amount">{amount}</div>
              </>
            )}
          </div>
        ) : null,
      )}
    </Wrapper>
  );
};

export default AccountList;
