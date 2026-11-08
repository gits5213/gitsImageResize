/* Applies the saved theme before React loads. Keep the key in sync with useTheme.ts. */
;(function () {
  var key = 'gits-image-resize-theme'
  try {
    var stored = localStorage.getItem(key)
    var theme =
      stored === 'dark' || stored === 'light'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
    if (theme === 'dark') document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = theme
  } catch {
    /* Storage or media queries can be unavailable. The app still renders. */
  }
})()
