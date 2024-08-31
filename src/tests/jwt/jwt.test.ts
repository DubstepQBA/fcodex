import { generateJWT, verifyJWT, configureAuth } from "../../modules";

configureAuth({
  secretKey: "test_secret",
  expiresIn: "1s",
  algorithm: "HS256",
});

describe("JWT Utility", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should generate a valid JWT", () => {
    const payload = { some: "data" };
    const token = generateJWT(payload);

    const verification = verifyJWT(token);
    expect(verification.valid).toBe(true);
    expect(verification.payload?.some).toBe("data");
  });

  it("should detect expired token", () => {
    const payload = { some: "data" };
    const token = generateJWT(payload);
    jest.advanceTimersByTime(2000);
    const verification = verifyJWT(token);
    expect(verification.valid).toBe(false);
    expect(verification.message).toBe("Token expired");
  });

  it("should return false for invalid signature", () => {
    const payload = { some: "data" };
    const token = generateJWT(payload);
    const [headerB64, payloadB64] = token.split(".");
    const invalidSignature = "invalid_signature";
    const tamperedToken = `${headerB64}.${payloadB64}.${invalidSignature}`;
    const verification = verifyJWT(tamperedToken);
    expect(verification.valid).toBe(false);
    expect(verification.message).toBe("Invalid token structure or payload");
  });

  it("should handle invalid JWT format", () => {
    const invalidToken = "header.payload"; // Sin firma
    const verification = verifyJWT(invalidToken);
    expect(verification.valid).toBe(false);
    expect(verification.message).toBe("Incomplete token");
  });
});
