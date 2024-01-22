import styled from 'styled-components';

export const Wrapper = styled.div`
  height: calc(100vh - 200px);
  overflow: auto;

  .empty-text {
    padding-right: 20px;
  }

  .acount-input {
    width: 240px;
    margin-right: 16px;
  }
  .confirm-create-btn {
    margin-right: 8px;
  }

  .account-item {
    display: flex;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    margin: 8px 0;
    background: #fcfcfc;
    transition: 0.3s;
    border-radius: 4px;
    padding: 8px; 24px;
    border-left: 8px solid #1677ff;

    &:hover {
      background: #1677ff11;
    }

    .account-name {
      flex: 1;
      color: #666;
      padding: 0 24px;
    }
    .account-amount {
      flex: 1;
      color: #999;
      text-align: right;
      padding: 0 24px;
    }
  }
`;
