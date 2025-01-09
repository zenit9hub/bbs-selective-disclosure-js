// bbs-core.js
import { generateBLSKeyPair, generateBBSKeyPair } from "./keyGeneration.js";
import { signBLS, verifyBLS, signBBS, verifyBBS } from "./signing.js";
import { bytesToHex, hexToBytes, padMessage } from "./utils.js";
import {
  createProof as bbsCreateProof,
  verifyProof as bbsVerifyProof,
} from "@mattrglobal/bbs-signatures";

// Create a proof for selective disclosure
export const createProof = async ({
  signature,
  publicKey,
  messages,
  revealed,
  nonce,
}) => {
  return bbsCreateProof({
    signature,
    publicKey,
    messages,
    revealed,
    nonce,
  });
};

// Verify a proof for selective disclosure
export const verifyProof = async ({ proof, publicKey, messages, nonce }) => {
  return bbsVerifyProof({
    proof,
    publicKey,
    messages,
    nonce,
  });
};

// Export all functions for external use
export {
  generateBLSKeyPair,
  generateBBSKeyPair,
  signBLS,
  verifyBLS,
  signBBS,
  verifyBBS,
  bytesToHex,
  hexToBytes,
  padMessage,
};
