import { request } from '@utils/request';
import type { RequestType } from '@utils/request';

type ServiceFunc = (
  params?: Record<string, any>,
  options?: {
    handleLoading?: RequestType['handleLoading'];
  },
) => Promise<any>;

export const getDataFromEmail: ServiceFunc = (params, options) =>
  request({
    url: '/getDataFromEmail',
    params,
    requestType: 'post',
    handleLoading: options?.handleLoading,
  });
