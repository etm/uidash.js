/*
  This file is part of UIDASH.JS.

  UIDASH.JS is free software: you can redistribute it and/or modify it under the terms
  of the GNU Lesser General Public License as published by the Free Software Foundation,
  either version 3 of the License, or (at your option) any later version.

  UIDASH.JS is distributed in the hope that it will be useful, but WITHOUT ANY
  WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
  PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License along with
  UIDASH.JS. If not, see <http://www.gnu.org/licenses/>.
*/

// side of the bubble that holds the arrow, then where along that side.
// tried in this order, the first one that fits into the window wins.
const uidash_dialogue_positions = [
  'left-top', 'left-middle', 'left-bottom',
  'right-top', 'right-middle', 'right-bottom',
  'top-left', 'top-middle', 'top-right',
  'bottom-left', 'bottom-middle', 'bottom-right'
];

function uidash_dialogue_place(dlg, target) { // {{{
  const style = getComputedStyle(dlg[0]);
  const em = parseFloat(style.fontSize);
  const arrow = parseFloat(style.getPropertyValue('--x-ui-dialogue-arrow')) * em;
  const inset = parseFloat(style.getPropertyValue('--x-ui-dialogue-inset')) * em; // arrow tip to the corner

  // getBoundingClientRect also works for svg targets
  const r = target[0].getBoundingClientRect();
  const t = { left: r.left + window.scrollX, top: r.top + window.scrollY, width: r.width, height: r.height };
  const cx = t.left + t.width / 2, cy = t.top + t.height / 2;
  const vl = window.scrollX, vt = window.scrollY;
  const vr = vl + document.documentElement.clientWidth, vb = vt + document.documentElement.clientHeight;

  // size as the css wants it, without the restriction of an earlier placement
  dlg.css({ 'max-width': '', 'max-height': '' });
  const w = dlg.outerWidth(), h = dlg.outerHeight();

  // the bubble can't get smaller than its min-width/min-height
  const minw = parseFloat(style.minWidth) || 0, minh = parseFloat(style.minHeight) || 0;

  // where the arrow points: the middle of the target, or, if the bubble would leave
  // the window that way, as far from the middle as needed, but still at the target
  const anchor = (align, c, lo, hi, start, end) => {
    if ((align == 'top' || align == 'left') && c - inset < lo) { return lo + inset <= end ? lo + inset : null; }
    if ((align == 'bottom' || align == 'right') && c + inset > hi) { return hi - inset >= start ? hi - inset : null; }
    return c;
  };
  // room along the side with the arrow, depending on where the arrow sits
  const space = (align, a, lo, hi) => {
    if (a === null) { return 0; }
    if (align == 'top' || align == 'left') { return hi - (a - inset); }
    if (align == 'middle') { return 2 * Math.min(a - lo, hi - a); }
    return a + inset - lo;
  };
  const along = (align, a, size) => {
    if (align == 'top' || align == 'left') { return a - inset; }
    if (align == 'middle') { return a - size / 2; }
    return a - size + inset;
  };

  // the first position that fits wins. If none fits, the one that keeps most
  // of the bubble, which then gets smaller (and its contents scroll).
  let best;
  for (const pos of uidash_dialogue_positions) {
    const [side, align] = pos.split('-');
    let rw, rh, a;
    if (side == 'left' || side == 'right') {
      a = anchor(align, cy, vt, vb, t.top, t.top + t.height);
      rh = space(align, a, vt, vb);
      rw = side == 'left' ? vr - (t.left + t.width + arrow) : t.left - arrow - vl;
    } else {
      a = anchor(align, cx, vl, vr, t.left, t.left + t.width);
      rw = space(align, a, vl, vr);
      rh = side == 'top' ? vb - (t.top + t.height + arrow) : t.top - arrow - vt;
    }
    rw = Math.max(0, rw);
    rh = Math.max(0, rh);
    // less room than the smallest bubble: unusable
    const kept = rw < minw || rh < minh ? 0 : Math.min(w, rw) * Math.min(h, rh);
    // ties (up to rounding) keep the earlier position
    if (!best || kept > best.kept + 0.5) { best = { pos: pos, a: a === null ? (side == 'left' || side == 'right' ? cy : cx) : a, rw: rw, rh: rh, kept: kept }; }
    if (rw >= w && rh >= h) { break; }
  }
  if (best.rw < w || best.rh < h) {
    // a narrower bubble gets higher, so restrict both
    dlg.css({ 'max-width': Math.min(w, best.rw), 'max-height': best.rh });
  }

  const [side, align] = best.pos.split('-');
  const fw = dlg.outerWidth(), fh = dlg.outerHeight();
  let left, top;
  if (side == 'left')   { left = t.left + t.width + arrow; top = along(align, best.a, fh); }
  if (side == 'right')  { left = t.left - arrow - fw;      top = along(align, best.a, fh); }
  if (side == 'top')    { top = t.top + t.height + arrow;  left = along(align, best.a, fw); }
  if (side == 'bottom') { top = t.top - arrow - fh;        left = along(align, best.a, fw); }
  dlg.attr('data-position', best.pos);
  dlg.offset({ left: left, top: top });
} // }}}

