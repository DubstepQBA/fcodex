import crypto from "crypto";

const algorithmMap: { [key in "HS256" | "HS384" | "HS512"]: string } = {
  HS256: "sha256",
  HS384: "sha384",
  HS512: "sha512",
};

/**
 * Creates a signature using the HMAC algorithm with the given data, secret, and algorithm.
 *
 * The algorithm must be one of HS256, HS384, or HS512.
 *
 * @param data - The data to sign.
 * @param secret - The secret to use for signing.
 * @param algorithm - The algorithm to use for signing.
 * @returns The signature as a base64url encoded string.
 */
export function createHmacSignature(
  data: string,
  secret: string,
  algorithm: "HS256" | "HS384" | "HS512"
): string {
  const hashAlgorithm = algorithmMap[algorithm]; // Mapeo al nombre del algoritmo de hash
  return crypto
    .createHmac(hashAlgorithm, secret)
    .update(data)
    .digest("base64url");
}

/**
 * Verifies a signature using the HMAC algorithm with the given data, secret, and algorithm.
 *
 * The algorithm must be one of HS256, HS384, or HS512.
 *
 * @param data - The data to verify against.
 * @param signature - The signature to verify.
 * @param secret - The secret to use for verification.
 * @param algorithm - The algorithm to use for verification.
 * @returns Whether the signature is valid.
 */
export function verifyHmacSignature(
  data: string,
  signature: string,
  secret: string,
  algorithm: "HS256" | "HS384" | "HS512"
): boolean {
  const expectedSignature = createHmacSignature(data, secret, algorithm);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
