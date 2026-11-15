---
name: AstroSim
description: Junior Astronaut Mission Trainer, a bright jet-age ticket wallet for a Moon-base rehearsal game.
colors:
  sky-stock: "#dcebff"
  coupon-white: "#ffffff"
  mission-navy: "#14245c"
  rocket-red: "#cc2a1f"
  rocket-red-deep: "#a9211a"
  carbon-violet: "#5b3fd9"
  carbon-wash: "#eee9ff"
  sunny-yellow: "#ffc233"
  surface-elevated: "#f2f6ff"
  surface-highlight: "#e4ecff"
  text-muted: "#45557f"
  text-faint: "#6b7899"
  border-soft: "#c3d2f0"
  perforation-blue: "#9fb3dd"
  success: "#127a3e"
  success-bg: "#ddf5e6"
  warning: "#8a5a00"
  warning-bg: "#fff1cc"
  danger: "#b4231a"
  danger-bg: "#ffe3e0"
  viz-blue: "#2a78d6"
  viz-orange: "#eb6834"
  viz-green: "#1baf7a"
  viz-amber: "#eda100"
  viz-pink: "#e87ba4"
  viz-indigo: "#6250d6"
  viz-neutral: "#8a97b8"
  viz-grid: "#dfe7f7"
typography:
  display:
    fontFamily: "Bahnschrift, 'DIN Alternate', 'DIN Condensed', 'Avenir Next Condensed', 'Roboto Condensed', 'Arial Narrow', system-ui, sans-serif"
    fontSize: "clamp(4.5rem, 12vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Bahnschrift, 'DIN Alternate', 'DIN Condensed', 'Avenir Next Condensed', 'Roboto Condensed', 'Arial Narrow', system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 4.2vw, 2.4rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Bahnschrift, 'DIN Alternate', 'DIN Condensed', 'Avenir Next Condensed', 'Roboto Condensed', 'Arial Narrow', system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  number:
    fontFamily: "Bahnschrift, 'DIN Alternate', 'DIN Condensed', 'Avenir Next Condensed', 'Roboto Condensed', 'Arial Narrow', system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
    fontFeature: "tnum"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  body-small:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sm: "8px"
  md: "12px"
  lg: "18px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  tap: "44px"
components:
  button-primary:
    backgroundColor: "{colors.rocket-red}"
    textColor: "{colors.coupon-white}"
    typography: "{typography.body-small}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.rocket-red-deep}"
  button-outline:
    backgroundColor: "{colors.coupon-white}"
    textColor: "{colors.mission-navy}"
    typography: "{typography.body-small}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.surface-highlight}"
  button-disabled:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-faint}"
  input:
    backgroundColor: "{colors.coupon-white}"
    textColor: "{colors.mission-navy}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "44px"
  choice-card:
    backgroundColor: "{colors.coupon-white}"
    textColor: "{colors.mission-navy}"
    rounded: "{rounded.md}"
    padding: "12px"
  choice-card-selected:
    backgroundColor: "{colors.carbon-wash}"
  coupon:
    backgroundColor: "{colors.coupon-white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  coupon-strip:
    backgroundColor: "{colors.mission-navy}"
    textColor: "{colors.coupon-white}"
    padding: "12px 24px"
  step-stub:
    backgroundColor: "{colors.coupon-white}"
    textColor: "{colors.mission-navy}"
    typography: "{typography.label}"
    padding: "8px 10px"
    height: "56px"
  step-stub-current:
    backgroundColor: "{colors.mission-navy}"
    textColor: "{colors.coupon-white}"
  done-stamp:
    backgroundColor: "{colors.sunny-yellow}"
    textColor: "{colors.mission-navy}"
    rounded: "{rounded.pill}"
    padding: "2px 7px"
  stat-tile:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.carbon-violet}"
    typography: "{typography.number}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  why-button:
    backgroundColor: "{colors.coupon-white}"
    textColor: "{colors.carbon-violet}"
    rounded: "{rounded.pill}"
    size: "26px"
---

# Design System: AstroSim

## Overview

**Creative North Star: "The Jet-Age Ticket Wallet"**

