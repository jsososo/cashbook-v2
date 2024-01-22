import { Input } from 'antd';
import { useEffect, useState } from 'react';

interface IProps {
  value?: number;
  onChange?: (v: number) => void;
}

const CustomInput = (props: IProps) => {
  const { value, onChange } = props;
  const [val, setVal] = useState('');

  useEffect(() => {
    setVal(value ? String(value) : '');
  }, [value]);

  const onChangeInput = (e: any) => {
    setVal(e.target.value);
  };

  const onBlur = () => {
    try {
      const v = eval(val);
      const num = Number(v);
      if (!Number.isNaN(num)) {
        const v = Number(num.toFixed(2));
        onChange?.(v);
        setVal(v ? String(v) : '');
      }
    } catch (e) {
      // error
    }
  };

  return (
    <Input
      value={val}
      placeholder="0"
      onChange={onChangeInput}
      onBlur={onBlur}
    />
  );
};

export default CustomInput;
