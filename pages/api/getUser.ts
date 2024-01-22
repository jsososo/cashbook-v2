import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../common/services/client';
import TableStore from 'tablestore';

type Data = {
  name: string;
};

const params: TableStore.GetRowParams = {
  tableName: 'user',
  primaryKey: [{ name: 'soso' }],
};
var condition = new TableStore.CompositeCondition(
  TableStore.LogicalOperator.AND,
);
condition.addSubCondition(
  new TableStore.SingleColumnCondition(
    'name',
    'soso',
    TableStore.ComparatorType.EQUAL,
  ),
);

params.columnFilter = condition;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  client.getRow(params, function (err, res) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(res.row);
  });
  res.status(200).json({ name: 'John Doe' });
}
