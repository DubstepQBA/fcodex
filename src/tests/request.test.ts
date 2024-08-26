import { IncomingMessage } from "http";
import { Request } from "../core/request";
import { Socket } from "net";

describe("Request class", () => {
  const createMockRequest = (
    method: string,
    body: any = null
  ): IncomingMessage => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = method;
    req.url = "/test";

    if (body) {
      const bodyString = JSON.stringify(body);
      req.headers["content-length"] = Buffer.byteLength(bodyString).toString();
      req.headers["content-type"] = "application/json";

      process.nextTick(() => {
        req.emit("data", Buffer.from(bodyString));
        req.emit("end");
      });
    } else {
      process.nextTick(() => {
        req.emit("end");
      });
    }

    return req;
  };

  test("should correctly parse JSON body for POST request", async () => {
    const mockBody = { key: "value" };
    const mockReq = createMockRequest("POST", mockBody);

    const request = new Request(mockReq);
    const parsedBody = await request.json();

    expect(parsedBody).toEqual(mockBody);
  });

  test("should return null for empty POST body", async () => {
    const mockReq = createMockRequest("POST");

    const request = new Request(mockReq);
    const parsedBody = await request.json();

    expect(parsedBody).toBeNull();
  });

  test("should throw an error for invalid JSON", async () => {
    const mockReq = new IncomingMessage(new Socket());
    mockReq.method = "POST";
    mockReq.url = "/test";

    process.nextTick(() => {
      mockReq.emit("data", Buffer.from("invalid json"));
      mockReq.emit("end");
    });

    const request = new Request(mockReq);

    await expect(request.json()).rejects.toThrow("Failed to parse JSON");
  });

  test("should return null for GET request", async () => {
    const mockReq = createMockRequest("GET");

    const request = new Request(mockReq);
    const parsedBody = await request.json();

    expect(parsedBody).toBeNull();
  });
});
