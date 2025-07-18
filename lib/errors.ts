import { widetype } from './widetype';

export type ApplicationErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'PAYMENT_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'METHOD_NOT_SUPPORTED'
  | 'TIMEOUT'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'PRECONDITION_FAILED'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'UNPROCESSABLE_CONTENT'
  | 'TOO_MANY_REQUESTS'
  | 'CLIENT_CLOSED_REQUEST'
  | 'INTERNAL_SERVER_ERROR'
  | 'NOT_IMPLEMENTED'
  | 'BAD_GATEWAY'
  | 'SERVICE_UNAVAILABLE'
  | 'GATEWAY_TIMEOUT'
  | 'UNKNOWN_HTTP_ERROR';

export const statusToCode: Record<number, ApplicationErrorCode> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  402: 'PAYMENT_REQUIRED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_SUPPORTED',
  408: 'TIMEOUT',
  409: 'CONFLICT',
  412: 'PRECONDITION_FAILED',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'UNPROCESSABLE_CONTENT',
  429: 'TOO_MANY_REQUESTS',
  499: 'CLIENT_CLOSED_REQUEST',
  500: 'INTERNAL_SERVER_ERROR',
  501: 'NOT_IMPLEMENTED',
  502: 'BAD_GATEWAY',
  503: 'SERVICE_UNAVAILABLE',
  504: 'GATEWAY_TIMEOUT'
};

export const codeToStatus: Record<ApplicationErrorCode, number> =
  widetype.fromEntries(
    Object.entries(statusToCode).map(([status, code]) => [code, Number(status)])
  );

export type ApplicationErrorArgs = {
  code: ApplicationErrorCode;
  message: string;
  cause?: unknown;
  data?: unknown;
};

export class ApplicationError extends Error {
  code: ApplicationErrorCode;
  data?: unknown;

  constructor(error: ApplicationErrorArgs) {
    super(error.message);
    this.name = error.code;
    this.code = error.code;
    this.message = error.message;
    this.cause = error.cause;
    this.data = error.data;
  }
}

export type HttpErrorArgs = {
  message: string;
  status: number;
  url: URL;
  cause?: unknown;
};
export class HttpError extends ApplicationError {
  constructor(args: HttpErrorArgs) {
    super({
      code: statusToCode[args.status] ?? 'UNKNOWN_HTTP_ERROR',
      message: args.message,
      cause: args.cause
    });
  }
}

export class UnauthorizedAccessError extends ApplicationError {
  constructor(message: string) {
    super({
      code: 'UNAUTHORIZED',
      message
    });
  }
}

export class NotFoundError extends ApplicationError {
  constructor(args: { message: string; data?: unknown }) {
    super({
      code: 'NOT_FOUND',
      ...args
    });
  }
}

export class UnexpectedError extends ApplicationError {
  constructor({ cause, message }: { message?: string; cause: unknown }) {
    super({
      code: 'INTERNAL_SERVER_ERROR',
      message: message ?? 'An unhandled error occurred.',
      cause
    });
  }
}

export namespace error {
  export function guard<TArgs extends any[], TResult>(
    fn: (...args: TArgs) => TResult
  ): (...args: TArgs) => TResult {
    return (...args: TArgs): TResult => {
      try {
        const result = fn(...args);

        if (result instanceof Promise) {
          return result.catch((error) => {
            if (error instanceof ApplicationError) {
              throw error;
            }
            throw new UnexpectedError({ cause: error });
          }) as TResult;
        }

        return result;
      } catch (error) {
        if (error instanceof ApplicationError) {
          throw error;
        }
        throw new UnexpectedError({ cause: error });
      }
    };
  }
}
