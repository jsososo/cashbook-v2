import { DeleteOutlined } from '@ant-design/icons';
import Billing from '@utils/billing';
import { Modal } from 'antd';
import { useContext } from 'react';
import { CashbookContext } from '../../../pages';
import { updateBilling } from '../../services';

interface IProps {
  billings: Billing[];
  onAfterDelete?: () => void;
}

const DeleteBillingBtn = (props: IProps) => {
  const { billings, onAfterDelete } = props;
  const { cashbook } = useContext(CashbookContext);

  const onClick = () => {
    Modal.confirm({
      title: '确认',
      content: '确认删除这条账单记录',
      async onOk() {
        await Promise.all(
          billings.map(billing =>
            updateBilling({
              id: billing.id,
              account_id: billing.account.id,
              category_id: billing.category.id,
              amount: billing.amount,
              deleted: true,
              time: billing.time.valueOf(),
            }),
          ),
        );
        billings.forEach(billing => {
          cashbook.deleteBilling(billing.id);
        });
        onAfterDelete?.();
      },
    });
  };
  return (
    <DeleteOutlined
      color="danger"
      style={{ color: '#ff4e4f' }}
      rev=""
      onClick={onClick}></DeleteOutlined>
  );
};

export default DeleteBillingBtn;
