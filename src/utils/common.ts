import {
  HttpException,
  HttpStatus,
  Type,
  ValidationPipe,
} from '@nestjs/common';
import {
  PhoneNumber,
  parsePhoneNumberWithError as parsePhoneNum,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from 'libphonenumber-js';

import {
  format,
  subDays,
  subHours,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import validationOptions from './validation-options';

enum TimeFilter {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
}

export default TimeFilter;

export const uint8ArrayToBase64 = (uint8Array: Uint8Array): string =>
  Buffer.from(uint8Array).toString('base64');

export const base64ToUint8Array = (base64: string): Uint8Array =>
  new Uint8Array(Buffer.from(base64, 'base64'));

export function base64ToBase64url(base64) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function parsePhoneNumber(
  phone: string,
  throwError = true,
): PhoneNumber {
  const isPossible = isPossiblePhoneNumber(phone);
  const isValid = isValidPhoneNumber(phone);

  if (throwError && (!isPossible || !isValid)) {
    throw new HttpException(
      'Provided phone number is not valid !',
      HttpStatus.BAD_REQUEST,
    );
  }

  const phoneNum = parsePhoneNum(phone);
  return phoneNum;
}

export function convertMinToMilliSecond(min: number) {
  return min * 60000;
}

export function generateDateRange(
  startDate: Date,
  endDate: Date,
  timeFilter: string,
): string[] {
  const dates: string[] = [];

  let adjustedStartDate = new Date(startDate);

  if (timeFilter === TimeFilter.Day) {
    adjustedStartDate = subHours(endDate, 24);
  } else if (timeFilter === TimeFilter.Week) {
    adjustedStartDate = subDays(endDate, 7);
  } else if (timeFilter === TimeFilter.Month) {
    adjustedStartDate = subMonths(endDate, 1);
  } else if (timeFilter === TimeFilter.Year) {
    adjustedStartDate = subYears(endDate, 1);
  }

  const current = new Date(adjustedStartDate);

  while (current <= endDate) {
    if (timeFilter === TimeFilter.Day) {
      dates.push(format(current, 'yyyy-MM-dd HH:mm'));
      current.setHours(current.getHours() + 1);
    } else if (timeFilter === TimeFilter.Week) {
      dates.push(format(current, 'yyyy-MM-dd'));
      current.setDate(current.getDate() + 1);
    } else if (timeFilter === TimeFilter.Month) {
      dates.push(format(current, 'yyyy-MM-dd'));
      current.setDate(current.getDate() + 1);
    } else if (timeFilter === TimeFilter.Year) {
      dates.push(format(current, 'yyyy-MM'));
      current.setMonth(current.getMonth() + 1);
    }
  }

  return dates;
}

export function getGraphStartDate(timeFilter) {
  let startDate: Date;
  let groupByFormat: string;
  switch (timeFilter) {
    case TimeFilter.Day:
      groupByFormat = "TO_CHAR(order.created_at, 'YYYY-MM-DD')";
      startDate = subDays(new Date(), 1);
      break;
    case TimeFilter.Week:
      groupByFormat = "TO_CHAR(order.created_at, 'YYYY-MM-DD')";
      startDate = subWeeks(new Date(), 1);
      break;
    case TimeFilter.Month:
      groupByFormat = "TO_CHAR(order.created_at, 'YYYY-MM-DD')";
      startDate = subMonths(new Date(), 1);
      break;
    case TimeFilter.Year:
      groupByFormat = "TO_CHAR(order.created_at, 'YYYY-MM')";
      startDate = subYears(new Date(), 1);
      break;
    default:
      throw new Error('Invalid time filter');
  }

  return { startDate, groupByFormat };
}
export function deepSerialize(obj) {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSerialize);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deepSerialize(value)]),
    );
  }
  return obj;
}

export function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

type QuarterRange = {
  label: string;
  start: Date;
  end: Date;
};

