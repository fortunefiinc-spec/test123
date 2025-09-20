// ⭐ Stars.js – achtergrond animatie
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let stars = [];
let meteors = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// ⭐ Init sterren
function createStars(count = 200) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: 0.05 + Math.random() * 0.1,
      opacity: Math.random()
    });
  }
}
createStars();

// 🌠 Maak een vallende ster
function spawnMeteor() {
  const startX = Math.random() * canvas.width;
  const startY = -50;
  meteors.push({
    x: startX,
    y: startY,
    vx: -4 - Math.random() * 3, // snelheid X
    vy: 4 + Math.random() * 3,  // snelheid Y
    len: 100 + Math.random() * 100,
    life: 0,
    maxLife: 80 + Math.random() * 50
  });
}

// Animatie loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ⭐ Sterren tekenen
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
    ctx.fill();
  });

  // 🌠 Meteoren tekenen
  meteors.forEach((m, i) => {
    m.x += m.vx;
    m.y += m.vy;
    m.life++;

    const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * m.len, m.y - m.vy * m.len);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - m.vx * m.len, m.y - m.vy * m.len);
    ctx.stroke();

    if (m.life > m.maxLife) {
      meteors.splice(i, 1);
    }
  });

  // Kans op vallende ster
  if (Math.random() < 0.01) {
    spawnMeteor();
  }

  requestAnimationFrame(animate);
}
animate();