The whole mission is a wallet of travel coupons laid on sky-blue stock. Each step of the loop (Briefing, Build, Rules, Test, Review) is one white coupon with a navy header strip, a perforated tear line and punched notches at its edges. Above the coupon, an Earth-to-Moon route arc carries a small rocket to the current stop, and a row of coupon stubs names every step, finished ones stamped with a round yellow "Done!". Review reads like a boarding pass: one giant violet number, ruled fields, and a dashed tear-off stub that holds the rating stamp.

The mood is bright, playful and confident, built for kids on a phone or a classroom projector. Density is moderate: one coupon per screen, ruled sections inside it instead of nested cards, generous 44px controls. Colour is assigned by job, not decoration: navy carries structure and text, rocket red is the one forward action, carbon violet marks every number the player should read, sunny yellow is reserved for stamps and selection.

The world explicitly refuses the dark mission-control dashboard and the generic white edu-app card stack. Depth is soft paper lift, never glow or neon.

**Key Characteristics:**
- Sky-blue stock ground with white coupons; navy header strip on every step coupon.
- Perforation as the structural divider: dashed tear lines, punched half-circle notches, dashed tear-off stubs.
- Condensed grotesk display with tabular numerals for every number; system sans body.
- One rocket-red primary action per view, living in the sticky footer pager.
- Two motions only: the rocket glide along the route arc, and the stamp press.

## Colors

A saturated primary-school palette on cool paper: navy structure, one red action, violet numbers, yellow stamps.

### Primary
- **Rocket Red** (`rocket-red`): the single primary action per view (the footer "Next" button, "Change my base"), and the flown portion of the route arc with its passed stops. Hover deepens to **Rocket Red Deep**. Darkened from the direction's #E23A2E so white button text passes 4.5:1.

### Secondary
- **Carbon Violet** (`carbon-violet`): every big number (stat tiles, the Review pass number, step numbers on stubs, Briefing step counters, the mass meter fill), links, the focus ring, the "Why this number?" mark, and the selected state of choice cards (with **Carbon Wash** behind it). Also the caret and native accent colour.

### Tertiary
- **Sunny Yellow** (`sunny-yellow`): the round "Done!" stamps, the "Step n of 5" label on the navy strip, the current stub's number, and text selection. Never a fill for large areas.

### Neutral
- **Sky Stock** (`sky-stock`): the page ground the wallet lies on; also fills the punched notches so they read as holes.
- **Coupon White** (`coupon-white`): coupons, stubs, outlined buttons, inputs.
- **Mission Navy** (`mission-navy`): all main text, coupon strips, the current stub, outlined button borders, the boarding-pass border and tear line.
- **Surface Elevated / Surface Highlight**: stat tiles, disabled controls, hover fills, ruled-section dividers inside a coupon.
- **Text Muted / Text Faint**: helper copy and disabled text.
- **Border Soft** (`border-soft`): input borders, perforated tear line under the strip, footer top rule.
- **Perforation Blue** (`perforation-blue`): the dashed unflown route arc, unflown stops, dashed locked stubs, input hover border, scrollbar thumb.

### Status
- **Success / Warning / Danger** with their pale backgrounds: the rating stamp ("Flight ready" green, "Needs more work" amber), notices, the lock reason in the footer (warning text), mission-lost lines. Always paired with an icon or words.

### Data visualisation
Chart colours are the light-surface steps of the validated dataviz palette: **Viz Blue** for the calm series and resource lines, **Viz Orange** for storms, then green, amber, pink and indigo for further failure causes, **Viz Neutral** for inactive marks and **Viz Grid** for gridlines. Dark windows and storm periods draw as translucent bands (navy at 8%, orange at 18%); the dose limit is a dashed **Danger** line.

### Named Rules
**The One Red Rule.** Rocket red marks exactly one forward action per view. Secondary actions are white with a navy outline.

**The Violet Number Rule.** A number the player is meant to read and compare is set in the condensed display face, tabular, in carbon violet.

**The Stamp Yellow Rule.** Sunny yellow means "done" or "you are here". It is never a background for content.

## Typography

**Display Font:** installed condensed grotesk stack (Bahnschrift, DIN Alternate, DIN Condensed, Avenir Next Condensed, Roboto Condensed, Arial Narrow), with `font-stretch: condensed`.
**Body Font:** system sans (system-ui, Segoe UI, Roboto, Helvetica Neue).
**Label/Mono Font:** ui-monospace stack, used only for technical values in How it works.

