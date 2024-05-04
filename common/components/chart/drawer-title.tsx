import { useBoolean, useRequest } from 'ahooks';
import { Modal, Form, Input, Select, Switch, Space } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useContext, useRef, useState } from 'react';
import { CashbookContext } from '../../../pages';
import { IncomeOrCost } from '@consts';
import { ServiceKanban, getKanban, updateKanban } from '../../services';
import storage from '@utils/storage';

const DrawerTitle = (props: {
  activeKanban?: ServiceKanban;
  setActiveKanban?: (v: ServiceKanban) => void;
}) => {
  const { activeKanban, setActiveKanban } = props;
  const [state, { setTrue, setFalse }] = useBoolean();
  const [editKanbanId, setEditKanbanId] = useState('_');
  const { cashbook } = useContext(CashbookContext);
  const [storeKanbanId, updateStoreKanbanId] =
    storage.useStorage<string>('storeage_kanban_id');

  const defaultKanban = {
    id: '_',
    name: '默认看板',
    settings: {
      include_none_rountine: true,
      show_all_sum: true,
      show_total: true,
      show_all_cat: true,
      category_ids: cashbook.categories.map(({ id }) => id),
    },
  };

  const [form] = Form.useForm();

  const closeModal = () => {
    setFalse();
    form.resetFields();
  };

  const kanbanMap = useRef<Record<string, ServiceKanban>>({});

  const { data = [], run } = useRequest(async (showId = storeKanbanId) => {
    const { data } = await getKanban({ ids: cashbook.kanban_ids.join(',') });
    const kanbanList = data?.kanbanList || [];
    let find = false;
    kanbanList.forEach(v => {
      kanbanMap.current[v.id || '_'] = v;
      if (showId === v.id) {
        find = true;
        setActiveKanban?.(v);
      }
    });
    if (!find) {
      setActiveKanban?.(defaultKanban);
    }

    return kanbanList;
  });

  const onClickCreate = () => {
    form.resetFields();
    setEditKanbanId('');
    setTrue();
  };
  const onClickEdit = () => {
    form.resetFields();
    const kanban = data.find(({ id }) => id === activeKanban?.id);
    form.setFieldsValue({
      name: kanban?.name || '',
      ...(kanban?.settings || {}),
    });
    setEditKanbanId(activeKanban?.id || '_');
    setTrue();
  };

  const { run: onOk, loading } = useRequest(
    async () => {
      const { name, ...value } = await form?.validateFields();
      const { data } = await updateKanban({
        settings: { ...value },
        name,
        id: editKanbanId || undefined,
      });
      cashbook.upsertKanbanId(data?.id || '');
      run(data?.id);
      closeModal();
    },
    {
      manual: true,
    },
  );

  const onChangeActiveKanban = (v: string) => {
    updateStoreKanbanId(v);
    setActiveKanban?.(kanbanMap.current[v] || defaultKanban);
  };

  return (
    <>
      <>
        <Space>
          <Select
            value={activeKanban?.id}
            onChange={onChangeActiveKanban}
            style={{ width: '200px' }}
            options={[
              { label: '默认', value: '_' },
              ...data.map(({ id, name }) => ({
                value: id,
                label: name,
              })),
            ]}
          />
          {activeKanban?.id === '_' ? null : (
            <EditOutlined onClick={onClickEdit} rev="" />
          )}
          {state ? null : <PlusOutlined onClick={onClickCreate} rev="" />}
        </Space>
      </>
      <Modal
        open={state}
        title={editKanbanId ? '编辑看板' : '新建看板'}
        okText="确认"
        okButtonProps={{ loading }}
        cancelText="取消"
        onOk={onOk}
        onCancel={closeModal}>
        <Form form={form} labelCol={{ span: 6 }}>
          <Form.Item
            name="name"
            label="看板名称"
            rules={[{ required: true, message: '请输入看板名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category_ids" label="账单分类">
            <Select
              mode="multiple"
              maxTagCount={3}
              options={cashbook.categories
                .filter(({ isTransfer }) => !isTransfer)
                .map(c => ({
                  label: `【${
                    c.type === IncomeOrCost.cost ? '支出' : '收入'
                  }】${c.name}`,
                  value: c.id,
                }))}
            />
          </Form.Item>
          <Form.Item
            valuePropName="checked"
            name="include_none_rountine"
            label="包含非日常支出">
            <Switch />
          </Form.Item>
          <Form.Item valuePropName="checked" name="show_total" label="展示总额">
            <Switch />
          </Form.Item>
          <Form.Item
            valuePropName="checked"
            name="show_all_cat"
            label="默认展示全部">
            <Switch />
          </Form.Item>
          <Form.Item
            valuePropName="checked"
            name="show_all_sum"
            label="收支包含隐藏项"
            extra="收支不包含隐藏项时不展示盈余">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DrawerTitle;
