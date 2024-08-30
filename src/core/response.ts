import { ServerResponse } from "http";
import { EventEmitter } from "events";

export class Response extends EventEmitter {
  private res: ServerResponse;
  private _headersSent: boolean = false;
  public statusCode: number = 200; // Agrega una propiedad `statusCode`
  public statusMessage: string = "OK"; // Agrega una propiedad `statusMessage`

  constructor(res: ServerResponse) {
    super();
    this.res = res;
  }

  /**
   * Verifies that headers have not already been sent.
   * If headers have already been sent, this will log a warning and return false.
   * @returns {boolean} Whether headers have not already been sent.
   */
  private ensureHeadersNotSent(): boolean {
    if (this._headersSent) {
      console.warn(
        "Attempted to send headers or body after they have already been sent."
      );
      return false;
    }
    return true;
  }

  /**
   * Writes a chunk of data to the response.
   * @param chunk - The chunk of data to write.
   * @param encodingOrCallback - The encoding to use for the chunk, or a callback to
   *   call when the chunk has been written.
   * @param callback - A callback to call when the chunk has been written, if
   *   encodingOrCallback is not a callback.
   * @returns true if the write was successful, false if the headers have already been sent.
   */
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

  /**
   * Finaliza la respuesta.
   * @param data - El contenido final a escribir en la respuesta, si se proporciona.
   * @returns void
   */
  end(data?: any): void {
    if (!this.ensureHeadersNotSent()) return;

    if (data) this.write(data);
    if (!this._headersSent) {
      this.res.end();
      this._headersSent = true;
      this.emit("finish"); // Emitir el evento 'finish' después de finalizar
    }
  }

  /**
   * Establece un header en la respuesta.
   * @param name - El nombre del header a establecer.
   * @param value - El valor del header a establecer.
   * @returns El objeto `Response` actual, para habilitar el encadenamiento de
   *   métodos.
   */
  setHeader(name: string, value: string | number): this {
    if (this.ensureHeadersNotSent()) {
      this.res.setHeader(name, value);
    }
    return this;
  }

  /**
   * Establece los encabezados de la respuesta y el estado de la respuesta.
   * @param statusCode - El código de estado HTTP.
   * @param statusMessage - El mensaje de estado HTTP. Si no se proporciona, se utiliza
   *   el mensaje predeterminado para el código de estado.
   * @param headers - Un objeto con los encabezados HTTP a establecer.
   * @returns El objeto `Response` actual, para habilitar el encadenamiento de
   *   métodos.
   * @emits finish - Después de escribir los encabezados.
   */
  writeHead(
    statusCode: number,
    statusMessage?: string,
    headers?: Record<string, string | number>
  ): this {
    if (this.ensureHeadersNotSent()) {
      this.res.writeHead(statusCode, statusMessage, headers);
      this._headersSent = true;
      this.statusCode = statusCode; // Establecer `statusCode`
      this.statusMessage = statusMessage || "OK"; // Establecer `statusMessage`
      this.emit("finish"); // Emitir el evento 'finish' después de escribir los encabezados
    }
    return this;
  }

  /**
   * Establece el código de estado HTTP de la respuesta.
   * @param code - El código de estado HTTP.
   * @returns El objeto `Response` actual, para habilitar el encadenamiento de
   *   métodos.
   */
  status(code: number): this {
    if (this.ensureHeadersNotSent()) {
      this.statusCode = code; // Establecer `statusCode`
      this.res.statusCode = code; // También establecer `statusCode` de `ServerResponse` para compatibilidad
    }
    return this;
  }

  /**
   * Envía una respuesta con el contenido proporcionado.
   * @param body - El contenido a enviar. Puede ser un string, un buffer, un objeto o null/undefined.
   * @returns void
   */
  send(body?: any): void {
    if (!this.ensureHeadersNotSent()) return;

    let contentType = "text/plain";
    let responseBody: any = "";

    if (body === undefined || body === null) {
      responseBody = "No content";
    } else if (typeof body === "string") {
      contentType = "text/plain";
      responseBody = body;
    } else if (Buffer.isBuffer(body)) {
      contentType = "application/octet-stream";
      responseBody = body;
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

  /**
   * Send a JSON response.
   *
   * This method will set the `Content-Type` header to `application/json` and
   * serialize the given data to JSON using `JSON.stringify`.
   *
   * @param {any} data - The data to serialize and send.
   */
  json(data: any): void {
    if (!this.ensureHeadersNotSent()) return;

    this.setHeader("Content-Type", "application/json");
    this.send(data); // `send` will handle JSON.stringify
  }

  /**
   * Returns a boolean indicating if the headers have been sent.
   *
   * If the headers have been sent, this value is `true`. Otherwise, it is `false`.
   *
   * This value is used internally by the `send` and `json` methods to determine
   * whether they should throw an error if the headers have already been sent.
   */
  get headersSent(): boolean {
    return this._headersSent;
  }
}
