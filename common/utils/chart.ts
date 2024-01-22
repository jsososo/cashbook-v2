import dayjs from 'dayjs';
import { RawRecord } from '@types';
import RecordInfo from './chart/record-info';
import SurplusInfo from './chart/surplus-info';
import TotalInfo from './chart/total-info';
import { IncomeOrCost, incomeOrCostInfoMap } from '@consts/index';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import storage from './storage';

/**
 * lineData 原数据数组
 * [
 *    ['Type', '22.01', '22.02', ...],
 *    ['收入', 1, 2.1, 3, ...],
 *    ...
 * ]
 */
type ResultArr = any[][];

export type Options = {
  filters?: string[];
  dateCount?: number;
  unit: 'd' | 'M' | 'y';
};

const sum = (
  array: number[],
  i: number = 0,
  j: number = array.length,
): number => {
  const result = array
    .slice(i, j)
    .reduce((value, current) => value + current, 0);
  return Number(Number(result).toFixed(2));
};

export default class Chart {
  constructor(rawRecordArr: RawRecord[], options?: Options) {
    this.updateData(rawRecordArr);
    this.getTitle = this.getTitle.bind(this);
    this.setOptions(options);
  }

  updateData(rawRecordArr: RawRecord[]) {
    this.rawRecordArr = rawRecordArr;
    this.handleXlsx();
  }

  // setTimePeriod(startDate?: number, endDate?: number) {
  //   startDate && (this.startDate = startDate);
  //   endDate && (this.endDate = endDate);
  // }

  setOptions(options?: Options) {
    const {
      filters = this.filters,
      dateCount = this.dateCount || 1,
      unit = this.dateUnit || 'M',
    } = options || {};

    this.filters = filters;
    this.dateCount = dateCount;
    unit && (this.dateUnit = unit);
    this.getLineData();
    const dataLength = (this.lineData?.result?.[0]?.length || 1) - 1;
    this.dataRange = [
      {
        d: Math.max(0, dataLength - 365),
        M: Math.max(0, dataLength - Math.max(4, 12 / dateCount)),
        y: 0,
      }[this.dateUnit || 'M'],
      dataLength - 1,
    ];
  }

  private startDate: number = dayjs().set('M', 1).set('date', 1).valueOf();
  private endDate: number = dayjs().valueOf();
  private dateCount: number = 1;
  private dateUnit: Options['unit'] = 'M';
  private lineData?: TotalLineData;

  private rawRecordArr: RawRecord[] = [];

  private recordMap: Record<string, RecordInfo> = {};
  private dataRange = [0, 0];
  private filters: string[] = [];

  handleXlsx = () => {
    const { rawRecordArr = [] } = this;
    const resultMap: Record<string, RecordInfo> = {
      总额: new TotalInfo(),
      支出: new RecordInfo('支出', IncomeOrCost.cost),
      收入: new RecordInfo('收入', IncomeOrCost.income),
      盈余: new SurplusInfo(),
    };

    let startDate = dayjs().valueOf();

    rawRecordArr.reverse().forEach(val => {
      const incomeOrCost =
        incomeOrCostInfoMap[
          val['金额'] > 0 ? IncomeOrCost.income : IncomeOrCost.cost
        ];
      const name = val['账目分类'];
      if (name === '转账') {
        return;
      }
      const key = `${name}-${incomeOrCost.str}`;
      const reverseKey = `${name}-${
        incomeOrCostInfoMap[incomeOrCost.reverse].str
      }`;
      if (!resultMap[key]) {
        resultMap[key] = new RecordInfo(name, incomeOrCost.val);
        if (resultMap[reverseKey]) {
          resultMap[key].setDuplicate();
          resultMap[key].setDuplicate();
        }
      }
      if (resultMap[key]) {
        resultMap[key].push(val);
      }
      incomeOrCost.val === IncomeOrCost.income && resultMap['收入'].push(val);
      incomeOrCost.val === IncomeOrCost.cost && resultMap['支出'].push(val);
      resultMap['总额'].push(val);
      resultMap['盈余'].push(val);
      startDate = Math.min(startDate, dayjs(val.时间, 'YYYY/MM/DD').valueOf());
    });

    this.startDate = startDate;
    this.recordMap = resultMap;
  };

