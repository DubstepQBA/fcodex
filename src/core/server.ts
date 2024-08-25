// server.ts
import http, { IncomingMessage, ServerResponse } from "http";
import { Router } from "./router";
import { Request } from "./request";
import { Response } from "./response";

type Middleware = (req: Request, res: Response, next: () => void) => void;

export class Server {
  private _router: Router;
  private middlewares: Middleware[] = [];

  constructor() {
    this._router = new Router();
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  // Exponer el router para que las rutas puedan ser añadidas fuera del Server
  get router() {
    return this._router;
  }

  listen(port: number, callback: () => void) {
    const server = http.createServer(
      (req: IncomingMessage, res: ServerResponse) => {
        const request = new Request(req);
        const response = new Response(res);

        let idx = 0;

        const next = () => {
          if (idx < this.middlewares.length) {
            const middleware = this.middlewares[idx++];
            middleware(request, response, next);
          } else {
            this._router.handleRequest(request, response);
          }
        };

        next();
      }
    );

    server.listen(port, callback);
  }
}
