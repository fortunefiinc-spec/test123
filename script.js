const segments = [
  { label: '10 Coins',  color: '#33e1c6', weight: 10 },
  { label: 'Extra Spin',color: '#7aa2ff', weight: 8  },
  { label: 'Try Again', color: '#ff7ab6', weight: 16 },
  { label: '20 Coins',  color: '#ffe27a', weight: 7  },
  { label: 'Common NFT',color: '#c08bff', weight: 5  },
  { label: '50 Coins',  color: '#ffb86b', weight: 3  },
  { label: 'Rare NFT',  color: '#69f',    weight: 2  },
  { label: 'Jackpot!',  color: '#ff5e5b', weight: 1  },
];

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultEl = document.getElementById('result');
const logEl = document.getElementById('log');
const legendEl = document.getElementById('legend');

function pct(n, total) { return ((n/total)*100).toFixed(1) + '%'; }
function renderLegend() {
  legendEl.innerHTML = '';
  const total = segments.reduce((a,s)=>a+(s.weight||0),0);
  segments.forEach(s => {
    const pill = document.createElement('div');
    pill.className = 'pill';
    pill.innerHTML =
      `<span style="background:${s.color}; width:10px; height:10px; border-radius:50%; display:inline-block;"></span>
       ${s.label} <span style="opacity:.7">(${s.weight} • ${pct(s.weight,total)})</span>`;
    legendEl.appendChild(pill);
  });
}
renderLegend();

const size = Math.min(canvas.width, canvas.height);
const radius = size * 0.48;
const center = { x: canvas.width/2, y: canvas.height/2 };
let currentAngle = 0;
const sliceAngle = (Math.PI * 2) / segments.length;

function drawWheel() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(currentAngle);
  for (let i=0; i<segments.length; i++) {
    const seg = segments[i];
    const start = i * sliceAngle;
    const end = start + sliceAngle;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.arc(0,0,radius,start,end);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)';
    ctx.stroke();
    ctx.save();
    ctx.rotate(start + sliceAngle/2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0e0f14';
    ctx.font = `${Math.floor(radius*0.09)}px sans-serif`;
    ctx.translate(radius*0.9,0);
    ctx.fillText(seg.label,0,0);
    ctx.restore();
  }
  ctx.restore();
}
drawWheel();

function weightedChoice(items) {
  const total = items.reduce((acc, it) => acc + (it.weight || 0), 0);
  let r = Math.random() * total;
  for (let i=0; i<items.length; i++) {
    r -= items[i].weight;
    if (r <= 0) return i;
  }
  return items.length-1;
}
function angleForIndex(index) {
  const targetSliceStart = index * sliceAngle;
  const targetSliceMid = targetSliceStart + sliceAngle/2;
  return (Math.PI * 2 - targetSliceMid) % (Math.PI*2);
}
function shortestRotation(from,to){ let delta=to-from; while(delta<=0) delta+=Math.PI*2; return delta; }
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
function appendLog(line){ const el=document.createElement('div'); el.textContent=line; logEl.prepend(el); }

let spinning = false;
function spin() {
  if(spinning) return;
  spinning = true;
  spinBtn.disabled=true;
  resultEl.textContent='Spinning...';
  const winnerIndex = weightedChoice(segments);
  const baseTarget = angleForIndex(winnerIndex);
  const extraTurns = 4 + Math.floor(Math.random()*3);
  const targetAngle = baseTarget + extraTurns * Math.PI*2;
  const startAngle = currentAngle % (Math.PI*2);
  const delta = shortestRotation(startAngle, targetAngle);
  const duration = 3600+Math.random()*900;
  const start = performance.now();

  function frame(now){
    const t = Math.min(1,(now-start)/duration);
    const eased = easeOutCubic(t);
    currentAngle = startAngle + delta*eased;
    drawWheel();
    if(t<1) requestAnimationFrame(frame);
    else {
      currentAngle = targetAngle % (Math.PI*2);
      drawWheel();
      const win = segments[winnerIndex];
      resultEl.innerHTML = `🎉 <b>Won:</b> ${win.label}`;
      appendLog(`[${new Date().toLocaleTimeString()}] WIN → ${win.label}`);
      spinning=false; spinBtn.disabled=false;
    }
  }
  requestAnimationFrame(frame);
}
spinBtn.addEventListener('click', spin);