import crypto from "crypto";

export interface JwtConfig {
  secretKey: string;
  expiresIn: string;
  algorithm: "HS256" | "HS384" | "HS512"; // Permitimos más algoritmos seguros
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

/**
 * Configura las opciones para la generación de tokens JWT.
 *
 * @param options Opciones para la configuración:
 *   - secretKey: Clave secreta para firmar los tokens (por defecto, "key_default").
 *   - expiresIn: Tiempo de expiración de los tokens (por defecto, "1h").
 *   - algorithm: Algoritmo para firmar los tokens (por defecto, "HS256").
 */
export function configureAuth(options: Partial<JwtConfig>) {
  CONFIG = { ...CONFIG, ...options };
}

function base64urlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString();
}

function createSignature(
  header: JwtHeader,
  payload: JwtPayload,
  secret: string
): string {
  const data = `${base64urlEncode(JSON.stringify(header))}.${base64urlEncode(
    JSON.stringify(payload)
  )}`;
  return crypto
    .createHmac(CONFIG.algorithm, secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function verifySignature(token: string, secret: string): boolean {
  const [headerB64, payloadB64, signature] = token.split(".");
  if (!headerB64 || !payloadB64 || !signature) return false;

  const header: JwtHeader = JSON.parse(base64urlDecode(headerB64));
  const payload: JwtPayload = JSON.parse(base64urlDecode(payloadB64));

  const expectedSignature = createSignature(header, payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Genera un token JWT con la carga útil especificada y la clave secreta configurada.
 * @param payload Carga útil a incluir en el token
 * @returns El token JWT generado
 */
export function generateJWT(payload: JwtPayload): string {
  const header: JwtHeader = {
    alg: CONFIG.algorithm,
    typ: "JWT",
  };

  const currentTime = Math.floor(Date.now() / 1000);
  let exp: number;

  if (CONFIG.expiresIn.endsWith("h")) {
    exp = currentTime + parseInt(CONFIG.expiresIn) * 3600;
  } else if (CONFIG.expiresIn.endsWith("m")) {
    exp = currentTime + parseInt(CONFIG.expiresIn) * 60;
  } else if (CONFIG.expiresIn.endsWith("s")) {
    exp = currentTime + parseInt(CONFIG.expiresIn);
  } else {
    exp = currentTime + 3600; // Predeterminado a 1 hora
  }

  const fullPayload: JwtPayload = {
    ...payload,
    exp,
    iat: currentTime, // Incluir issued at time (iat)
  };

  const headerEncoded = base64urlEncode(JSON.stringify(header));
  const payloadEncoded = base64urlEncode(JSON.stringify(fullPayload));
  const signature = createSignature(header, fullPayload, CONFIG.secretKey);

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

/**
 * Verifica si el token JWT es válido.
 * @param token El token JWT a verificar
 * @returns Un objeto con la siguiente estructura:
 *   - `valid`: Un booleano que indica si el token es válido o no.
 *   - `payload`: La carga útil del token, si `valid` es `true`.
 *   - `message`: Un mensaje de error, si `valid` es `false`.
 */
export function verifyJWT(token: string): {
  valid: boolean;
  payload?: JwtPayload;
  message?: string;
} {
  const [headerB64, payloadB64, signature] = token.split(".");
  if (!headerB64 || !payloadB64 || !signature) {
    return { valid: false, message: "Token incompleto" };
  }

  const isValidSignature = verifySignature(token, CONFIG.secretKey);
  if (!isValidSignature) {
    return { valid: false, message: "Firma inválida" };
  }

  let payload: JwtPayload;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64));
  } catch (error) {
    return { valid: false, message: "Payload inválido" };
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (payload.exp && currentTime > payload.exp) {
    return { valid: false, message: "Token expirado" };
  }

  return { valid: true, payload };
}
