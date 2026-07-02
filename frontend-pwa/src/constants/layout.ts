export const TAB_BAR_CONTENT_HEIGHT = 56;
export const TAB_HEADER_CONTENT_HEIGHT = 124;
export const CONTENT_SHEET_TOP_PADDING = 16;
export const MESSAGE_COMPOSER_ESTIMATED_HEIGHT = 80;

/** Bottom inset for content above the tab bar + home indicator. */
export function tabBarInset(extraPx = 0): string {
  return `calc(${TAB_BAR_CONTENT_HEIGHT}px + env(safe-area-inset-bottom, 0px) + ${extraPx}px)`;
}

/** Bottom inset for scroll content above a fixed message composer + tab bar. */
export function messageComposerScrollInset(extraPx = 0): string {
  return `calc(${TAB_BAR_CONTENT_HEIGHT}px + ${MESSAGE_COMPOSER_ESTIMATED_HEIGHT}px + env(safe-area-inset-bottom, 0px) + ${extraPx}px)`;
}
