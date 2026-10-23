# Product Marketing Context

**Document version:** v1
**Last updated:** 2026-10-23

The "product" is Alexandre Joly's personal brand on X (@AlexDmzz), with alexandrejoly.me as the owned home base. Kwern and Gymup have their own marketing context; here they are proof of craft, not the subject.

## Product Overview
**One-liner:** A design engineer who designs and builds interfaces with care for the details, and teaches agents to do the same.
**Title:** "Design engineer at Yoojo" as the public descriptor (X bio, LinkedIn headline, site). JSON-LD `jobTitle` matches it ("Design Engineer"). The official job title, verbatim on LinkedIn Experience and in the About page's Yoojo paragraph, stays "Front End Developer & UI/UX Designer" (Yoojo, since Oct 2018); it is the two halves of the same role, so a reader who checks finds the match.
**What it does:** Alexandre ships things people can install: shadcn registry components with one distinctive trick each, agent skills that make AI produce better UI (design-to-shadcn, shadcn-composition-patterns), and the write-ups behind them. Every post shows one detail, how it works, and how to get it.
**Product category:** Design engineering / UI craft × AI agents (the shelf the leading design-engineering accounts on X sit on).
**Product type:** Personal brand: X account + portfolio site + open-source registry and skills.
**Business model:** Free open source now. Later, a paid product sold in time-boxed windows once the audience exists (Pro components, a course or premium skills; not decided).

## Target Audience
**Target companies:** Product teams and startups building React/shadcn interfaces with AI agents in the loop.
**Decision-makers:** Design engineers, front-end developers, product designers who code, founders who care about polish; hiring managers and founders looking for that profile.
**Primary use case:** "My AI-built UI looks generic and breaks on details. Show me how to make it feel right."
**Jobs to be done:**
- Give me a component or skill I can install today that makes my interface noticeably better.
- Teach me the detail I would not have noticed (and the CSS/a11y behind it).
- Show me a workflow where agents do real design work without lowering the bar.
**Use cases:**
- Installing a registry component (`pnpm dlx shadcn@latest add https://alexandrejoly.me/r/<name>.json`).
- Skinning shadcn from an existing design with design-to-shadcn.
- Bookmarking a craft tip with the code inline.
- Following the Figma × Claude workflow (figma-design, figma-prototype, simplr-lint).

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Design engineer peer | Craft, motion, a11y, new CSS | Keeping up, finding the non-obvious detail | One precise detail per post, with the code |
| Dev shipping with agents | Speed without slop | AI output looks generic, drifts from the design system | Skills and components that encode taste |
| Product designer moving into code/AI | Figma → code fidelity | Agents ignore the design system | Proven Figma × Claude workflow with checks, not prompts |
| Founder / hiring manager | Someone who owns UI end to end | Hard to judge craft from a CV | A public trail of shipped, inspectable work |

## Problems & Pain Points
**Core problem:** AI makes building UI fast, but the result is generic and wrong in the details: spacing, motion, a11y, design-system drift.
**Why alternatives fall short:**
- Generic component libraries ship looks, not behaviours; consumers fight overrides.
- Prompt-only "design skills" are rules agents break; nothing checks them.
- Big craft accounts show the detail but rarely the shadcn-native, installable version.
**What it costs them:** Rework, design reviews that repeat, UI that feels cheap next to Linear/Vercel-level products.
**Emotional tension:** "AI made me faster but my work looks like everyone else's."

## Competitive Landscape
**Direct:** Established design-engineering accounts (12k–111k followers) selling courses, magazines and skill sets — they own motion, "interface details" and craft essays. The animation and generic "make UI better" skill niches are taken.
**Secondary:** Large component registries and block marketplaces — volume and looks, little per-behaviour depth.
**Indirect:** "AI will design for you" hype accounts and Figma-is-dead takes — reach without trust (0–9 likes on those takes in the sample).

**Open lane:** the shadcn-native layer — registry components that each solve one hard behaviour, shipped with the skill that teaches agents to use them, plus Figma × agent workflows that use checks instead of prompts.

