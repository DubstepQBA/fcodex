import { Request, Response } from "./";
import { match, MatchFunction } from "path-to-regexp";

export type Method = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
export type Handler = (req: Request, res: Response) => void;
export type Middleware = (
  req: Request,
  res: Response,
  next: () => void
) => void;

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

  /**
   * Adds a route to the router.
   *
   * @param method The HTTP method that the route responds to.
   * @param path The path that the route responds to.
   * @param handler The handler function that will be called when the route is matched.
   * @param middlewares The middlewares that should be executed before the handler.
   */
  private addRoute(
    method: Method,
    path: string,
    handler: Handler,
    middlewares: Middleware[] = []
  ) {
    this.routes.push({
      method,
      path: `${this.basePath}${path}`.replace(/\/+/g, "/"),
      handler,
      middlewares,
    });
  }

  /**
   * Adds a middleware to the router.
   *
   * @param middleware - The middleware to add.
   * @returns The router instance, to enable method chaining.
   */
  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  /**
   * Adds a route that responds to GET requests.
   *
   * @param path The path for the route.
   * @param handler The handler function for the route.
   * @param middlewares The middlewares for the route.
   */
  get(path: string, handler: Handler, middlewares: Middleware[] = []) {
    this.addRoute("GET", path, handler, middlewares);
  }

  /**
   * Adds a route that responds to POST requests.
   *
   * @param path The path for the route.
   * @param handler The handler function for the route.
   * @param middlewares The middlewares for the route.
   */
  post(path: string, handler: Handler, middlewares: Middleware[] = []) {
    this.addRoute("POST", path, handler, middlewares);
  }

  /**
   * Adds a route that responds to DELETE requests.
   *
   * @param path The path for the route.
   * @param handler The handler function for the route.
   * @param middlewares The middlewares for the route.
   */
  delete(path: string, handler: Handler, middlewares: Middleware[] = []) {
    this.addRoute("DELETE", path, handler, middlewares);
  }

  /**
   * Adds a route that responds to PUT requests.
   *
   * @param path The path for the route.
   * @param handler The handler function for the route.
   * @param middlewares The middlewares for the route.
   */
  put(path: string, handler: Handler, middlewares: Middleware[] = []) {
    this.addRoute("PUT", path, handler, middlewares);
  }

  /**
   * Adds a route that responds to PATCH requests.
   *
   * @param path The path for the route.
   * @param handler The handler function for the route.
   * @param middlewares The middlewares for the route.
   */
  patch(path: string, handler: Handler, middlewares: Middleware[] = []) {
    this.addRoute("PATCH", path, handler, middlewares);
  }

  /**
   * Mounts another router instance at a given path.
   *
   * @param prefix The path prefix to use for the mounted router.
   * @param router The router instance to mount.
   */
  useRouter(prefix: string, router: Router) {
    router.basePath = `${this.basePath}${prefix}`;
    this.routes.push(...router.routes);
  }

  /**
   * Executes the given middlewares in order, passing the request, response
   * and a callback to each middleware. When all middlewares have been
   * executed, the callback given to this method will be called.
   *
   * @param middlewares The middlewares to execute.
   * @param req The request object.
   * @param res The response object.
   * @param next The callback to call when all middlewares have been executed.
   */
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

  /**
   * Finds a route matching the given method and path.
   *
   * @param method The HTTP method to search for.
   * @param path The path to search for.
   *
   * @returns An object containing the handler, middlewares and params associated with the route,
   * or `undefined` if no matching route was found.
   */
  public findRoute(method: Method, path: string) {
    path = path.replace(/\/+/g, "/"); // Normaliza la ruta solicitada
    console.log(`Finding route: ${method} ${path}`); // Debug log
    for (const route of this.routes) {
      const normalizedRoutePath = route.path.replace(/\/+/g, "/"); // Normaliza la ruta almacenada
      console.log(`Checking route: ${route.method} ${normalizedRoutePath}`); // Debug log
      if (route.method === method) {
        const matchFn: MatchFunction<Record<string, string>> =
          match(normalizedRoutePath);
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

  /**
   * Handles an incoming request by executing the global middlewares and then
   * searching for a matching route. If a route is found, the route's middlewares
   * are executed and then the route's handler is called with the request and
   * response objects. If no route is found, the `handleNotFound` method is called.
   *
   * @param req The incoming request.
   * @param res The response object.
   */
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

  /**
   * Parses the query parameters from the request URL and stores them in the
   * request's `query` property.
   *
   * @param req The incoming request.
   */
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

  /**
   * Handles a 404 Not Found response, sending a "Not Found" message.
   *
   * @param req The incoming request.
   * @param res The response to send.
   */
  private handleNotFound(req: Request, res: Response) {
    res.status(404).send("Not Found");
  }
}
