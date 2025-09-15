// --- DOM refs ---
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultEl = document.getElementById('result');
const pointer = document.getElementById('pointer');
const coinsEl = document.getElementById('coins');
const spinsEl = document.getElementById('spins');
const extraEl = document.getElementById('extra');
const jpsEl = document.getElementById('jps');
const historyList = document.getElementById('historyList');
const confettiCanvas = document.getElementById('confetti');
const confCtx = confettiCanvas.getContext('2d');

// --- Basis data (identiek aan jouw start) + waarden ---
const segments = [
  {label:"10 Coins",   color:"#f6c54a", weight:10, type:"coins",   value:10},
  {label:"Extra Spin", color:"#ff944a", weight:8,  type:"extra",   value:1},
  {label:"20 Coins",   color:"#f6c54a", weight:7,  type:"coins",   value:20},
  {label:"50 Coins",   color:"#ff944a", weight:3,  type:"coins",   value:50},
  {label:"Jackpot!",   color:"#f65c4a", weight:1,  type:"jackpot", value:500}
];

const TAU = Math.PI * 2;
const sliceAngle = TAU / segments.length;

// State
const state = { coins:0, spins:0, extra:0, jackpots:0 };

// Afmetingen
let currentAngle = 0;
let spinning = false;
let angVel = 0;
let plan = null;
let winnerIndex = null;

// Retina / responsive
function fitCanvases(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.width * dpr); // vierkant
  confettiCanvas.width = canvas.width;
  confettiCanvas.height = canvas.height;
  drawWheel();
}
window.addEventListener('resize', fitCanvases);

// Logo (optioneel)
const logo = new Image();
logo.src = 'logo.png'; // zet jullie logo in dezelfde map

// Tekenen van het wiel — blijft trouw aan je basis, maar iets mooier
function drawWheel(){
  const w = canvas.width, h = canvas.height;
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const radius = Math.min(w, h)/2 - 10*dpr;

  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.translate(w/2, h/2);
  ctx.rotate(currentAngle);

  for(let i=0;i<segments.length;i++){
    const start = i*sliceAngle;
    const end = start + sliceAngle;

    // sector met subtiele radial gradient (zoals jouw basis)
    const grad = ctx.createRadialGradient(0,0,50*dpr, 0,0, radius);
    grad.addColorStop(0,"#fff8");
    grad.addColorStop(1,segments[i].color);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.arc(0,0,radius,start,end);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle="#111";
    ctx.lineWidth = 2*dpr;
    ctx.stroke();

    // label
    ctx.save();
    ctx.rotate(start + sliceAngle/2);
    ctx.fillStyle="#111";
    ctx.font = `${18*dpr}px sans-serif`;
    ctx.textAlign="right";
    ctx.textBaseline="middle";
    ctx.fillText(segments[i].label, radius-10*dpr, 0);
    ctx.restore();
  }

  // midden cirkel + logo (zoals jouw basis)
  ctx.beginPath();
  ctx.arc(0,0,70*dpr,0,TAU);
  ctx.fillStyle="#111";
  ctx.fill();

  if(logo.complete && logo.naturalWidth){
    const size = 80*dpr;
    ctx.drawImage(logo, -size/2, -size/2, size, size);
  }

  ctx.restore();
}

// Weighted keuze (zoals basis)
function weightedChoice(items){
  const total = items.reduce((a,b)=>a+b.weight,0);
  let r = Math.random()*total;
  for(let i=0;i<items.length;i++){ r -= items[i].weight; if(r<=0) return i; }
  return items.length-1;
}

// Bereken absolute hoek waarbij index onder de pointer valt (boven)
function angleForIndex(index){
  const targetMid = index*sliceAngle + sliceAngle/2;
  return (TAU - targetMid) % TAU;
}

// Spin plannen met constante vertraging zodat we exact eindigen op index
function planSpinTo(index){
  const baseTarget = angleForIndex(index);
  const start = ((currentAngle % TAU) + TAU) % TAU;
  const laps = 3 + Math.floor(Math.random()*3); // 3..5 rondes
  const total = (baseTarget - start + TAU) % TAU + laps*TAU;
  const decel = 4.8 + Math.random()*1.4; // rad/s^2
  const v0 = Math.sqrt(2*decel*total);
  return {v0, decel, target: start + total};
}

