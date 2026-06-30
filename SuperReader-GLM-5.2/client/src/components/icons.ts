// A simple yellow pencil as inline SVG data URL.
export const PencilIcon =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect x="4" y="20" width="20" height="6" rx="1" transform="rotate(-45 4 20)" fill="#FFD400" stroke="#000" stroke-width="2"/>
  <rect x="2" y="22" width="6" height="6" rx="1" transform="rotate(-45 2 22)" fill="#FFD400" stroke="#000" stroke-width="2"/>
  <polygon points="4,28 9,23 7,21 2,26" fill="#000"/>
</svg>`);
