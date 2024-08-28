import { Request, Response } from "../../core";
import { Validator, ValidationSchema } from "./validator";

export const validateMiddleware = (schema: ValidationSchema) => {
  const validator = new Validator(schema);

  return (req: Request, res: Response, next: () => void) => {
    req.body
      ?.then((body: any) => {
        const errors = validator.validate(body);

        if (errors.length > 0) {
          return res.status(400).json({ errors });
        }

        next();
      })
      .catch(() => {
        res.status(500).json({ error: "Failed to process request body" });
      });
  };
};
