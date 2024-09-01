import { Request, Response } from "../../core";
import { HttpError } from "./HttpError";

export const errorHandlerManager = (
  req: Request,
  res: Response,
  next: () => void
) => {
  try {
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      console.error(
        `[${new Date().toISOString()}] ${error.statusCode} - ${error.message}`
      );
      res.status(error.statusCode).send({ error: error.message });
    } else {
      console.error(
        `[${new Date().toISOString()}] 500 - Internal Server Error:`,
        error
      );
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
};