function uidash_dialogue_replace(dlg) { // {{{
  const target = $(dlg).data('uidash-target');
  if ($(dlg).hasClass('open') && target) { uidash_dialogue_place($(dlg), $(target)); }
} // }}}

// reposition open dialogues when their contents change their size, or the window does
const uidash_dialogue_observer = typeof ResizeObserver == 'undefined' ? null : new ResizeObserver(function(entries) {
  entries.forEach(function(e) { uidash_dialogue_replace(e.target); });
});
$(window).on('resize', function() {
  $('ui-dialogue.open').each(function() { uidash_dialogue_replace(this); });
});

function uidash_dialogue_close(dlg) { // {{{
  // tells the dialogue, by its button, the close button or a click outside
  if (!$(dlg).hasClass('open')) { return; }
  $(dlg).removeClass('open').removeData('uidash-target');
  if (uidash_dialogue_observer) { uidash_dialogue_observer.unobserve($(dlg)[0]); }
  $(dlg)[0].dispatchEvent(new CustomEvent("uidash:dialogue_close", {"bubbles":true, "cancelable":false}));
} // }}}

function uidash_dialogue(dlg, target) { // {{{
  dlg = $(dlg).first();
  target = $(target).first();
  // the contents get their own element, so they can scroll below the close button
  if (dlg.children('ui-dialogue-content').length == 0) {
    // not .not('ui-close'), that also drops the text nodes
    dlg.contents().filter(function() { return this.nodeName != 'UI-CLOSE'; }).wrapAll('<ui-dialogue-content></ui-dialogue-content>');
    if (dlg.children('ui-dialogue-content').length == 0) {
      dlg.prepend($('<ui-dialogue-content></ui-dialogue-content>'));
    }
  }
  if (dlg.children('ui-close').length == 0) {
    dlg.append($('<ui-close><i class="uidash-icon-delete"></i></ui-close>'));
  }
  dlg.data('uidash-target', target[0]);
  dlg.addClass('open');
  uidash_dialogue_place(dlg, target);
  if (uidash_dialogue_observer) { uidash_dialogue_observer.observe(dlg[0]); }
} // }}}

// delegated to document, so no need to wait for ready
$(document).on('click', 'ui-dialogue > ui-close', function() { uidash_dialogue_close($(this).parent()); });
// close when clicking outside, but not when clicking the target again
$(document).on('mousedown', function(e) {
  $('ui-dialogue.open').each(function() {
    const target = $(this).data('uidash-target');
    if (this.contains(e.target) || (target && target.contains(e.target))) { return; }
    uidash_dialogue_close(this);
  });
});
