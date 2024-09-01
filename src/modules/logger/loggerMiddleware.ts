import { Request } from "../../core/request";
import { Response } from "../../core/response";

const colors = {
  reset: "\x1b[0m",
  info: "\x1b[34m", // Azul
  success: "\x1b[32m", // Verde
  warning: "\x1b[33m", // Amarillo
  error: "\x1b[31m", // Rojo
};

/**
 * Gets the appropriate color based on the status code.
 */
const getStatusColor = (statusCode: number): string => {
  if (statusCode >= 500) {
    return colors.error;
  } else if (statusCode >= 400) {
    return colors.warning;
  } else if (statusCode >= 200) {
    return colors.success;
  } else {
    return colors.info;
  }
};

/**
 * Logger middleware that logs request and response information with color-coded output.
 */
export const logger = async (req: Request, res: Response, next: () => void) => {
  const startTime = process.hrtime();

  console.log(
    `${colors.info}[INFO] [${new Date().toISOString()}] ${req.method} ${
      req.url
    }${colors.reset}`
  );

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const elapsedTime = (seconds * 1e9 + nanoseconds) / 1e6; // Convertir a milisegundos

    const statusColor = getStatusColor(res.statusCode);

    console.log(
      `${statusColor}[${new Date().toISOString()}] ${req.method} ${req.url} - ${
        res.statusCode
      } ${res.statusMessage}; ${elapsedTime.toFixed(3)} ms${colors.reset}`
    );
  });

  try {
    await next();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error(
      `${colors.error}[ERROR] [${new Date().toISOString()}] ${errorMessage}${
        colors.reset
      }`
    );

    if (!res.headersSent) {
      res.status(500).send("Internal Server Error");
    }
  } finally {
  }
};
