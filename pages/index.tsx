import Cashbook from '@utils/cashbook';
import {
  useCallback,
  useEffect,
  useRef,
  createContext,
  useState,
  useMemo,
} from 'react';
import dayjs from 'dayjs';
import { num } from '@utils/math';
import { IncomeOrCost } from '@consts';
import storage from '@utils/storage';
import { getUserInfo, ServiceUserInfo } from '../common/services';
import BillingTimeline from '@components/timeline';
import Billing from '@utils/billing';
import DrawerBilling from '@components/drawer-billing';
import { EditBtn } from '@components/style/index-page';
import { PlusOutlined } from '@ant-design/icons';
import { useUpdate } from 'ahooks';
import { Row, Col, Tabs } from 'antd';
import AccountList from '@components/account-list';
import CategoryList from '@components/category-list';
import Chart from '@components/chart';

export type DrawerBilling = {
  billing?: Billing;
  isCreate?: boolean;
  transBilling?: Billing[];
};

export const CashbookContext = createContext({
  cashbook: new Cashbook(),
  drawerBilling: {} as DrawerBilling,
  setDrawerBilling: (state: DrawerBilling) => {},
  forceUpdate: () => {},
  filter: {} as Record<string, any>,
  setFilter: (val: Record<string, any>) => {},
});

const IndexPage = () => {
  const refCashbook = useRef<Cashbook>();

  const [token] = storage.useStorage<string>('token');
  const [userData, setUserData] =
    storage.useStorage<ServiceUserInfo>('user_data');
  const [cashbook, setCashbook] = useState(new Cashbook(userData));
  const [drawerBilling, setDrawerBilling] = useState<DrawerBilling>({});
  const [filter, setFilter] = useState<Record<string, any>>({});
  const forceUpdate = useUpdate();

  // 日历渲染
  const dateCellRender = useCallback((v: dayjs.Dayjs) => {
    if (!refCashbook.current) {
      return null;
    }
    const { cost, income } = (
      refCashbook.current.billingsDateMap[v.format('YYYY-MM-DD')] || []
    ).reduce(
      ({ cost, income }, { isTransfer, incomeOrCost, amount }) => ({
        cost: num(
          cost +
            (!isTransfer && incomeOrCost === IncomeOrCost.cost ? amount : 0),
        ),
        income: num(
          income +
            (!isTransfer && incomeOrCost === IncomeOrCost.income ? amount : 0),
        ),
      }),
      { cost: 0, income: 0 },
    );
    return (
      <div>
        {cost ? <div>coast: {cost}</div> : null}
        {income ? <div>income: {income}</div> : null}
      </div>
    );
  }, []);

  useEffect(() => {
    if (token) {
      getUserInfo().then(({ data }) => {
        setCashbook(new Cashbook(data));
        setUserData(data);
      });
    }
  }, [token]);

  const contextVal = useMemo(
    () => ({
      cashbook,
      drawerBilling,
      setDrawerBilling,
      forceUpdate,
      filter,
      setFilter,
    }),
    [cashbook, drawerBilling, filter],
  );

  if (!token) {
    return (window.location.href = '/login');
  }

  return (
    <CashbookContext.Provider value={contextVal}>
      <div>
        <Row>
          <Col span={12}>
            <BillingTimeline />
          </Col>
          <Col span={12}>
            <Tabs
              items={[
                {
                  label: '账户',
                  key: 'account',
                  children: <AccountList />,
                },
                {
                  label: '分类',
                  key: 'category',
                  children: <CategoryList />,
                },
              ]}
              tabBarExtraContent={<Chart />}
            />
          </Col>
        </Row>
        <DrawerBilling />
        <EditBtn onClick={() => setDrawerBilling({ isCreate: true })}>
          <PlusOutlined rev="" />
        </EditBtn>
      </div>
    </CashbookContext.Provider>
  );
};

export default IndexPage;
