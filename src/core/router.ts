import { Request } from "./request";
import { Response } from "./response";
import { match, MatchFunction, Path } from "path-to-regexp";

type Method = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
type Handler = (req: Request, res: Response) => void;
type Route = { method: Method; path: string; handler: Handler };

export class Router {
  private routes: Route[] = [];
  private basePath: string = "";
  private middlewares: Handler[] = [];

  constructor(basePath: string = "") {
    this.basePath = basePath;
  }

  private addRoute(method: Method, path: string, handler: Handler) {
    this.routes.push({ method, path: `${this.basePath}${path}`, handler });
  }

  useMiddleware(middleware: Handler) {
    this.middlewares.push(middleware);
  }

  addRoutes(method: Method, routes: { [path: string]: Handler }) {
    for (const [path, handler] of Object.entries(routes)) {
      this.addRoute(method, path, handler);
    }
  }

  get(path: string, handler: Handler) {
    this.addRoute("GET", path, handler);
  }

  post(path: string, handler: Handler) {
    this.addRoute("POST", path, handler);
  }

  delete(path: string, handler: Handler) {
    this.addRoute("DELETE", path, handler);
  }

  put(path: string, handler: Handler) {
    this.addRoute("PUT", path, handler);
  }

  patch(path: string, handler: Handler) {
    this.addRoute("PATCH", path, handler);
  }

  use(prefix: string, router: Router) {
    router.basePath = `${this.basePath}${prefix}`;
    this.routes.push(...router.routes);
  }

  private async executeMiddlewares(req: Request, res: Response) {
    for (const middleware of this.middlewares) {
      await middleware(req, res);
      if (res.headersSent) return; // Stop middleware chain if response has been sent
    }
  }

  private findRoute(
    method: Method,
    path: string
  ): { handler: Handler; params: Record<string, string> } | undefined {
    for (const route of this.routes) {
      if (route.method === method) {
        const matchFn: MatchFunction<Record<string, string>> = match(
          route.path
        );
        const matchResult = matchFn(path);

        if (matchResult) {
          return { handler: route.handler, params: matchResult.params };
        }
      }
    }
    return undefined;
  }

  async handleRequest(req: Request, res: Response) {
    await this.executeMiddlewares(req, res);
    if (res.headersSent) return;

    const [path] = req.url.split("?");
    const method = req.method as Method;
    const route = this.findRoute(method, path);

    if (route) {
      req.params = route.params;
      this.parseQueryParams(req);
      route.handler(req, res);
    } else {
      this.handleNotFound(req, res);
    }
  }

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

  private handleNotFound(req: Request, res: Response) {
    res.status(404).send("Not Found");
  }
}
