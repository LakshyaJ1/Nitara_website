// Dev-only Agentation toolbar for the plain-HTML Nitara site.
// Loaded by main.js on local previews (incl. forwarded ports); never shipped to production (site/dev is in .vercelignore).
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Agentation } from 'agentation';

const host = document.createElement('div');
host.id = 'agentation-root';
document.body.appendChild(host);
createRoot(host).render(<Agentation endpoint={location.origin + "/__agentation"} />);
