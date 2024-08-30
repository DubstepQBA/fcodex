interface ValidationError {
  field: string;
  message: string | false;
}

export interface ValidationSchema {
  [key: string]: {
    type:
      | "string"
      | "number"
      | "boolean"
      | "array"
      | "object"
      | "email"
      | "date"
      | "url";
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
}

export class Validator {
  private schema: ValidationSchema;

  constructor(schema: ValidationSchema) {
    this.schema = schema;
  }

  validate(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const [field, rules] of Object.entries(this.schema)) {
      const value = data[field];

      if (rules.required && (value === undefined || value === null)) {
        errors.push({ field, message: "This field is required." });
        continue;
      }

      if (value !== undefined) {
        if (rules.type === "string") {
          if (typeof value !== "string") {
            errors.push({
              field,
              message: `Expected a string but got ${typeof value}.`,
            });
          } else {
            if (rules.minLength && value.length < rules.minLength) {
              errors.push({
                field,
                message: `Must be at least ${rules.minLength} characters long.`,
              });
            }
            if (rules.maxLength && value.length > rules.maxLength) {
              errors.push({
                field,
                message: `Must be at most ${rules.maxLength} characters long.`,
              });
            }
            if (rules.pattern && !rules.pattern.test(value)) {
              errors.push({
                field,
                message: `Does not match the required pattern.`,
              });
            }
          }
        }

        if (rules.type === "number") {
          if (typeof value !== "number") {
            errors.push({
              field,
              message: `Expected a number but got ${typeof value}.`,
            });
          } else {
            if (rules.min !== undefined && value < rules.min) {
              errors.push({ field, message: `Must be at least ${rules.min}.` });
            }
            if (rules.max !== undefined && value > rules.max) {
              errors.push({ field, message: `Must be at most ${rules.max}.` });
            }
          }
        }

        if (rules.custom) {
          const customValidation = rules.custom(value);
          if (customValidation !== true) {
            errors.push({ field, message: customValidation });
          }
        }

        if (rules.type === "email") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push({ field, message: "Invalid email address." });
          }
        }

        if (rules.type === "date") {
          if (typeof value !== "string") {
            errors.push({
              field,
              message: "Invalid date format. Must be YYYY-MM-DD.",
            });
          }
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            errors.push({
              field,
              message: "Invalid date format. Must be YYYY-MM-DD.",
            });
          }
        }
        if (rules.type === "url") {
          if (
            !/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(
              value
            )
          ) {
            errors.push({ field, message: "Invalid URL." });
          }
        }
      }
    }

    return errors;
  }
}