export function getQuarterRange(
  currentDate = new Date(),
  options?: { limit?: number; includeCurrentQuarter?: boolean },
): QuarterRange[] {
  const { limit, includeCurrentQuarter = false } = options || {};

  function buildQuarters(year: number) {
    return [
      {
        label: `Q1 ${year}`,
        start: new Date(year, 0, 1),
        end: new Date(year, 3, 1),
      },
      {
        label: `Q2 ${year}`,
        start: new Date(year, 3, 1),
        end: new Date(year, 6, 1),
      },
      {
        label: `Q3 ${year}`,
        start: new Date(year, 6, 1),
        end: new Date(year, 9, 1),
      },
      {
        label: `Q4 ${year}`,
        start: new Date(year, 9, 1),
        end: new Date(year, 11, 31),
      },
    ];
  }

  function filterQuarters(quarters: QuarterRange[]) {
    let filtered = quarters.filter((q) => {
      if (q.end < currentDate) return true; // fully past
      if (
        includeCurrentQuarter &&
        q.start <= currentDate &&
        q.end >= currentDate
      )
        return true; // ongoing
      return false;
    });

    if (limit && limit > 0) {
      filtered = filtered.slice(-limit);
    }
    return filtered;
  }

  // Try current year first
  let filteredQuarters = filterQuarters(
    buildQuarters(currentDate.getFullYear()),
  );

  // If no quarters found, fallback to previous year
  if (filteredQuarters.length === 0) {
    filteredQuarters = filterQuarters(
      buildQuarters(currentDate.getFullYear() - 1),
    );
  }

  return filteredQuarters;
}

export function getCurrentQuarter(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based

  let quarter: number;
  let start: Date;
  let end: Date;

  if (month < 3) {
    quarter = 1;
    start = new Date(year, 0, 1);
    end = new Date(year, 3, 1);
  } else if (month < 6) {
    quarter = 2;
    start = new Date(year, 3, 1);
    end = new Date(year, 6, 1);
  } else if (month < 9) {
    quarter = 3;
    start = new Date(year, 6, 1);
    end = new Date(year, 9, 1);
  } else {
    quarter = 4;
    start = new Date(year, 9, 1);
    end = new Date(year + 1, 0, 1);
  }

  return {
    label: `Q${quarter} ${year}`,
    start,
    end,
  };
}

export function getDaysPassed(
  fromDate: Date,
  toDate: Date = new Date(),
  includeEndDate = true,
): number {
  const start = new Date(fromDate);
  const end = new Date(toDate);

  // Clear time portion for accurate full-day difference
  start.setHours(0, 0, 0, 0);
  if (includeEndDate) {
    end.setHours(23, 59, 59, 999);
  } else {
    end.setHours(0, 0, 0, 0);
  }

  const diffInMs = end.getTime() - start.getTime();
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  return Math.max(days, 0); // Prevent negative result
}

export function parseRedisUrl(redisUrl: string) {
  if (!redisUrl) {
    throw new Error('REDIS_URL is not provided');
  }

  let url: URL;
  try {
    url = new URL(redisUrl);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_: unknown) {
    throw new Error('Invalid REDIS_URL format');
  }

  const username = url.username || undefined;
  const password = url.password || undefined;

  const host = url.hostname;
  const port = url.port ? parseInt(url.port, 10) : 6379; // default Redis port

  // Optional — Redis DB index (e.g. redis://localhost:6379/2)
  const db =
    url.pathname && url.pathname !== '/'
      ? parseInt(url.pathname.replace('/', ''), 10)
      : undefined;

  return {
    protocol: url.protocol.replace(':', ''), // redis or rediss
    host,
    port,
    username,
    password,
    db,
    encryption: url.protocol === 'rediss',
    url: redisUrl,
  };
}

export function serializeError(err: unknown) {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(err as any), // preserves custom props like code, query, response
    };
  }

  return {
    name: 'UnknownError',
    message: String(err),
  };
}

const validationPipe = new ValidationPipe(validationOptions);

export function validateDto<T>(data: unknown, dtoClass: Type<T>): Promise<T> {
  return validationPipe.transform(data, {
    type: 'body',
    metatype: dtoClass,
  });
}

export function secondsToMinutes(seconds: string): number {
  const sec = parseInt(seconds, 10);
  if (isNaN(sec)) {
    throw new Error(`Invalid seconds value: ${seconds}`);
  }
  return Math.ceil(sec / 60);
}
