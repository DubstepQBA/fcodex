import http, { IncomingMessage, ServerResponse } from "http";
import { config } from "../config";
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

  /**
   * Adds a middleware to the server.
   *
   * @param middleware - The middleware to add.
   * @returns The server instance, to enable method chaining.
   */
  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this; // Enable method chaining
  }

  /**
   * Returns the router instance.
   *
   * @returns The router instance.
   */
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

  /**
   * Start the server and listen for incoming requests.
   * @param port Port number to listen on. Defaults to the value of `config.PORT`.
   * @param callback Optional callback to be called when the server is listening.
   * @returns The underlying `http.Server` instance.
   * @throws {Error} If the server is already running.
   */
  listen(port?: number, callback?: () => void): http.Server {
    if (this.server) {
      throw new Error("Server is already running");
    }
    if (!port) {
      port = config.PORT;
    }
    if (typeof callback !== "function" || callback === null) {
      callback = () => {};
    }

    this.server = http.createServer(this.handleRequest.bind(this));
    this.server.listen(port, callback);

    return this.server;
  }

  /**
   * Close the server and stop listening for incoming requests.
   * @param callback Optional callback to be called when the server is closed.
   * @throws {Error} If the server is not running.
   */
  close(callback?: (err?: Error) => void): void {
    if (this.server) {
      this.server.close(callback);
    } else if (callback) {
      callback(new Error("Server is not running"));
    }
  }
}
