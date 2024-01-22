import styled from 'styled-components';

export const Wrapper = styled.div`
  height: calc(100vh - 200px);
  overflow: auto;

  background: #fff;

  .cate-input {
    width: 150px;
  }

  .cate-name {
    margin: 8px;
    height: 24px;
    line-height: 24px;
    border-left: 5px solid #eee;
    padding-left: 8px;
  }

  .cate-list {
    flex-wrap: wrap;
    display: flex;

    .category-item {
      min-width: 120px;
      max-width: 120px;
      text-align: center;
      flex: 1;
      height: 32px;
      line-height: 32px;
      border: 1px solid #eee;
      margin: 8px;
    }
  }
`;
