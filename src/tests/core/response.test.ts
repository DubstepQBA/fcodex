import { ServerResponse } from "http";
import { Response } from "../../core/response"; // Ajusta la ruta según sea necesario

describe("Response class", () => {
  let mockRes: jest.Mocked<ServerResponse>;
  let response: Response;

  beforeEach(() => {
    mockRes = {
      write: jest.fn(),
      end: jest.fn(),
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      statusCode: 200,
      headersSent: false,
    } as unknown as jest.Mocked<ServerResponse>;

    response = new Response(mockRes);
  });

  it("should send a plain text response", () => {
    response.send("Hello, world!");

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "text/plain"
    );
    expect(mockRes.write).toHaveBeenCalledWith(
      "Hello, world!",
      undefined,
      undefined
    );
    expect(mockRes.end).toHaveBeenCalled();
  });

  it("should send a JSON response", () => {
    const data = { key: "value" };
    response.json(data);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json"
    );
    expect(mockRes.write).toHaveBeenCalledWith(
      JSON.stringify(data),
      undefined,
      undefined
    );
    expect(mockRes.end).toHaveBeenCalled();
  });

  it("should send a buffer response", () => {
    const buffer = Buffer.from("buffer data");
    response.send(buffer);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/octet-stream"
    );
    expect(mockRes.write).toHaveBeenCalledWith(buffer, undefined, undefined);
    expect(mockRes.end).toHaveBeenCalled();
  });

  it("should set status code and send response", () => {
    response.status(404).send("Not Found");

    expect(mockRes.statusCode).toBe(404);
    expect(mockRes.write).toHaveBeenCalledWith(
      "Not Found",
      undefined,
      undefined
    );
    expect(mockRes.end).toHaveBeenCalled();
  });

  it("sets Content-Type header to text/html", () => {
    response.html("<html></html>");
    expect(mockRes.setHeader).toHaveBeenCalledWith("Content-Type", "text/html");
  });
});
