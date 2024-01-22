import { IncomeOrCost, incomeOrCostInfoMap, IncomeOrCostStr } from '@consts';
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Switch,
} from 'antd';
import { useContext, useEffect, useMemo } from 'react';
import { CashbookContext } from '../../../pages';
import { useBoolean } from 'ahooks';
import dayjs from 'dayjs';
import { ServiceBilling, updateBilling } from '../../services';
import Billing from '@utils/billing';
import { filterOption, genId } from '@utils/tools';
import { FormOutlined } from '@ant-design/icons';
import DeleteBillingBtn from '@components/delete-billing-btn';
import CustomInput from '@components/custom-input';
import CustomDatePicker from '@components/custom-date-picker';

const DrawerBilling = () => {
  const { drawerBilling, setDrawerBilling, cashbook } =
    useContext(CashbookContext);
  const { billing, isCreate, transBilling } = drawerBilling;
  const [_isEdit, { setTrue: onClickEdit, setFalse: exitEditMode }] =
    useBoolean();
  const [confirmLoading, { setTrue: setLoading, setFalse: stopLoading }] =
    useBoolean();
  const [continueCreate, { toggle: onChangeContinueCreate }] = useBoolean(true);

  const [form] = Form.useForm();
  const formValType = Form.useWatch('type', form);
  const cost_account_id = Form.useWatch('cost_account_id', form);
  const income_account_id = Form.useWatch('income_account_id', form);

  const visible = useMemo(
    () => !!(billing || isCreate || transBilling?.length),
    [billing, isCreate, transBilling],
  );
  const isEdit = useMemo(() => _isEdit || isCreate, [_isEdit, isCreate]);
  const onClose = () => {
    setDrawerBilling({});
    exitEditMode();
  };

  const [costTransBilling, incomeTransBilling] = useMemo(() => {
    return (transBilling || []).sort((a, b) => a.type - b.type);
  }, [transBilling]);

  const onSave = async () => {
    const formVal = await form.validateFields();

    const {
      amount,
      time,
      account_id,
      category_id,
      income_account_id,
      cost_account_id,
      type,
      is_none_rountine,
      remark,
    } = formVal;

    setLoading();
    const params = {
      id: billing?.id || genId(),
      amount,
      is_none_rountine,
      category_id,
      account_id,
      time: time.valueOf(),
      remark,
    } as ServiceBilling;
    if (formVal.type) {
      await updateBilling(params);
      cashbook.createBilling({
        id: params.id,
        amount,
        isNonRountine: is_none_rountine,
        category: cashbook.getAndCreateCategory({ id: category_id }),
        account: cashbook.getAndCreateAccount({ id: account_id }),
        remark,
        time,
      });
    } else {
      params.id = costTransBilling?.id || genId();
      params.is_none_rountine = false;
      params.category_id =
        cashbook.categories.find(
          ({ isTransfer, type }) => isTransfer && type === IncomeOrCost.cost,
        )?.id || '';
      params.account_id = cost_account_id;
      await updateBilling(params);
      cashbook.createBilling(
        {
          id: params.id,
          amount,
          isNonRountine: false,
          category: cashbook.getAndCreateCategory({ id: params.category_id }),
          account: cashbook.getAndCreateAccount({ id: cost_account_id }),
          remark,
          time,
        },
        5,
      );
      params.id = incomeTransBilling?.id || genId();
      params.category_id =
        cashbook.categories.find(
          ({ isTransfer, type }) => isTransfer && type === IncomeOrCost.income,
        )?.id || '';
      params.account_id = income_account_id;
      await updateBilling(params);
      cashbook.createBilling(
        {
          id: params.id,
          amount,
          isNonRountine: false,
          category: cashbook.getAndCreateCategory({ id: params.category_id }),
          account: cashbook.getAndCreateAccount({ id: income_account_id }),
          remark,
          time,
        },
        5,
      );
    }
    stopLoading();
    message.success('保存成功');
    if (isCreate && continueCreate) {
      form.resetFields(['amount', 'remark', 'is_none_rountine']);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (!isCreate) {
      setTimeout(() => {
        form.setFieldsValue({
          category_id: billing?.category?.id,
          account_id: billing?.account?.id,
          cost_account_id: costTransBilling?.account?.id,
          income_account_id: incomeTransBilling?.account?.id,
          amount: billing?.amount || costTransBilling.amount,
          type: billing?.type || 0,
          remark: billing?.remark || '',
          is_none_rountine: billing?.isNoneRountine || false,
          time: dayjs(billing?.date),
        });
      });
    } else {
      form.setFieldsValue({
        amount: 0,
      });
    }
  }, [visible, isEdit]);

  useEffect(() => {
    form.resetFields(['category_id']);
  }, [formValType]);

  useEffect(() => {
    form.setFieldsValue({
      time: dayjs(),
      type: IncomeOrCost.cost,
    });
  }, []);

  useEffect(() => {
    if (income_account_id === cost_account_id) {
      form.resetFields(['cost_account_id']);
    }
  }, [income_account_id]);

  useEffect(() => {
    if (income_account_id === cost_account_id) {
      form.resetFields(['income_account_id']);
    }
  }, [cost_account_id]);

  return (
    <Drawer
      visible={visible}
      footer={
        <Button
          onClick={onSave}
          loading={confirmLoading}
          type="primary"
          style={{ float: 'right' }}>
          保存
        </Button>
      }
      extra={
        !isCreate ? (
          <DeleteBillingBtn
            billings={billing ? [billing] : transBilling || []}
            onAfterDelete={onClose}
          />
        ) : (
          <>
            连续记录{' '}
            <Switch
              checked={continueCreate}
              onChange={onChangeContinueCreate}
            />
          </>
        )
      }
      title={
        <div>
          {isCreate ? (
            '新建'
          ) : (
            <div>
              {(billing || costTransBilling)?.date || ''} -{' '}
              {(billing || costTransBilling)?.category?.name || ' '}
              {!isEdit && (
                <FormOutlined
                  rev=""
                  style={{
                    cursor: 'pointer',
                    color: '#1677ff',
                    marginLeft: '10px',
                  }}
                  onClick={onClickEdit}
                />
              )}
            </div>
          )}
        </div>
      }
      width={`max(500px, 40vw)`}
      onClose={onClose}>
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ offset: 1 }}
        form={form}
        disabled={confirmLoading}>
        {isEdit ? (
          <>
            <Form.Item label="类型" name="type">
              <Select
                disabled={!isCreate}
                options={[
                  {
                    label: incomeOrCostInfoMap[IncomeOrCost.cost].str,
                    value: IncomeOrCost.cost,
                  },
                  {
                    label: incomeOrCostInfoMap[IncomeOrCost.income].str,
                    value: IncomeOrCost.income,
                  },
                  {
                    label: '转账',
                    value: 0,
                  },
                ]}
              />
            </Form.Item>
            {[IncomeOrCost.cost, IncomeOrCost.income].includes(formValType) ? (
              <Form.Item
                label="账单分类"
                name="category_id"
                rules={[{ required: true, message: '请选择分类' }]}>
                <Select
                  showSearch
                  filterOption={filterOption}
                  options={cashbook.getCategoryOpts(formValType)}
                />
              </Form.Item>
            ) : null}
            <Form.Item
              label="金额"
              name="amount"
              rules={[
                {
                  min: 0.01,
                  type: 'number',
                  message: '金额需大于0',
                },
                { required: true, message: '请输入金额' },
              ]}>
              <CustomInput />
            </Form.Item>
            {[IncomeOrCost.cost, IncomeOrCost.income].includes(formValType) ? (
              <Form.Item
                label="账户"
                name="account_id"
                rules={[{ required: true, message: '请选择账户' }]}>
                <Select
                  showSearch
                  filterOption={filterOption}
                  options={cashbook.getAccountOpts()}
                />
              </Form.Item>
            ) : (
              <>
                <Form.Item
                  label="转出账户"
                  name="cost_account_id"
                  rules={[{ required: true, message: '请选择账户' }]}>
                  <Select
                    showSearch
                    filterOption={filterOption}
                    options={cashbook.getAccountOpts()}
                  />
                </Form.Item>
                <Form.Item
                  label="转入账户"
                  name="income_account_id"
                  rules={[{ required: true, message: '请选择账户' }]}>
                  <Select
                    showSearch
                    filterOption={filterOption}
                    options={cashbook.getAccountOpts()}
                  />
                </Form.Item>
              </>
            )}

            <Form.Item
              label="时间"
              name="time"
              rules={[{ required: true, message: '请选择时间' }]}>
              <CustomDatePicker />
            </Form.Item>
            <Form.Item
              label="非日常记录"
              name="is_none_rountine"
              valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="备注" name="remark">
              <Input.TextArea />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item label="类型">
              {transBilling
                ? '转账'
                : incomeOrCostInfoMap[
                    billing?.incomeOrCost || IncomeOrCost.income
                  ].str}
            </Form.Item>
            {transBilling ? null : (
              <Form.Item label="账单分类">
                {(billing || costTransBilling)?.category.name}
              </Form.Item>
            )}
            <Form.Item label="金额">
              {(billing || costTransBilling)?.amount}
            </Form.Item>
            {transBilling ? (
              <>
                <Form.Item label="转出账户">
                  {costTransBilling?.account?.name}
                </Form.Item>
                <Form.Item label="转入账户">
                  {incomeTransBilling?.account?.name}
                </Form.Item>
              </>
            ) : (
              <Form.Item label="账户">{billing?.account?.name}</Form.Item>
            )}

            <Form.Item label="时间">
              {(billing || costTransBilling)?.date}
            </Form.Item>
            {!transBilling ? (
              <Form.Item label="非日常记录">
                {billing?.isNoneRountine ? '是' : '否'}
              </Form.Item>
            ) : null}
            {!transBilling ? (
              <Form.Item label="备注">{billing?.remark || '-'}</Form.Item>
            ) : null}
          </>
        )}
      </Form>
    </Drawer>
  );
};

export default DrawerBilling;
