import { IncomingMessage } from "http";

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";

export class Request {
  private req: IncomingMessage;
  public query: { [key: string]: string } = {};
  public params: { [key: string]: string } = {};
  public body: Promise<any> | null = null;
  public user?: any;

  /**
   * Constructor.
   *
   * @param req The incoming HTTP request.
   *
   * @api public
   */
  constructor(req: IncomingMessage) {
    this.req = req;
    this.body = this.processBody();
  }

  /**
   * Returns the headers of the request.
   *
   * @returns The headers of the request.
   *
   * @api public
   */
  get headers() {
    return this.req.headers;
  }

  /**
   * Returns the URL of the request.
   *
   * @returns The URL of the request or an empty string if not available.
   *
   * @api public
   */
  get url() {
    return this.req.url || "";
  }

  /**
   * Returns the HTTP method of the request.
   *
   * @returns The HTTP method of the request, or an empty string if not available.
   *
   * @api public
   */
  get method() {
    return this.req.method as HttpMethod;
  }

  /**
   * Process the request body.
   *
   * If the request method is POST, PUT or PATCH, it will process the body as JSON.
   * If the body is empty, it will return null.
   * If the body is not a valid JSON, it will throw an error.
   *
   * @returns A promise that resolves with the parsed JSON data or null if the request body is empty.
   * @throws An error if the body is not a valid JSON.
   *
   * @private
   */
  private async processBody(): Promise<any> {
    if (
      this.req.method === "POST" ||
      this.req.method === "PUT" ||
      this.req.method === "PATCH"
    ) {
      return new Promise((resolve, reject) => {
        let data = "";
        this.req.on("data", (chunk) => {
          data += chunk;
        });

        this.req.on("end", () => {
          try {
            if (data.trim() === "") {
              resolve(null); // Devolver null si no hay datos
            } else {
              resolve(JSON.parse(data)); // Intentar analizar JSON
            }
          } catch (err) {
            reject(new Error("Failed to parse JSON")); // Manejar errores de análisis JSON
          }
        });

        this.req.on("error", (err) => {
          reject(err); // Manejar errores de solicitud
        });
      });
    } else {
      return null; // No se procesa el cuerpo para otros métodos
    }
  }

  /**
   * Returns the parsed JSON body of the request.
   * @returns A promise that resolves with the parsed JSON data.
   * @throws An error if the body has not been processed.
   */
  async json(): Promise<any> {
    if (this.body) {
      return this.body;
    }
    throw new Error("Body has not been processed");
  }
}
