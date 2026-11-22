import { terrain } from './terrain.mjs';

const line = '#233840';
const red = '#df2427';
const [tipX, tipY] = terrain.trail.at(-1);
const numeral = (value) => Number(value.toFixed(1));
const rule = (x, y) => `<path d="M${x - 8} ${y}h16m-8 -8v16"/>`;

function sheetMarks() {
  return `<g fill="none" stroke="#5d6c66" stroke-width=".7" opacity=".35">
    <path d="M68 149v318h775" stroke-dasharray="1 6"/>${rule(68, 149)}${rule(68, 467)}${rule(843, 467)}
    <path d="M92 467v-5m23 5v-3m23 3v-3m23 3v-5m23 5v-3m23 3v-3m23 3v-5m23 5v-3m23 3v-3m23 3v-5"/>
  </g>`;
}

function hardware() {
  return `<g>
    <path d="M-9 61H934v30H-9z" fill="#2f312c" opacity=".25" filter="url(#soft-shadow)" transform="translate(9 10)"/>
    <rect x="-8" y="24" width="941" height="55" rx="3" fill="#22272a"/>
    <rect x="-8" y="25" width="941" height="46" rx="2" fill="url(#rail-metal)"/>
    <rect x="-8" y="25" width="941" height="46" fill="url(#brushing)" opacity=".7"/>
    <path d="M-6 28H930M-6 67H930" stroke="#e7e9e7" stroke-opacity=".48"/>
    <path d="M-6 42H930v13H-6z" fill="#21292c"/>
    <path d="M-6 46H930v8H-6z" fill="url(#belt)"/>
    <path d="M-6 55H930m-936 15H930" stroke="#343b3d" stroke-width="1.5"/>
    <path d="M0 20h17l5 7v53H0z" fill="#313b3e"/><path d="M3 25h12l3 4v44H3z" fill="url(#rail-metal)"/>
    ${[27, 190, 370, 550, 907].map((x) => `<g transform="translate(${x} 32)"><circle r="3.3" fill="#343838"/><circle r="2.4" fill="#b9bfbc"/><path d="M-1.5 1.2l3 -2.4" stroke="#434a4b" stroke-width=".9"/></g>`).join('')}
    <g transform="translate(${tipX} 0)">
      <path d="M-43 64H50L34 97h-94z" fill="#282f31" opacity=".44" transform="translate(8 6)" filter="url(#metal-shadow)"/>
      <path d="M-9 82H9l3 73h-24z" fill="#141a1c"/>
      <rect x="-7" y="84" width="14" height="74" rx="2" fill="url(#shaft)"/>
      <path d="M-5 91h10v65H-5z" fill="url(#brushing)"/>
      <rect data-plotter-rod x="-3.6" y="154" width="7.2" height="${numeral(tipY - 218)}" fill="url(#shaft)"/>
      <path d="M-56 30H52L35 57H-73z" stroke="#1b2123" stroke-width="2" fill="url(#carriage-ivory)"/>
      <path d="M-46 58H62L44 86H-63z" stroke="#291c1d" stroke-width="2" fill="url(#carriage-red)"/>
      <path d="M-55 32H47M-44 60H57" stroke="#fff" stroke-opacity=".5"/>
      <path d="M-68 53H35m-94 29H45" stroke="#000" stroke-opacity=".32"/>
      ${[[-51, 43], [30, 43], [-42, 71], [40, 71]].map(([x, y]) => `<g transform="translate(${x} ${y})"><circle r="3.4" fill="#222526" opacity=".75"/><circle r="2.45" fill="#d1cebf"/><path d="M-1.55 1.1l3.1 -2.2" stroke="#444645" stroke-width=".9"/></g>`).join('')}
      <g data-plotter-pen transform="translate(0 ${numeral(tipY)})">
        <path d="M-8 -67H8L10 -61V-15L6 -8H-6l-4 -7V-61z" stroke="#1a2528" fill="url(#pen-grip)"/>
        <path d="M-9 -57H9m-9 3H9m-9 3H9" stroke="#bcc5bc" stroke-opacity=".48"/>
        <path d="M-8 -25H8v6H-8z" fill="#c8292c"/>
        <path d="M-6 -8H6L2.1 -1 0 0 -2.1 -1z" fill="url(#shaft)" stroke="#233031" stroke-width=".7"/>
        <path d="M0 -4v4" stroke="#b0161e" stroke-width="1.5" stroke-linecap="round"/>
      </g>
    </g>
  </g>`;
}

