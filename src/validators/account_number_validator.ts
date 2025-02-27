import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";
import { SupportedCurrency } from "../types";
export function IsValidAccountNumberBasedOnCurrency(
  validationOptions?: ValidationOptions
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "isValidAccountNumberBasedOnCurrency",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(accountNumber: any, args: ValidationArguments) {
          const payload = args.object as {
            currency: SupportedCurrency;
            accountNumber: string;
          };

          // Get the currency from the object
          const currency = payload.currency;

          if (!currency) {
            return true;
          }

          if (!accountNumber) {
            return true;
          }

          // Validation logic based on currency
          switch (currency) {
            case SupportedCurrency.NGN:
              // For NGN, account number must be exactly 10 digits
              return /^\d{10}$/.test(accountNumber);

            default:
              // If currency is not one of the handled cases, consider it valid or invalid based on your requirements
              return false; // or true if you want to ignore other currencies
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        defaultMessage(_args: ValidationArguments) {
          return "Account number is not valid based on the provided currency.";
        },
      },
    });
  };
}