## Differentiation
**Key differentiators:**
- Every component has one non-obvious, explainable trick (badge that cuts a real transparent hole with `shape()`, CSS-only marquee that holds still while items fit, chat-style reverse infinite scroll with no scroll JS, inset separator via anchor positioning).
- Accessibility is designed in and stated (one progressbar announced, WCAG 2.5.8 hit area, `inert` clones).
- Skills that encode a method, not taste adjectives (design-to-shadcn: sampled pixels → OKLCH tokens → variants, never overrides).
- Production proof: Yoojo's design system (Simplr) since 2018, a Figma linter with 42 rules used by designers and agents, frontend-patterns used daily.
- Three award-winning portfolios (CSSDA WOTD 2018 and 2024, Awwwards HM 2024); current site at Lighthouse 100 × 4 and served as Markdown to agents.
**How we do it differently:** Checks over prompts; variants over overrides; ship the installable thing, then explain the detail.
**Why that's better:** People get something that works today and learn why it works.
**Why people follow:** Each post is worth bookmarking.

## Objections
| Objection | Response |
|-----------|----------|
| "Another AI skill, more slop" | Lead with a visible before/after and a number; show the check that enforces it. |
| "Who is this guy? 26 followers" | Let the work speak: pinned demo, awards, production use at Yoojo, live site scores. |
| "Just a copy of the big craft accounts" | Credit sources openly; own the shadcn-native + Figma-checks lane they don't cover. |

