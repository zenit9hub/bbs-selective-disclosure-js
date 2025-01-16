// Convert bytes to a hex string
export const bytesToHex = (bytes) => Buffer.from(bytes).toString("hex");

// Convert a hex string to bytes
export const hexToBytes = (hex) => {
  if (!hex || hex.length % 2 !== 0) {
    throw new Error("Hex string must be non-empty and even length");
  }
  return Uint8Array.from(Buffer.from(hex, "hex"));
};

// Pad a message to a fixed length
export const padMessage = (message) => {
  const KEY_LENGTH = 32;
  if (!message || message.length > KEY_LENGTH) {
    throw new Error(
      `Message must be non-empty and no longer than ${KEY_LENGTH} bytes. Was ${message?.length} bytes`
    );
  }
  const paddedMessage = new Uint8Array(KEY_LENGTH);
  paddedMessage.set(message);
  return paddedMessage;
};

export const generateNonce = (length = 32) => {
  if (length < 16) {
    throw new Error(
      "Nonce length must be at least 16 bytes for security reasons."
    );
  }
  return crypto.getRandomValues(new Uint8Array(length));
};
