FortuneFi Wheel – Enhanced
const prev = angle;
// Integrate
const dt = 1/60; // fixed timestep for stable physics
angle += angVel * dt;
angVel = Math.max(0, angVel - planned.decel * dt);


// Tick sound when crossing a slice edge under the pointer
const idx = Math.floor(((TAU - (angle % TAU)) % TAU) / slice);
if(idx !== lastTickIndex){ ticker.click(); lastTickIndex = idx; }


// Reached target?
if(angVel <= 0.01 && angle >= planned.target - 0.01){
angle = planned.target % TAU; angVel = 0; spinning = false;
onStop(targetIndex);
} else {
drawWheel();
requestAnimationFrame(step);
}
}


function onStop(winnerIdx){
drawWheel();
const prize = segments[winnerIdx];
pointer.classList.add('bounce');
state.spins += 1;


if(prize.type==='coins'){ state.coins += prize.value; toast(`+${prize.value} coins`); }
if(prize.type==='extra'){ state.extra += prize.value; toast('Extra spin!'); }
if(prize.type==='jackpot'){ state.coins += prize.value; state.jackpots += 1; confetti.burst(); toast('JACKPOT!!!'); }


updateDashboard();
resultEl.textContent = `🎉 Gewonnen: ${prize.label}`;
addHistory(`Spin ${state.spins}: ${prize.label}`);


$('#wheel').classList.remove('spin-glow');
spinBtn.disabled = false; autoBtn.disabled = false;
}


// Keyboard: Space to spin
window.addEventListener('keydown', (e)=>{ if(e.code==='Space'){ e.preventDefault(); spin(); }});


// Auto x10
let autoCount = 0;
function autoSpin(times=10){
if(spinning) return; autoCount = times;
const run = ()=>{
if(autoCount<=0) return; autoCount--; spin();
const wait = 1200 + Math.random()*600; // staggered
const check = () => { if(!spinning){ setTimeout(run, wait); } else { setTimeout(check, 100); } };
check();
};
run();
}


spinBtn.addEventListener('click', spin);
autoBtn.addEventListener('click', ()=>autoSpin(10));


// Initial draw
resizeAll();
updateDashboard();


// Accessibility: announce result via aria-live (the #result element already has readable text)
