# BBS Selective Disclosure

This project implements BBS+ signatures for selective disclosure using the `@mattrglobal/bbs-signatures` library and `@noble/bls12-381` for cryptographic operations.

## Introduction

BBS+ signatures allow for the creation of digital signatures that can selectively disclose certain parts of the signed data. This project provides an implementation of these signatures, enabling secure and private data sharing.

## Project Structure

- **src/bbs-core.js**: Core functions for generating key pairs, signing, and verifying messages using BLS and BBS signatures.
- **tests/bbs-core.test.js**: Test cases for the core functions using Mocha and Chai.

## Prerequisites

- Node.js (version 14 or higher recommended)
- npm (Node Package Manager)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/zenit9hub/bbs-selective-disclosure-js.git
   ```

2. Navigate to the project directory:

   ```bash
   cd bbs-selective-disclosure-js
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

## Usage

To run the tests, use the following command:

```bash
npm test
```

## Future Directions

This project aims to expand its capabilities by integrating more advanced cryptographic features, improving performance, and enhancing usability. Future updates may include support for additional cryptographic schemes and improved documentation.

## Library Information

- `@mattrglobal/bbs-signatures`: Provides BBS+ signature capabilities.
- `@noble/bls12-381`: Used for BLS signature operations.

## Security Considerations

When using cryptographic libraries, ensure that you are following best practices for key management and data protection. Regularly update dependencies to incorporate security patches and improvements.

## Examples

### BLS Key Pair Generation

```javascript
import { generateBLSKeyPair } from "./src/bbs-core.js";

(async () => {
  const { privateKey, publicKey } = await generateBLSKeyPair();
  console.log("Private Key:", privateKey);
  console.log("Public Key:", publicKey);
})();
```

### Selective Disclosure Example

```javascript
import {
  generateBBSKeyPair,
  signBBS,
  createProof,
  verifyProof,
} from "./src/bbs-core.js";

(async () => {
  const messageCount = 3;
  const bbsKeyPair = await generateBBSKeyPair(messageCount);

  const messages = [
    new TextEncoder().encode("Message A"),
    new TextEncoder().encode("Message B"),
    new TextEncoder().encode("Message C"),
  ];

  const signature = await signBBS(bbsKeyPair, messages);

  const revealedIndexes = [0, 2];
  const nonce = new Uint8Array([1, 2, 3]);

  const proof = await createProof({
    signature,
    publicKey: bbsKeyPair.publicKey,
    messages,
    revealed: revealedIndexes,
    nonce,
  });

  const revealedMessages = revealedIndexes.map((index) => messages[index]);

  const proofResult = await verifyProof({
    proof,
    publicKey: bbsKeyPair.publicKey,
    messages: revealedMessages,
    nonce,
  });

  console.log("Proof verified:", proofResult.verified);
})();
```

## Documentation Links

- [BBS+ Signatures Documentation](https://github.com/mattrglobal/bbs-signatures)
- [BLS12-381 Documentation](https://github.com/paulmillr/noble-bls12-381)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Contact

For any questions or inquiries, please contact [your-email@example.com](mailto:your-email@example.com).

## License

This project is licensed under the ISC License.
