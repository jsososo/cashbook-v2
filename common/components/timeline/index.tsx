import { Pointer } from '@components/style/common';
import { IncomeOrCost } from '@consts';
import Billing from '@utils/billing';
import { filterOption } from '@utils/tools';
import {
  Timeline,
  TimelineItemProps,
  Typography,
  Select,
  InputNumber,
} from 'antd';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CashbookContext } from '../../../pages';
import { StyledWrapper, FilterWrapper } from './style';
import { useScroll } from 'ahooks';

const Text = Typography.Text;
const Title = Typography.Title;

const BillingTimeline = () => {
  const { cashbook, setDrawerBilling, filter, setFilter } =
    useContext(CashbookContext);

  const [maxCount, setMaxCount] = useState(100);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInnerRef = useRef<HTMLDivElement>(null);

  const items = useMemo<(TimelineItemProps & { key: string })[]>(() => {
    let prevDate: string;
    const transBilling: Map<string, Billing[]> = new Map();
    return cashbook.billings
      .filter(({ account, category, amount }) => {
        if (filter.account?.length && !filter.account.includes(account.id)) {
          return false;
        }
        if (filter.category?.length) {
          if (!filter.category.includes(category.id)) {
            if (!(filter.category.includes('trans') && category.isTransfer)) {
              return false;
            }
          }
        }
        if (amount < filter.minAmount) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.time.valueOf() - a.time.valueOf())
      .reduce((arr, billing) => {
        const {
          date,
          amount,
          category,
          id,
          incomeOrCost,
          isTransfer,
          type,
          remark,
          account,
        } = billing;

        if (arr.length > maxCount) {
          return arr;
        }

        const pushDate = () => {
          if (prevDate !== date) {
            arr.push({
              children: <Title level={5}>{date}</Title>,
              key: date,
            });
            prevDate = date;
          }
        };

        if (isTransfer) {
          const transKey = `${date}_${amount}`;
          const storeList = transBilling.get(transKey) || ([] as Billing[]);
          const prevIndex = storeList.findIndex(b => b.type !== type);
          if (prevIndex > -1) {
            const [prev] = storeList.splice(prevIndex, 1);
            const trans = [prev, billing].sort((a, b) => a.type - b.type);
            pushDate();
            arr.push({
              children: (
                <Pointer
                  onClick={() => {
                    setDrawerBilling({
                      transBilling: trans,
                    });
                  }}>
                  {trans?.[0]?.account?.name || ''}
                  {' => '}
                  {trans?.[1]?.account?.name || 0} {amount}
                </Pointer>
              ),
              dot: <Text type="warning">{category.name}</Text>,
              key: id,
              color: '#999',
            });

            transBilling.delete(transKey);
          } else {
            storeList.push(billing);
            transBilling.set(transKey, storeList);
          }
        } else {
          pushDate();
          arr.push({
            children: (
              <Pointer onClick={() => setDrawerBilling({ billing })}>
                {incomeOrCost === IncomeOrCost.income ? '+' : '-'}
                {Number((amount || 0).toFixed(2))}
                <Text type="secondary" className="remark-content">
                  {remark}
                </Text>
              </Pointer>
            ),
            dot: (
              <Text
                type={
                  incomeOrCost === IncomeOrCost.income ? 'danger' : 'secondary'
                }>
                {category.name}
              </Text>
            ),
            key: id,
            color: '#999',
          });
        }

        return arr;
      }, [] as (TimelineItemProps & { key: string })[]);
  }, [cashbook, cashbook.updateAt, filter, maxCount]);

  const accountOptions = cashbook.accounts.map(({ name, id }) => ({
    value: id,
    label: name,
  }));

  const categoryOptions = cashbook.categories
    .filter(({ isTransfer }) => !isTransfer)
    .map(({ name, id, type }) => ({
      value: id,
      label: `${name}${type === IncomeOrCost.income ? ' (收入)' : ''}`,
    }));
  categoryOptions.push({ value: 'trans', label: '转账' });

  const position = useScroll(timelineRef.current);

  useEffect(() => {
    if (
      (position?.top || 0) + (timelineRef.current?.clientHeight || 0) + 50 >
      Math.max(timelineInnerRef.current?.clientHeight ?? 0, window.innerHeight)
    ) {
      setMaxCount(v => v + 100);
    }
  }, [position?.top]);

  const updateAccountFilter = useCallback((v: string[]) => {
    setMaxCount(100);
    setFilter({ account: v });
  }, []);
  const updateCategoryFilter = useCallback((v: string[]) => {
    setMaxCount(100);
    setFilter({ category: v });
  }, []);

  const updateMinAmount = useCallback((v?: any) => {
    setFilter({ minAmount: v || 0 });
  }, []);

  return (
    <>
      <StyledWrapper className="scroll-timeline" ref={timelineRef}>
        <FilterWrapper>
          <Select
            style={{ width: '150px' }}
            showSearch
            filterOption={filterOption}
            mode="multiple"
            options={accountOptions}
            value={filter.account}
            placeholder="全部账户"
            allowClear
            onChange={updateAccountFilter}
          />
          <Select
            placeholder="全部分类"
            style={{ width: '150px' }}
            showSearch
            filterOption={filterOption}
            mode="multiple"
            value={filter.category}
            options={categoryOptions}
            allowClear
            onChange={updateCategoryFilter}
          />
          <InputNumber
            style={{ width: '150px' }}
            placeholder="金额大于"
            value={filter.minAmount || ''}
            onChange={updateMinAmount}
          />
        </FilterWrapper>
        <div className="inner-content" ref={timelineInnerRef}>
          <Timeline>
            {items.map(({ key, ...rest }) => (
              <Timeline.Item key={key} {...rest} />
            ))}
          </Timeline>
        </div>
      </StyledWrapper>
    </>
  );
};

export default BillingTimeline;
