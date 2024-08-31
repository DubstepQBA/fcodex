import crypto from "crypto";

/**
 * Creates a signature using the RSA algorithm.
 * @param data The data to be signed.
 * @param privateKey The private key to use for signing.
 * @param algorithm The algorithm to use. Supported algorithms are:
 *   - RS256 (RSA-SHA256)
 *   - RS384 (RSA-SHA384)
 *   - RS512 (RSA-SHA512)
 * @returns The signature as a base64url encoded string.
 */
export function createRsaSignature(
  data: string,
  privateKey: string,
  algorithm: string
): string {
  return crypto
    .createSign(algorithm)
    .update(data)
    .sign(privateKey, "base64url");
}

/**
 * Verifies a signature using the RSA algorithm.
 * @param data The data to verify against.
 * @param signature The signature to verify.
 * @param publicKey The public key to use for verification.
 * @param algorithm The algorithm to use. Supported algorithms are:
 *   - RS256 (RSA-SHA256)
 *   - RS384 (RSA-SHA384)
 *   - RS512 (RSA-SHA512)
 * @returns Whether the signature is valid.
 */
export function verifyRsaSignature(
  data: string,
  signature: string,
  publicKey: string,
  algorithm: string
): boolean {
  return crypto
    .createVerify(algorithm)
    .update(data)
    .verify(publicKey, signature, "base64url");
}
