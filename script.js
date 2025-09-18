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

  let spins = 1; // start met 1 spin
  updateSpinUI();

  const segments = [
    {label:"10 $FFI",  color:"#f6c54a", weight:10},
    {label:"Extra Spin",color:"#ff944a", weight:8},
    {label:"20 $FFI",  color:"#f6c54a", weight:7},
    {label:"50 $FFI",  color:"#ff944a", weight:3},
    {label:"Jackpot!",  color:"#f65c4a", weight:1}
  ];

  const sliceAngle = 2*Math.PI/segments.length;
  let currentAngle = 0;
  let spinning = false;

  const size = Math.min(canvas.width, canvas.height);
  const radius = size * 0.46;
  const center = { x: canvas.width/2, y: canvas.height/2 };

  const logo = new Image();
  logo.src = "logo.png";

  // update UI (knop + counter)
  function updateSpinUI(){
    spinBtn.textContent = `SPIN`;
    spinBtn.disabled = (spins <= 0);
    spinCountEl.textContent = `Spins left: ${spins}`;
  }

  // RNG helpers
  function weightedChoice(items){
    const total = items.reduce((a,b)=>a+(b.weight||0),0);
    let r = Math.random()*total;
    for(let i=0;i<items.length;i++){ r -= (items[i].weight||0); if(r<=0) return i; }
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

  // SPIN functie
  function spin(){
    if(spinning || spins <= 0) return;
    spinning = true;
    spins--; // gebruik 1 spin
    updateSpinUI();

    resultEl.textContent = "Creating Your FORTUNE…";

    const winner = weightedChoice(segments);
    const baseTarget = angleForIndex(winner);
    const extraTurns = 4 + Math.floor(Math.random()*3);
    const target = baseTarget + extraTurns * Math.PI*2;

    const startAngle = currentAngle % (Math.PI*2);
    const delta = shortestRotation(startAngle, target);
    const duration = 3800 + Math.random()*900;
    const start = performance.now();

    function frame(now){
      const t = Math.min(1, (now - start)/duration);
      const eased = easeOutCubic(t);
      currentAngle = startAngle + delta*eased;
      drawWheel();
      if(t<1){ requestAnimationFrame(frame); }
      else {
        currentAngle = target % (Math.PI*2);
        drawWheel();
        const win = segments[winner];
        resultEl.textContent = "🎉 YOU HAVE WON!: " + win.label;
        spinning = false;

        // extra spin winnen
        if(win.label === "Extra Spin"){ 
          spins++;
          resultEl.textContent += " (+1 spin)";
        }

        updateSpinUI();
      }
    }
    requestAnimationFrame(frame);
  }

  // Power Up
  function powerUp(){
    spins++;
    updateSpinUI();
    resultEl.textContent = "⚡ Power Up activated! +1 Spin";
  }

  // teken wiel (rest code blijft gelijk)
  function drawWheel(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(currentAngle);
    // … rest van je teken-code …
    ctx.restore();
  }

  // init
  drawWheel();
  powerBtn.addEventListener('click', powerUp);
  spinBtn.addEventListener('click', spin);
})();
