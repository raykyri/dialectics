# Context Briefing: AI and Governance

## The Landscape

The intersection of AI/LLMs and governance is underdeveloped relative to both the technology's capability and the domain's need. This briefing synthesizes the existing project landscape, theoretical frameworks, and structural barriers.

## Existing Projects and Tools

### LLM-Era Tools
- **Talk to the City** (AI Objectives Institute): Uses LLMs to cluster and summarize large volumes of qualitative input (interviews, surveys, public comments) into interactive reports. One of the more mature LLM-native tools in this space. Has been deployed in real contexts.
- **Anthropic's Clio**: Internal tool for analyzing aggregate patterns in Claude conversations while preserving privacy. Architecture pattern — LLM-based clustering of free-text into meaningful categories while preserving anonymity — is directly applicable to deliberative contexts.
- **Collective Constitutional AI** (Anthropic + CIP, 2023): ~1,000 Americans contributed to shaping Claude's behavioral guidelines through deliberative process. Finding: collectively-authored constitutions produced preferred AI behavior vs. expert-authored versions.
- **Habermas Machine** (Google DeepMind, 2024): LLMs mediate between participants, generating compromise statements. Early results cautiously positive — AI-mediated groups reached agreement more often.
- **Remesh**: Platform for large-scale online conversations with AI synthesis. Commercially deployed; used by UN, governments, corporations.
- **OpenAI Democratic Inputs to AI** (2023): Funded ~10 teams to prototype governance mechanisms. Status of outputs unclear.

### Pre-LLM Reference Projects (Still Active)
- **Polis** (pol.is): Opinion clustering via PCA — participants submit statements, vote agree/disagree/pass. Used in Taiwan's vTaiwan. Core strength: mathematical approach to finding consensus without AI-generated text. LLM integration being explored for summarization.
- **Decidim**: Open-source participatory democracy platform (Barcelona origin). 400+ cities. AI integration minimal but high-impact potential given user base.
- **Collective Intelligence Project** (CIP): Research org focused on collective input into AI governance. Key people: Divya Siddarth, Saffron Huang.

### Adjacent Spaces
- **DAOs**: AI delegates (LLM agents voting based on stated preferences) actively debated in Ethereum community. Gitcoin uses ML for Sybil detection in quadratic funding.
- **Wikipedia**: Cautious about AI-generated content. ML for vandalism detection (ORES/Lift Wing) but not LLMs. Governance mechanisms are a model *for* AI governance, not users *of* AI.
- **OSS Reputation**: No formal AI-specific reputation systems. "Vibe coding" governance challenge (evaluating/trusting AI-generated PRs) largely unsolved; handled through existing code review + disclosure policies.
- **ARIA (UK)**: Likely has programmes touching collective intelligence/deliberation. Specific details need verification — recommended checking aria.org.uk directly.

## Key Thinkers and Frameworks

| Thinker | Core Claim | Emphasis |
|---------|-----------|----------|
| **Audrey Tang** | Democracy and technology are structurally analogous. AI as "listener at scale." | Practical deployment, radical transparency |
| **Glen Weyl** (RadicalxChange) | The fundamental problem is preference aggregation under unequal intensity. Quadratic mechanisms + AI. | Mechanism design, plural technology |
| **Divya Siddarth** (CIP) | "How do we build collective processes for steering AI?" not "how do we align AI with human values?" | Participation-washing risk, temporal mismatch |
| **Beth Noveck** (GovLab) | Government is bad at using distributed expertise. AI as matchmaker between problems and people. | Pragmatic problem-solving |
| **Helene Landemore** | Democracy's epistemic value comes from cognitive diversity. AI could either enhance or destroy this. | Does AI reduce cognitive diversity by channeling through single model? |
| **James Fishkin** (Stanford) | Deliberative polling + AI. | Academic authority on deliberation |

