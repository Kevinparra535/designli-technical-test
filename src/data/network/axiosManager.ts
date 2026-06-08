import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { injectable } from 'inversify';
import qs from 'qs';

import { config } from '@/config/config';
import { TYPES } from '@/config/types';

// import { AuthServiceImpl } from '../services/authService';
import Logger from '@/ui/utils/Logger';

export interface HttpManager {
  get<T = any>(
    url: string,
    filters?: Record<string, any>,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

/**
 * Implementation of the HttpManager interface using Axios library.
 */

@injectable()
export class AxiosHttpManager implements HttpManager {
  private http: AxiosInstance;

  private logger = new Logger('AxiosHttpManager');

  /**
   * Constructs a new instance of AxiosHttpManager.
   * @param authService - The authentication service used for checking active session.
   */
  constructor() {
    // @inject(TYPES.AuthService) private authService: AuthServiceImpl
    this.http = axios.create({
      baseURL: config.BASE_URL,
      timeout: 1000 * 60 * 5, // 5 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.http.interceptors.request.use(this._handleRequest);
    this.http.interceptors.response.use(this._handleSucess, this._handleError);
  }

  /**
   * Sends a GET request to the specified URL with optional filters.
   * @param url - The URL to send the request to.
   * @param filters - Optional filters to apply to the request.
   * @param config - The Axios request configuration.
   * @returns A promise that resolves to the response data.
   */
  public async get<T>(
    url: string,
    filters?: Record<string, any>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const searchParams = [
      'value',
      'status',
      'step_id',
      'user_id',
      'trace_id',
      'step_type',
      'association_name',
    ];

    const filter_: Record<string, any> = {};

    for (const param of searchParams) {
      if (filters && filters[param] !== undefined) {
        filter_[param] = filters[param];
      }
    }

    const otherFilters = Object.fromEntries(
      Object.entries(filters || {}).filter(
        ([key]) => !searchParams.includes(key),
      ),
    );

    const configQuery = {
      addQueryPrefix: true,
      encode: false,
    };

    const queries = qs.stringify(
      {
        ...otherFilters,
        filter_: Object.keys(filter_).length
          ? JSON.stringify(filter_)
          : undefined,
      },
      configQuery,
    );

    const checkURL = url?.endsWith('//') ? url.slice(url.length - 1) : url;
    const { data } = await this.http.get<T>(
      encodeURI(`${checkURL}${queries}`),
      config,
    );

    return data;
  }

  /**
   * Sends a POST request to the specified URL.
   * @param url - The URL to send the request to.
   * @param data - The data to send with the request.
   * @param config - The Axios request configuration.
   * @returns A promise that resolves to the response data.
   */
  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.http.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Sends a PUT request to the specified URL.
   * @param url - The URL to send the request to.
   * @param data - The data to send with the request.
   * @param config - The Axios request configuration.
   * @returns A promise that resolves to the response data.
   */
  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.http.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Sends a DELETE request to the specified URL.
   * @param url - The URL to send the request to.
   * @param config - The Axios request configuration.
   * @returns A promise that resolves to the response data.
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.delete<T>(url, config);
    return response.data;
  }

  private _handleRequest = async (config: AxiosRequestConfig): Promise<any> => {
    try {
      // const session = await this.authService.checkActiveSession(); // Asume que authService tiene un método getToken()

      // if (session) {
      //   config.headers = config.headers || {}; // Initialize headers if undefined
      //   config.headers.Authorization = `Bearer ${session.access_token}`;
      // }

      return config;
    } catch (error: any) {
      this.logger.error(error);
      return Promise.reject(error);
    }
  };

  private _handleSucess = <T>(response: T): T => response;

  private _handleError = (error: any) => {
    console.log(error);

    if (axios.isCancel(error)) {
      this.logger.warn('Request was cancelled');
      return Promise.reject(new Error('Request cancelled'));
    }

    if (error.code === 'ENETUNREACH') {
      this.logger.error('Network Unreachable');
      return Promise.reject(
        new Error(
          'Network unreachable. Please check your internet connection.',
        ),
      );
    }

    if (error.code === 'ECONNABORTED') {
      this.logger.error('Request timed out');
      return Promise.reject(
        new Error('Request timed out. Please try again later.'),
      );
    }

    if (!error.response) {
      this.logger.error('No response received from server');
      return Promise.reject(new Error('No response from server.'));
    }

    let errorMessage = 'An unknown error occurred';
    switch (error.response.status) {
      case 400:
        errorMessage =
          'Bad Request: ' +
          (error.response.data?.message || error.response.data?.error);
        break;
      case 401:
        errorMessage = 'Unauthorized: ' + error.response.data?.message;
        break;
      case 403:
        errorMessage = 'Forbidden: ' + error.response.data?.message;
        break;
      case 404:
        errorMessage = 'Not Found: ' + error.response.data?.message;
        break;
      case 500:
        errorMessage = 'Internal Server Error: ' + error.response.data?.message;
        break;
      default:
        errorMessage = 'Unhandled status code: ' + error.response.status;
    }
    this.logger.error(errorMessage);

    return Promise.reject({
      message: error.response.data?.message || errorMessage,
      statusCode: error.response.status,
      data: error.response.data,
    });
  };
}
