import styled from 'styled-components';
import { Layout, Empty } from 'antd';

const Wrapper = styled(Layout)`
  min-height: 100vh;
  min-width: 1260px;

  .ant-spin-container {
    min-height: 100vh;
  }

  .pie-echarts-content {
    margin-top: 20px;
    width: 80%;
    height: 1200px;
    left: 10%;
  }
  .line-echarts-content {
    width: 80%;
    height: 500px;
    left: 10%;
  }
`;

export const EmptyWrapper = styled(Empty)`
  margin-top: 40px;
`;

export const LayoutContent = styled(Layout.Content)`
  margin-top: 40px;
  min-height: calc(100vh - 64px);
`;

export default Wrapper;
