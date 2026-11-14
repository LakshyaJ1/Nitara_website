// Review toolbar (Agentation) for the plain-HTML Nitara site.
// Loaded by main.js on local previews (incl. forwarded ports); never on the live domains.
// Comments go to the Agentation server through serve.py's same-origin /__agentation proxy.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Agentation } from 'agentation';

const host = document.createElement('div');
host.id = 'agentation-root';
document.body.appendChild(host);
createRoot(host).render(<Agentation endpoint={location.origin + '/__agentation'} />);

// The toolbar keeps every comment in this browser (and on the server) across reloads,
// but it always starts closed, and closed means its pins are hidden. If this page still
// has open comments, switch it on after load (same as pressing Ctrl+Shift+F) so they stay visible.
function openComments() {
  try {
    const saved = JSON.parse(localStorage.getItem('feedback-annotations-' + location.pathname) || '[]');
    return saved.filter((a) => a && a.status !== 'resolved' && a.status !== 'dismissed'
      && a.kind !== 'placement' && a.kind !== 'rearrange').length;
  } catch { return 0; }
}
function pressToggle() {
  const init = { key: 'F', code: 'KeyF', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true };
  document.dispatchEvent(new KeyboardEvent('keydown', init));
}
function toolbarIsOpen() {
  const root = document.querySelector('agentation-toolbar')?.shadowRoot;
  return !!root?.querySelector('[aria-label="Feedback controls"]');
}
// wait for the toolbar to mount and for the server sync to settle, then open once
window.setTimeout(() => { if (openComments() > 0 && !toolbarIsOpen()) pressToggle(); }, 1500);
