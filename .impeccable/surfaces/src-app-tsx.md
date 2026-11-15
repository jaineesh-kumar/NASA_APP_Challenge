---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/ui/screens","src/ui/components"]
---

# Surface: AstroSim app shell and step flow

Scope: the whole web app (src/App.tsx and every screen). Visitor mode: Operate.
Audience and job: kids 7-12 build a Moon base, set rules, test it 300 times and learn from the review; judges check the science once.
Constraints: PRODUCT.md; no new packages, no remote fonts or images, copy in src/content, engine untouched, 44 px targets, 360 px width, 4.5:1 text contrast, reduced motion.
Chosen direction: Jet-Age Ticket Wallet, translated bright and playful (user choice on the decision page, 2026-11-14; "bright and playful" pinned earlier).
Memorable moment: the rocket gliding along the Earth-to-Moon route arc when a step changes.
Open decisions: illustrated mascots or images (none exist; do not invent).

## Direction contract

THESIS: The mission is a ticket wallet: one coupon per step, Briefing to Review, done coupons stamped, the journey always visible. Refuses the dark mission-control dashboard and the generic white edu-app card stack.

OWN-WORLD: Sky-blue stock ground (#DCEBFF), white coupon cards with notched corners and a perforated tear line, mission navy (#14245C) header strips and text, rocket red (#E23A2E) for the one primary action, carbon violet (#5B3FD9) for every big number, sunny yellow (#FFC233) round "Done!" stamps. Condensed grotesk display (Bahnschrift, DIN or Avenir Next Condensed, Roboto Condensed), system sans body, tabular numerals. Sentence-case tab labels sit on coupon tabs.

STORY: A child sees where they are on the journey, does one step on one coupon, sees what it costs, and moves on with Next; Review reads like a boarding pass: how many crews out of 100 came home and why.

FIRST VIEWPORT: Top: product name left, Learn and How it works tabs right. Below: the route arc from Earth to Moon with five stops and the rocket at the current step, and a stub row naming each step, done ones stamped. Centre: the current step's coupon, navy strip with "Step 2 of 5" and the step title, work area on white. Bottom: sticky bar, Back outlined left, Next rocket-red right, a plain-words reason when Next is locked.

FORM: Jet-Age Ticket Wallet (catalog vernacular-ephemera-jet-age-ticket-wallet), a dealt challenger chosen over the assigned direction (the user's pick, not on my ordered list); seed:94103e863d0b007c. Signature interaction: the rocket glides along the route arc between stops; coupons stamp "Done!" when a step is finished. Motion grammar: one glide, one stamp press; nothing else animates on its own.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
