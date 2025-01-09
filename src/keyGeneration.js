import { getPublicKey } from "@noble/bls12-381";
import {
  generateBls12381G2KeyPair,
  bls12381toBbs,
} from "@mattrglobal/bbs-signatures";

const KEY_LENGTH = 32;

// Generate a BLS key pair
export const generateBLSKeyPair = async () => {
  const privateKey = crypto.getRandomValues(new Uint8Array(KEY_LENGTH));
  const publicKey = getPublicKey(privateKey);
  return { privateKey, publicKey };
};

// Generate a BBS key pair
export const generateBBSKeyPair = async (messageCount) => {
  const blsKeyPair = await generateBls12381G2KeyPair();
  return bls12381toBbs({ keyPair: blsKeyPair, messageCount });
};
