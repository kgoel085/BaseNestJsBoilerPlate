import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { CommonResponseDto } from '../interceptors/response.interceptor';
import {
  buildMessage,
  isISO31661Alpha2,
  isPostalCode,
  matches,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
interface ApiCommonResponseOptions {
  nullable?: boolean;
}

export function ApiCommonResponse<T extends Type<any>>(
  dataType: T,
  options: ApiCommonResponseOptions = {},
) {
  const { nullable = false } = options;

  return applyDecorators(
    ApiExtraModels(CommonResponseDto, dataType),
    ApiResponse({
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(CommonResponseDto),
          },
          {
            properties: {
              data: nullable
                ? {
                    allOf: [{ $ref: getSchemaPath(dataType) }],
                    nullable: true, // 👈 apply nullable
                  }
                : { $ref: getSchemaPath(dataType) },
            },
          },
        ],
      },
    }),
  );
}

export function IsName(
  isFullName = false,
  validationOptions?: ValidationOptions,
) {
  return function (object: NonNullable<any>, propertyName: string) {
    registerDecorator({
      name: 'isName',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return isFullName
            ? matches(value, /^[A-Za-z0-9 #^&*_+\-=()/'. ,:]+$/)
            : matches(value, /^[A-Za-z0-9 #^&*_+\-=()/'. ,:]+$/);
        },
        defaultMessage() {
          return `${propertyName} should only contains alphabets`;
        },
      },
    });
  };
}

export function IsDescription(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<any>, propertyName: string) {
    registerDecorator({
      name: 'isDescription',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return matches(value, /^[^${}<>]*$/);
        },
        defaultMessage() {
          return `${propertyName} should only contains alphanumeric characters`;
        },
      },
    });
  };
}

export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<any>, propertyName: string) {
    registerDecorator({
      name: 'isNotBlank',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value === 'string') {
            return value.trim().length > 0;
          } else {
            return true;
          }
        },
        defaultMessage() {
          return `${propertyName} should not be blank`;
        },
      },
    });
  };
}

export function IsPostalCodeOf(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    const unsupportedCountryCode = ['AX', 'AE'];
    const unsupportedCountryCodeMapping = new Map<string, string>([
      ['AX', 'FI'],
      ['AE', 'any'],
    ]);

    // NEW: regex constraint
    const POSTAL_CODE_REGEX = /^[A-Za-z0-9,.\-\/ ]{3,10}$/;

    registerDecorator({
      name: 'isPostalCodeOf',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // 1️⃣ Regex validation (always applied)
          return POSTAL_CODE_REGEX.test(value);

          const [countryCodeField] = args.constraints;

          // 2️⃣ No country provided → generic validation
          if (!countryCodeField) {
            return isPostalCode(value, 'any');
          }

          const countryCode = (args.object as any)[countryCodeField];

          if (!countryCode) {
            return isPostalCode(value, 'any');
          }

          if (!isISO31661Alpha2(countryCode)) {
            return false;
          }

          // 3️⃣ Map unsupported country codes
          const countryCodeISO =
            unsupportedCountryCodeMapping.get(countryCode) ?? countryCode;

          const validatorCountry = unsupportedCountryCode.includes(
            countryCodeISO.toUpperCase(),
          )
            ? 'any'
            : countryCodeISO;

          return isPostalCode(value, validatorCountry);
        },

        defaultMessage: buildMessage(
          () =>
            `$property must be a valid postal code (4–10 characters, alphanumeric, , . - / allowed)`,
          validationOptions,
        ),
      },
    });
  };
}

export function IsDateOfBirth(
  minAge = 18,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateOfBirth',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(dateOfBirth: any) {
          if (!(dateOfBirth instanceof Date)) {
            return false;
          }

          const today = new Date();
          const birthDate = new Date(dateOfBirth);

          // Ensure the date is not in the future
          if (birthDate > today) {
            return false;
          }

          // Ensure the user is at least 18 years old
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          return age >= minAge;
        },
        defaultMessage() {
          return `Date of birth must be a valid date and the user must be at least ${minAge} years old.`;
        },
      },
    });
  };
}

export function IsAddress(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<any>, propertyName: string) {
    registerDecorator({
      name: 'isAddress',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: any) {
          // Allow alphanumeric characters, spaces, commas, and basic punctuation
          return matches(value, /^[^${}<>]*$/);
        },
        defaultMessage() {
          return `${propertyName} should only contain alphanumeric characters, spaces, and commas.`;
        },
      },
    });
  };
}

export function IsFileName(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<any>, propertyName: string) {
    registerDecorator({
      name: 'isFileName',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return matches(value, /^[A-Za-z0-9 #^&*_+\-=()/'. ,:]+$/);
        },
        defaultMessage() {
          return `${propertyName} should only contain alphanumeric characters, spaces, and dot.`;
        },
      },
    });
  };
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<any>, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return false;
          const date = new Date(value);
          return date > new Date(); // Check if the date is in the future
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a future date`;
        },
      },
    });
  };
}

export function IsRedisUrl(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<any>, propertyName: string) {
    registerDecorator({
      name: 'isRedisUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          /**
           * Redis URL Format:
           * redis://[[username][:password]@]host[:port][/db]
           *
           * Username/password are optional.
           */

          const redisUrlRegex =
            /^rediss?:\/\/(?:([^:@]+)(?::([^@]+))?@)?([^:/?#]+)(?::(\d+))?(?:\/(\d+))?$/;

          const match = value.match(redisUrlRegex);
          if (!match) return false;

          const [, username, password, host, port, db] = match;

          // Validate port (if present)
          if (
            port &&
            (isNaN(Number(port)) || Number(port) <= 0 || Number(port) > 65535)
          ) {
            return false;
          }

          // Validate db index (if present)
          if (db && (isNaN(Number(db)) || Number(db) < 0)) {
            return false;
          }

          // Username/password OPTIONAL — nothing else to check
          if (username || password || host) {
            return true;
          }

          return true;
        },

        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Redis connection URL`;
        },
      },
    });
  };
}
