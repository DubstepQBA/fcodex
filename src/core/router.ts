import { Request, Response } from "./";
import { match, MatchFunction } from "path-to-regexp";

type Method = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
type Handler = (req: Request, res: Response) => void;
type Middleware = (req: Request, res: Response, next: () => void) => void;

interface Route {
  method: Method;
  path: string;
  handler: Handler;
  middlewares: Middleware[];
}

export class Router {
  private routes: Route[] = [];
  private basePath: string = "";
  private middlewares: Middleware[] = [];

  constructor(basePath: string = "") {
    this.basePath = basePath;
  }

  // Método para agregar rutas con middlewares específicos
  private addRoute(
    method: Method,
    path: string,
    handler: Handler,
    middlewares: Middleware[] = []
  ) {
    this.routes.push({
      method,
      path: `${this.basePath}${path}`,
      handler,
      middlewares,
    });
  }

  // Método para agregar middlewares globales al router
  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  // Métodos para añadir rutas individuales con sus respectivos manejadores
  get(path: string, handler: Handler, middlewares: Middleware[] = []) {
    this.addRoute("GET", path, handler, middlewares);
  }

  post(path: string, handler: Handler, middlewares: Middleware[] = []) {
    this.addRoute("POST", path, handler, middlewares);
  }

  delete(path: string, handler: Handler, middlewares: Middleware[] = []) {
    this.addRoute("DELETE", path, handler, middlewares);
  }

  put(path: string, handler: Handler, middlewares: Middleware[] = []) {
    this.addRoute("PUT", path, handler, middlewares);
  }

  patch(path: string, handler: Handler, middlewares: Middleware[] = []) {
    this.addRoute("PATCH", path, handler, middlewares);
  }

  // Método para anidar routers
  useRouter(prefix: string, router: Router) {
    router.basePath = `${this.basePath}${prefix}`;
    this.routes.push(...router.routes);
  }

  // Ejecutar middlewares en orden
  private async executeMiddlewares(
    middlewares: Middleware[],
    req: Request,
    res: Response,
    next: () => void
  ) {
    let index = 0;

    const exec = async () => {
      if (index < middlewares.length) {
        await middlewares[index++](req, res, exec);
      } else {
        next();
      }
    };

    await exec();
  }

  // Buscar una ruta que coincida con la solicitud
  private findRoute(
    method: Method,
    path: string
  ):
    | {
        handler: Handler;
        middlewares: Middleware[];
        params: Record<string, string>;
      }
    | undefined {
    for (const route of this.routes) {
      if (route.method === method) {
        const matchFn: MatchFunction<Record<string, string>> = match(
          route.path
        );
        const matchResult = matchFn(path);

        if (matchResult) {
          return {
            handler: route.handler,
            middlewares: route.middlewares,
            params: matchResult.params,
          };
        }
      }
    }
    return undefined;
  }

  // Manejo de la solicitud
  async handleRequest(req: Request, res: Response) {
    await this.executeMiddlewares(this.middlewares, req, res, async () => {
      const [path] = req.url.split("?");
      const method = req.method as Method;
      const route = this.findRoute(method, path);

      if (route) {
        req.params = route.params;
        this.parseQueryParams(req);

        await this.executeMiddlewares(route.middlewares, req, res, () => {
          route.handler(req, res);
        });
      } else {
        this.handleNotFound(req, res);
      }
    });
  }

  // Parseo de parámetros de consulta
  private parseQueryParams(req: Request) {
    const queryString = req.url.split("?")[1];
    if (queryString) {
      const queryParams = new URLSearchParams(queryString);
      req.query = {};
      queryParams.forEach((value, key) => {
        req.query[key] = value;
      });
    }
  }

  // Manejo de rutas no encontradas
  private handleNotFound(req: Request, res: Response) {
    res.status(404).send("Not Found");
  }
}
