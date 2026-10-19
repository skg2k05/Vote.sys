# Team Operational Guide — Vote.sys Blockchain Voting Platform

This document serves as the technical and operational handover manual for the team, detailing the system architecture, how to run the project locally, the complete election lifecycle, and the key architectural fixes applied to modernize the codebase.

---

## 1. System Overview & Technology Stack

The platform is a full-stack Web3 application designed to conduct tamper-proof elections using smart contracts deployed on the Ethereum blockchain.

| Layer | Technologies Used | Responsibility |
| :--- | :--- | :--- |
| **Blockchain** | Ethereum (`Solidity ^0.8.19`), Ganache | Immutable ledger storing election details, candidate rosters, voter whitelists, and tallying votes. |
| **Web3 Client** | `Web3.js v1.10.4`, MetaMask | Interfacing the frontend with the blockchain node and signing transactions using cryptographic wallets. |
| **Frontend** | `Next.js v8`, `React 16.8`, Semantic UI React, Chart.js | Dynamic web user interface, real-time vote visualization, candidate and voter management dashboards. |
| **Backend API** | `Express.js`, Node.js | Custom server running Next.js SSR, routing, and REST endpoints for authentication and voter records. |
| **Database** | `MongoDB`, `Mongoose` | Storing registered voter accounts, administrative credentials, and hashed passwords. |

---

## 2. What Was Modernized & Fixed

The original codebase had several critical legacy bugs that prevented normal operations. Here is a breakdown of what was investigated and resolved:

### A. Navigation & Menu Failures (The "Clicking 15 times" bug)
* **Root Cause:** Legacy menu items were wrapped as `<Link><a><Menu.Item as="a">...</Menu.Item></a></Link>`. In HTML5, nesting `<a>` inside an `<a>` is illegal; modern browser DOM parsers un-nested them, leaving the inner button as an orphan anchor with zero click listeners and no navigation URL. Furthermore, `<Sidebar.Pushable>` was creating an invisible CSS overlay that captured pointer events.
* **Resolution:** Rebuilt the sidebar navigation into a dedicated component (`CompanySidebar.js`) using direct `Router.pushRoute` event handlers, active tab indicators, and valid Semantic UI layout hierarchy.

### B. Contract Method Call Runtime Crash
* **Root Cause:** In `candidate_list.js`, line 36 had `await election.methods.getNumOfCandidates.call()`, omitting parentheses `()`. This invoked JavaScript's `Function.prototype.call` instead of Web3's contract method, throwing a fatal runtime error and bouncing users back to the login page.
* **Resolution:** Corrected to `await election.methods.getNumOfCandidates().call()`, with safe integer parsing and a graceful empty state display.

### C. Voter Password Visibility & Recovery
* **Root Cause:** Generated voter passwords were only logged to stdout (which was rapidly buried by Next.js build logs), and were immediately hashed via bcrypt into the database with no recovery mechanism.
* **Resolution:**
  * Added optional custom password creation on the registration form.
  * Preserved temporary passwords for administrative display in the Voter List dashboard.
  * Added on-screen credentials banners and one-click **"Copy"** and **"Reset Password"** capabilities.

### D. Ethereum Checksum & Wallet Mismatch Detection
* **Root Cause:** Web3 rejected addresses with mixed case that did not match EIP-55 checksum standards (`bad address checksum`). Furthermore, voters attempting to vote while MetaMask was still connected to the company account were blocked without clear UI feedback.
* **Resolution:**
  * Integrated `web3.utils.toChecksumAddress` across registration flows.
  * Added real-time MetaMask account detection in the Voting Booth (`vote.js`), displaying whether the active wallet is whitelisted, along with an instant **"Switch Account"** button.

---

## 3. Local Environment Setup

### Prerequisites
* **Node.js**: v18 or higher (tested on Node v20/v22 with legacy OpenSSL flag)
* **MongoDB Community Server**: Installed as a background service on port `27017`
* **MetaMask Browser Extension**: Installed in Chrome, Brave, or Edge

### Environment Variables (`.env`)
Create a `.env` file at the root:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/BlockVotes
RPC_URL=http://127.0.0.1:8545
EMAIL=
PASSWORD=
MNEMONIC=
```

---

## 4. Execution Workflow (3 Terminals)

Always run the application across three separate terminal instances:

### Terminal 1: Local Blockchain (Ganache)
```bash
npm run chain
```
* **Listening:** `http://127.0.0.1:8545`
* **Chain ID:** `1337`
* **Network Mnemonic:**
  ```
  myth like bonus scare over problem client lizard pioneer submit female collect
  ```

### Terminal 2: Contract Compilation & Deployment
```bash
npm run deploy
```
* Compiles `Election.sol` into `Ethereum/Build/`.
* Deploys `ElectionFact` and writes the address to `Ethereum/deployed_address.json`.

### Terminal 3: Application Server
```bash
npm start
```
* Starts the Express + Next.js server at **`http://localhost:3000`**.

---

## 5. MetaMask Configuration

### Step 1: Add Custom RPC Network
* **Network Name:** `Ganache Local`
* **RPC URL:** `http://127.0.0.1:8545`
* **Chain ID:** `1337`
* **Currency:** `ETH`

### Step 2: Import Test Accounts
Import the following private keys into MetaMask:

* **Account 0 (Company / Authority):**
  * Address: `0x90F8bf6A479f320ead074411a4b0e7944Ea8c9C1`
  * Private Key: `0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d`
* **Account 1 (Voter):**
  * Address: `0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0`
  * Private Key: `0x6cbed15c793ce57650b9877cf26f5d7d95710ee33c937ff0776737709a410313`

---

## 6. End-to-End Operational Walkthrough

```
[Company Login] ──> [Create Election] ──> [Add Candidates] ──> [Whitelist Voters]
                                                                      │
[Announce Winner] <── [End Election] <── [Cast Vote On-Chain] <───────┘
```

1. **Create Election:**
   * Go to `http://localhost:3000/company_login`.
   * Sign in using Account 0 (`0x90F8...`).
   * Create the election name and description. Confirm the MetaMask transaction.
2. **Add Candidates:**
   * Go to the **Candidate List** tab.
   * Add candidates with name, email, manifesto, and optional photo.
   * Confirm the blockchain transaction in MetaMask.
3. **Register Voters:**
   * Go to the **Voter List** tab.
   * Register a voter with their email and MetaMask address (`0xFFcf...`).
   * Copy the voter password displayed on screen.
4. **Cast Vote:**
   * Switch MetaMask to the Voter account (`0xFFcf...`).
   * Navigate to `http://localhost:3000/voter_login`.
   * Log in with the voter credentials.
   * In the Voting Booth, click **Vote!** on the preferred candidate and confirm in MetaMask.
5. **End Election:**
   * Switch MetaMask back to Account 0 (Company).
   * Go to the **Dashboard** and click **End election**.
   * Confirm in MetaMask → The winner is announced and further voting is blocked.

---

## 7. Troubleshooting & FAQ

#### Q: MetaMask reports "Nonce too high" or transaction hangs?
* **Solution:** Whenever Ganache is restarted, MetaMask retains obsolete block history. Go to MetaMask → **Settings** → **Advanced** → **Clear activity and nonce data** (or Reset Account).

#### Q: "This MetaMask account is not registered for this election"?
* **Solution:** You are trying to vote with an account that hasn't been whitelisted by the company. Open the Voting Booth, click **"Switch Account"**, and select your whitelisted voter wallet in MetaMask.

#### Q: MongoDB connection refused on startup?
* **Solution:** Ensure the local MongoDB service is started: `net start MongoDB` on Windows.
