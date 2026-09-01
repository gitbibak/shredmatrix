// Switches the Google Fonts stylesheet from media="print" (non-blocking) to
// "all" once it has downloaded, so text renders immediately with the fallback
// font and swaps in without delaying first paint.
(function () {
  var link = document.getElementById('google-fonts');
  if (!link) return;
  var activate = function () { link.media = 'all'; };
  if (link.sheet) activate();
  else link.addEventListener('load', activate, { once: true });
  setTimeout(activate, 3000);
})();
