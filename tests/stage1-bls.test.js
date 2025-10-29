import { describe, it, before } from "mocha";
import { expect } from "chai";
import {
  generateBLSKeyPair,
  signBLS,
  verifyBLS,
  bytesToHex,
  hexToBytes,
} from "../src/bbs-core.js";
import { logStageIntro } from "./support/learningArtifacts.js";

const encoder = new TextEncoder();

describe("Stage 1 – BLS Signature Primitives", () => {
  before(() => {
    logStageIntro("Stage 1");
  });

  it("generates a valid BLS key pair", async () => {
    const { privateKey, publicKey } = await generateBLSKeyPair();
    expect(privateKey).to.be.instanceOf(Uint8Array);
    expect(publicKey).to.be.instanceOf(Uint8Array);
    expect(privateKey.byteLength).to.equal(32);
  });

  it("signs and verifies a message successfully", async () => {
    const { privateKey, publicKey } = await generateBLSKeyPair();
    const message = encoder.encode("Learning BBS builds on solid BLS");
    const signature = await signBLS(message, privateKey);
    const isValid = await verifyBLS(signature, message, publicKey);
    expect(isValid).to.be.true;
  });

  it("detects a tampered message", async () => {
    const { privateKey, publicKey } = await generateBLSKeyPair();
    const originalMessage = encoder.encode("Original message payload");
    const tamperedMessage = encoder.encode("Original message payload?");
    const signature = await signBLS(originalMessage, privateKey);
    const isValid = await verifyBLS(signature, tamperedMessage, publicKey);
    expect(isValid).to.be.false;
  });

  it("fails verification when using a different public key", async () => {
    const { privateKey } = await generateBLSKeyPair();
    const { publicKey: strangerPublicKey } = await generateBLSKeyPair();
    const message = encoder.encode("Key mismatch scenario");
    const signature = await signBLS(message, privateKey);
    const isValid = await verifyBLS(signature, message, strangerPublicKey);
    expect(isValid).to.be.false;
  });

  it("round-trips a signature through hex encoding safely", async () => {
    const { privateKey, publicKey } = await generateBLSKeyPair();
    const message = encoder.encode("Hex safety check");
    const signature = await signBLS(message, privateKey);
    const hexSig = bytesToHex(signature);
    const decodedSig = hexToBytes(hexSig);
    const isValid = await verifyBLS(decodedSig, message, publicKey);
    expect(isValid).to.be.true;
  });
});

