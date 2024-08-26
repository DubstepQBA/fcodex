import { ServerResponse } from "http";

export class Response {
  private res: ServerResponse;
  private _headersSent: boolean = false;

  constructor(res: ServerResponse) {
    this.res = res;
  }

  private ensureHeadersNotSent() {
    if (this._headersSent) {
      console.warn(
        "Attempted to send headers or body after they have already been sent."
      );
      return false; // Indicate that the operation should not continue
    }
    return true; // It's safe to continue
  }

  write(
    chunk: any,
    encodingOrCallback?:
      | BufferEncoding
      | ((error: Error | null | undefined) => void),
    callback?: (error: Error | null | undefined) => void
  ): boolean {
    if (!this.ensureHeadersNotSent()) return false;

    if (typeof encodingOrCallback === "function") {
      return this.res.write(chunk, encodingOrCallback);
    } else {
      return this.res.write(
        chunk,
        encodingOrCallback as BufferEncoding,
        callback
      );
    }
  }

  end(data?: any): void {
    if (data && this.ensureHeadersNotSent()) this.write(data);
    this.res.end();
    this._headersSent = true;
  }

  setHeader(name: string, value: string | number): this {
    if (!this.ensureHeadersNotSent()) return this;

    this.res.setHeader(name, value);
    return this;
  }

  writeHead(
    statusCode: number,
    headers?: Record<string, string | number>
  ): this {
    if (!this.ensureHeadersNotSent()) return this;

    this.res.writeHead(statusCode, headers);
    this._headersSent = true;
    return this;
  }

  status(code: number): this {
    if (this.ensureHeadersNotSent()) {
      this.res.statusCode = code;
    }
    return this;
  }

  send(body: any): void {
    if (!this.ensureHeadersNotSent()) return;

    if (typeof body === "string" || Buffer.isBuffer(body)) {
      this.setHeader("Content-Type", "text/plain");
    } else if (typeof body === "object") {
      this.setHeader("Content-Type", "application/json");
      body = JSON.stringify(body);
    }

    this.write(body);
    this.end();
  }

  json(data: any): void {
    if (!this.ensureHeadersNotSent()) return;

    this.setHeader("Content-Type", "application/json");
    this.send(JSON.stringify(data));
  }

  get headersSent(): boolean {
    return this._headersSent;
  }
}
