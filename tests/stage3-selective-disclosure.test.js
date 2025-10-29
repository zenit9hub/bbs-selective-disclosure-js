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

const baseClaims = [
  "name:Eunji Park",
  "program:AI Research",
  "graduation:2023",
];

const toMessages = (claims) => claims.map((claim) => encoder.encode(claim));

describe("Stage 3 – Selective Disclosure Strategies", () => {
  before(() => {
    logStageIntro("Stage 3");
  });

  it("reveals a single claim while keeping others hidden", async () => {
    const keyPair = await generateBBSKeyPair(baseClaims.length);
    const messages = toMessages(baseClaims);
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

    const revealedMessages = revealed.map((index) => messages[index]);
    const verification = await verifyProof({
      proof,
      publicKey: keyPair.publicKey,
      messages: revealedMessages,
      nonce,
    });

    expect(verification.verified).to.be.true;
  });

  it("confirms that revealing all claims matches standard verification", async () => {
    const keyPair = await generateBBSKeyPair(baseClaims.length);
    const messages = toMessages(baseClaims);
    const signature = await signBBS(keyPair, messages);
    const nonce = generateNonce();

    const revealed = [0, 1, 2];
    const proof = await createProof({
      signature,
      publicKey: keyPair.publicKey,
      messages,
      revealed,
      nonce,
    });

    const verification = await verifyProof({
      proof,
      publicKey: keyPair.publicKey,
      messages,
      nonce,
    });

    expect(verification.verified).to.be.true;
  });

  it("handles non-sequential reveal ordering safely", async () => {
    const keyPair = await generateBBSKeyPair(baseClaims.length);
    const messages = toMessages(baseClaims);
    const signature = await signBBS(keyPair, messages);
    const nonce = generateNonce();

    const requestedOrder = [2, 0];
    const proof = await createProof({
      signature,
      publicKey: keyPair.publicKey,
      messages,
      revealed: requestedOrder,
      nonce,
    });

    const unsortedAttempt = await verifyProof({
      proof,
      publicKey: keyPair.publicKey,
      messages: requestedOrder.map((index) => messages[index]),
      nonce,
    });
    expect(unsortedAttempt.verified).to.be.false;

    const sortedOrder = [...requestedOrder].sort((a, b) => a - b);
    const revealedMessages = sortedOrder.map((index) => messages[index]);
    const verification = await verifyProof({
      proof,
      publicKey: keyPair.publicKey,
      messages: revealedMessages,
      nonce,
    });

    expect(verification.verified).to.be.true;
  });
});
