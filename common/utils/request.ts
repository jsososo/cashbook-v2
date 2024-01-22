import axios from 'axios';
import { message } from 'antd';
import storage from './storage';

const instance = axios.create({
  baseURL: '/api',
  timeout: 60000 * 10000000,
});

type HandleLoading = (loading: boolean) => void;

type HandleError = (err: Error) => void;

export type RequestType = {
  url: string;
  params?: Record<string, any>;
  requestType: 'get' | 'post';
  handleLoading?: HandleLoading;
};

export const request = async <T extends any>({
  url,
  params,
  requestType,
  handleLoading,
}: RequestType): Promise<{ data?: T; err?: any; code?: number }> => {
  handleLoading?.(true);

  const res = await instance[requestType](url, {
    ...params,
    token: storage.get('token'),
  })
    .then(res => {
      if (res.data?.success) {
        return { data: res.data?.data };
      } else {
        if (res.data?.code === 403) {
          window.location.href = '/login';
        }
        throw new Error(res.data?.message || '服务器出错');
      }
    })
    .catch(err => {
      message.error(err.message || '请求出错');
      return { err };
    });
  handleLoading?.(false);
  return res;
};
