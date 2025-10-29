import { describe, it, before } from "mocha";
import { expect } from "chai";
import {
  generateBBSKeyPair,
  signBBS,
  createProof,
  verifyProof,
  bytesToHex,
  generateNonce,
} from "../src/bbs-core.js";
import { logStageIntro } from "./support/learningArtifacts.js";
import {
  toByteMessages,
  universityCredentialFixture,
  vpSkeleton,
} from "./support/fixtures.js";

const encoder = new TextEncoder();

const claimKeys = [
  "id",
  "givenName",
  "familyName",
  "degree",
  "graduationYear",
];

const mapCredentialToClaimStrings = (credential) =>
  claimKeys.map((key) => `${key}:${credential.credentialSubject[key]}`);

describe("Stage 5 – VC to VP Derivation", () => {
  before(() => {
    logStageIntro("Stage 5");
  });

  it("derives a verifiable presentation from a signed credential", async () => {
    const credential = universityCredentialFixture();
    const claimStrings = mapCredentialToClaimStrings(credential);
    const messages = toByteMessages(claimStrings);

    const keyPair = await generateBBSKeyPair(messages.length);
    const signature = await signBBS(keyPair, messages);

    const signedCredential = {
      ...credential,
      proof: {
        type: "BbsBlsSignature2020",
        created: credential.issuanceDate,
        proofPurpose: "assertionMethod",
        verificationMethod: `${credential.issuer}#bbs-key-1`,
        signatureValue: bytesToHex(signature),
      },
    };

    const revealFields = ["givenName", "degree", "graduationYear"];
    const revealedIndices = revealFields.map((field) =>
      claimKeys.indexOf(field)
    );
    const presentationNonce = generateNonce();

    const proof = await createProof({
      signature,
      publicKey: keyPair.publicKey,
      messages,
      revealed: revealedIndices,
      nonce: presentationNonce,
    });

    const revealedMessages = revealedIndices.map((index) => messages[index]);
    const verification = await verifyProof({
      proof,
      publicKey: keyPair.publicKey,
      messages: revealedMessages,
      nonce: presentationNonce,
    });

    expect(verification.verified).to.be.true;

    const presentation = vpSkeleton({
      holder: credential.credentialSubject.id,
      proof: {
        type: "BbsBlsSignatureProof2020",
        created: new Date().toISOString(),
        verificationMethod: `${credential.issuer}#bbs-key-1`,
        nonce: bytesToHex(presentationNonce),
        proofValue: bytesToHex(proof),
      },
      revealedFields: revealFields,
    });

    presentation.verifiableCredential = [signedCredential];
    presentation.revealedAttributes = Object.fromEntries(
      revealFields.map((field, idx) => [
        field,
        new TextDecoder().decode(revealedMessages[idx]).split(":")[1],
      ])
    );

    expect(presentation.verifiableCredential[0].proof.signatureValue).to.equal(
      bytesToHex(signature)
    );
    expect(presentation.revealedAttributes).to.deep.equal({
      givenName: credential.credentialSubject.givenName,
      degree: credential.credentialSubject.degree,
      graduationYear: credential.credentialSubject.graduationYear,
    });
  });
});