  getRawRecordArr() {
    return this.rawRecordArr.filter(item => item['账目分类'] !== '转账');
  }

  lineLegendSelected: Record<string, boolean> =
    storage.get('line_legend_selected') || {};

  pieLegendSelected: Record<string, boolean> =
    storage.get('pie_legend_selected') || {};

  private getFilterData = (type?: IncomeOrCost) => {
    const { result, costMap } = this.getLineData();

    // 仅计算支出
    const source = result.filter((arr: any[], i) => {
      switch (type) {
        case IncomeOrCost.cost:
          return (
            costMap[IncomeOrCost.cost].has(arr[0]) && !['支出'].includes(arr[0])
          );
        case IncomeOrCost.income:
          return (
            costMap[IncomeOrCost.income].has(arr[0]) &&
            !['总额', '盈余', '收入'].includes(arr[0])
          );
        default:
          return ['收入', '支出'].includes(arr[0]);
      }
    });

    return source;
  };

  private pieDataIndex: number = 0;

  private getTitle(isRange?: boolean, showCount?: boolean) {
    const { lineData, pieDataIndex, dataRange, dateCount, dateUnit } = this;
    const [startIndex, endIndex] = dataRange;
    const unitMap = { d: '日', M: '月', y: '年' };
    if (!lineData) {
      return '';
    }
    if (isRange) {
      return `${(lineData?.result?.[0]?.[startIndex + 1] || '')
        .split('-')
        .shift()} - ${(lineData?.result?.[0]?.[endIndex + 1] || '')
        .split('-')
        .pop()}${
        showCount
          ? ` 每${dateCount > 1 ? dateCount : ''}${unitMap[dateUnit]}`
          : ''
      }`;
    } else {
      return `${lineData?.result?.[0]?.[pieDataIndex + 1] || ''}`;
    }
  }

  setDatazoom(start: number, end: number) {
    const dataLength = (this.lineData?.result?.[0]?.length || 1) - 1;
    const startIndex = Math.floor((start * dataLength) / 100);
    const endIndex = Math.min(
      Math.floor((end * dataLength) / 100),
      dataLength - 1,
    );
    this.dataRange = [startIndex, endIndex];

    return [this.getLineOptions(), this.getPieOptions()];
  }

  getLineOptions(): EChartsOption {
    const source = this?.lineData?.result || [];
    const legendDataList = source.map(list => list[0]);
    const legendSelected = legendDataList.reduce(
      (prev, name) => ({
        ...prev,
        [name]: this.lineLegendSelected[name] ?? true,
      }),
      {},
    );
    legendDataList.shift();
    return {
      xAxis: {
        type: 'category',
        boundaryGap: false,
      },
      title: {
        text: `${this.getTitle(true, true)} 趋势`,
      },
      dataZoom: [
        {
          startValue: source[0][this.dataRange[0] + 1],
          endValue: source[0][this.dataRange[1] + 1],
        },
      ],
      legend: {
        type: 'scroll',
        width: '80%',
        data: legendDataList,
        selected: legendSelected,
        top: '8%',
      },
      tooltip: {
        trigger: 'axis',
        position: function (point, params, dom, rect, size) {
          return [point[0] + 50, 'center'];
        },
        align: 'left',
        verticalAlign: 'middle',
      },
      dataset: {
        source,
      },
      yAxis: { gridIndex: 0 },
      grid: { bottom: '10%', top: '20%' },
      series: [
        ...new Array(legendDataList.length).fill({
          type: 'line',
          symbol: 'none',
          top: '10%',
          sampling: 'lttb',
          smooth: 0.3,
          seriesLayoutBy: 'row',
          emphasis: { focus: 'series' },
        }),
      ],
    };
  }

