import { useBoolean } from 'ahooks';
import { Drawer, Button } from 'antd';
import ChartContent from './chart-content';

import styled from 'styled-components';
import { LineChartOutlined } from '@ant-design/icons';
import { useContext, useState } from 'react';
import { CashbookContext } from '../../../pages';
import DrawerTitle from './drawer-title';
import { ServiceKanban } from '../../services';

const StyledDrawer = styled(Drawer)`
  .ant-layout {
    background: #fff;
  }
`;

const ChartButton = styled(LineChartOutlined)`
  padding: 0 12px;
  &:hover {
    color: #1677ff;
  }
`;

const Chart = () => {
  const [state, { setTrue, setFalse }] = useBoolean();
  const { cashbook } = useContext(CashbookContext);
  const [kanban, setActiveKanban] = useState<ServiceKanban>();

  return (
    <>
      {cashbook.billings.length ? (
        <ChartButton onClick={setTrue} rev="" />
      ) : null}
      <StyledDrawer
        width="100vw"
        title={
          <DrawerTitle
            activeKanban={kanban}
            setActiveKanban={setActiveKanban}
          />
        }
        onClose={setFalse}
        open={state}>
        {state ? <ChartContent kanban={kanban} /> : null}
      </StyledDrawer>
    </>
  );
};

export default Chart;
