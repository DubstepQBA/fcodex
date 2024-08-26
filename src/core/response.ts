import { ServerResponse } from "http";

export class Response {
  private res: ServerResponse;
  private _headersSent: boolean = false;

  constructor(res: ServerResponse) {
    this.res = res;
  }

  private ensureHeadersNotSent(): boolean {
    if (this._headersSent) {
      console.warn(
        "Attempted to send headers or body after they have already been sent."
      );
      return false;
    }
    return true;
  }

  write(
    chunk: any,
    encodingOrCallback?:
      | BufferEncoding
      | ((error: Error | null | undefined) => void),
    callback?: (error: Error | null | undefined) => void
  ): boolean {
    if (!this.ensureHeadersNotSent()) return false;

    return typeof encodingOrCallback === "function"
      ? this.res.write(chunk, encodingOrCallback)
      : this.res.write(chunk, encodingOrCallback as BufferEncoding, callback);
  }

  end(data?: any): void {
    if (!this.ensureHeadersNotSent()) return;

    if (data) this.write(data);
    if (!this._headersSent) {
      this.res.end();
      this._headersSent = true;
    }
  }

  setHeader(name: string, value: string | number): this {
    if (this.ensureHeadersNotSent()) {
      this.res.setHeader(name, value);
    }
    return this;
  }

  writeHead(
    statusCode: number,
    headers?: Record<string, string | number>
  ): this {
    if (this.ensureHeadersNotSent()) {
      this.res.writeHead(statusCode, headers);
      this._headersSent = true;
    }
    return this;
  }

  status(code: number): this {
    if (this.ensureHeadersNotSent()) {
      this.res.statusCode = code;
    }
    return this;
  }

  send(body?: any): void {
    if (!this.ensureHeadersNotSent()) return;

    let contentType = "text/plain";
    let responseBody: any = ""; // Cambiado a any para manejar Buffer también

    if (body === undefined || body === null) {
      responseBody = "No content";
    } else if (typeof body === "string") {
      contentType = "text/plain";
      responseBody = body;
    } else if (Buffer.isBuffer(body)) {
      contentType = "application/octet-stream";
      responseBody = body; // No convertir a string
    } else if (typeof body === "object") {
      contentType = "application/json";
      responseBody = JSON.stringify(body);
    } else {
      responseBody = "";
    }

    this.setHeader("Content-Type", contentType);
    this.write(responseBody);
    this.end();
  }

  json(data: any): void {
    if (!this.ensureHeadersNotSent()) return;

    this.setHeader("Content-Type", "application/json");
    this.send(data); // `send` will handle JSON.stringify
  }

  get headersSent(): boolean {
    return this._headersSent;
  }
}
