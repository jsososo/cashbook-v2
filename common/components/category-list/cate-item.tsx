import { DeleteOutlined, FormOutlined } from '@ant-design/icons';
import BillingCategory from '@utils/billing-category';
import { useCallback, useContext, useState } from 'react';
import { CashbookContext } from '../../../pages';
import { updateCategory } from '../../services';
import { useBoolean } from 'ahooks';
import { Button, Input, message } from 'antd';

export const CateItem = (props: { cate: BillingCategory }) => {
  const { cate } = props;
  const { id, name, type } = cate;
  const { cashbook, forceUpdate } = useContext(CashbookContext);
  const canDelete = !cashbook.billings.find(b => b.category.id === id);
  const [inputName, setInputName] = useState('');
  const [inputVisible, { setTrue: showInput, setFalse: hideInput }] =
    useBoolean(false);

  const deleteCategory = useCallback(() => {
    updateCategory({
      id: id,
      type: type,
      deleted: true,
    });
    cashbook.deleteCategory(id);
    forceUpdate();
  }, []);

  const onClickEdit = useCallback(() => {
    showInput();
    setInputName(name);
  }, []);

  const onConfirm = useCallback(() => {
    hideInput();
    const exitCate = cashbook.categories.find(
      c => type === c.type && c.name === inputName,
    );

    if (exitCate?.id === id) {
      return;
    }

    let msg;
    if (!inputName) {
      msg = '不能为空';
    }
    if (exitCate) {
      msg = '存在同名分类';
    }

    if (msg) {
      return message.warning(msg);
    }

    updateCategory({
      id,
      type,
      name: inputName,
    });
    cate.update({ name: inputName });
    forceUpdate();
  }, [cashbook.categories, cate, hideInput, id, inputName, name, type]);

  return (
    <div className={`category-item ${inputVisible ? 'edit-mode' : ''}`}>
      {canDelete ? (
        <div className="delete-btn" onClick={deleteCategory}>
          <DeleteOutlined rev="" />
        </div>
      ) : null}
      <div className="edit-btn" onClick={onClickEdit}>
        <FormOutlined rev="" />
      </div>
      {inputVisible ? (
        <>
          <Input
            autoFocus
            className="cate-input"
            maxLength={5}
            value={inputName}
            onChange={e => setInputName(e.target.value)}
            onBlur={onConfirm}
          />
        </>
      ) : (
        <div className="category-name">{name}</div>
      )}
    </div>
  );
};
