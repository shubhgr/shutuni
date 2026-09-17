<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Figma-first UI implementation rules

Apply these rules to every page, section, and responsive UI change in this project:

### VerdictEd design sources

- Desktop: https://www.figma.com/design/aeRwrryVZ2NbSHHm211gnW/VerdictEd-Project?node-id=744-280&t=dRVJ31XI2IL6gQcv-1
- Mobile: https://www.figma.com/design/aeRwrryVZ2NbSHHm211gnW/VerdictEd-Project?node-id=818-225&t=dRVJ31XI2IL6gQcv-1

- Inspect the exact current Figma node with `get_design_context` before editing code. Do not rely on an earlier node ID after the design has changed.
- Treat the latest Figma layer hierarchy as the structural source of truth. Reproduce its container nesting with normal flex/grid layout instead of unnecessary absolute positioning.
- Record and implement the section dimensions, content max-width, padding, margins, gaps, alignment, overflow/clipping, and image orientation before styling details.
- Match every typography change, including font family, weight, size, line-height, letter-spacing, wrapping, alignment, and inline color changes.
- Use the exact Figma colors and supplied local assets. Preserve asset aspect ratios unless Figma explicitly defines a crop or stretch, and never duplicate decoration already included in a composite image.
- Keep image sizing responsive between the desktop and mobile Figma frames. Desktop artwork should stop growing at its Figma maximum, while intermediate/tablet widths should transition smoothly without pushing content outside its padded container.
- Keep editable text as HTML text layered over its visual asset when it is a separate Figma text layer. Do not replace editable text and its background with one flattened image.
- Preserve all existing backend logic, APIs, routes, links, and application behavior during UI work.
- After each section change, verify the rendered page at the relevant Figma viewport sizes, compare visible spacing and crops, and check the browser console for errors before handoff.
