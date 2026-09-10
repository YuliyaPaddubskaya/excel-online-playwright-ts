# Excel Online E2E Automation Test (Playwright + TypeScript)

This repository contains an end-to-end automated test for verifying the `TODAY()` function in Excel Online using Playwright, TypeScript, Page Object Model (POM), and Custom Fixtures.

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <https://github.com/YuliyaPaddubskaya/excel-online-playwright-ts.git>
   cd excel-online-playwright-ts
   ```

## 🏗 Architectural Overview & Best Practices

The project follows clean code standards, SOLID principles, and strict separation of concerns:

- **Page Object Model (POM)**: Core Excel Online interactions (`pages/ExelOnlinePage.ts`) are completely decoupled from test declarations.
- **Custom Fixtures**: Fixture-based instantiation (`fixtures/fixtures.ts`) manages page lifecycle cleanly and injects POM dependencies.
- **Authentication Storage**: Pre-authenticates via `tests/auth.setup.ts` and saves state to `playwright/.auth/user.json` to bypass repetitive login overhead.
- **DOM-First Wait Strategy**: Avoids fragile network state dependencies (such as `networkidle`). All readiness checks rely on explicit DOM element states (`toBeVisible`, `toBeFocused`).
- **Resilient Overlay Handling**: Built-in handling for blocking notification banners and toasts (`UnavailabilityToast`) directly inside nested editor `iframe` contexts (`WacFrame`) without breaking React virtual DOM state.
- **Localization & Format Alignment**: Standardizes date formatting (`DD/MM/YYYY`) matching the regional account settings of Excel Online.
- **CI/CD:** GitHub Actions (automatic test execution in an isolated Ubuntu environment on pushes/manually, report generation)

## 🛠 Prerequisites

- **Node.js** (v24.19.0 or higher recommended)
- **npm** (comes packaged with Node.js)

---

## ⚙️ Configuration & Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd excel-online-playwright-ts
   Install dependencies & browser binaries:
   ```

Bash
npm install
npx playwright install chrome
Environment Variables Configuration:
Create a .env file in the root directory based on .env.example:

MS_ACCOUNT_EMAIL="your-email@example.com"
MS_ACCOUNT_PASSWORD="your-password"

🚀 Running Tests & Available Scripts
All execution commands are wrapped in package.json scripts:

Run all E2E tests (Headless Chrome): npm test
Run authentication setup only: npm run test:auth

⚙️ CI/CD Integration
This project includes a GitHub Actions workflow (.github/workflows/playwright.yml) that automatically runs the test suite on every push and pull_request targeting master / main branches.

Credentials (MS_ACCOUNT_EMAIL, MS_ACCOUNT_PASSWORD) are passed securely via GitHub Repository Secrets.

📂 Project Structure
Plaintext
excel-online-playwright-ts/
├── .github/workflows/
│ └── playwright.yml # GitHub Actions CI/CD configuration
├── config/ # Environment & global configurations
├── fixtures/
│ └── fixtures.ts # Custom Playwright test fixtures
├── pages/
│ └── ExelOnlinePage.ts # Excel Online POM (WacFrame frame & cell operations)
├── tests/
│ ├── auth.setup.ts # Auth setup script (generates user.json)
│ └── excel-today.spec.ts# TODAY() formula evaluation spec
├── utils/
│ └── dateUtils.ts # Date formatting helpers (DD/MM/YYYY)
├── playwright\.auth/ # Stored authentication state (user.json)
├── .env.example # Environment template
├── package.json # Scripts and dependency manifests
├── playwright.config.ts # Global Playwright settings
└── README.md

## FAQ & Engineering Notes

### 1. How are blocking toasts / overlays handled?

Excel Online frequently renders `UnavailabilityToast` or notification banners inside its `WacFrame` iframe. Instead of complex DOM deletion loops that crash React's virtual DOM reconciliation, `ExelOnlinePage.dismissAllToasts()` intercepts and strips blocking overlay containers gracefully before cell interaction.

### 2. Why is `networkidle` avoided?

Excel Online keeps persistent background channels open (WebSockets, telemetry, and OneDrive sync polling). Using `waitForLoadState('networkidle')` causes intermittent 30-second timeouts. The suite instead uses targeted Web Assertions on `NameBox` visibility and focus state.

### 3. Alternative Solutions Considered

- **API-Driven Session Management (Create/Delete Workbook via Microsoft Graph API)**:
  - **Concept**: Instead of reusing a static default workbook or navigating to `excel.new` via UI, the test suite could call Microsoft Graph API (`POST /v1.0/me/drive/root/children`) using an OAuth2 bearer token to provision a clean `.xlsx` file before test execution, run the UI test inside that file, and immediately delete it via API (`DELETE /v1.0/me/drive/items/{item-id}`) in an `afterAll` hook.
  - **Trade-off / Why not used**: While this guarantees a completely isolated environment and instant cleanup, acquiring full Graph API app registrations / OAuth tokens requires tenant-level Azure AD privileges or enterprise app consent, which isn't always feasible with personal test accounts. The current UI-based approach maintains zero external API dependencies.

- **Direct Cell Canvas Interaction**:
  - Interacting directly with Excel grid coordinates via canvas clicks is highly fragile across different screen resolutions. Navigation via the **NameBox input** (`#FormulaBar-NameBoxwrapper input`) paired with keyboard shortcuts (`Control+Enter`) provides 100% deterministic cell selection and formula execution.