**Anti-persona:** Engagement farmers, crypto/gambling audiences, people looking for "10 AI tools" lists, indie-hacker growth-tactics crowd (that's Kwern's audience, not this account's).

## Switching Dynamics
**Push:** Generic AI UI, libraries that need overrides, prompt rules agents ignore.
**Pull:** Installable components with a real trick, skills with proof, precise tips with code.
**Habit:** Already follow the big craft accounts; default shadcn is "good enough".
**Anxiety:** Unknown author, maintenance of a small registry, AI-skill fatigue.

## Customer Language
**How they describe the problem:**
- "AI slop" / "it all looks the same"
- "make it feel native" / "feel right"
- "my agent ignores the design system"
**How they describe us:** Not enough data yet. Collect verbatim replies and quote-posts here.
**Words to use:** detail, feel, behaviour, install, variant, token, check, before/after, ships, a11y.
**Words to avoid:** "game-changer", "revolutionary", "10x", "UI is solved", "Figma is dead", "free gold", hype emoji chains; "Airbnb icons" (brand imitation).
**Glossary:**
| Term | Meaning |
|------|---------|
| Registry | Alexandre's shadcn registry at alexandrejoly.me/r/ |
| Skill | An agent skill (Claude Code / skills.sh) |
| design-to-shadcn | Skill that skins shadcn primitives from any site or screenshot |
| Simplr | Yoojo's design system, created by Alexandre |
| simplr-lint | Figma linter (42 rules) for designers and agents |
| Yoojo | Employer (formerly Youpijob); OK to name, internals stay private |

## Brand Voice
| Attribute | Means | Doesn't mean | Example line |
|-----------|-------|--------------|--------------|
| Precise | Exact values, real numbers, named CSS features | Jargon walls | "Home HTML went from 100 KB to 38.6 KB." |
| Honest | Shows failures and limits | Self-deprecation as a bit | "My first reaction was 'why would they even put a rate limit, it's stupid'." / footer: Lighthouse "may vary" |
| Craft-first | The detail is the hero | Aesthetic for its own sake | "I care about the details that make them feel right." |
| Plain | Short sentences, no hype, few emoji | Cold or corporate | "I design and build interfaces end to end." |
| Generous | Credit others, give the code | Humble-brag | Credit, by handle, the authors and tool makers whose ideas you build on |

**Tone by context:**
- Support: answer the question first, with the fix or the line of code.
- Launch: "New component:" / "New skill:" + what it does in one line + video; install line in the first reply.
- Errors: own it, say what changed.
- Sales (later): time-boxed window, clear terms, no fake scarcity.
- Social: English, first person singular, 1–3 sentences + media, links in a self-reply.
**Terms we own:** "variant, not override", "checks, not prompts", "holds still while it fits".
**Never use (and why):** Revenue claims without proof (reads as fake), "UI is solved" (dies and invites dunks), promoting retired skills (for-sure, agent-browser-chrome: removed 2026-10-20).

## Proof Points
**Metrics:**
- alexandrejoly.me: rebuilt in 5 days (153 commits), Lighthouse mobile 100 × 4, Is Agentic 100, home HTML 100 KB → 38.6 KB.
- react-easy-modals: 7,360 npm downloads lifetime, 258 last month, used in production at Yoojo.
- Figma work: 42 lint rules in 6 families; instructions 8 KB → 3.3 KB; a call budget cut a variant from hundreds of calls to 8.
- Icon generation: ~$0.09 per icon, 4–9 px drift with one call per icon vs 10–38 px multi-icon.
- Kwern: 2,936 commits since 2026-08-27; Gymup: 1,269 commits, iOS 1.3.1, open MCP server.
**Customers:** Yoojo (employer, since 2018).
**Testimonials:** None yet.
**Value themes:**
| Theme | Proof |
|-------|-------|
| Craft | Awards 2018/2024, component tricks, site scores |
| Agents that respect design | design-to-shadcn, figma-design + simplr-lint, frontend-patterns |
| Ships | 3 products + registry + skills in 2026 |

## Goals
**Business goal:** Reputation and opportunities as a design engineer; build the audience for a paid product later.
**Conversion action:** Follow @AlexDmzz → visit alexandrejoly.me → install a component or skill.
**Current metrics (2026-10-23, X API):** 26 followers, 302 following, 72 tweets, no pinned post. Best original: react-easy-modals registry post (238 impressions, 4 likes).

## Learnings
*Decisions and tested lessons. Newest first. Keep it to about 20 active entries.*
| Date | Learning | Evidence | Applies to | Status |
|------|----------|----------|------------|--------|
| 2026-10-23 | Positioning is craft (design + front-end) + AI, described as "design engineer" (design + production front-end), with the official title "Front End Developer & UI/UX Designer" kept on LinkedIn Experience; Kwern/Gymup stay ≤ 20% of posts as proof. | User decision; official title checked on LinkedIn. | social, copywriting | active |
| 2026-10-23 | Post in English. | User decision; French design engineers with reach post in English. | all | active |
| 2026-10-23 | Yoojo may be named; colleague names, file keys, back office, payment, unreleased screens stay private. | User decision + inventory. | all | active |
| 2026-10-23 | Track the monthly median likes of originals, not the best post; jokes and hobby posts spike without moving it. | Full histories: shadcn median 20 → 75 → 236 after artifacts; his 1.1k-like joke left the next month flat. | social, analytics | active |
| 2026-10-23 | Built artifacts that borrow a famous subject (credited recreations, A-vs-B detail videos) grow the account; replies under big accounts did not, for any of them. | Full histories of 5 accounts: ~1 reply/month before the breakout; first hits were recreations of famous product UI; one account's best post was a tip video a month before its first skill; reply targets were peers (median 7.5k followers). | social | active |
| 2026-10-23 | Expect months of flat medians before the jump. | 9 months to a first 1k-like post; top hits 4–10 months after tripling cadence; one account flat for 3.5 years. | social | active |
| 2026-10-23 | "New skill: /x" + video is the strongest 2026 format in this niche; bare `npx skills add` posts die. | Top account in the niche: skill posts median 3,466 likes vs 1,180 account median; bare install posts 0–17 likes. | social | active |
| 2026-10-23 | One behaviour per short video, install line in the first reply, not the hook. | Menu↔Drawer demo 2,448 likes vs same author's install-led posts 128–175. | social | active |
| 2026-10-23 | Promo posts and reposted promos flop; sell in replies or time-boxed windows. | Course sales posts 11–17 likes on a 111k account; a registry promo reposted ×9 at 0–7 likes. | social | active |
| 2026-10-23 | Off-thesis replies (App Store/Apple Ads) dilute the account. | Last 10 replies from @AlexDmzz, 0–2 likes. | social | watch |

## Changelog
*Newest first. One line per revision: what changed and why.*
- v1 (2026-10-23) — Initial context: personal brand on X, built from an X audit of design-engineering and AI-skill accounts (recent posts and full breakout histories) and the inventory of Alexandre's work.
