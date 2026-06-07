/**
 * Z-Index Scale
 * ────────────────────────────────────────────────────────────────────────────
 * Centralised semantic layer names. Every z-index in the codebase should
 * pick a value from this scale, never a raw number. The Tailwind utility
 * classes are defined in `src/index.css` under `@layer utilities`.
 *
 * Adding a new layer?
 *   1. Add the name + value here.
 *   2. Add the matching `.z-<name> { z-index: <value>; }` rule in index.css.
 *   3. Use the className, not a raw `z-[N]`.
 *
 * Removing a layer? Grep for the class name first to make sure no consumers
 * are stranded.
 *
 * Stacking rule: lower numbers render below higher numbers. Two layers at the
 * same number are tied — last in the DOM wins, so don't rely on ordering.
 */
export const Z = {
  /** Local content above a background image / decorative element. */
  CONTENT: 'z-content',
  /** Sticky tab/panel headers within a scrolling region. */
  STICKY_PANEL: 'z-sticky-panel',
  /** Secondary sticky header (e.g. the public Portfolio preview header). */
  SECONDARY_HEADER: 'z-secondary-header',
  /** The application's main sticky header. */
  PRIMARY_HEADER: 'z-primary-header',
  /** Dropdowns, popovers, tooltips, top-of-page status banners, mobile nav. */
  DROPDOWN: 'z-dropdown',
  /** Full-screen modal/dialog backdrops. */
  MODAL_BACKDROP: 'z-modal-backdrop',
  /** Modal close button that floats above the backdrop. */
  MODAL_CLOSE: 'z-modal-close',
  /** Mobile drawer panels. */
  DRAWER: 'z-drawer',
  /** Page-transition overlay (one-shot wipe between routes). */
  PAGE_WIPE: 'z-page-wipe',
} as const;

export type ZLayer = (typeof Z)[keyof typeof Z];
