import { ReloadOutlined, UserOutlined } from '@ant-design/icons';
import FilterRecord from '../filter-record';
import DataHandler from '@utils/data-handler';
import { Wrapper, Avatar } from './styled';
import { Col, Row, Space, Dropdown } from 'antd';
import { useState } from 'react';
import storage from '@utils/storage';
import type { UserInfo } from '@types';

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
          {userInfo && <ReloadOutlined onClick={() => queryData()} />}
          {/* <FilterRecord dataHandler={dataHandler} /> */}
          {userInfo ? (
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
          ) : (
            <Avatar icon={<UserOutlined />} />
          )}
        </Space>
      </Row>
    </Wrapper>
  );
};

export default Header;
