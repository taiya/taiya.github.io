// @ts-check

/**
 * Wire up the hamburger toggle on #menu.
 *
 * The .menu_toggle button is hidden via CSS at desktop widths, so on desktop
 * this module runs but has no visible effect. At viewport widths below 1000px
 * the toggle becomes visible and controls the collapsed `<ol>` via the
 * `.open` class on `#menu`.
 */
function init_menu() {
  const menu = document.getElementById('menu');
  const toggle = /** @type {HTMLButtonElement|null} */ (
    document.querySelector('.menu_toggle')
  );
  if (!menu || !toggle) return;

  function close() {
    if (!menu || !toggle) return;
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function open() {
    if (!menu || !toggle) return;
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (menu.classList.contains('open')) close();
    else open();
  });

  document.addEventListener('click', function(e) {
    if (!menu.classList.contains('open')) return;
    const target = /** @type {Node|null} */ (e.target);
    if (target && menu.contains(target)) return;
    close();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') close();
  });

  menu.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', close);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init_menu);
} else {
  init_menu();
}
