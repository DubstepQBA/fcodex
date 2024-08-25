//response.ts
import { ServerResponse } from "http";

export class Response {
  private res: ServerResponse;

  constructor(res: ServerResponse) {
    this.res = res;
  }

  write(
    chunk: any,
    encoding?: BufferEncoding | ((error: Error | null | undefined) => void),
    callback?: (error: Error | null | undefined) => void
  ): boolean {
    if (typeof encoding === "function") {
      return this.res.write(
        chunk,
        encoding as (error: Error | null | undefined) => void
      );
    } else if (encoding) {
      return this.res.write(chunk, encoding, callback);
    } else {
      return this.res.write(chunk, callback);
    }
  }

  end(data?: any) {
    this.res.end(data);
  }

  setHeader(name: string, value: string | number) {
    this.res.setHeader(name, value);
  }

  writeHead(statusCode: number, headers?: any) {
    this.res.writeHead(statusCode, headers);
  }

  status(code: number) {
    this.res.writeHead(code);
    return this;
  }

  send(body: any) {
    if (typeof body === "string") {
      this.write(body);
    } else if (Buffer.isBuffer(body)) {
      this.write(body);
    } else if (body) {
      this.write(JSON.stringify(body));
    }
    this.end();
  }
  json(data: any) {
    this.res.setHeader("Content-Type", "application/json");
    this.res.end(JSON.stringify(data));
  }
}
