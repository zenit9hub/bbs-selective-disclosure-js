const roadmap = [
  {
    id: "Stage 0",
    title: "Utility Foundations",
    goal: "Ensure deterministic byte/hex handling before applying cryptography.",
    keyChecks: [
      "Hex ↔ bytes conversions",
      "Message padding invariants",
      "Nonce entropy requirements",
    ],
  },
  {
    id: "Stage 1",
    title: "BLS Signatures",
    goal: "Validate the base signature primitive that BBS builds upon.",
    keyChecks: [
      "Key generation",
      "Happy-path verification",
      "Failure on tampering",
    ],
  },
  {
    id: "Stage 2",
    title: "BBS Multi-Message Signatures",
    goal: "Sign structured claims and detect schema mismatches.",
    keyChecks: [
      "Key pair suitability",
      "Message count adherence",
      "Graceful error handling",
    ],
  },
  {
    id: "Stage 3",
    title: "Selective Disclosure Scenarios",
    goal: "Prove different reveal strategies without exposing hidden claims.",
    keyChecks: [
      "Subset reveal",
      "Full disclose sanity check",
      "Index ordering discipline",
    ],
  },
  {
    id: "Stage 4",
    title: "Proof Integrity Guards",
    goal: "Surface how proofs fail when the transcript is manipulated.",
    keyChecks: [
      "Nonce mismatch",
      "Claim tampering",
      "Verifier key mismatch",
    ],
  },
  {
    id: "Stage 5",
    title: "VC / VP Narrative",
    goal: "Connect BBS proofs to a concrete credential issuance and presentation flow.",
    keyChecks: [
      "Credential assembly",
      "Derived presentation",
      "Verifier reconstruction",
    ],
  },
];

const learningGraph = `graph TD
  S0["Stage 0\\nUtility Foundations"]
  S1["Stage 1\\nBLS Signatures"]
  S2["Stage 2\\nBBS Signatures"]
  S3["Stage 3\\nSelective Disclosure"]
  S4["Stage 4\\nProof Integrity"]
  S5["Stage 5\\nVC → VP Flow"]
  S0 --> S1 --> S2 --> S3 --> S4 --> S5
`;

export const stageRoadmap = roadmap;

export const getStageMeta = (stageId) =>
  roadmap.find((stage) => stage.id === stageId);

export const logStageIntro = (stageId) => {
  if (typeof process !== "undefined" && process.env.STAGE_LOG_MODE === "silent") {
    return;
  }

  const stage = getStageMeta(stageId);
  if (!stage) return;

  const banner = [
    "",
    `🧭  ${stage.id} – ${stage.title}`,
    `   Goal: ${stage.goal}`,
    `   Key checks: ${stage.keyChecks.join(", ")}`,
    "",
  ].join("\n");

  // eslint-disable-next-line no-console
  console.log(banner);
};

export const exportLearningGraph = () => learningGraph;
