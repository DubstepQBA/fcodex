import { Request } from "../../core/request";
import { Response } from "../../core/response";

const colors = {
  reset: "\x1b[0m",
  info: "\x1b[34m", // Azul
  success: "\x1b[32m", // Verde
  warning: "\x1b[33m", // Amarillo
  error: "\x1b[31m", // Rojo
};

export const logger = async (req: Request, res: Response, next: () => void) => {
  const startTime = process.hrtime();

  // Log the basic request info with an info color
  console.log(
    `${colors.info}[INFO] [${new Date().toISOString()}] ${req.method} ${
      req.url
    }${colors.reset}`
  );

  // Verificar si `res` tiene el método `on`
  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const elapsedTime = (seconds * 1e9 + nanoseconds) / 1e6; // Convertir a milisegundos

    let statusColor = colors.success;
    if (res.statusCode >= 500) {
      statusColor = colors.error;
    } else if (res.statusCode >= 400) {
      statusColor = colors.warning;
    }

    // Log the detailed response info with appropriate status color
    console.log(
      `${statusColor}[${new Date().toISOString()}] ${req.method} ${req.url} - ${
        res.statusCode
      } ${res.statusMessage}; ${elapsedTime.toFixed(3)} ms${colors.reset}`
    );
  });

  try {
    await next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `${colors.error}[ERROR] [${new Date().toISOString()}] ${error.message}${
          colors.reset
        }`
      );
    } else {
      console.error(
        `${colors.error}[ERROR] [${new Date().toISOString()}] Unknown error${
          colors.reset
        }`
      );
    }
    res.status(500).send("Internal Server Error");
  }
};
