/**
 * @jest-environment node
 */

import { describe, it } from "mocha";
import { expect } from "chai";
import {
  generateBLSKeyPair,
  signBLS,
  verifyBLS,
  generateBBSKeyPair,
  signBBS,
  verifyBBS,
  bytesToHex,
  hexToBytes,
  padMessage,
  createProof,
  verifyProof,
  generateNonce,
} from "../src/bbs-core.js";

describe("Utility Functions", () => {
  it("Converts hex to bytes correctly", () => {
    const hex = "010203";
    const bytes = hexToBytes(hex);
    expect(bytes).to.deep.equal(new Uint8Array([1, 2, 3]));
  });

  it("Throws error for invalid hex string", () => {
    expect(() => hexToBytes("010")).to.throw(
      "Hex string must be non-empty and even length"
    );
    expect(() => hexToBytes(null)).to.throw(
      "Hex string must be non-empty and even length"
    );
  });

  it("Converts bytes to hex correctly", () => {
    const bytes = new Uint8Array([0x01, 0x02, 0x03]);
    const hexString = bytesToHex(bytes);
    expect(hexString).to.equal("010203");
  });

  it("Pads message correctly", () => {
    const message = new Uint8Array([0x45, 0x46]);
    const padded = padMessage(message);
    expect(padded).to.have.lengthOf(32);
    expect(padded[0]).to.equal(0x45);
    expect(padded[1]).to.equal(0x46);
    for (let i = 2; i < 32; i++) {
      expect(padded[i]).to.equal(0);
    }
  });

  it("Throws error for null message", () => {
    expect(() => padMessage(null)).to.throw(
      "Message must be non-empty and no longer than 32 bytes. Was undefined bytes"
    );
  });

  it("Throws error for message longer than 32 bytes", () => {
    const longMessage = new Uint8Array(33);
    expect(() => padMessage(longMessage)).to.throw(
      "Message must be non-empty and no longer than 32 bytes. Was 33 bytes"
    );
  });
});

describe("bbs-core.js Tests", () => {
  it("Generates BLS key pair", async () => {
    const { privateKey, publicKey } = await generateBLSKeyPair();
    expect(privateKey).to.be.instanceOf(Uint8Array);
    expect(publicKey).to.be.instanceOf(Uint8Array);
    expect(privateKey).to.have.lengthOf(32);
  });

  it("Signs and verifies BLS message", async () => {
    const { privateKey, publicKey } = await generateBLSKeyPair();
    const message = new TextEncoder().encode("Hello BLS");
    const signature = await signBLS(message, privateKey);

    const isValid = await verifyBLS(signature, message, publicKey);
    expect(isValid).to.be.true;
  });

  it("Generates BBS key pair", async () => {
    const messageCount = 3;
    const bbsKeyPair = await generateBBSKeyPair(messageCount);
    expect(bbsKeyPair).to.have.property("publicKey");
    expect(bbsKeyPair).to.have.property("secretKey");
  });

  it("Signs and verifies BBS messages", async () => {
    const messageCount = 3;
    const bbsKeyPair = await generateBBSKeyPair(messageCount);

    const claims = [
      new TextEncoder().encode("Message A"),
      new TextEncoder().encode("Message B"),
      new TextEncoder().encode("Message C"),
    ];

    const signature = await signBBS(bbsKeyPair, claims);
    expect(signature).to.be.instanceOf(Uint8Array);

    const result = await verifyBBS(bbsKeyPair.publicKey, signature, claims);
    expect(result.verified).to.be.true;
  });
});

describe("BBS Selective Disclosure Tests", () => {
  it("Reveals the first and third claims out of three", async () => {
    // 1. Define the number of claims
    const claimCount = 3;

    // 2. Generate BBS key pair
    const bbsKeyPair = await generateBBSKeyPair(claimCount);
    expect(bbsKeyPair.publicKey).to.be.instanceOf(Uint8Array);
    expect(bbsKeyPair.secretKey).to.be.instanceOf(Uint8Array);

    // 3. Construct claim array
    const claims = [
      new TextEncoder().encode("Claim A"),
      new TextEncoder().encode("Claim B"),
      new TextEncoder().encode("Claim C"),
    ];
    expect(claims.length).to.equal(claimCount);

    // 4. Generate BBS signature
    const signature = await signBBS(bbsKeyPair, claims);
    expect(signature).to.be.instanceOf(Uint8Array);

    // 5. Set indices of claims to reveal
    const revealedIndices = [0, 2];

    // 6. Generate a secure nonce
    const nonce = generateNonce(); // Default length of 32
    expect(nonce.byteLength).to.be.gte(16);

    // 7. Create proof for selective disclosure
    const proof = await createProof({
      signature,
      publicKey: bbsKeyPair.publicKey,
      messages: claims,
      revealed: revealedIndices,
      nonce,
    });
    expect(proof).to.be.instanceOf(Object);

    // 8. Extract only the revealed claims
    const revealedClaims = revealedIndices.map((index) => claims[index]);

    // 9. Verify the proof
    const proofResult = await verifyProof({
      proof,
      publicKey: bbsKeyPair.publicKey,
      messages: revealedClaims,
      nonce,
    });
    expect(proofResult.verified).to.be.true;
  });
});
