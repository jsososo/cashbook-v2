import styled from 'styled-components';

export const StyledWrapper = styled.div`
  width: 100%;
  padding: 0 4vw;
  height: 100vh;
  overflow-y: hiiden;
  background: #fff;

  .ant-timeline-item-content {
    margin-left: 50px;
  }

  &.scroll-timeline {
    max-height: calc(100vh - 50px);
    overflow: auto;
    padding-left: 56px;

    .inner-content {
      padding-left: 56px;
    }

    ::-webkit-scrollbar {
    }
  }

  .remark-content {
    padding-left: 8px;
  }
`;

export const FilterWrapper = styled.div`
  display: flex;
  margin-top: 24px;
  position: sticky;
  top: 0;
  z-index: 9;
  background: #fff;
  padding: 12px 0;

  > div {
    margin: 0 8px;
  }
`;
