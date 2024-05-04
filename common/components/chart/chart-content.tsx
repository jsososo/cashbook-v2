import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  useContext,
} from 'react';
import ReactECharts from 'echarts-for-react';
import DataHandler, {
  Options as DataHandlerOptions,
} from '@utils/chart/data-handler';
import type { EChartsOption } from 'echarts';
import { merge } from 'lodash-es';
import storage from '@utils/storage';
import Wrapper, { LayoutContent } from '@components/style/index-page';
import { CashbookContext } from '../../../pages';
import { Radio, RadioChangeEvent, Select, Switch } from 'antd';
import { IncomeOrCost } from '@consts';
import { filterOption } from '@utils/tools';
import { ServiceKanban } from '../../services';

export type SettingVal = {
  excludeCategory?: string[];
  dateCount?: number;
  unit?: 'd' | 'M' | 'y';
};

const ChartContent = (props: { kanban?: ServiceKanban }) => {
  const { kanban } = props;
  const [lineOptions, setLineOptions] = useState<EChartsOption>();
  const [pieOptions, setPieOptions] = useState<EChartsOption>();
  const dataRef = useRef<DataHandler>();
  const lineRef = useRef<any>();
  const pieRef = useRef<any>();
  const [passRecord] = storage.useStorage<string[]>('pass_record');
  const [settingVal, updateSettingVal] =
    storage.useStorage<SettingVal>('setting_val');
  const { cashbook } = useContext(CashbookContext);

  const options: DataHandlerOptions = useMemo(() => {
    return {
      dateCount: settingVal?.dateCount || 1,
      unit: settingVal?.unit || 'M',
      kanban,
    };
  }, [passRecord, settingVal, kanban]);

  useEffect(() => {
    const dataHandler = new DataHandler(cashbook.billings);
    dataRef.current = dataHandler;
  }, []);

  useEffect(() => {
    const dataHandler = dataRef.current;

    if (!options.kanban || !dataHandler) {
      return;
    }
    dataHandler.setOptions(options);
    setLineOptions(dataHandler.getLineOptions());
    setPieOptions(dataHandler.getPieOptions(0));
  }, [options]);

  const updatePieOpts = useCallback((dataIndex: number) => {
    if (dataRef.current) {
      setPieOptions(dataRef.current.getPieOptions(dataIndex));
    }
  }, []);

  const lineEnvent = useMemo(
    () => ({
      updateAxisPointer: (event: any) => {
        const xAxisInfo = event.axesInfo?.[0];
        if (xAxisInfo) {
          updatePieOpts(xAxisInfo.value);
        }
      },
      datazoom: (event: any) => {
        const { start, end } = event;
        const dataHandler = dataRef.current;
        if (dataHandler) {
          const [lineOpts, pieOpts] = dataHandler.setDatazoom(
            start as number,
            end as number,
          );
          setLineOptions(lineOpts);
          setPieOptions(pieOpts);
        }
      },
      axisareaselected: (e: any) => {},

      legendselectchanged: (event: any) => {
        const dataHandler = dataRef.current;
        if (dataHandler) {
          merge(dataHandler.lineLegendSelected, event.selected);
          storage.set('line_legend_selected', dataHandler.lineLegendSelected);
        }
      },
    }),
    [],
  );

  const pieEvent = useMemo(
    () => ({
      legendselectchanged: (event: any) => {
        const dataHandler = dataRef.current;
        if (dataHandler) {
          merge(dataHandler.pieLegendSelected, event.selected);
          storage.set('pie_legend_selected', dataHandler.pieLegendSelected);
          setPieOptions(dataHandler.getPieOptions());
        }
      },
    }),
    [],
  );

  const updateTimePeriod = useCallback(
    (e: RadioChangeEvent) => {
      const value = e.target.value;
      switch (value) {
        case '1_y':
          updateSettingVal({ ...settingVal, dateCount: 1, unit: 'y' });
          break;
        case '3_M':
          updateSettingVal({ ...settingVal, dateCount: 3, unit: 'M' });
          break;
        case '1_M':
          updateSettingVal({ ...settingVal, dateCount: 1, unit: 'M' });
          break;
        default:
          break;
      }
    },
    [settingVal],
  );

  return kanban ? (
    <Wrapper>
      <LayoutContent>
        <div className="filter-wrapper">
          <div>
            <Radio.Group
              defaultValue={`${settingVal?.dateCount || 1}_${
                settingVal?.unit || 'M'
              }`}
              onChange={updateTimePeriod}>
              <Radio.Button value="1_y">年</Radio.Button>
              <Radio.Button value="3_M">季</Radio.Button>
              <Radio.Button value="1_M">月</Radio.Button>
            </Radio.Group>
          </div>
        </div>
        {lineOptions && (
          <ReactECharts
            style={{ height: '500px', width: '80%' }}
            className="line-echarts-content"
            ref={e => (lineRef.current = e)}
            option={lineOptions}
            notMerge={true}
            lazyUpdate={true}
            onEvents={lineEnvent}
          />
        )}
        {pieOptions && (
          <>
            <ReactECharts
              style={{ height: '1200px', width: '80%' }}
              ref={e => (pieRef.current = e)}
              onEvents={pieEvent}
              className="pie-echarts-content"
              option={pieOptions}
            />
          </>
        )}
      </LayoutContent>
    </Wrapper>
  ) : null;
};

export default ChartContent;
