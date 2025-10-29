const encoder = new TextEncoder();

export const toByteMessages = (value) => {
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      typeof item === "string"
        ? encoder.encode(item)
        : (() => {
            throw new TypeError(
              `Unsupported item type at index ${index}: ${typeof item}`
            );
          })()
    );
  }

  if (value && typeof value === "object") {
    return Object.entries(value).map(([key, item]) =>
      encoder.encode(`${key}:${item}`)
    );
  }

  throw new TypeError(
    `toByteMessages expects an array or object, received ${typeof value}`
  );
};

export const universityCredentialFixture = () => ({
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/bbs/v1",
  ],
  type: ["VerifiableCredential", "UniversityDegreeCredential"],
  issuer: "did:example:issuer-university-1",
  issuanceDate: "2024-01-01T00:00:00Z",
  credentialSubject: {
    id: "did:example:holder-489",
    givenName: "Eunji",
    familyName: "Park",
    degree: "Bachelor of Science and Creativity",
    graduationYear: "2023",
  },
});

export const vpSkeleton = ({ holder, proof, revealedFields }) => ({
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/bbs/v1",
  ],
  type: ["VerifiablePresentation", "SelectiveDisclosurePresentation"],
  holder,
  presentationSubmission: {
    descriptor_map: revealedFields.map((field) => ({
      id: field,
      format: "bbs-proof",
      path: `$.credentialSubject.${field}`,
    })),
  },
  proof,
});

