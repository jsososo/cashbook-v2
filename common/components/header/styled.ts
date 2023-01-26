import styled from 'styled-components';
import { Layout, Avatar as AntdAvatar } from 'antd';

export const Wrapper = styled(Layout.Header)`
  background: #fff !important;
  border-bottom: #00152905 1px solid;
  box-shadow: #00152922 0 2px 10px;
`;

export const Avatar = styled(AntdAvatar)`
  margin: 10px;
`;
