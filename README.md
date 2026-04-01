# GST Chain - Professional Blockchain Tax Ledger

GST Chain is a decentralized application (DApp) designed to provide a secure, immutable, and transparent ledger for GST tax invoices. It leverages Ethereum smart contracts to store and verify invoice integrity, preventing tax fraud and ensuring data authenticity.

## ✨ Features

- **Dashboard-Centric UI**: A premium, glassmorphic interface for seamless interaction.
- **On-Chain Storage**: Permanent records stored on a local Ethereum blockchain (Hardhat).
- **Live Transaction Ledger**: Real-time tracking of all invoices via Smart Contract Events.
- **Cryptographic Verification**: Instant verification of any invoice using its unique on-chain hash.
- **Premium PDF Generation**: Download professional, blockchain-verified tax invoices.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile devices.

## 🛠️ Technology Stack

- **Blockchain**: Solidity (Smart Contract), Hardhat (Development Environment)
- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism), JavaScript (ESM)
- **Libraries**: 
  - `ethers.js`: Blockchain interaction
  - `jsPDF`: Document generation
  - `QRCode.js`: (Optional) Digital verification seals

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed.
- [MetaMask](https://metamask.io/) browser extension.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/NEW-gst-blockchain-project.git
   cd NEW-gst-blockchain-project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running Locally

1. **Start the Hardhat node**:
   ```bash
   npx hardhat node
   ```

2. **Deploy the Smart Contract** (in a separate terminal):
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Update the Contract Address**:
   Copy the deployed address from the terminal and update `contractAddress` in `app.js`.

4. **Launch the Web App**:
   Serve the root directory using any local server (e.g., `npx http-server .`).

### Connecting MetaMask

- Connect MetaMask to **Localhost 8545**.
- **Important**: If you restart the Hardhat node, you must go to *Settings > Advanced > Clear Activity Tab Data* in MetaMask to reset the nonce.

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.
