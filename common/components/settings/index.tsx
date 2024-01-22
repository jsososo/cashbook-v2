import { Drawer, Form, Switch, InputNumber, Select } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useState } from 'react';
import FilterRecord from '../filter-record';
import DataHandler from '@utils/chart/data-handler';
import storage from '@utils/storage';

type SettingsProps = {
  dataHandler?: DataHandler;
};

export type SettingVal = {
  filter?: boolean;
  dateCount?: number;
  unit?: 'd' | 'M' | 'y';
};

const Settings = ({ dataHandler }: SettingsProps) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm<SettingVal>();
  const filterRecordVisible = Form.useWatch('filter', form);
  const [settingVal, setSettingVal] =
    storage.useStorage<SettingVal>('setting_val');

  const checkedFilter = Form.useWatch('filter', form);

  return (
    <>
      <SettingOutlined onClick={() => setVisible(true)} />
      <Drawer
        title="设置"
        open={visible}
        onClose={() => setVisible(false)}
        width={900}>
        <Form
          form={form}
          initialValues={settingVal}
          onValuesChange={(_, val) => setSettingVal(val)}>
          <Form.Item label="时间间隔" name="dateCount" initialValue={1}>
            <InputNumber min={1} max={12} step={1} addonAfter="月" />
          </Form.Item>
          {/*<Form.Item label="时间单位" name="unit">
            <Select
              options={[
                { label: '年', value: 'y' },
                { label: '月', value: 'M' },
                { label: '天', value: 'd' },
              ]}
            />
          </Form.Item> */}
          <Form.Item label="过滤异常数据" name="filter">
            <Switch checked={checkedFilter} />
          </Form.Item>
          {dataHandler && filterRecordVisible && (
            <FilterRecord dataHandler={dataHandler} />
          )}
        </Form>
      </Drawer>
    </>
  );
};

export default Settings;
