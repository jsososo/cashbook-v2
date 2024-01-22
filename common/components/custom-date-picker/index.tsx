import { DatePicker, Button, Space } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

interface IProps {
  value?: Dayjs;
  onChange?: (v: Dayjs) => void;
}

const CustomDatePicker = (props: IProps) => {
  const { value, onChange } = props;
  return (
    <Space size={8}>
      <Button
        size="small"
        onClick={() => onChange?.((value || dayjs()).subtract(1, 'd'))}
        icon={<MinusOutlined rev="" />}
      />
      <DatePicker
        value={value}
        allowClear={false}
        onChange={v => onChange?.(v as Dayjs)}
      />
      <Button
        size="small"
        onClick={() => onChange?.((value || dayjs()).add(1, 'd'))}
        icon={<PlusOutlined rev="" />}
      />
    </Space>
  );
};

export default CustomDatePicker;