**Character:** a jet-age signage condensed face for titles, strips and numbers, against a friendly neutral system body that keeps grade 3 to 5 copy easy to read. The display stack is provisional: remote fonts are banned and font licences are a human decision, so self-hosting an OFL condensed grotesk is an open decision.

### Hierarchy
- **Display** (700, clamp(4.5rem, 12vw, 6rem), 0.9, tabular): the Review boarding-pass hero number only.
- **Headline** (700, clamp(1.7rem, 4.2vw, 2.4rem), 1.12): the step title at the top of each coupon.
- **Title** (700, 1.3rem, 1.12): section titles inside a coupon; pass fields at 1.35rem.
- **Number** (700, 2rem, 1.1, tabular, violet): stat tiles; steppers use the same face at 1.3rem in navy.
- **Body** (400, 1.0625rem, 1.55): running copy; Briefing lead at 1.15rem, max 62ch; explanatory blocks capped near 70ch.
- **Body small** (600, 0.9375rem): buttons, inputs, tile labels, footer lock reason.
- **Label** (700, 0.8125rem): stub labels, badges, pass field names, legends. Sentence case, no tracking.

### Named Rules
**The Tabular Rule.** Every number that can change uses tabular numerals so values never shift layout.

**The Sentence Case Rule.** Labels, tabs and buttons are sentence case. No uppercase tracking labels.

## Layout

A single centred column, max 1120px with a 16px gutter. Top to bottom: header (brand left; Learn, How it works and the real-data badge right), the route arc (an SVG quadratic curve, 1000 wide on desktop, redrawn on a 560-wide canvas under 560px), a five-column stub row, the current step's coupon, and a sticky footer pager (Back outlined left, lock reason centred, rocket-red Next right) on a 96% white bar.

Inside a coupon, content uses a two-column grid (24px gap) that collapses to one column at 768px. Sections inside a coupon are ruled with a 2px pale rule, never boxed. Spacing follows a 4px base: 4, 8, 12, 16, 24, 32, 48. Every control is at least 44px tall.

Breakpoints observed: 768px (single column, coupon padding 16px), 720px (boarding pass stacks, storm grid single column), 560px (compact arc, Done stamp shrinks to a corner check, header tabs tighten), 480px (arc labels hide, Next button stretches), 420px (lock reason moves above the footer buttons).

## Elevation & Depth

Soft paper lift with navy-tinted ambient shadows; nothing glows and nothing has a hard offset. The coupon is the only strongly lifted surface; stubs and badges sit just off the ground; the current stub lifts 3px. Inside a coupon everything is flat.

### Shadow Vocabulary
- **Paper rest** (`box-shadow: 0 1px 2px rgba(20, 36, 92, 0.1)`): stubs, Done stamps, the real-data badge.
- **Lift** (`box-shadow: 0 8px 18px -10px rgba(20, 36, 92, 0.35)`): the primary button and the current stub.
- **Coupon** (`box-shadow: 0 14px 30px -18px rgba(20, 36, 92, 0.45)`): the step coupon.
- **Footer** (`box-shadow: 0 -10px 24px -18px rgba(20, 36, 92, 0.5)`): the sticky pager, lifting upward.

### Named Rules
**The No Cards In Coupons Rule.** A coupon holds ruled sections, not nested cards; panel cards inside a coupon lose their border, radius and shadow and become a top rule.

## Shapes

Gently rounded paper: 8px for inputs, 12px for buttons, tiles and choice cards, 18px for coupons and the boarding pass, full pills for badges, stamps and the "?" mark. Borders are 2px everywhere (navy for actions, soft blue for fields). The world's signature geometry is the perforation: a 3px dashed tear line under each coupon strip with 22px punched half-circles at both edges, dashed borders on locked stubs, and a 3px dashed navy tear line separating the boarding pass from its stub. Stamps are rotated (Done -8deg, rating -2deg). Stubs have larger top corners than bottom (12px over 6px), like a torn ticket tab.

## Components

