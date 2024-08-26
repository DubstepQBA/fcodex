import { Request } from "../../core/request";
import { Response } from "../../core/response";

export const loggerMiddleware = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};
