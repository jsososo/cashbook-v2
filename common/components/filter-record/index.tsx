import {
  useCallback,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';
import {
  Drawer,
  Button,
  Table,
  Switch,
  Form,
  InputNumber,
  Checkbox,
  DatePicker,
  Select,
  Row,
  Col,
} from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import DataHandler from '@utils/data-handler';
import { FcRed, FcGreen } from './styled';
import storage from '@utils/storage';

type SettingsProps = {
  dataHandler?: DataHandler;
};

const Settings = ({ dataHandler }: SettingsProps) => {
  const [visible, setVisible] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [options, setOptions] = useState({
    coast: new Set(),
    type: new Set(),
  });
  const passData = useRef<Set<string>>(new Set());

  useLayoutEffect(() => {
    passData.current = new Set(Array.from('pass_record') || []);
  }, []);

  useEffect(() => {
    if (dataHandler) {
      const rawRecord = dataHandler.getRawRecordArr();
      const options = {
        coast: new Set(),
        type: new Set(),
      };
      rawRecord.forEach(item => {
        options.coast.add(item.收支类型);
        options.type.add(item.账目分类);
      });
      setOptions({ ...options });
      setDataSource(dataHandler.getRawRecordArr());
    }
  }, [dataHandler]);

  const renderText = useCallback((v: string | number, item: any) => {
    const value = typeof v === 'number' ? Math.abs(v) : v;
    switch (item?.['收支类型']) {
      case '收入':
        return <FcRed>{value}</FcRed>;
      case '支出':
        return <FcGreen>{value}</FcGreen>;
      default:
        return value;
    }
  }, []);

  const getItemKey = useCallback((item: Record<string, any>) => {
    return `${item['时间']}_${item['账目分类']}_${item['金额']}_${
      item['备注'] || '-'
    }`;
  }, []);

  const handleCheck = useCallback(
    (item: Record<string, any>, v: boolean) => {
      if (v) {
        passData.current.add(getItemKey(item));
      } else {
        passData.current.delete(getItemKey(item));
      }
      storage.set('pass_record', Array.from(passData.current));
    },
    [getItemKey],
  );

  const onFilterChange = useCallback(
    (_: any, value: Record<string, any>) => {
      const rawRecord = dataHandler?.getRawRecordArr() || [];
      console.log(value);

      setDataSource(
        rawRecord.filter(item => {
          let flag = true;
          if (value.coast) {
            flag = flag && item.收支类型 === value.coast;
          }
          if (value.num_value) {
            const num_value = Math.abs(item.金额);
            if (value.num_type === 1) {
              flag = flag && num_value >= value.num_value;
            } else {
              flag = flag && num_value <= value.num_value;
            }
          }
          if (value.remark) {
            flag = flag && !!item.备注;
          }
          if (value.type) {
            flag = flag && item.账目分类 === value.type;
          }
          if (value.passed) {
            flag = flag && passData.current.has(getItemKey(item));
          }
          return flag;
        }),
      );
    },
    [dataHandler],
  );

  return (
    <>
      {dataHandler && (
        <>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setVisible(true)}></Button>
          <Drawer
            title="过滤数据"
            onClose={() => setVisible(false)}
            open={visible}
            width={900}>
            <div>
              <div>
                <Form onValuesChange={onFilterChange}>
                  <Row>
                    <Col span={5}>
                      <Form.Item label="收支类型" name="coast">
                        <Select
                          placeholder="选择收支类型"
                          allowClear
                          options={Array.from(options.coast).map(v => ({
                            label: v,
                            value: v,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={5} offset={1}>
                      <Form.Item label="分类" name="type">
                        <Select
                          placeholder="选择分类"
                          allowClear
                          options={Array.from(options.type).map(v => ({
                            label: v,
                            value: v,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8} offset={1}>
                      <Form.Item label="时间" name="passed">
                        <DatePicker.RangePicker allowClear />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>
                      <Row>
                        <Form.Item
                          label="金额"
                          initialValue={1}
                          name="num_type">
                          <Select
                            options={[
                              { label: '>=', value: 1 },
                              { label: '<=', value: 2 },
                            ]}
                          />
                        </Form.Item>
                        <Form.Item name="num_value">
                          <InputNumber min={0} step={0.01}></InputNumber>
                        </Form.Item>
                      </Row>
                    </Col>
                    <Col span={3}>
                      <Form.Item label="有备注" name="remark">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={4} offset={1}>
                      <Form.Item label="已标记" name="passed">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>
              <Table
                size="small"
                dataSource={dataSource}
                columns={[
                  { title: '时间', dataIndex: '时间' },
                  {
                    title: '收支类型',
                    dataIndex: '收支类型',
                    render: renderText,
                  },
                  {
                    title: '分类',
                    dataIndex: '账目分类',
                  },
                  { title: '金额', dataIndex: '金额', render: renderText },
                  { title: '备注', dataIndex: '备注', render: v => v || '-' },
                  {
                    title: '标记过滤',
                    width: 80,
                    fixed: 'right',
                    dataIndex: '',
                    render: (v, item) => (
                      <Switch
                        key={getItemKey(item)}
                        defaultChecked={passData.current.has(getItemKey(item))}
                        onChange={v => handleCheck(item, v)}
                      />
                    ),
                  },
                ]}
                pagination={{
                  simple: true,
                  pageSize: 20,
                  showQuickJumper: true,
                }}
              />
            </div>
          </Drawer>
        </>
      )}
    </>
  );
};

export default Settings;
