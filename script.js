// === CONFIG ===
const segments = [
  { label: '10 Coins',  color: '#f6c54a', weight: 10 },
  { label: 'Extra Spin',color: '#ff944a', weight: 8  },
  { label: 'Try Again', color: '#ff7ab6', weight: 16 },
  { label: '20 Coins',  color: '#f6c54a', weight: 7  },
  { label: 'Common NFT',color: '#c08bff', weight: 5  },
  { label: '50 Coins',  color: '#ffb86b', weight: 3  },
  { label: 'Rare NFT',  color: '#7aa2ff', weight: 2  },
  { label: 'Jackpot!',  color: '#ff5e5b', weight: 1  },
];

// === BASIS ===
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultEl = document.getElementById('result');
const logEl = document.getElementById('log');
const legendEl = document.getElementById('legend');

// Logo (plaats assets/logo.png naast dit bestand)
const logo = new Image();
logo.src = 'assets/logo.png';

// Legenda pills
function renderLegend() {
  legendEl.innerHTML = '';
  segments.forEach(s => {
    const pill = document.createElement('div');
    pill.className = 'pill';
    pill.innerHTML = `<span class="dot" style="background:${s.color}"></span>${s.label} <span style="opacity:.7">(${s.weight})</span>`;
    legendEl.appendChild(pill);
  });
}
renderLegend();

const size = Math.min(canvas.width, canvas.height);
const radius = size * 0.44;          // iets kleiner om ring/lampjes te tonen
const center = { x: canvas.width/2, y: canvas.height/2 };
let currentAngle = 0;
const sliceAngle = (Math.PI * 2) / segments.length;

// Tekent het wiel met FortuneFi-stijl
function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(currentAngle);

  // --- Buitenste gouden ring ---
  ctx.beginPath();
  ctx.arc(0, 0, radius + 18, 0, Math.PI * 2);
  ctx.lineWidth = 14;
  const ringGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
  ringGrad.addColorStop(0, '#fbe08a');
  ringGrad.addColorStop(0.5, '#f6c54a');
  ringGrad.addColorStop(1, '#d9a32f');
  ctx.strokeStyle = ringGrad;
  ctx.stroke();

  // --- “Lampjes” rond de ring ---
  const bulbs = 60;
  for (let i = 0; i < bulbs; i++) {
    const a = (i / bulbs) * Math.PI * 2;
    const r = radius + 18;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const g = ctx.createRadialGradient(x, y, 1, x, y, 6);
    g.addColorStop(0, 'rgba(255,255,200,0.95)');
    g.addColorStop(1, 'rgba(255,215,100,0.05)');
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  // --- Slices met radiale glans + zwarte separators ---
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const start = i * sliceAngle;
    const end = start + sliceAngle;

    // Sector
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();

    const grad = ctx.createRadialGradient(0, 0, radius * 0.05, 0, 0, radius);
    // subtiele “sheen”
    grad.addColorStop(0, '#ffffff10');
    grad.addColorStop(0.25, seg.color);
    grad.addColorStop(1, shade(seg.color, -18));
    ctx.fillStyle = grad;
    ctx.fill();

    // Separator stroke
    ctx.strokeStyle = 'rgba(0,0,0,.55)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Label
    ctx.save();
    ctx.rotate(start + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f1014';
    ctx.font = `${Math.floor(radius * 0.09)}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
    ctx.translate(radius * 0.9, 0);
    wrapText(ctx, seg.label, 0, 0, radius * 0.38, radius * 0.09);
    ctx.restore();
  }

  // --- Binnenste hub met gouden rand ---
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
  const hubGrad = ctx.createLinearGradient(-20, -20, 20, 20);
  hubGrad.addColorStop(0, '#0e1016');
  hubGrad.addColorStop(1, '#0a0c12');
  ctx.fillStyle = hubGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.18 + 6, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = ringGrad;
  ctx.stroke();

  // --- Logo in het midden ---
  if (logo && logo.complete) {
    const s = radius * 0.24; // schaal logo t.o.v. rad
    ctx.save();
    // zachte glow onder logo
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.drawImage(logo, -s/2, -s/2, s, s);
    ctx.restore();
  }

  ctx.restore();
}

// Tekst wrapping
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else line = testLine;
  }
  lines.push(line.trim());
  const totalH = lines.length * lineHeight;
  let yy = y - totalH/2 + lineHeight*0.85;
  lines.forEach(l => { ctx.fillText(l, x, yy); yy += lineHeight; });
}

// Kleur shading helper (hex naar donkerder)
function shade(hex, pct){
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if(!m) return hex;
  let [r,g,b] = [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
  r = Math.min(255, Math.max(0, r + Math.round(255 * (pct/100))));
  g = Math.min(255, Math.max(0, g + Math.round(255 * (pct/100))));
  b = Math.min(255, Math.max(0, b + Math.round(255 * (pct/100))));
  return `rgb(${r},${g},${b})`;
}

// Gewogen random keuze
function weightedChoice(items, weightKey = 'weight') {
  const total = items.reduce((acc, it) => acc + (it[weightKey] || 0), 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= (items[i][weightKey] || 0);
    if (r <= 0) return i;
  }
  return items.length - 1;
}

// Doelhoek zodat gekozen index onder pointer eindigt
function angleForIndex(index) {
  const targetSliceMid = index * sliceAngle + sliceAngle / 2;
  return (Math.PI * 2 - targetSliceMid) % (Math.PI * 2);
}

let spinning = false;

function spin() {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;
  resultEl.textContent = 'Aan het draaien…';

  const winnerIndex = weightedChoice(segments);
  const baseTarget = angleForIndex(winnerIndex);
  const extraTurns = 4 + Math.floor(Math.random() * 3); // 4..6 rondjes
  const targetAngle = baseTarget + extraTurns * Math.PI * 2;

  const startAngle = currentAngle % (Math.PI * 2);
  const delta = shortestRotation(startAngle, targetAngle);

  const duration = 3800 + Math.random() * 900; // ms
  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = easeOutCubic(t);
    currentAngle = startAngle + delta * eased;
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      currentAngle = targetAngle % (Math.PI * 2);
      drawWheel();

      const win = segments[winnerIndex];
      resultEl.innerHTML = `🎉 <b>Gewonnen:</b> ${win.label}`;
      appendLog(`[${new Date().toLocaleTimeString()}] WIN → ${win.label}`);
      spinning = false;
      spinBtn.disabled = false;
    }
  }
  requestAnimationFrame(frame);
}

function shortestRotation(from, to) {
  let delta = to - from;
  while (delta <= 0) delta += Math.PI * 2;
  return delta;
}
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

function appendLog(line) {
  const el = document.createElement('div');
  el.textContent = line;
  logEl.prepend(el);
}

// Init
drawWheel();
spinBtn.addEventListener('click', spin);
logo.addEventListener('load', drawWheel);
