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

export function ApiCommonResponse<T extends Type<any>>(dataType: T) {
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
              data: {
                $ref: getSchemaPath(dataType),
              },
            },
          },
        ],
      },
    }),
  );
}

export function IsEthAddress(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<any>, propertyName: string) {
    registerDecorator({
      name: 'isEthAddress',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return matches(value, /^0x[a-fA-F0-9]{40}$/);
        },
        defaultMessage() {
          return `${propertyName} should be a valid eth address !`;
        },
      },
    });
  };
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
            ? matches(value, /^[A-Za-z0-9 #^&*_+\-=]+$/)
            : matches(value, /^[A-Za-z0-9 #^&*_+\-=]+$/);
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
      },
    });
  };
}

export function IsPostalCodeOf(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    const unsupportedCountryCode = ['AX'];
    const unsupportedCountryCodeMapping = new Map<string, string>();
    unsupportedCountryCodeMapping.set('AX', 'FI');

    registerDecorator({
      name: 'isPostalCodeOf',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [countryCodeField] = args.constraints;
          const countryCode = (args.object as any)[countryCodeField];
          if (!isISO31661Alpha2(countryCode)) {
            // Invalid county code
            return false;
          }

          let countryCodeISO = countryCode;
          if (unsupportedCountryCodeMapping.get(countryCode)) {
            // Check is unsupported mapping has something
            countryCodeISO = unsupportedCountryCodeMapping.get(countryCode);
          }

          return isPostalCode(
            value,
            unsupportedCountryCode.includes(countryCodeISO.toUpperCase()) // If still not present in the mapping, then it is unsupported and use 'any'
              ? 'any'
              : countryCodeISO,
          );
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            `${eachPrefix} $property must be a valid postal code in the specified country `,
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
          return matches(value, /^[A-Za-z0-9 .#^&*_+\-=]+$/);
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

export function IsOfferingId(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<any>, propertyName: string) {
    registerDecorator({
      name: 'isOfferingId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return matches(value, /^[0-9a-fA-F-]{36}$/);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a future date`;
        },
      },
    });
  };
}
