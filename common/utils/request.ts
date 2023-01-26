import axios from 'axios';
import { message } from 'antd';

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

type HandleLoading = (loading: boolean) => void;

type HandleError = (err: Error) => void;

export type RequestType = {
  url: string;
  params?: Record<string, any>;
  requestType: 'get' | 'post';
  handleLoading?: HandleLoading;
};

export const request = async ({
  url,
  params,
  requestType,
  handleLoading,
}: RequestType) => {
  handleLoading?.(true);
  const res = await instance[requestType](url, params)
    .then(res => {
      if (res.data?.success) {
        return { data: res.data?.data };
      } else {
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