### Where Thinkers Converge
1. AI should augment democratic processes, not replace them
2. Interesting applications are in *listening at scale* — summarizing, clustering, mapping
3. Core danger: AI that generates rather than reflects — manufacturing consensus
4. Transparency and auditability non-negotiable
5. "AI alignment" discourse too narrow; need processes for collective steering

### Where They Diverge
1. Mechanism design (Weyl) vs. deliberation (Landemore) — different theories of what democracy is *for*
2. Pragmatism (Noveck) vs. principle (Landemore/Siddarth) — rapid deployment vs. careful institutional design
3. Optimism gradient: Tang/Weyl more optimistic; Landemore cautious; broader academic community more skeptical

## Structural Barriers

### 1. Interaction Paradigm (Design/Engineering)
LLMs are 1:1; governance is n:n. No major platform has built genuinely multi-party AI facilitation. Polis sidesteps the problem (aggregation, not conversation). Technically feasible but requires significant investment nobody has prioritized.

### 2. Incentive Structure (Market Failure)
Individual productivity tools have clear unit economics. Governance tools are public goods — no procurement budget for "the public" or "the democratic process." Civic tech funding (philanthropy, grants) is orders of magnitude below commercial AI investment. Code for America's lesson: civic tech that makes government efficient can find funding; civic tech that makes democracy more participatory struggles.

### 3. Trust and Legitimacy (Social/Institutional)
Governance requires qualitatively different trust. Specific concerns: neutrality (whose AI?), surveillance framing, accountability gaps, automation anxiety. Pew data shows public comfort with AI drops sharply when application moves from personal assistance to governance.

### 4. Institutional Adoption (Institutional)
Procurement cycles 12-36 months. Asymmetric incentives (failure punished, innovation unrewarded). Success requires sustained institutional champion (e.g., Audrey Tang). Generational timescale.

### 5. Design Paradigm (Design/Engineering)
Chat is wrong for collective processes. Alternatives exist (structured argumentation, opinion mapping, wiki-like collaboration) but nobody has invested in AI-enhanced versions. The people with design skills work at companies optimizing for individual productivity.

### 6. Technology Readiness (Technical — Improving Rapidly)
Missing: adversarial robustness, long-context multi-user consistency, multilingual depth. Already capable: summarization, clustering, translation, argument mapping. "Too early" is partially valid but serves as convenient excuse for not addressing the market failure.

### Barriers Are Mutually Reinforcing
Market failure → no investment in interaction paradigm or design → no deployable tools → no track record → no trust → no institutional adoption. Highest-leverage intervention: address the funding/incentive problem to create resources for design and engineering.

### Historical Comparison
Technology-to-governance lag: 2-5 years for service delivery, 10-20+ years for participatory use. Exceptions (Estonia, Taiwan) required: political crisis, institutional champions, small/homogeneous populations.

## The User's Situation

The user is exploring this space to build understanding and generate a list of actionable project ideas. They are interested in:
- Democratic participation and institutional decision-making
- Collective knowledge building
- Conflict resolution and mediation specifically
- Tools AND practices/rituals (embedding AI into recurring institutional processes)
- The gap between AI capability and governance adoption

They note that government operations/policy analysis already use AI broadly — the question is why not democratic participation, collective intelligence, and conflict resolution.

## The Deepest Contradiction Identified

**"AI as Mirror" vs. "AI as Mediator"**

The existing successful approaches (Polis, Talk to the City, Clio) all work by making collective patterns *legible* — reflecting back what a group thinks so humans can see the structure. The AI is a mirror: it shows you what's there but doesn't intervene.

The unrealized potential (conflict resolution, active facilitation, deliberation support) would require AI as *mediator* — an active participant that generates bridging proposals, structures conversation, and shapes the deliberative process. This is where the user's intuitions point but where almost nothing has been successfully built.

The tension: the mirror approach is safer, more legitimate, and has proofs-of-concept — but it may be fundamentally insufficient for the hard governance problems (conflict resolution, bridging deep disagreements). The mediator approach is potentially transformative — but it runs into every structural barrier simultaneously (trust, legitimacy, interaction paradigm, design).