### Buttons
- **Shape:** gently rounded (12px), 2px border, minimum 44px tall, 600 weight body-small text.
- **Primary:** rocket red fill and border, white text, 700 weight, Lift shadow; hover deepens to Rocket Red Deep. At most one per view.
- **Outline (default):** white fill, navy border and text; hover fills Surface Highlight.
- **Press:** translate 1px down and scale 0.98.
- **Disabled:** pale surface, soft border, faint text, not-allowed cursor.
- **Focus:** one 3px carbon-violet outline offset 3px, everywhere.

### Steppers
Two 44px square outline buttons with inline minus and plus icons around a condensed tabular count; a row label and muted help text on the left, rows ruled by a 1px soft border. "+" disables when one more would break the rocket weight limit.

### Choice cards
White, 2px soft border, 12px radius. Selected: carbon-violet border on Carbon Wash with a check. Keyboard focus draws the violet ring around the whole card.

### Inputs / Fields
White, 2px soft border, 8px radius, 44px tall; hover border goes to Perforation Blue; focus uses the global violet ring.

### Navigation
- **Header tabs:** transparent text buttons with inline icons; the current one becomes a white outlined tab.
- **Route arc:** dashed perforation-blue route, solid rocket-red flown part, stops filled red once passed, Earth and Moon-base glyphs at the ends, the rocket oriented along the tangent.
- **Stub row:** five coupon stubs (violet number, bold label). Current stub is navy with a yellow number, lifted 3px. Locked stubs are dashed outlines with no fill. Finished stubs carry the Done stamp.
- **Footer pager:** sticky, Back outlined left, Next rocket-red right, the lock reason in warning text when Next is locked.

### Step Coupon (signature)
White coupon, 18px radius, Coupon shadow. Navy strip with "Step n of 5" in sunny yellow on the left and a coupon code (MB-02) in condensed tabular white on the right. Below the strip, the perforated tear line with punched notches, then the work area at 24px padding (16px on phones).

### Done Stamp (signature)
A sunny-yellow pill with a check and "Done!", navy 800-weight text, rotated -8deg, sitting on the stub's bottom edge; presses in once (0.35s, rotate -20deg and scale 1.6 to rest). On phones it shrinks to a check-only badge at the stub corner.

### Boarding Pass (signature, Review)
A 2px navy-bordered pass, 18px radius: main area with the giant violet number and a condensed headline beside it, a ruled grid of fields (muted label over condensed value), and a Carbon Wash tear-off stub behind a 3px dashed navy line holding the rating stamp (3px current-colour border, rotated -2deg, green when flight ready, amber when it needs work).

### Stat Tiles
Surface Elevated fill, 2px Surface Highlight border, 12px radius; muted label with a "Why this number?" mark, violet condensed value.

### Why This Number?
A 26px violet-outlined circle with a "?" and a 44px invisible hit area; hover fills Carbon Wash. Sits beside every number shown to the player.

### Motion
One glide, one stamp press; nothing else animates on its own. The rocket glides along the arc over 700ms with an expo ease-out when the step changes; stamps press in with `cubic-bezier(0.16, 1, 0.3, 1)`. Reduced motion removes all animation and the rocket jumps to its stop.

## Do's and Don'ts

### Do:
- **Do** put each step's work on one white coupon with a navy strip and the perforated tear line.
- **Do** keep exactly one rocket-red action per view; everything else is navy-outlined white.
- **Do** set every comparable number in the condensed face, tabular, in carbon violet, with a "Why this number?" mark beside it.
- **Do** divide content inside a coupon with 2px pale rules or dashed perforations, not boxes.
- **Do** keep every control at least 44px and use the single 3px violet focus ring.
- **Do** take chart colours from the viz tokens and pair status colour with an icon or words.
- **Do** keep motion to the rocket glide and the stamp press, and honour reduced motion.

### Don't:
- **Don't** build the dark mission-control dashboard or a generic white edu-app card stack.
- **Don't** nest cards inside a coupon.
- **Don't** use sunny yellow as a content background or rocket red for anything but the forward action and the flown route.
- **Don't** use hard offset shadows, glows or neon; depth is soft navy-tinted paper lift.
- **Don't** add uppercase tracked labels or eyebrow text above headings; labels are sentence case.
- **Don't** load remote fonts, images or icon fonts; icons are inline SVG.
