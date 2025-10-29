import { describe, it, before } from "mocha";
import { expect } from "chai";
import {
  generateBBSKeyPair,
  signBBS,
  createProof,
  verifyProof,
  generateNonce,
} from "../src/bbs-core.js";
import { logStageIntro } from "./support/learningArtifacts.js";

const encoder = new TextEncoder();

const claims = [
  "name:Eunji Park",
  "program:AI Research",
  "graduation:2023",
];

const toMessages = (list) => list.map((claim) => encoder.encode(claim));

describe("Stage 4 – Proof Integrity Guards", () => {
  before(() => {
    logStageIntro("Stage 4");
  });

  it("fails verification when the nonce differs from the original", async () => {
    const keyPair = await generateBBSKeyPair(claims.length);
    const messages = toMessages(claims);
    const signature = await signBBS(keyPair, messages);

    const originalNonce = generateNonce();
    const revealed = [0, 2];
    const proof = await createProof({
      signature,
      publicKey: keyPair.publicKey,
      messages,
      revealed,
      nonce: originalNonce,
    });

    const revealedMessages = revealed.map((index) => messages[index]);
    const forgedNonce = generateNonce();

    const verification = await verifyProof({
      proof,
      publicKey: keyPair.publicKey,
      messages: revealedMessages,
      nonce: forgedNonce,
    });

    expect(verification.verified).to.be.false;
  });

  it("detects tampered revealed claims", async () => {
    const keyPair = await generateBBSKeyPair(claims.length);
    const messages = toMessages(claims);
    const signature = await signBBS(keyPair, messages);
    const nonce = generateNonce();
    const revealed = [1];

    const proof = await createProof({
      signature,
      publicKey: keyPair.publicKey,
      messages,
      revealed,
      nonce,
    });

    const tamperedMessage = encoder.encode("program:Tampered Program");
    const verification = await verifyProof({
      proof,
      publicKey: keyPair.publicKey,
      messages: [tamperedMessage],
      nonce,
    });

    expect(verification.verified).to.be.false;
  });

  it("rejects proofs when verified against a different public key", async () => {
    const keyPair = await generateBBSKeyPair(claims.length);
    const strangerKeyPair = await generateBBSKeyPair(claims.length);
    const messages = toMessages(claims);
    const signature = await signBBS(keyPair, messages);
    const nonce = generateNonce();
    const revealed = [0, 1];

    const proof = await createProof({
      signature,
      publicKey: keyPair.publicKey,
      messages,
      revealed,
      nonce,
    });

    const revealedMessages = revealed.map((index) => messages[index]);
    const verification = await verifyProof({
      proof,
      publicKey: strangerKeyPair.publicKey,
      messages: revealedMessages,
      nonce,
    });

    expect(verification.verified).to.be.false;
  });
});

