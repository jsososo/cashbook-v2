import { Form, Input, Button } from 'antd';
import { useState } from 'react';
import { encode } from '@utils/private-key';
import { FormWrapper } from './style';

type Props = {
  queryData: (key?: string, email?: string) => void;
};

const UserLogin = ({ queryData }: Props) => {
  const [form] = Form.useForm();

  const onSubmit = () => {
    const { email, password, host } = form.getFieldsValue();
    queryData(encode(email, password, host), email);
  };

  return (
    <FormWrapper
      form={form}
      labelCol={{ span: 4, offset: 4 }}
      onFinish={onSubmit}
      wrapperCol={{ span: 8 }}>
      <Form.Item
        label="邮箱"
        name="email"
        rules={[{ required: true, message: '请输入邮箱' }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="密码"
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}>
        <Input type="password"></Input>
      </Form.Item>
      <Form.Item
        label="IMAP 服务host"
        name="host"
        rules={[{ required: true, message: '请输入IMAP 服务host' }]}>
        <Input />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8 }}>
        <Button type="primary" htmlType="submit">
          登陆并获取邮箱
        </Button>
      </Form.Item>
    </FormWrapper>
  );
};

export default UserLogin;
