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
    min-height: 40px;

    .category-item {
      min-width: 130px;
      max-width: 130px;
      text-align: center;
      border-radius: 4px;
      flex: 1;
      height: 34px;
      line-height: 32px;
      border: 1px solid #eee;
      margin: 8px;
      position: relative;
      overflow: hidden;

      &.edit-mode {
        text-align: left;
      }

      &:hover {
        .delete-btn {
          right: 0;
        }
        .edit-btn {
          left: 0;
        }
      }

      .delete-btn,
      .edit-btn {
        position: absolute;
        transition: 0.3s;
        padding: 0 8px;
        cursor: pointer;
      }

      .cate-input {
        width: 128px;
      }

      .delete-btn {
        right: -32px;
        &:hover {
          color: #f5222d;
        }
      }
      .edit-btn {
        left: -32px;
        &:hover {
          color: #1677ff;
        }
      }
    }
  }
`;
