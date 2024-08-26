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
  public body: any; // Aquí almacenaremos el cuerpo procesado

  constructor(req: IncomingMessage) {
    this.req = req;
    this.processBody(); // Procesa el cuerpo al crear la instancia
  }

  get headers() {
    return this.req.headers;
  }

  get url() {
    return this.req.url || "";
  }

  get method() {
    return this.req.method as HttpMethod; // Cast to HttpMethod
  }

  private processBody() {
    this.body = new Promise((resolve, reject) => {
      let data = "";
      this.req.on("data", (chunk) => {
        data += chunk;
      });

      this.req.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async json(): Promise<any> {
    return this.body; // Devuelve el cuerpo procesado
  }
}
