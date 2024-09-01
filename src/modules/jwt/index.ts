import { createHmacSignature, verifyHmacSignature } from "./algorithms/HMAC";
import { createRsaSignature, verifyRsaSignature } from "./algorithms/RSA";

export interface JwtConfig {
  secretKey: string; // Para HMAC
  privateKey?: string; // Para RSA
  publicKey?: string; // Para RSA
  expiresIn: string;
  algorithm: "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512";
}

export interface JwtPayload {
  [key: string]: any;
  exp?: number;
  iat?: number;
}

export interface JwtHeader {
  alg: string;
  typ: string;
}

let CONFIG: JwtConfig = {
  secretKey: "key_default",
  expiresIn: "1h",
  algorithm: "HS256",
};

export function configureAuth(options: Partial<JwtConfig>) {
  CONFIG = { ...CONFIG, ...options };
}

function base64urlEncode(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function base64urlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString();
}

function createSignature(data: string): string {
  if (CONFIG.algorithm.startsWith("HS")) {
    return createHmacSignature(
      data,
      CONFIG.secretKey,
      CONFIG.algorithm as "HS256" | "HS384" | "HS512"
    );
  } else if (CONFIG.algorithm.startsWith("RS")) {
    if (!CONFIG.privateKey) {
      throw new Error("Private key is required for RSA algorithms");
    }
    return createRsaSignature(
      data,
      CONFIG.privateKey,
      CONFIG.algorithm as "RS256" | "RS384" | "RS512"
    );
  } else {
    throw new Error("Unsupported algorithm");
  }
}

function verifySignature(data: string, signature: string): boolean {
  if (CONFIG.algorithm.startsWith("HS")) {
    return verifyHmacSignature(
      data,
      signature,
      CONFIG.secretKey,
      CONFIG.algorithm as "HS256" | "HS384" | "HS512"
    );
  } else if (CONFIG.algorithm.startsWith("RS")) {
    if (!CONFIG.publicKey) {
      throw new Error("Public key is required for RSA algorithms");
    }
    return verifyRsaSignature(
      data,
      signature,
      CONFIG.publicKey,
      CONFIG.algorithm as "RS256" | "RS384" | "RS512"
    );
  } else {
    throw new Error("Unsupported algorithm");
  }
}

function calculateExpiration(expiresIn: string): number {
  const currentTime = Math.floor(Date.now() / 1000);
  const match = expiresIn.match(/(\d+)([hms])/);

  if (!match) throw new Error("Invalid expiration format");

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "h":
      return currentTime + value * 3600;
    case "m":
      return currentTime + value * 60;
    case "s":
      return currentTime + value;
    default:
      return currentTime + 3600;
  }
}

/**
 * Generates a JWT token with the given payload.
 *
 * @param payload - The payload to encode in the JWT token.
 * @returns The generated JWT token as a string.
 */
export function generateJWT(payload: JwtPayload): string {
  const header: JwtHeader = {
    alg: CONFIG.algorithm,
    typ: "JWT",
  };

  const currentTime = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    exp: calculateExpiration(CONFIG.expiresIn),
    iat: currentTime,
  };

  const headerEncoded = base64urlEncode(JSON.stringify(header));
  const payloadEncoded = base64urlEncode(JSON.stringify(fullPayload));
  const signature = createSignature(`${headerEncoded}.${payloadEncoded}`);

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

/**
 * Verifies a given JWT token and returns its payload if valid.
 * @param token The JWT token to verify.
 * @returns An object with the following properties:
 *   - valid: A boolean indicating if the token is valid.
 *   - payload: The payload of the token if valid, or undefined.
 *   - message: A string describing the reason why the token is invalid, or undefined.
 */
export function verifyJWT(token: string): {
  valid: boolean;
  payload?: JwtPayload;
  message?: string;
} {
  try {
    const [headerB64, payloadB64, signature] = token.split(".");

    if (!headerB64 || !payloadB64 || !signature) {
      return { valid: false, message: "Incomplete token" };
    }

    const data = `${headerB64}.${payloadB64}`;

    if (!verifySignature(data, signature)) {
      return { valid: false, message: "Invalid signature" };
    }

    const payload: JwtPayload = JSON.parse(base64urlDecode(payloadB64));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp && currentTime > payload.exp) {
      return { valid: false, message: "Token expired" };
    }
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, message: "Invalid token structure or payload" };
  }
}
