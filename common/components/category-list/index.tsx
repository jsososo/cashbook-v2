import { IncomeOrCost } from '@consts';
import { genId } from '@utils/tools';
import { useBoolean, useUpdate } from 'ahooks';
import { Button, Input, Select } from 'antd';
import { useCallback, useContext, useState } from 'react';
import { CashbookContext } from '../../../pages';
import { updateCategory } from '../../services';
import { Wrapper } from './style';
import BillingCategory from '@utils/billing-category';
import { DeleteOutlined } from '@ant-design/icons';
import { CateItem } from './cate-item';

const CategoryList = () => {
  const { cashbook } = useContext(CashbookContext);

  const [inputVisible, { setTrue: showInput, setFalse: hideInput }] =
    useBoolean(false);

  const [inputName, setInputName] = useState('');

  const [type, setType] = useState<IncomeOrCost>(IncomeOrCost.cost);

  const onCreate = useCallback(async () => {
    const params = { id: genId(), name: inputName, type };
    await updateCategory(params);
    cashbook.createCategory(params);
    setInputName('');
    hideInput();
  }, [inputName, setInputName]);

  const costCates = cashbook.categories.filter(
    ({ type }) => type === IncomeOrCost.cost,
  );

  const incomCates = cashbook.categories.filter(
    ({ type }) => type === IncomeOrCost.income,
  );

  return (
    <Wrapper>
      {inputVisible ? (
        <div>
          <Select
            value={type}
            onChange={setType}
            options={[
              { label: '支出', value: IncomeOrCost.cost },
              { label: '收入', value: IncomeOrCost.income },
            ]}
          />
          <Input
            className="cate-input"
            maxLength={5}
            value={inputName}
            onChange={e => setInputName(e.target.value)}
          />
          <Button
            type="primary"
            onClick={onCreate}
            disabled={
              !inputName ||
              (type === IncomeOrCost.cost ? costCates : incomCates).some(
                ({ name }) => name === inputName,
              )
            }>
            确认
          </Button>
        </div>
      ) : (
        <>
          <Button onClick={showInput}>新建分类</Button>
        </>
      )}
      <div className="cate-name">支出</div>
      <div className="cate-list">
        {costCates.map(c => (
          <CateItem key={`${c.id}_${c.name}`} cate={c} />
        ))}
        {costCates?.length ? null : '暂无'}
      </div>
      <div className="cate-name">收入</div>
      <div className="cate-list">
        {incomCates.map(c => (
          <CateItem key={`${c.id}_${c.name}`} cate={c} />
        ))}
        {incomCates?.length ? null : '暂无'}
      </div>
    </Wrapper>
  );
};

export default CategoryList;