// Tick geluid (simpel webaudio—geen asset nodig)
const ticker = {
  ctx: null,
  ensure(){ if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
  click(){
    this.ensure();
    const a = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    a.type='square'; a.frequency.value=900; g.gain.value=0.035;
    a.connect(g).connect(this.ctx.destination);
    a.start();
    setTimeout(()=>a.stop(), 18);
  }
};
let lastSlice = -1;

// Confetti (bij Jackpot)
const confetti = {
  parts: [],
  burst(n=120){
    const w = confettiCanvas.width, h = confettiCanvas.height;
    for(let i=0;i<n;i++){
      confetti.parts.push({
        x: w/2, y: 40,
        vx: (Math.random()-0.5)*6,
        vy: Math.random()*-4-2,
        r: 2+Math.random()*3,
        a: Math.random()*TAU,
        life: 60+Math.random()*40,
        hue: (40 + Math.random()*50)|0
      });
    }
    if(!confetti._running){ confetti._running = true; requestAnimationFrame(confetti.step); }
  },
  step(){
    const w = confettiCanvas.width, h = confettiCanvas.height;
    confCtx.clearRect(0,0,w,h);
    confetti.parts = confetti.parts.filter(p=> (p.life-=1) > 0);
    for(const p of confetti.parts){
      p.vy += 0.12; p.x += p.vx; p.y += p.vy; p.a += 0.2;
      confCtx.save(); confCtx.translate(p.x,p.y); confCtx.rotate(p.a);
      confCtx.fillStyle = `hsl(${p.hue},95%,60%)`;
      confCtx.fillRect(-p.r,-p.r,p.r*2,p.r*2);
      confCtx.restore();
    }
    if(confetti.parts.length) requestAnimationFrame(confetti.step);
    else confetti._running = false;
  }
};

// Dashboard/geschiedenis
function updateDashboard(){
  coinsEl.textContent = state.coins;
  spinsEl.textContent = state.spins;
  extraEl.textContent = state.extra;
  jpsEl.textContent = state.jackpots;
}
function addHistory(text){
  const li = document.createElement('li');
  li.textContent = text;
  historyList.prepend(li);
}

// Klein toastje
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>el.classList.remove('show'), 1800);
}

// Hoofd spin
function spin(){
  if(spinning) return;
  spinning = true; spinBtn.disabled = true;
  canvas.classList.add('spin-glow');
  resultEl.textContent = "Aan het draaien…";
  pointer.classList.remove('bounce');

  winnerIndex = weightedChoice(segments);
  plan = planSpinTo(winnerIndex);
  angVel = plan.v0;

  requestAnimationFrame(step);
}

// Physics loop (vaste tijdstap voor stabiliteit)
function step(){
  if(!spinning) return;

  const dt = 1/60; // 60 FPS
  currentAngle += angVel * dt;
  angVel = Math.max(0, angVel - plan.decel * dt);

  // Tick bij elk nieuw slice onder de pointer
  const idxUnderPointer = Math.floor(((TAU - (currentAngle % TAU)) % TAU) / sliceAngle);
  if(idxUnderPointer !== lastSlice){ ticker.click(); lastSlice = idxUnderPointer; }

  // Stopconditie (zacht in de buurt van target)
  if(angVel <= 0.01 && currentAngle >= plan.target - 0.01){
    currentAngle = plan.target % TAU;
    angVel = 0; spinning = false;
    onStop(winnerIndex);
  } else {
    drawWheel();
    requestAnimationFrame(step);
  }
}

// Afhandeling na stoppen
function onStop(i){
  drawWheel();
  const seg = segments[i];
  pointer.classList.add('bounce');

  state.spins += 1;
  if(seg.type === 'coins'){
    state.coins += seg.value;
    toast(`+${seg.value} coins`);
  } else if(seg.type === 'extra'){
    state.extra += seg.value;
    toast('Extra spin!');
  } else if(seg.type === 'jackpot'){
    state.jackpots += 1;
    state.coins += seg.value;
    confetti.burst();
    toast('JACKPOT!!!');
  }

  updateDashboard();
  resultEl.textContent = `🎉 Gewonnen: ${seg.label}`;
  addHistory(`Spin ${state.spins}: ${seg.label}`);

  canvas.classList.remove('spin-glow');
  spinBtn.disabled = false;
}

// Init
fitCanvases();
updateDashboard();
drawWheel();
spinBtn.addEventListener('click', spin);
window.addEventListener('keydown', (e)=>{ if(e.code==='Space'){ e.preventDefault(); spin(); }});
