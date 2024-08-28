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
  public user?: any; // Nueva propiedad `user`

  constructor(req: IncomingMessage) {
    this.req = req;
    this.body = this.processBody();
  }

  get headers() {
    return this.req.headers;
  }

  get url() {
    return this.req.url || "";
  }

  get method() {
    return this.req.method as HttpMethod;
  }

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

  async json(): Promise<any> {
    if (this.body) {
      return this.body;
    }
    throw new Error("Body has not been processed");
  }
}
