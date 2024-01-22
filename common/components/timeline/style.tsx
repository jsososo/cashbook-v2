import styled from 'styled-components';
import { Timeline } from 'antd';

export const StyledTimeline = styled(Timeline)`
  width: 100%;
  padding: 0 4vw;
  height: 100vh;
  overflow-y: hiiden;
  background: #fff;

  .ant-timeline-item-content {
    margin-left: 50px;
  }

  .scroll-timeline {
    max-height: calc(100vh - 50px);
    overflow: auto;
    padding-left: 32px;

    ::-webkit-scrollbar {
    }
  }

  .remark-content {
    padding-left: 8px;
  }
`;