  getPieOptions(dataIndex?: number): EChartsOption | undefined {
    const {
      pieDataIndex,
      dataRange,
      pieLegendSelected,
      getFilterData,
      getTitle,
    } = this;
    const costSource = getFilterData(IncomeOrCost.cost);
    const incomSource = getFilterData(IncomeOrCost.income);
    const source = getFilterData();

    this.pieDataIndex = dataIndex ?? pieDataIndex;
    const [startIndex, endIndex] = dataRange;
    const baseSeries: echarts.SeriesOption = {
      type: 'pie',
      radius: ['40%', '70%'],
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      height: 340,
      emphasis: {
        label: {
          show: true,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
    };
    const handleSource = (source: any[][], isTotal = false) =>
      source
        .map(resultArr => ({
          name: resultArr[0],
          value: isTotal
            ? sum(resultArr, startIndex + 1, endIndex + 2)
            : resultArr[(dataIndex ?? this.pieDataIndex) + 1] || 0,
        }))
        .filter(({ value }) => value);

    const handleSum = (source: any[][], isTotal = false) =>
      sum(handleSource(source, isTotal).map(({ value }) => value));

    const handleSurplus = (source: any[][], isTotal = false) =>
      Math.round(
        handleSource(source, isTotal).reduce(
          (prev, { name, value }) => prev + value * (name === '收入' ? 1 : -1),
          0,
        ) * 100,
      ) / 100;

    return {
      legend: {
        type: 'scroll',
        top: 'top',
        width: '80%',
        selected: pieLegendSelected,
        show: true,
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}¥（{d}%）',
      },
      toolbox: {
        show: false,
      },
      title: [
        {
          text: `${getTitle(true)} 占比数据`,
          left: '30%',
          top: 60,
          textAlign: 'center',
        },
        {
          text: `${getTitle()} 占比数据`,
          left: '70%',
          top: 60,
          textAlign: 'center',
        },
        {
          text: `总支出\n${handleSum(costSource, true)}¥`,
          left: '30%',
          textAlign: 'center',
          textVerticalAlign: 'middle',
          top: 240,
          textStyle: {
            fontSize: 14,
            lineHeight: 20,
          },
        },
        {
          text: `总支出\n${handleSum(costSource)}¥`,
          left: '70%',
          textAlign: 'center',
          textVerticalAlign: 'middle',
          top: 240,
          textStyle: {
            fontSize: 14,
            lineHeight: 20,
          },
        },
        {
          text: `总收入\n${handleSum(incomSource, true)}¥`,
          left: '30%',
          textAlign: 'center',
          textVerticalAlign: 'middle',
          top: 580,
          textStyle: {
            fontSize: 14,
            lineHeight: 20,
          },
        },
        {
          text: `总收入\n${handleSum(incomSource)}¥`,
          left: '70%',
          textAlign: 'center',
          textVerticalAlign: 'middle',
          top: 580,
          textStyle: {
            fontSize: 14,
            lineHeight: 20,
          },
        },
        {
          text: `总盈余\n${handleSurplus(source, true)}¥`,
          left: '30%',
          textAlign: 'center',
          textVerticalAlign: 'middle',
          top: 920,
          textStyle: {
            fontSize: 14,
            lineHeight: 20,
          },
        },
        {
          text: `总盈余\n${handleSurplus(source)}¥`,
          left: '70%',
          textAlign: 'center',
          textVerticalAlign: 'middle',
          top: 920,
          textStyle: {
            fontSize: 14,
            lineHeight: 20,
          },
        },
      ],
      series: [
        {
          ...baseSeries,
          left: '-40%',
          top: '80',
          data: handleSource(costSource, true),
        },
        {
          ...baseSeries,
          top: '80',
          left: '40%',
          data: handleSource(costSource),
        },
        {
          ...baseSeries,
          left: '-40%',
          top: '420',
          data: handleSource(incomSource, true),
        },
        {
          ...baseSeries,
          top: '420',
          left: '40%',
          data: handleSource(incomSource),
        },
        {
          ...baseSeries,
          left: '-40%',
          top: '760',
          data: handleSource(source, true),
        },
        {
          ...baseSeries,
          top: '760',
          left: '40%',
          data: handleSource(source),
        },
      ],
    };
  }
}
