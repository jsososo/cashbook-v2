import { ReloadOutlined, UserOutlined } from '@ant-design/icons';
import DataHandler from '@utils/data-handler';
import { Wrapper, Avatar } from './styled';
import { Row, Space, Dropdown } from 'antd';
import storage from '@utils/storage';
import type { UserInfo } from '@types';
import Settings from '../settings';

type Props = {
  queryData: () => void;
  dataHandler?: DataHandler;
};

const Header = ({ queryData, dataHandler }: Props) => {
  const [userInfo, setUserInfo] = storage.useStorage<UserInfo>('user-info');

  return (
    <Wrapper>
      <Row justify="space-between">
        <div>口袋记账数据可视化</div>
        <Space size="large">
          {userInfo ? (
            <>
              <ReloadOutlined onClick={() => queryData()} />
              <Settings dataHandler={dataHandler} />
              <Dropdown
                menu={{
                  items: [
                    {
                      label: '退出',
                      key: 'log-out',
                      danger: true,
                      onClick: () => setUserInfo(),
                    },
                  ],
                }}>
                <Avatar>{userInfo.email[0]}</Avatar>
              </Dropdown>
            </>
          ) : (
            <Avatar icon={<UserOutlined />} />
          )}
        </Space>
      </Row>
    </Wrapper>
  );
};

export default Header;
