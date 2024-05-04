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
  min-height: calc(100vh - 64px);

  .filter-wrapper {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 0 10%;

    .cat-filter {
      margin-left: 12px;
    }
  }
`;

export const EditBtn = styled.div`
  position: fixed;
  bottom: 50px;
  background: #1677ff;
  color: #fff;
  font-size: 30px;
  left: 50%;
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
  border-radius: 50%;
  transform: translateX(-50%) rotate(0);
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    transform: translateX(-50%) rotate(90deg);
  }
`;

export default Wrapper;
