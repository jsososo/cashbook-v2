import dayjs from 'dayjs';
// import { RawRecord } from '@types';
import RecordInfo from './record-info';
import SurplusInfo from './surplus-info';
import TotalInfo from './total-info';
import { IncomeOrCost, incomeOrCostInfoMap } from '@consts/index';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import Billing from '@utils/billing';
import { ServiceKanban } from '../../services';

type RawRecord = Billing;

/**
 * lineData 原数据数组
 * [
 *    ['Type', '22.01', '22.02', ...],
 *    ['收入', 1, 2.1, 3, ...],
 *    ...
 * ]
 */
type ResultArr = any[][];

type TotalLineData = {
  result: ResultArr;
  costMap: {
    [IncomeOrCost.income]: Set<string>;
    [IncomeOrCost.cost]: Set<string>;
    0: Set<string>;
  };
};

export type Options = {
  filters?: string[];
  hideTotal?: boolean;
  dateCount?: number;
  unit: 'd' | 'M' | 'y';
  kanban?: ServiceKanban;
};

const colors = [
  '#336699',
  '#99ccff',
  '#6699cc',
  '#336666',
  '#66cccc',
  '#339999',
  '#99cccc',
  '#b4d8c2',
  '#ff9933',
  '#ffcc66',
  '#33cccc',
  '#66ccff',
  '#3366ff',
  '#9999ff',
  '#cc99ff',
  '#33cc99',
  '#aaccff',
  '#a8c8b4',
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
  '#3399cc',
  '#66cc99',
  '#e6b800',
  '#b87000',
  '#b3b3cc',
  '#7f7f00',
  '#ff0000',
  '#800000',
  '#cc0000',
  '#b30000',
];

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

export default class DataHandler {
  constructor(rawRecordArr: RawRecord[], options?: Options) {
    this.updateData(rawRecordArr);
    this.getTitle = this.getTitle.bind(this);
    this.setOptions(options);
  }

  updateData(rawRecordArr: RawRecord[]) {
    this.rawRecordArr = rawRecordArr.sort(
      (a, b) => a.time.valueOf() - b.time.valueOf(),
    );
    // this.handleXlsx();
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
      kanban,
    } = options || {};

    this.filters = filters;
    this.kanban = kanban?.settings || {};
    this.kanban.categorySet = new Set(kanban?.settings?.category_ids || []);
    this.dateCount = dateCount;
    unit && (this.dateUnit = unit);
    this.handleXlsx();
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
  private kanban?: ServiceKanban['settings'] & {
    categorySet?: Set<string>;
  } = undefined;

  handleXlsx = () => {
    const { rawRecordArr = [] } = this;
    const resultMap: Record<string, RecordInfo> = {
      总额: new TotalInfo(),
      支出: new RecordInfo('支出', IncomeOrCost.cost),
      收入: new RecordInfo('收入', IncomeOrCost.income),
      盈余: new SurplusInfo(),
    };

    let startDate = dayjs().valueOf();

    rawRecordArr.forEach(val => {
      const incomeOrCost = incomeOrCostInfoMap[val.type];
      const name = val.category.name;
      if (val.isTransfer) {
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
          resultMap[reverseKey].setDuplicate();
        }
      }

      let includeVal = false;

      if (!this.kanban?.categorySet?.has(val.category.id)) {
        delete resultMap[key];
      }

      if (
        resultMap[key] &&
        (this.kanban?.include_none_rountine || !val.isNoneRountine)
      ) {
        includeVal = true;
        resultMap[key].push(val);
      }

      incomeOrCost.val === IncomeOrCost.income &&
        (includeVal || this.kanban?.show_all_sum) &&
        resultMap['收入'].push(val);
      incomeOrCost.val === IncomeOrCost.cost &&
        (includeVal || this.kanban?.show_all_sum) &&
        resultMap['支出'].push(val);
      resultMap['总额'].push(val);
      resultMap['盈余'].push(val);
      startDate = Math.min(startDate, val.time.valueOf());
    });

    this.startDate = startDate;
    this.recordMap = resultMap;
    if (!this.kanban?.show_all_cat) {
      this.lineLegendSelected = Object.values(resultMap).reduce(
        (o: Record<string, boolean>, v) => {
          o[v.name] = ['总额', '收入', '支出', '盈余'].includes(v.name);
          return o;
        },
        {},
      );
    }
    if (!this.kanban?.show_total) {
      delete resultMap['总额'];
    }
    if (!this.kanban?.show_all_sum) {
      delete resultMap['盈余'];
    }
  };

  getLineData(): TotalLineData {
    const {
      startDate,
      endDate,
      dateCount: count,
      dateUnit: unit,
      recordMap,
    } = this;

    let s = dayjs(startDate).startOf(count > 1 ? 'y' : unit);
    let e = dayjs(s).add(count, unit).startOf(unit).subtract(1, 'millisecond');

    // 数据初始化
    const resultArr: ResultArr = [['Type']];
    const timeArr = resultArr[0];
    const formatMap: Record<typeof unit, string> = {
      d: 'MM.DD',
      M: 'YY.MM',
      y: 'YYYY',
    };
    const timeFormat = formatMap[unit];
    const resultMap: Record<string, number[]> = {};
    Object.values(recordMap).forEach(record => (resultMap[record.name] = []));
    const costMap = {
      [IncomeOrCost.income]: new Set<string>(),
      [IncomeOrCost.cost]: new Set<string>(),
      0: new Set<string>(),
    };

    // 开始循环，统计所有的数据，填入 resultArr
    do {
      // 如果横坐标间隔大于 1 天/月/年，显示区间为 xx.xx - xx.xx
      if (count > 1) {
        timeArr.push(`${s.format(timeFormat)}-${e.format(timeFormat)}`);
      } else {
        // 如果横坐标间隔为 1 天/月/年，直接显示那个时间就 ok
        timeArr.push(s.format(timeFormat));
      }
      Object.values(recordMap).forEach(record => {
        resultMap[record.name].push(
          record.getAmount(s.valueOf(), e.valueOf(), this.filters),
        );

        // 对收支数据进行额外的计算
        costMap[record.incomeOrCost || 0].add(record.name);
      });
      s = s.add(count, unit).startOf(unit);
      e = e.add(count, unit).endOf(unit);
    } while (s.valueOf() <= endDate);

    Object.entries(resultMap).forEach(([typeName, arr]) => {
      if (arr.find(v => v !== 0)) {
        resultArr.push([typeName, ...arr]);
      }
    });
    this.lineData = {
      result: resultArr,
      costMap,
    };

    return this.lineData;
  }

  getRawRecordArr() {
    return this.rawRecordArr.filter(item => !item.isTransfer);
  }

  lineLegendSelected: Record<string, boolean> = {};
  // storage.get('line_legend_selected') || {};

  pieLegendSelected: Record<string, boolean> = {};
  // storage.get('pie_legend_selected') || {};

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
      color: colors,
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
      color: colors,
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
          top: '760',
          data: handleSource(source, true),
        },
        {
          ...baseSeries,
          top: '760',
          left: '40%',
          data: handleSource(source),
        },
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
      ],
    };
  }
}