export function plotterScene() {
  return `<svg class="plotter-scene" data-plotter-scene xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${terrain.width} ${terrain.height}" role="img" aria-labelledby="plan-title plan-description">
  <title id="plan-title">Le traceur de Gruyère</title>
  <desc id="plan-description">Un traceur ivoire et rouge sur un rail d’aluminium, au-dessus de la gravure à deux crêtes des Préalpes fribourgeoises.</desc>
  <defs>
    <linearGradient id="rail-metal" x2="0" y2="1"><stop stop-color="#f0f0e9"/><stop offset=".12" stop-color="#b8bfbc"/><stop offset=".3" stop-color="#848d8b"/><stop offset=".54" stop-color="#535c5f"/><stop offset=".77" stop-color="#b7bdb8"/><stop offset=".94" stop-color="#626b6c"/><stop offset="1" stop-color="#363f43"/></linearGradient>
    <linearGradient id="shaft"><stop stop-color="#3b4446"/><stop offset=".28" stop-color="#767d77"/><stop offset=".45" stop-color="#e2e4d9"/><stop offset=".64" stop-color="#a0a8a1"/><stop offset="1" stop-color="#42494b"/></linearGradient>
    <linearGradient id="carriage-ivory" x2=".38" y2="1"><stop stop-color="#fff9e9"/><stop offset=".68" stop-color="#e7e1cc"/><stop offset="1" stop-color="#aca693"/></linearGradient>
    <linearGradient id="carriage-red" x2=".38" y2="1"><stop stop-color="#f55545"/><stop offset=".57" stop-color="#e61a22"/><stop offset="1" stop-color="#a91622"/></linearGradient>
    <linearGradient id="pen-grip"><stop stop-color="#303d3f"/><stop offset=".35" stop-color="#67726f"/><stop offset=".54" stop-color="#8a9894"/><stop offset="1" stop-color="#2c3335"/></linearGradient>
    <linearGradient id="paper-face" x2=".79" y2="1"><stop stop-color="#fbf1da"/><stop offset=".64" stop-color="#e9ddc3"/><stop offset="1" stop-color="#cdb99c"/></linearGradient>
    <pattern id="brushing" width="19" height="5" patternUnits="userSpaceOnUse"><path d="M0 .5h19m-19 3h19" stroke="#fff" stroke-opacity=".25" stroke-width=".55"/><path d="M4 2h11m-7 2h11" stroke="#141a1a" stroke-opacity=".4" stroke-width=".7"/></pattern>
    <pattern id="belt" width="6" height="8" patternUnits="userSpaceOnUse"><path d="M.5 0v8m2 -8v8" stroke="#bac2bd" stroke-opacity=".24" stroke-width=".6"/></pattern>
    <filter id="soft-shadow" x="-30%" y="-90%" width="175%" height="300%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="metal-shadow" x="-50%" y="-90%" width="205%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>
    ${terrain.contours.map(({ d }, index) => `<path id="iso-${index}" d="${d}" fill-rule="evenodd"/>`).join('')}
  </defs>
  ${sheetMarks()}
  <use data-relief-shadow href="#iso-0" fill="#3d3025" opacity="0" filter="url(#soft-shadow)"/>
  ${terrain.contours.map(({ level }, index) => `<g data-slice="${level}">
    <use href="#iso-${index}" data-slice-shadow fill="#514434" opacity="0"/>
    <use href="#iso-${index}" data-slice-edge fill="#a78e70" stroke="#6b5844" stroke-width=".65" opacity="0"/>
    <use href="#iso-${index}" data-slice-face fill="url(#paper-face)" fill-opacity="0" stroke="${line}" stroke-width="${index % 5 === 0 ? 1.35 : 0.86}" stroke-opacity="${index % 5 === 0 ? 0.93 : 0.76}" stroke-linejoin="round"/>
  </g>`).join('')}
  <path data-ink-trail d="${terrain.ink}" fill="none" stroke="${red}" stroke-width="2.7" stroke-linejoin="round" stroke-linecap="round"/>
  <ellipse data-pen-shadow cx="${numeral(tipX + 10)}" cy="${numeral(tipY + 5)}" rx="11" ry="3" fill="#352a25" opacity=".32" transform="rotate(18 ${tipX} ${tipY})"/>
  <circle cx="${tipX}" cy="${tipY}" r="4.6" fill="#a71921" opacity=".16"/>
  <circle cx="${tipX}" cy="${tipY}" r="2.8" fill="#b51b24"/>
  ${hardware()}
  </svg>`;
}

export function printSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="34 96 828 387" width="828" height="387" role="img" aria-labelledby="titre"><title id="titre">Le traceur de Gruyère — Estampe Helvnet</title>
  <rect x="34" y="96" width="828" height="387" fill="#f5efe0"/>
  ${sheetMarks()}
  <g fill="none" stroke="${line}" stroke-linejoin="round">
  ${terrain.contours.map(({ d }, index) => `<path d="${d}" stroke-width="${index % 5 === 0 ? 1.35 : 0.86}" opacity="${index % 5 === 0 ? 0.93 : 0.76}"/>`).join('\n')}
  </g><path d="${terrain.ink}" fill="none" stroke="${red}" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${tipX}" cy="${tipY}" r="2.8" fill="#b51b24"/></svg>`;
}
