import { useBoolean } from 'ahooks';
import { Drawer, Button } from 'antd';
import ChartContent from './chart-content';

const Chart = () => {
  const [state, { setTrue, setFalse }] = useBoolean();

  return (
    <>
      <Button onClick={setTrue}>chart</Button>
      <Drawer width="100vw" onClose={setFalse} open={state}>
        {state && <ChartContent />}
      </Drawer>
    </>
  );
};

export default Chart;
