import { Request, Response } from "../../core";

interface CorsOptions {
  allowedOrigins?: string[];
  blacklist?: string[];
}

/**
 * Middleware que establece encabezados CORS para permitir solicitudes
 * desde orígenes permitidos. Si el origen de la solicitud no está en
 * la lista de orígenes permitidos, se devuelve un estado 403.
 *
 * @param options Opciones para el middleware:
 *   - allowedOrigins: Orígenes permitidos (por defecto, se permite
 *     cualquier origen).
 *   - blacklist: Orígenes que se incluirán en la lista negra (por defecto,
 *     no se incluye ninguno).
 * @returns Un middleware que se encarga de establecer los encabezados CORS.
 */
export const corsMiddleware = (options: CorsOptions = {}) => {
  const { allowedOrigins = [], blacklist = [] } = options;

  return (req: Request, res: Response, next: () => void) => {
    const origin = req.headers.origin as string;

    // Verificar si el origen está en la lista negra
    if (blacklist.includes(origin)) {
      res.status(403).send("Forbidden");
      return;
    }

    // Establecer encabezados CORS
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "");
    }

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // Manejo de solicitudes OPTIONS
    if (req.method === "OPTIONS") {
      res.status(204).send();
    } else {
      next(); // Llamar al siguiente middleware o manejador de rutas
    }
  };
};
