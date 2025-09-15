const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const segments = [
  { label: "10 Coins", color: "#f6c54a" },
  { label: "Try Again", color: "#ff944a" },
  { label: "20 Coins", color: "#f65c4a" },
  { label: "NFT Ticket", color: "#ff7ab6" },
  { label: "50 Coins", color: "#f6c54a" },
  { label: "Rare Loot", color: "#7aa2ff" }
];

const sliceAngle = (2 * Math.PI) / segments.length;
let currentAngle = 0;

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

drawWheel();
