import { describe, it, before } from "mocha";
import { expect } from "chai";
import {
  generateBBSKeyPair,
  signBBS,
  verifyBBS,
  generateNonce,
} from "../src/bbs-core.js";
import { logStageIntro } from "./support/learningArtifacts.js";

const encoder = new TextEncoder();

const sampleClaims = [
  "studentId:20240123",
  "program:AI Research",
  "level:Graduate",
];

describe("Stage 2 – BBS Multi-Message Signatures", () => {
  before(() => {
    logStageIntro("Stage 2");
  });

  it("creates a BBS key pair with the intended message capacity", async () => {
    const keyPair = await generateBBSKeyPair(sampleClaims.length);
    expect(keyPair).to.have.property("publicKey");
    expect(keyPair).to.have.property("secretKey");
    expect(keyPair.publicKey).to.be.instanceOf(Uint8Array);
  });

  it("signs and verifies structured claims", async () => {
    const keyPair = await generateBBSKeyPair(sampleClaims.length);
    const messages = sampleClaims.map((claim) => encoder.encode(claim));
    const signature = await signBBS(keyPair, messages);
    expect(signature).to.be.instanceOf(Uint8Array);

    const result = await verifyBBS(keyPair.publicKey, signature, messages);
    expect(result.verified).to.be.true;
  });

  it("guards against zero-length schemas when generating key material", async () => {
    let error;
    try {
      await generateBBSKeyPair(0);
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
  });

  it("flags verification failures when claims are dropped", async () => {
    const keyPair = await generateBBSKeyPair(sampleClaims.length);
    const messages = sampleClaims.map((claim) => encoder.encode(claim));
    const signature = await signBBS(keyPair, messages);

    const subset = messages.slice(0, 2);
    const result = await verifyBBS(keyPair.publicKey, signature, subset);
    expect(result.verified).to.be.false;
  });

  it("fails verification if the signature is replayed with different claims", async () => {
    const keyPair = await generateBBSKeyPair(sampleClaims.length);
    const messages = sampleClaims.map((claim) => encoder.encode(claim));
    const signature = await signBBS(keyPair, messages);

    const alteredMessages = [...messages];
    const tampered = encoder.encode("program:Quantum Finance");
    alteredMessages[1] = tampered;

    const result = await verifyBBS(
      keyPair.publicKey,
      signature,
      alteredMessages
    );
    expect(result.verified).to.be.false;
  });

  it("produces unique signatures thanks to a random nonce internally", async () => {
    const keyPair = await generateBBSKeyPair(sampleClaims.length);
    const messages = sampleClaims.map((claim) => encoder.encode(claim));
    const signatureA = await signBBS(keyPair, messages);
    const signatureB = await signBBS(keyPair, messages);

    expect(signatureA).to.not.deep.equal(signatureB);
  });
});
