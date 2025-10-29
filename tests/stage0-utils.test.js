import { describe, it, before } from "mocha";
import { expect } from "chai";
import {
  bytesToHex,
  hexToBytes,
  padMessage,
  generateNonce,
} from "../src/bbs-core.js";
import { logStageIntro } from "./support/learningArtifacts.js";

describe("Stage 0 – Utility Foundations", () => {
  before(() => {
    logStageIntro("Stage 0");
  });

  it("performs a hex ↔ bytes roundtrip without data loss", () => {
    const original = "4a4b4c4d";
    const bytes = hexToBytes(original);
    const reconstructed = bytesToHex(bytes);
    expect(reconstructed).to.equal(original);
  });

  it("rejects invalid hex strings", () => {
    expect(() => hexToBytes("123")).to.throw(
      "Hex string must be non-empty and even length"
    );
    expect(() => hexToBytes("")).to.throw(
      "Hex string must be non-empty and even length"
    );
  });

  it("pads a short message to 32 bytes", () => {
    const padded = padMessage(new Uint8Array([0x01, 0x02]));
    expect(padded).to.have.lengthOf(32);
    expect(padded[0]).to.equal(0x01);
    expect(padded[1]).to.equal(0x02);
    expect(Array.from(padded.slice(2))).to.satisfy((tail) =>
      tail.every((value) => value === 0)
    );
  });

  it("rejects empty or oversized messages during padding", () => {
    expect(() => padMessage(null)).to.throw(
      "Message must be non-empty and no longer than 32 bytes. Was undefined bytes"
    );

    const oversized = new Uint8Array(40);
    expect(() => padMessage(oversized)).to.throw(
      "Message must be non-empty and no longer than 32 bytes. Was 40 bytes"
    );
  });

  it("creates nonces with configurable entropy", () => {
    const nonce = generateNonce(48);
    expect(nonce).to.be.instanceOf(Uint8Array);
    expect(nonce.byteLength).to.equal(48);
  });

  it("enforces the minimum nonce length", () => {
    expect(() => generateNonce(8)).to.throw(
      "Nonce length must be at least 16 bytes for security reasons."
    );
  });
});

