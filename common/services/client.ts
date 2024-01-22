import { TableName } from '@consts/service';
import TableStore from 'tablestore';

const client = new TableStore.Client({
  accessKeyId: process.env.NEXT_PUBLIC_CLIENT_ID,
  accessKeySecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
  endpoint: 'https://soso-cash.cn-zhangjiakou.tablestore.aliyuncs.com',
  instancename: 'soso-cash',
});

export default client;

const handleData2Array = (primaryKey: Record<string, any>) =>
  Object.entries(primaryKey).map(([key, value]) => ({
    [key]: value,
  }));

const handleArray2Data = (array: Record<string, any>[]) =>
  array.reduce(
    (prev, v) => ({
      ...prev,
      [v.name || v.columnName]: v.value || v.columnValue,
    }),
    {} as Record<string, any>,
  );

export const getRow = (
  tableName: TableName,
  primaryKey: Record<string, any>,
) => {
  return new Promise((resolve, reject) => {
    client.getRow(
      {
        tableName,
        primaryKey: handleData2Array(primaryKey),
      },
      (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(
          handleArray2Data([
            ...(data.row?.primaryKey || []),
            ...(data.row?.attributes || []),
          ]),
        );
      },
    );
  });
};

export const getBatchRow = (
  tableName: TableName,
  primaryKeys: Record<string, any>[],
) => {
  return new Promise((resolve, reject) => {
    if (!primaryKeys.length) {
      return resolve([]);
    }
    const resGroup: any[] = [];
    let count = 0;
    let successCount = 0;

    while (primaryKeys.length) {
      count += 1;
      client.batchGetRow(
        {
          tables: [
            {
              tableName: tableName,
              primaryKey: primaryKeys
                .splice(0, 100)
                .map(v => handleData2Array(v)),
            },
          ],
        },
        (err, data) => {
          if (err) {
            return reject(err);
          }
          resGroup.push(
            ...(data?.tables?.[0] || []).map(v =>
              handleArray2Data([
                ...(v?.primaryKey || []),
                ...(v?.attributes || []),
              ]),
            ),
          );
          successCount += 1;
          if (successCount === count) {
            resolve(resGroup);
          }
        },
      );
    }
  });
};

export const putRow = (
  tableName: TableName,
  primaryKey: Record<string, any>,
  value: Record<string, any>,
) => {
  return new Promise((resolve, reject) => {
    client.putRow(
      {
        tableName,
        condition: new TableStore.Condition(
          TableStore.RowExistenceExpectation.IGNORE,
          null,
        ),
        primaryKey: handleData2Array(primaryKey),
        attributeColumns: handleData2Array(value),
        returnContent: { returnType: TableStore.ReturnType.Primarykey },
      },
      (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      },
    );
  });
};
