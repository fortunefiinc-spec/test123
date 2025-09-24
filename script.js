// FortuneFi Wheel – Deluxe (Try Me page)
(function(){
  const canvas = document.getElementById('wheel');
  if(!canvas) return; 

  const ctx = canvas.getContext('2d');
  const spinBtn = document.getElementById('spinBtn');
  const resultEl = document.getElementById('result');
  const powerBtn = document.getElementById('powerBtn');
  const spinCountEl = document.getElementById('spinCount');

  const cfx = document.getElementById('confetti');
  const conf = cfx.getContext('2d');

  // --- spins ---
  let spins = 1;
  let spinning = false;

  function updateSpinUI(){
    spinBtn.disabled = (spins <= 0 || spinning);
    spinCountEl.textContent = `Spins left: ${spins}`;
  }

  const segments = [
    {label:"TRY AGAIN",  color:"#f65c4a", weight:11},
    {label:"Extra Spin", color:"#ff944a", weight:8},
    {label:"NFT",        color:"#add8e6", weight:11},
    {label:"10 $FFI",    color:"#f6c54a", weight:10},
    {label:"TRY AGAIN",  color:"#f65c4a", weight:11},
    {label:"Extra Spin", color:"#ff944a", weight:8},
    {label:"20 $FFI",    color:"#f6c54a", weight:7},
    {label:"TRY AGAIN",  color:"#f65c4a", weight:11},
    {label:"50 $FFI",    color:"#ff944a", weight:3},
  ];

  const sliceAngle = 2*Math.PI/segments.length;
  let currentAngle = 0;

  const size = Math.min(canvas.width, canvas.height);
  const radius = size * 0.46;
  const center = { x: canvas.width/2, y: canvas.height/2 };

  const logo = new Image();
  logo.src = "logo.png";

  // --- NFT IMAGE ---
  const nftImg = new Image();
  nftImg.src = "NFT.png"; // jouw NFT plaatje

  // --- SOUND FILES ---
  const tickSound = new Audio("sounds/tick.wav");     
  const confettiSound = new Audio("Confetti.wav"); 
  const loseSound = new Audio("aww.mp3"); 

  // --- CONFETTI ---
  let confetti = [];
  function spawnConfetti(n=120){
    confetti.length = 0;
    for(let i=0;i<n;i++){
      confetti.push({
        x: Math.random()*cfx.width,
        y: -20 - Math.random()*60,
        vx: (Math.random()-.5)*2,
        vy: 2+Math.random()*2.5,
        a: Math.random()*Math.PI*2,
        va: (Math.random()-.5)*0.3,
        w: 6+Math.random()*6,
        h: 10+Math.random()*12,
        col: ['#f6c54a','#ff944a','#f65c4a','#7aa2ff','#c08bff'][Math.floor(Math.random()*5)]
      });
    }
    confettiSound.currentTime = 0;
    confettiSound.play().catch(()=>{});
  }

  function tickConfetti(){
    conf.clearRect(0,0,cfx.width,cfx.height);
    conf.save();
    confetti.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.a+=p.va;
      if(p.y < cfx.height+30){
        conf.save();
        conf.translate(p.x, p.y);
        conf.rotate(p.a);
        conf.fillStyle = p.col;
        conf.fillRect(-p.w/2,-p.h/2,p.w,p.h);
        conf.restore();
      }
    });
    conf.restore();
    confetti = confetti.filter(p=> p.y < cfx.height+30);
    if(confetti.length) requestAnimationFrame(tickConfetti);
  }

  // --- RNG ---
  function weightedChoice(items){
    const total = items.reduce((a,b)=>a+(b.weight||0),0);
    let r = Math.random()*total;
    for(let i=0;i<items.length;i++){ 
      r -= (items[i].weight||0); 
      if(r<=0) return i; 
    }
    return items.length-1;
  }
  function angleForIndex(index){
    const targetMid = index * sliceAngle + sliceAngle/2;
    return (3*Math.PI/2 - targetMid + Math.PI*2) % (Math.PI*2);
  }
  function shortestRotation(from,to){
    let d = to - from;
    while(d<=0) d += Math.PI*2;
    return d;
  }
  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

  // --- DRAW WHEEL ---
  function drawWheel(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(currentAngle);

    // ring
    ctx.beginPath();
    ctx.arc(0,0, radius+16, 0, Math.PI*2);
    ctx.lineWidth = 14;
    const ringGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    ringGrad.addColorStop(0, '#fbe08a');
    ringGrad.addColorStop(0.5, '#f6c54a');
    ringGrad.addColorStop(1, '#d19a2a');
    ctx.strokeStyle = ringGrad;
    ctx.stroke();

    // bulbs
    const bulbs = 60;
    for(let i=0;i<bulbs;i++){
      const a = (i/bulbs)*Math.PI*2;
      const r = radius+16;
      const x = Math.cos(a)*r, y = Math.sin(a)*r;
      const g = ctx.createRadialGradient(x,y,1, x,y,7);
      g.addColorStop(0,'rgba(255,255,220,.95)');
      g.addColorStop(1,'rgba(255,215,120,.05)');
      ctx.beginPath(); ctx.arc(x,y,4.8,0,Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
    }

    // sectors
    for(let i=0;i<segments.length;i++){
      const seg = segments[i];
      const start = i*sliceAngle, end = start+sliceAngle;

      ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,radius,start,end); ctx.closePath();
      const grad = ctx.createRadialGradient(0,0, radius*0.05, 0,0, radius);
      grad.addColorStop(0, '#ffffff10');
      grad.addColorStop(0.25, seg.color);
      grad.addColorStop(1, shade(seg.color, -18));
      ctx.fillStyle = grad; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 2.2; ctx.stroke();

      ctx.save();
      ctx.rotate(start + sliceAngle/2);

      if(seg.label === "NFT" && nftImg.complete){
        // NFT kaart netjes in slice + uitsnijden
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.arc(0,0,radius,-sliceAngle/2,sliceAngle/2);
        ctx.closePath();
        ctx.clip();

        ctx.rotate(Math.PI/2); // 180° draaien
        const imgSize = radius * 1.1;
        ctx.drawImage(nftImg, -imgSize/2, -imgSize/2, imgSize, imgSize);

        ctx.restore();
      } else {
        // standaard tekst
        ctx.textAlign = 'right';
        ctx.fillStyle = '#0f1014';
        ctx.font = `${Math.floor(radius*0.09)}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
        wrapText(ctx, seg.label, radius*0.92, 0, radius*0.4, Math.floor(radius*0.09));
      }

      ctx.restore();
    }

    // hub
    ctx.beginPath();
    ctx.arc(0,0, radius*0.18, 0, Math.PI*2);
    const hubGrad = ctx.createLinearGradient(-20,-20,20,20);
    hubGrad.addColorStop(0, '#0e1016'); hubGrad.addColorStop(1, '#0a0c12');
    ctx.fillStyle = hubGrad; ctx.fill();
    ctx.beginPath();
    ctx.arc(0,0, radius*0.18+6, 0, Math.PI*2);
    ctx.lineWidth = 4; ctx.strokeStyle = ringGrad; ctx.stroke();

    if(logo && logo.complete){
      const s = radius * 0.24;
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.beginPath(); ctx.arc(0,0, s*0.75, 0, Math.PI*2); ctx.fillStyle = '#000'; ctx.fill();
      ctx.globalAlpha = 1;
      ctx.drawImage(logo, -s/2, -s/2, s, s);
      ctx.restore();
    }

    ctx.restore();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' '); let line = ''; const lines=[];
    for (let n=0;n<words.length;n++){
      const test = line + words[n] + ' ';
      if (ctx.measureText(test).width > maxWidth && n>0) { 
        lines.push(line.trim()); 
        line = words[n] + ' '; 
      } else line = test;
    }
    lines.push(line.trim());
    let yy = y - (lines.length*lineHeight)/2 + lineHeight*0.85;
    lines.forEach(l=>{ ctx.fillText(l, x, yy); yy += lineHeight; });
  }

  function shade(hex, pct){
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if(!m) return hex;
    let [r,g,b] = [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
    r = Math.min(255, Math.max(0, r + Math.round(255 * (pct/100))));
    g = Math.min(255, Math.max(0, g + Math.round(255 * (pct/100))));
    b = Math.min(255, Math.max(0, b + Math.round(255 * (pct/100))));
    return `rgb(${r},${g},${b})`;
  }

  // --- SPIN ---
  function spin(){
    if(spinning || spins <= 0) return;
    spinning = true;
    spins--;
    updateSpinUI();

    resultEl.textContent = "Creating Your FORTUNE…";

    const winner = weightedChoice(segments);
    const baseTarget = angleForIndex(winner);

    const offset = (Math.random() - 0.5) * 0.25; 
    const extraTurns = 4 + Math.floor(Math.random()*3);
    const target = baseTarget + offset + extraTurns * Math.PI*2;

    const startAngle = currentAngle % (Math.PI*2);
    const delta = shortestRotation(startAngle, target);
    const duration = 4200 + Math.random()*900;
    const start = performance.now();

    let lastTick = -1;

    function frame(now){
      const t = Math.min(1, (now - start)/duration);
      const eased = easeOutCubic(t);
      currentAngle = startAngle + delta*eased;
      drawWheel();

      const segIndex = Math.floor(((currentAngle % (Math.PI*2)) / sliceAngle));
      if(segIndex !== lastTick) {
        tickSound.currentTime = 0;
        tickSound.play().catch(()=>{});
        lastTick = segIndex;
      }

      if(t<1){ 
        requestAnimationFrame(frame); 
      } else {
        currentAngle = target % (Math.PI*2);
        drawWheel();
        const win = segments[winner];
        resultEl.textContent = "🎉 YOU HAVE WON!: " + win.label;

        if(win.label === "TRY AGAIN"){
          loseSound.currentTime = 0;
          loseSound.play().catch(()=>{});
        } else {
          spawnConfetti(); 
          tickConfetti();
        }

        if(win.label === "Extra Spin"){ 
          spins++;
          resultEl.textContent += " (+1 spin)";
        }

        spinning = false;
        updateSpinUI();
      }
    }
    requestAnimationFrame(frame);
  }

  // --- PowerUp ---
  function powerUp(){
    spins++;
    resultEl.textContent = "⚡ Power Up: +1 Spin!";
    updateSpinUI();
  }

  function fitOverlays(){
    const dpr = window.devicePixelRatio || 1;
    cfx.width = canvas.clientWidth * dpr;
    cfx.height = canvas.clientWidth * dpr;
    cfx.style.width = canvas.clientWidth + "px";
    cfx.style.height = canvas.clientWidth + "px";
  }

  // --- INIT ---
  drawWheel();
  fitOverlays();
  logo.addEventListener('load', drawWheel);
  nftImg.addEventListener('load', drawWheel);
  window.addEventListener('resize', ()=>{ fitOverlays(); drawWheel(); });
  spinBtn.addEventListener('click', spin);
  powerBtn.addEventListener('click', powerUp);
  updateSpinUI();
})();
