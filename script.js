const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const resultEl = document.getElementById("result");

const segments = [
  { label: "10 Coins", color: "#f6c54a", weight: 10 },
  { label: "Try Again", color: "#ff944a", weight: 8 },
  { label: "20 Coins", color: "#f65c4a", weight: 7 },
  { label: "NFT Ticket", color: "#ff7ab6", weight: 5 },
  { label: "50 Coins", color: "#f6c54a", weight: 3 },
  { label: "Rare Loot", color: "#7aa2ff", weight: 1 }
];

const sliceAngle = (2 * Math.PI) / segments.length;
let currentAngle = 0;
let spinning = false;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(currentAngle);

  const radius = canvas.width / 2 - 10;

  for (let i = 0; i < segments.length; i++) {
    const start = i * sliceAngle;
    const end = start + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();

    ctx.fillStyle = segments[i].color;
    ctx.fill();
    ctx.strokeStyle = "#111";
    ctx.stroke();

    ctx.save();
    ctx.rotate(start + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#111";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(segments[i].label, radius - 10, 5);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.fillStyle = "#111";
  ctx.fill();
  ctx.restore();
}

function weightedChoice(items) {
  const total = items.reduce((a, b) => a + b.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= items[i].weight;
    if (r <= 0) return i;
  }
  return items.length - 1;
}

function angleForIndex(index) {
  const targetMid = index * sliceAngle + sliceAngle / 2;
  return (2 * Math.PI - targetMid) % (2 * Math.PI);
}

function spin() {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;
  resultEl.textContent = "Spinning…";

  const winner = weightedChoice(segments);
  const baseTarget = angleForIndex(winner);
  const extra = (3 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
  const target = baseTarget + extra;
  const start = currentAngle % (2 * Math.PI);
  const delta = target - start;
  const dur = 4000;
  const startTime = performance.now();

  function frame(t) {
    const p = Math.min(1, (t - startTime) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    currentAngle = start + delta * eased;
    drawWheel();
    if (p < 1) {
      requestAnimationFrame(frame);
    } else {
      currentAngle = target % (2 * Math.PI);
      drawWheel();
      resultEl.textContent = `🎉 Gewonnen: ${segments[winner].label}`;
      spinning = false;
      spinBtn.disabled = false;
    }
  }
  requestAnimationFrame(frame);
}

drawWheel();
spinBtn.addEventListener("click", spin);
