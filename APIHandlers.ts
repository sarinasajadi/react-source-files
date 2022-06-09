import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'universal-cookie';
import { User } from '../types/user';
import { AnyObject } from '../types/anyObject';

const cookies = new Cookies();

/**
 *
 * @param {Object} error
 * @throws It will throw the new error based on the try-catch encapsolution on every request
 */
// const errorHandler = (error) => {
//   throw new Error(`Following error has been thrown
//      ${error}`);
// };

/**
 *
 * @param {String} email
 * @param {String} password
 * @returns {Promise<T> | Object} Returned object is user data
 * @method
 */
export const Login = async (email: string, password: string): Promise<User> => {
  const encodedCredentials = btoa(`${email}:${password}`);
  const loginData = { email, password };
  return new Promise<User | any>((resolve, reject) => {
    Axios.post<User>(`${process.env.REACT_APP_BASE_URL}login`, loginData, {
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
      },
    })
      .then(resolve)
      .catch((error) => {
        const response = error.response ? error.response : undefined;
        return reject(response);
      });
  });
};

/**
 *
 * @returns {AxiosInstance}
 * @method
 */
const CreateHeaderWithBearerAuthentication = (): AxiosInstance =>
  Axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    headers: {
      Authorization: `Bearer ${cookies.get('userToken')}`,
    },
  });

/**
 *
 * @param {String} item
 * @param {Number} id
 * @returns {Promise<any> | Object} Returned object is based on requested item and id
 * @method
 */
export const Get = async <T = any>(item: string, id: number | string): Promise<AxiosResponse<T>> =>
  CreateHeaderWithBearerAuthentication().get(`${item}/${id}`);

export const GetItem = async <T = any>(item: string): Promise<AxiosResponse<T>> =>
  CreateHeaderWithBearerAuthentication().get(`${item}`);

/**
 *
 * @param {String} item
 * @param {Number} id
 * @returns {Promise<AxiosResponse<T>>}
 * @method
 */
export const Delete = (item: string, id: string | number): Promise<AxiosResponse> =>
  CreateHeaderWithBearerAuthentication().delete(`${item}/${id}`);

/**
 *
 * @param {String} item
 * @param {Object} object
 * @returns {Promise<T> | Object} Returned object is based on server response
 * @method
 */
export const Post = async <T = any>(item: string, object: T): Promise<AxiosResponse<T>> =>
  CreateHeaderWithBearerAuthentication().post(`${item}`, object);

/**
 *
 * @param {String} item
 * @param id
 * @param {Object} object
 * @returns {Promise<T> | Object} Returned object is based on server response
 * @method
 */

export const Put = async <T = any>(item: string, id: string | number, object: T): Promise<AxiosResponse<T>> =>
  CreateHeaderWithBearerAuthentication().put([item, id].join('/'), object);

export const Search = async <T = any>(item: string, object: AnyObject): Promise<AxiosResponse<T>> =>
  CreateHeaderWithBearerAuthentication().post(`${item}/search`, object);

export const FetchImage = async (item: string, id: string | number, path: string): Promise<AxiosResponse> =>
  CreateHeaderWithBearerAuthentication().get(`${item}/${id}/${path}`, {
    responseType: 'blob',
  });
