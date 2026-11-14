# Prompt-Wars

## SkillPath AI: Agentic Skill Discovery, Multi-Platform Validation & Adaptive Career Learning

SkillPath AI is an agentic AI-powered career learning platform and precision engineering calibration instrument. It measures the gap between what a learner claims and what they have verified, generating deterministic multi-phase roadmaps, simulating adaptive mentor interventions, and tracking career pivot skill capital.

### Architecture Highlights
- **Deterministic Evaluation First**: Strict TypeScript scoring algorithms compute skill proficiency, cognitive tier weights, and calibration states before qualitative LLM analysis.
- **4-Agent Gemini Orchestration**: Asynchronous multi-agent pipeline with circuit-breaker fallbacks (Skill Analyzer, Career Gap Agent, Learning Planner, Adaptive Mentor).
- **Consent-Gated Platform Integrations**: External footprint sync (GitHub, LinkedIn, LeetCode, Kaggle) requiring explicit learner consent.
- **Precision Drafting UI**: Mineral palette interface with React Bits WebGL2 `<GradientASCII />`, `DecryptedText`, and `CountUpNumber` kinetic primitives.
- **Dynamic Skill Capital Ledger**: Cross-role transition matrices for seamless career pivots.

### Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Visualizations**: WebGL2 Shaders + Recharts
- **Validation**: Zod (Single source of truth)
- **AI**: Google Generative AI (Gemini Flash) with deterministic local fallbacks

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Quantum-Tharun/Prompt-Wars.git
   cd Prompt-Wars
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   Add your Google Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run Verification & Tests**:
   ```bash
   # Type check
   npx tsc --noEmit

   # Production build
   npx next build --webpack
   ```
