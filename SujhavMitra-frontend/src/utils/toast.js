/**
 * Dispatches a toast event for global toast handling.
 * @param {string} message - Toast message text
 * @param {'success' | 'error' | 'info' | 'warning'} [variant='info'] - Toast type
 * @param {number} [timeout=2200] - Duration in milliseconds
 */
export function showToast(message, variant = "info", timeout = 2200) {
  try {
    window.dispatchEvent(
      new CustomEvent("app:toast", { detail: { message, variant, timeout } })
    );
  } catch (err) {
    console.error("Toast dispatch failed:", err);
  }
}
