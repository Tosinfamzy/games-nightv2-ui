/**
 * A gentle nudge shown when the page is open inside a social app's in-app
 * browser (Instagram / Facebook / etc.). Those webviews block file downloads
 * (so "Add to calendar" .ics won't work) and have flaky storage, so opening in
 * the real browser gives a better experience. Detection is best-effort UA
 * sniffing — if we're unsure, we show nothing.
 */
function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  // Instagram, Facebook (FBAN/FBAV), Messenger, Line, TikTok, Snapchat, WeChat.
  return /(Instagram|FBAN|FBAV|FB_IAB|Messenger|Line\/|TikTok|Snapchat|MicroMessenger)/i.test(
    ua,
  )
}

export function OpenInBrowserHint() {
  if (!isInAppBrowser()) return null
  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
      👋 You're in an in-app browser. For the best experience — and to add this
      to your calendar — tap the <span className="font-semibold">•••</span> menu
      and choose <span className="font-semibold">Open in browser</span>.
    </div>
  )
}
