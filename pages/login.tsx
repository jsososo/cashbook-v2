import storage from '@utils/storage';
import { Form, Input, Button } from 'antd';
import { useEffect } from 'react';
import { createUser } from '../common/services';

const Login = () => {
  const [_, setToken] = storage.useStorage<string>('token');
  const [form] = Form.useForm();

  useEffect(() => {
    setToken('');
  }, []);

  const loginOrCreate = async (create = false) => {
    const { name, key } = form.getFieldsValue();
    const { data } = await createUser({
      name,
      key: btoa(key),
      create,
    });

    if (data?.token) {
      setToken(data?.token);
      window.location.href = '/';
    }
  };

  const onCreate = async () => loginOrCreate(true);

  const onLogin = async () => loginOrCreate();

  return (
    <div>
      <Form layout="vertical" form={form}>
        <Form.Item label="用户名" name="name">
          <Input />
        </Form.Item>
        <Form.Item label="密码" name="key">
          <Input type="password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={onCreate}>
            注册
          </Button>
          <Button type="primary" onClick={onLogin}>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
