import type { NextPage } from 'next';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import DataHandler, {
  Options as DataHandlerOptions,
} from '@utils/data-handler';
import type { EChartsOption } from 'echarts';
import { merge } from 'lodash-es';
import storage from '@utils/storage';
import Wrapper, {
  EmptyWrapper,
  LayoutContent,
} from '@components/style/index-page';
import { Spin } from 'antd';
import { getDataFromEmail } from '../common/services';
import Header from '@components/header';
import UserLogin from '@components/user-login';
import type { UserInfo } from '@types';
import { SettingVal } from '@components/settings';

const Home: NextPage = () => {
  const [lineOptions, setLineOptions] = useState<EChartsOption>();
  const [pieOptions, setPieOptions] = useState<EChartsOption>();
  const [loading, setLoading] = useState<boolean>(false);
  const dataRef = useRef<DataHandler>();
  const lineRef = useRef<any>();
  const pieRef = useRef<any>();
  const [userInfo, setUserInfo] = storage.useStorage<UserInfo>('user-info');
  const [loginVisible, setLoginVisible] = useState(false);
  const [emptyVisible, setEmptyVisible] = useState(true);
  const [passRecord] = storage.useStorage<string[]>('pass_record');
  const [settingVal] = storage.useStorage<SettingVal>('setting_val');

  const options: DataHandlerOptions = useMemo(() => {
    return {
      filters: settingVal?.filter ? passRecord || [] : undefined,
      dateCount: settingVal?.dateCount || 1,
      unit: settingVal?.unit || 'M',
    };
  }, [passRecord, settingVal]);

  const queryData = useCallback(
    (key?: string, email?: string) => {
      if (!key && !userInfo) {
        return;
      }
      getDataFromEmail(
        { key: key || userInfo?.key },
        {
          handleLoading: setLoading,
        },
      ).then(({ data, err }) => {
        setEmptyVisible(false);
        if (
          err?.message?.includes?.('没有收到 export@data.qeeniao.com 的邮件') &&
          email &&
          key
        ) {
          setUserInfo({
            email,
            key,
          });
          setEmptyVisible(true);
          return;
        }

        if (!data) {
          return;
        }
        if (key && email) {
          setUserInfo({
            email: email || '',
            key,
          });
        }
        let dataHandler = dataRef.current;
        if (!dataHandler) {
          dataHandler = new DataHandler(data, options);
          dataRef.current = dataHandler;
        } else {
          dataHandler.updateData(data);
        }

        setLineOptions(dataHandler.getLineOptions());
        setPieOptions(dataHandler.getPieOptions(0));
      });
    },
    [userInfo, options],
  );

  useEffect(() => {
    const dataHandler = dataRef.current;
    if (dataHandler) {
      dataHandler.setOptions(options);
      setLineOptions(dataHandler.getLineOptions());
      setPieOptions(dataHandler.getPieOptions(0));
    }
  }, [options]);

  useEffect(() => {
    if (!userInfo) {
      setLineOptions(undefined);
      setPieOptions(undefined);
      setLoginVisible(true);
      setEmptyVisible(false);
    } else {
      queryData();
    }
  }, [userInfo]);

  useEffect(() => {
    if (dataRef.current) {
      setLoginVisible(false);
    }
  }, [dataRef.current]);

  useEffect(() => {
    setLoginVisible(!userInfo);
  }, [userInfo]);

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
          setLineOptions(dataHandler.getLineOptions());
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

  return (
    <Wrapper>
      <Spin spinning={loading}>
        <Header queryData={queryData} dataHandler={dataRef.current} />
        <LayoutContent>
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
          {loginVisible ? <UserLogin queryData={queryData} /> : null}
          {emptyVisible ? <EmptyWrapper /> : null}
        </LayoutContent>
      </Spin>
    </Wrapper>
  );
};

export default Home;
