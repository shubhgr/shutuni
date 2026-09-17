# Design QA — Truth / Why It Matters Section

- Source visual truth: Figma file `aeRwrryVZ2NbSHHm211gnW`, node `961:78` inside desktop frame `744:280`; user reference screenshot `/var/folders/3g/80s08kz940n0sj4lg5ssgknc0000gn/T/TemporaryItems/NSIRD_screencaptureui_PFUJdr/Screenshot 2026-09-15 at 5.12.59 PM.png`
- Implementation: `http://localhost:3000/#why`
- Verification viewport: 1574 × 976 CSS px, device scale factor 1
- Source dimensions: Figma node 1440 × 964 CSS px; reference screenshot 1027 × 672 px
- State: desktop homepage, truth section aligned to its top edge
- Browser evidence: in-app Browser capture after hot reload; console errors checked (none)

## Full-view comparison

The implementation follows the Figma hierarchy: one 964px section, one 50/50 vertical background split, one centered horizontal inner container, a clipped typewriter slot, and one vertically spaced copy column. The split, image bridge, headline wrapping, and shared copy alignment match the source composition.

## Focused region comparison

- Typography: Stack Sans project font, 64px bold headings, 16px body copy, source line heights and tracking retained.
- Spacing: 96px left / 120px right / 120px vertical section padding; 108px column gap; 334px copy-group gap; 32px heading-to-body gaps.
- Colors: section-local `#ff5a1f`, `#242628`, `#f5e7d0`, and white match the Figma values.
- Image: supplied typewriter artwork is rendered inside the Figma-defined 498 × 839px clipped slot with the 135.37% horizontal crop and source shadow.
- Copy: punctuation and wording match the selected Figma node.

## Comparison history

1. Earlier implementation used separate grid bands, manual absolute positioning, and an undersized image. Replaced with the Figma auto-layout-equivalent container hierarchy.
2. First simplified pass revealed that the Figma image slot intentionally crops a 135.37%-wide source. Applied the exact clipping geometry and section-local colors.
3. Post-fix browser capture confirms the intended image bridge, equal band split, spacing, wrapping, and alignment. No P0, P1, or P2 differences remain.

## Findings

No actionable P0/P1/P2 visual mismatches remain for the desktop target.

## Implementation checklist

- [x] Figma container hierarchy reproduced
- [x] Desktop max-width and padding constraints reproduced
- [x] Typewriter image crop and shadow reproduced
- [x] Typography, copy spacing, and color split reproduced
- [x] Browser console checked for errors

final result: passed

---

## Footer verification

- Source visual truth: Figma node `929:363`; user reference screenshot `/var/folders/3g/80s08kz940n0sj4lg5ssgknc0000gn/T/TemporaryItems/NSIRD_screencaptureui_HX4wiB/Screenshot 2026-09-15 at 6.01.52 PM.png`
- Implementation: homepage `.verdict-footer`
- Geometry: 627.182px section, 120px top/side padding, centered 1200px inner stack, and 64px gap before the 1200×290px wordmark.
- Typography: 64px/1.2 bold heading with white and `#ff5a1f` lines; 16px/24px semibold navigation; 14px/20px muted copyright.
- Layout: 549px heading column, 345px wrapping navigation, 360px metadata column, 32px navigation-to-copyright gap.
- Asset fidelity: supplied `Vector.svg` is used directly as the lower wordmark.
- Responsive behavior: the 1200px inner frame and wordmark shrink within the section padding below the desktop maximum.
- Browser verification: rendered footer inspected at the active local desktop viewport; no console errors.
- Findings: no actionable P0/P1/P2 desktop mismatches remain.

final result: passed

---

## Go public section verification

- Source visual truth: Figma node `964:141`; user reference screenshot `/var/folders/3g/80s08kz940n0sj4lg5ssgknc0000gn/T/TemporaryItems/NSIRD_screencaptureui_a7FOXk/Screenshot 2026-09-15 at 5.46.42 PM.png`
- Implementation: homepage `.verdict-public`
- Desktop geometry: 819.882px section; 60px top, 120px side/bottom padding; centered 1440px maximum container; 390px copy column; artwork capped at 809×640px.
- Responsive behavior: artwork flexes below the 1440px reference width without moving the copy outside its padded container.
- Typography and colors: 48px medium cream lead line, 64px bold white emphasis, 16px white body, 32px content gaps, `#232527` background, and `#ff5a1f` CTA.
- Asset fidelity: supplied `section-3-tablet.png` composite is used directly with proportional containment; separate desktop decoration is not duplicated.
- Browser verification: desktop section inspected at the active local viewport; no console errors.
- Findings: no actionable P0/P1/P2 desktop mismatches remain.

final result: passed

---

## CTA banner verification

- Source visual truth: Figma node `963:115`; user reference screenshot `/var/folders/3g/80s08kz940n0sj4lg5ssgknc0000gn/T/TemporaryItems/NSIRD_screencaptureui_9VQIhl/Screenshot 2026-09-15 at 5.24.52 PM.png`
- Implementation: homepage `.verdict-cta`
- Desktop source frame: 1440 × 830 CSS px
- Structure: 120px vertical section padding; centered 1440px row; 25px column gaps; 292×268px left megaphone; 824×590px CTA stack; 280×268px right megaphone.
- Paper treatment: standalone torn-paper image inside an 824×478px clipped frame. Headline and highlighted `Verdict?` are live HTML text, not baked into the asset.
- CTA spacing: 12px headline-line gap, 72px paper-to-button gap, 188.781×40px button.
- Asset fidelity: supplied `image 44183.png` is used on both sides; the left instance is mirrored.
- Browser verification: rendered desktop section inspected after hot reload; console errors checked (none).
- Findings: no actionable P0/P1/P2 desktop mismatches remain.

final result: passed
