import { z } from 'zod';
import { ApplicationError } from './errors';

/**
 * Miguel Object Parser (MOP)
 */
export namespace mop {
  interface ParseConfig<T extends z.ZodTypeAny> {
    error?: string;
    schema?: T;
  }
  const client = <T extends z.ZodTypeAny>(config: ParseConfig<T>) => {
    const schema = <T extends z.ZodTypeAny>(schema: T) => {
      return client<T>({
        ...config,
        schema
      });
    };

    const error = (message: string) => {
      return client({
        ...config,
        error: message
      });
    };

    const parse = (data: unknown): z.infer<T> => {
      if (!config.schema) {
        throw new ApplicationError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No schema defined. Please use .schema to define a schema.'
        });
      }

      const safe = config.schema.safeParse(data);
      if (!safe.success)
        throw new ApplicationError({
          code: 'VALIDATION_ERROR',
          message: config.error ?? 'Failed to process schema',
          cause: safe.error
        });
      return safe.data;
    };

    return {
      schema,
      error,
      parse
    };
  };
  export const schema = <T extends z.ZodTypeAny>(schema: T) => {
    return client<T>({ schema });
  };
  export const error = (message: string) => {
    return client({ error: message });
  };
}
