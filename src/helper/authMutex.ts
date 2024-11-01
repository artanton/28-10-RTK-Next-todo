import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { removeUser } from '../redux/auth/AuthSlice';
const defaultURL = `${process.env.REACT_APP_API_URL}/api/users`;

const baseQuery = fetchBaseQuery({
  baseUrl: defaultURL,
  credentials: 'include',
  prepareHeaders: headers => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Access-Control-Allow-Origin', '*');
    return headers;
  },
});

const mutex = new Mutex();
export const customFetchBase: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          api.dispatch(removeUser());
        }

        const { data } = await baseQuery(
          {
            credentials: 'include',
            url: '/regenerate',
            method: 'GET',
            
          },
          api,
          extraOptions
        );
        
        if(data){
        const token = (data as any).accessToken;

        
          localStorage.setItem('accessToken', token);
          result = await baseQuery(args, api, extraOptions);
        } else {
          localStorage.removeItem('accessToken');
          api.dispatch(removeUser());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};
