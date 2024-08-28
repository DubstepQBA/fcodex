import http, { IncomingMessage, ServerResponse } from "http";
import { Router } from "./router";
import { Request } from "./request";
import { Response } from "./response";
import { logger } from "../modules";

type Middleware = (req: Request, res: Response, next: () => void) => void;

export class Server {
  private _router: Router;
  private middlewares: Middleware[] = [logger];
  private server: http.Server | null = null;

  constructor() {
    this._router = new Router();
  }

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this; // Enable method chaining
  }

  get router(): Router {
    return this._router;
  }

  private async handleRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const request = new Request(req);
    const response = new Response(res);

    let idx = 0;

    const next = async (): Promise<void> => {
      if (idx < this.middlewares.length) {
        const middleware = this.middlewares[idx++];
        try {
          middleware(request, response, next);
        } catch (err) {
          this.handleError(err, response);
        }
      } else {
        this._router.handleRequest(request, response);
      }
    };

    try {
      await next();
    } catch (err) {
      this.handleError(err, response);
    }
  }

  private handleError(error: any, res: Response): void {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).send({ error: "Internal Server Error" });
    }
  }

  listen(port: number, callback?: () => void): http.Server {
    if (this.server) {
      throw new Error("Server is already running");
    }

    this.server = http.createServer(this.handleRequest.bind(this));
    this.server.listen(port, callback);

    return this.server;
  }

  close(callback?: (err?: Error) => void): void {
    if (this.server) {
      this.server.close(callback);
    } else if (callback) {
      callback(new Error("Server is not running"));
    }
  }
}
