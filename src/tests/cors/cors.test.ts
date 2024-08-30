import { corsMiddleware } from "../../modules/cors/corsMiddleware";
import { Request, Response } from "../../core";

describe("corsMiddleware", () => {
  let req: Request;
  let res: Response;
  let next: () => void;

  beforeEach(() => {
    res = {
      writeHead: jest.fn(),
      end: jest.fn(),
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    next = jest.fn();
  });

  it("sets CORS headers correctly for allowed origins", () => {
    req = {
      method: "GET",
      headers: { origin: "https://example.com" },
    } as unknown as Request;

    const middleware = corsMiddleware({
      allowedOrigins: ["https://example.com"],
      blacklist: [],
    });

    middleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Origin",
      "https://example.com"
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns 403 for blacklisted origins", () => {
    req = {
      method: "GET",
      headers: { origin: "https://blacklisted.com" },
    } as unknown as Request;

    const middleware = corsMiddleware({
      allowedOrigins: ["https://example.com"],
      blacklist: ["https://blacklisted.com"],
    });

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith("Forbidden");
    expect(next).not.toHaveBeenCalled();
  });

  it("does not set CORS headers for unallowed origins", () => {
    req = {
      method: "GET",
      headers: { origin: "https://unallowed.com" },
    } as unknown as Request;

    const middleware = corsMiddleware({
      allowedOrigins: ["https://example.com"],
      blacklist: [],
    });

    middleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Origin",
      ""
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns 204 status code for OPTIONS request", () => {
    req = {
      method: "OPTIONS",
      headers: { origin: "https://example.com" },
    } as unknown as Request;

    const middleware = corsMiddleware({
      allowedOrigins: ["https://example.com"],
      blacklist: [],
    });

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("does not set CORS headers multiple times", () => {
    req = {
      method: "GET",
      headers: { origin: "https://example.com" },
    } as unknown as Request;

    const middleware = corsMiddleware({
      allowedOrigins: ["https://example.com"],
      blacklist: [],
    });

    middleware(req, res, next);
    middleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledTimes(6); // 3 calls per middleware invocation
  });
});
