import z from 'zod';
import { ApplicationError, error, HttpError } from './errors';
import { mop } from './mop';
import { NextRequest, NextResponse } from 'next/server';

const originalFetch = fetch;

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export namespace http {
  export type ContentType =
    | 'application/json'
    | 'application/x-www-form-urlencoded'
    | 'text/plain';

  export const contentType = (type?: ContentType) => {
    return {
      bodyParser: (body: string) => {
        switch (type) {
          case 'application/json':
            return JSON.parse(body);
          case 'application/x-www-form-urlencoded':
            return Object.fromEntries(new URLSearchParams(body));
          case 'text/plain':
          default:
            return body;
        }
      }
    };
  };

  export type FetchArgs = RequestInit & { url: URL; query: URLSearchParams };
  export const fetch = async (args: FetchArgs): Promise<Response> => {
    const { url, ...init } = args;
    try {
      return await originalFetch(
        args.query.size > 0 ? `${url}?${args.query}` : url,
        init
      );
    } catch (err) {
      console.error('Unexpected fetch error', err);
      return new Response('Network error or DNS failure', {
        status: 500
      });
    }
  };

  type BaseUrlArgs = { baseUrl: string; path: string };
  type NextUrlArgs = {
    nextUrl: NextRequest['nextUrl'];
    path: string;
  };
  type RequestUrlArgs = {
    request: NextRequest;
    path: string;
  };
  export function url(args: BaseUrlArgs): URL;
  export function url(args: NextUrlArgs): URL;
  export function url(args: RequestUrlArgs): URL;
  export function url(args: BaseUrlArgs | NextUrlArgs | RequestUrlArgs): URL {
    const baseUrl =
      'nextUrl' in args
        ? args.nextUrl
        : 'request' in args
          ? args.request.nextUrl
          : args.baseUrl;
    const LOCAL_DEV_URL = `http://localhost:${process.env.PORT}`;
    return new URL(
      args.path,
      process.env.NODE_ENV === 'development' ? LOCAL_DEV_URL : baseUrl
    );
  }

  export type ResponseConfig = {
    json: any;
    status: number;
    redirect: URL;
  };

  export const response = (args: Partial<ResponseConfig> = {}) => {
    const merge = (override: Partial<ResponseConfig>) => {
      return response({ ...args, ...override });
    };
    const json = (json: any = {}) => {
      return merge({ json });
    };
    const status = (status?: number) => {
      return merge({ status });
    };
    const redirect = (redirect: URL) => {
      return merge({ redirect });
    };
    const end = () => {
      if (args.json && args.redirect) {
        throw new ApplicationError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Only one response format supported (.redirect, .json).'
        });
      }

      if (args.json) {
        return NextResponse.json(args.json, {
          status: args.status ?? (args.json ? 200 : 204)
        });
      } else if (args.redirect) {
        return NextResponse.redirect(args.redirect);
      }

      return NextResponse.json(
        { ok: true },
        {
          status: 200
        }
      );
    };

    return {
      json,
      status,
      redirect,
      end
    };
  };

  const createQueryParams = (params?: QueryParams) => {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        query.append(key, String(value));
      }
    }
    return query;
  };

  type ErrorCatcher = (data: any) => void;
  type AuthorizationGetter = () => Promise<Partial<{ authorization: string }>>;
  type QueryParams = Record<string, string | number | boolean>;
  interface HttpClientConfig<T extends z.ZodTypeAny> {
    auth: AuthorizationGetter;
    catcher: ErrorCatcher;
    baseUrl: string;
    query: QueryParams;
    needsAuth: boolean;
    method: Method;
    path: string;
    body: BodyInit;
    contentType: ContentType;
    output: T;
  }

  const client = <T extends z.ZodTypeAny>(
    config: Partial<HttpClientConfig<T>>
  ) => {
    const merge = <TNew extends z.ZodTypeAny>(
      overrides: Partial<HttpClientConfig<TNew>>
    ) =>
      client<TNew>({ ...config, ...overrides } as Partial<
        HttpClientConfig<TNew>
      >);

    const base = (baseUrl: string) => merge({ baseUrl });
    const query = (params: QueryParams) => merge({ query: params });
    const path = (raw: string) => merge({ path: raw });
    const boundary = (fn: ErrorCatcher) => merge({ catcher: fn });
    const security = (fn: AuthorizationGetter) => merge({ auth: fn });
    const secure = (state: boolean = true) => merge({ needsAuth: state });
    const post = () => merge({ method: 'POST' });
    const get = () => merge({ method: 'GET' });
    const json = (data?: any) =>
      merge({
        body: data ? JSON.stringify(data) : undefined,
        contentType: 'application/json'
      });
    const form = (data?: any) =>
      merge({
        body: data ? new URLSearchParams(data) : undefined,
        contentType: 'application/x-www-form-urlencoded'
      });

    const output = <TNew extends z.ZodTypeAny>(raw: TNew) => {
      return merge<TNew>({
        output: raw
      });
    };

    const then = async (
      resolve: (value: any) => void,
      reject?: (reason: any) => void
    ) => {
      return execute().then(resolve, reject);
    };

    const execute = error.guard(async (): Promise<z.infer<T>> => {
      if (!config.path)
        throw new ApplicationError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Path is not defined. Use .path to set the path.'
        });

      if (!config.method)
        throw new ApplicationError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Method is not defined. Use .get or .post to set the method.'
        });

      const headers = new Headers();

      if (config.contentType) {
        headers.append('Content-Type', config.contentType.toString());
      }

      if (config.needsAuth) {
        if (!config.auth)
          throw new ApplicationError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              'Authorization function is not defined. Use .authorization to set it.'
          });

        const { authorization } = await config.auth();
        if (authorization) {
          headers.append('Authorization', authorization);
        }
      }

      const query = createQueryParams(config.query);
      const url = new URL(config.path, config.baseUrl);
      const response = await fetch({
        url,
        query,
        method: config.method,
        headers,
        body: config.body
      });

      if (!response.ok) {
        const data = await response.text();
        console.log('response', response.status, response.statusText, data);
        throw new HttpError({
          message: 'Failed to fetch',
          cause: new Error(response.statusText),
          url,
          status: response.status
        });
      }

      const data = await response.json();

      if (config.catcher) {
        config.catcher(data);
      }

      if (config.output) {
        return mop
          .schema(config.output)
          .error('Failed to parse HTTP fetch response output')
          .parse(data);
      }
    });

    return {
      base,
      query,
      path,
      post,
      get,
      secure,
      then,
      json,
      form,
      output,
      end: execute,
      boundary,
      security
    };
  };

  export type Client = ReturnType<typeof client>;
  export const base = (baseUrl: string) => client({ baseUrl });
}
