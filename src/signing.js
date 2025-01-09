import { sign, verify } from "@noble/bls12-381";
import {
  sign as bbsSign,
  verify as bbsVerify,
} from "@mattrglobal/bbs-signatures";

// Sign a message using BLS
export const signBLS = async (message, privateKey) => sign(message, privateKey);

// Verify a BLS signature
export const verifyBLS = async (signature, message, publicKey) =>
  verify(signature, message, publicKey);

// Sign messages using BBS
export const signBBS = async (keyPair, messages) =>
  bbsSign({ keyPair, messages });

// Verify a BBS signature
export const verifyBBS = async (publicKey, signature, messages) =>
  bbsVerify({ publicKey, signature, messages });
