import { ServerResponse } from "http";

export class Response {
  private res: ServerResponse;
  private _headersSent: boolean = false;

  constructor(res: ServerResponse) {
    this.res = res;
  }

  write(
    chunk: any,
    encodingOrCallback?:
      | BufferEncoding
      | ((error: Error | null | undefined) => void),
    callback?: (error: Error | null | undefined) => void
  ): boolean {
    if (this._headersSent) {
      return false;
    }

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
    if (data) this.write(data);
    this.res.end();
    this._headersSent = true;
  }

  setHeader(name: string, value: string | number): this {
    if (this._headersSent) {
      return this;
    }
    this.res.setHeader(name, value);
    return this;
  }

  writeHead(
    statusCode: number,
    headers?: Record<string, string | number>
  ): this {
    if (this._headersSent) {
      return this;
    }
    this.res.writeHead(statusCode, headers);
    this._headersSent = true;
    return this;
  }

  status(code: number): this {
    return this.writeHead(code);
  }

  send(body: any): void {
    if (typeof body === "string" || Buffer.isBuffer(body)) {
      this.setHeader("Content-Type", "text/plain");
      this.write(body);
    } else if (typeof body === "object") {
      this.json(body);
    }
    this.end();
  }

  json(data: any): void {
    if (!this._headersSent) {
      this.setHeader("Content-Type", "application/json");
    }
    this.send(JSON.stringify(data));
  }

  get headersSent(): boolean {
    return this._headersSent;
  }
}
