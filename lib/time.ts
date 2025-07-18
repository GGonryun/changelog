import { numbers } from './numbers';
import { text } from './text';

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const newTimestamp = (t: Date | number | string) => {
  // convert to date.
  const date = new Date(t);

  /**
   * @param options the duration to compare our timestamp against
   * @returns true if the timestamp is older than the given duration
   */
  const isAtLeast = (options: DurationOptions) => {
    const now = new Date();
    const duration = newDuration(options);
    return {
      old: () => now.getTime() - date.getTime() > duration.toMilliseconds()
    };
  };

  return { isAtLeast };
};

type NewTimestamp = ReturnType<typeof newTimestamp>;

type DurationOptions = Partial<{
  minutes: number;
  weeks: number;
}>;

const newDuration = (options: DurationOptions) => {
  const fallback = (number?: number) => number ?? 0;

  const toMilliseconds = () =>
    fallback(options.minutes) * MINUTE + fallback(options.weeks) * WEEK;

  return {
    toMilliseconds
  };
};

type NewDuration = ReturnType<typeof newDuration>;

export namespace timestamp {
  export const from = newTimestamp;
  export type Timestamp = NewTimestamp;
}

export namespace duration {
  export const from = newDuration;
  export type Duration = NewDuration;
}

type DateLike = string | number | Date;

export namespace dates {
  export const printMonth = (date: Date = new Date()) => {
    const monthName = new Intl.DateTimeFormat('en-US', {
      month: 'long'
    }).format(date);
    return text.uppercaseFirstLetter(monthName);
  };

  export const toDate = (date: DateLike): Date => {
    if (typeof date === 'number') {
      return new Date(date);
    } else if (typeof date === 'string') {
      return new Date(Date.parse(date));
    }
    return date;
  };
  // print the year in format: August 13th, 2025
  export const pretty = (value: DateLike): string => {
    const date = toDate(value);

    const day = date.getDate();
    const month = printMonth(date);
    const year = date.getFullYear();
    return `${month} ${day}${numbers.getOrdinalSuffix(day)}, ${year}`;
  };
}
