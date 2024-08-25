//router.ts
import { Request } from "./request";
import { Response } from "./response";

type Method = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";

interface Route {
  path: string;
  handler: (req: Request, res: Response) => void;
}

export class Router {
  private routes: { [key: string]: (req: Request, res: Response) => void } = {};
  private basePath: string = "";

  constructor(basePath: string = "") {
    this.basePath = basePath;
  }

  private addRoute(
    method: Method,
    path: string,
    handler: (req: Request, res: Response) => void
  ) {
    const routeKey = `${method}:${this.basePath}${path}`;
    this.routes[routeKey] = handler;
  }

  // Método para agregar múltiples rutas
  addRoutes(
    method: Method,
    routes: { [path: string]: (req: Request, res: Response) => void }
  ) {
    for (const [path, handler] of Object.entries(routes)) {
      this.addRoute(method, path, handler);
    }
  }

  get(path: string, handler: (req: Request, res: Response) => void) {
    this.addRoute("GET", path, handler);
  }

  post(path: string, handler: (req: Request, res: Response) => void) {
    this.addRoute("POST", path, handler);
  }

  delete(path: string, handler: (req: Request, res: Response) => void) {
    this.addRoute("DELETE", path, handler);
  }

  put(path: string, handler: (req: Request, res: Response) => void) {
    this.addRoute("PUT", path, handler);
  }

  patch(path: string, handler: (req: Request, res: Response) => void) {
    this.addRoute("PATCH", path, handler);
  }

  use(prefix: string, router: Router) {
    const prefixedRouter = new Router(`${this.basePath}${prefix}`);
    for (const [key, handler] of Object.entries(router.routes)) {
      prefixedRouter.routes[key] = handler;
    }
    this.routes = { ...this.routes, ...prefixedRouter.routes };
  }

  handleRequest(req: Request, res: Response) {
    const routeKey = `${req.method}:${req.url}`;
    const handler = this.routes[routeKey];

    if (handler) {
      handler(req, res);
    } else {
      res.status(404).send("Not Found");
    }
  }
}
