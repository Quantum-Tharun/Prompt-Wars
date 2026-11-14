# SkillPath AI — Precision Calibration Instrument & Drafting Notebook Design Plan

## 1. Executive Summary & Design Critique
SkillPath AI is an engineering calibration instrument and drafting notebook designed to discover what a technical learner can empirically do, contrast it against self-claims and platform evidence, and calculate the distance to a target engineering role.

### Anti-Slop Design Critique:
- **Tone**: Precision drafting instrument. Terse, factual engineering labels ("Calibration gap", "Verified level", "Prerequisite gate", "Evidence log").
- **Eliminated**: Dark dashboard theme, floating shadow cards, colored icon pills, rounded-full pills, gradient text/borders, neon accents, emojis, and marketing buzzwords.
- **Adopted**: Cool mineral drafting ground (`#ECEEED`), elevated instrument surfaces (`#F7F8F7`), carbon ink rules (`#18191B`, `#C5C9C7`), graphite annotations (`#5F6563`), deep viridian (`#146348`), and signal vermilion (`#B8351E`). Zero blue or purple hues.
- **Typography**: Bricolage Grotesque for tabular instrument metrics and UI controls, Source Serif 4 for diagnostics and provenance explanations, IBM Plex Mono strictly for code blocks.
- **Motion**: Strictly restrained to two purposeful transitions (ruler coordinate slide and gate-unlock rail transition), both respecting `prefers-reduced-motion`.

---

## 2. Shell & 3-Column Layout Topology
```
+-------------------------------------------------------------------------------------------------+
| Presenter strip: Carbon bar (#18191B), 13px, 4 presets + self-test modal, toggle via Alt+P     |
+----------------------+--------------------------------------------------+-----------------------+
| Journey rail (220px) | Stage canvas (max-width 960px fluid)             | Evidence panel (340px)|
| 1. Profile           | Active stage view:                               | Contextual telemetry  |
| 2. Connect           | - Ruled drafting tables                          | - Career specs        |
| 3. Verify            | - Horizontal Calibration Rulers                  | - Consent logs        |
| 4. Validated profile | - SVG 5-Phase Prerequisite Rail                  | - Diagnostic audits   |
| 5. Roadmap           | - 3-Vector Triangulation Archetypes              | - Provenance drawer   |
| 6. Mentor            | - Recovery Quiz & Readiness Jump                 | - Skill capital delta |
| 7. Career switch     | - Skill Capital Preservation Ledger              |                       |
+----------------------+--------------------------------------------------+-----------------------+
```

---

## 3. Data Flow & Integration Contracts
Every stage binds directly to the verified Next.js App Router API endpoints via `lib/api/client.ts` and `lib/api/adapters.ts`:
1. **Profile**: `POST /api/discovery/init`
2. **Connect**: `POST /api/platforms/connect` (403 on denied consent)
3. **Verify**: `POST /api/assessment/questions` (3-Question Adaptive Staircase)
4. **Validated Profile**: `POST /api/assessment/validate` and `POST /api/orchestrate`
5. **Roadmap**: `POST /api/orchestrate` (5-Phase DAG Roadmap with Provenance)
6. **Mentor**: `POST /api/mentor/adapt` (35% JS failure -> surgical splice) & `POST /api/mentor/verify` (100% recovery -> gate unlock)
7. **Career Switch**: `POST /api/career/pivot` (Data Analyst switch, 15-20 hours saved)
8. **Self-Test**: `GET /api/test-pipeline` (10-stage assertion suite)



---

## 4. React Bits `<GradientASCII />` & Kinetic Primitives Integration
- **WebGL2 Canvas**: `components/viz/GradientASCII.tsx` with `GradientASCII.css`, compiled in WebGL2 with custom `VERTEX` and `FRAGMENT` shaders, dynamic character atlas, mouse scramble trail, click wave ripple, and `IntersectionObserver` frame throttling.
- **Drafting Palette Constraint**: Calibrated strictly to mineral drafting ground with zero blue/purple undertones (`colors={["#ECEEED", "#C5C9C7", "#5F6563", "#146348", "#18191B"]}`, `lightMode={true}`, `glow={0}`, `gradientOpacity={0.18}`).
- **DecryptedText Primitives**: `components/motion/DecryptedText.tsx` cycles character set `[=+xX0S8#@]` over 360ms to resolve archetype tags (`"Verified practitioner"`, `"Certificate collector"`).
- **CountUpNumber Primitives**: `components/motion/CountUpNumber.tsx` smoothly counts up readiness scores and hours saved over 480ms with cubic ease-out.
