// Simple matrix background
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
const cols = Math.floor(canvas.width / 20);
const drops = Array(cols).fill(0);
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener('resize', resize);
function draw(){
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#0f0'; ctx.font='14px monospace';
  for(let i=0;i<drops.length;i++){
    const text = String.fromCharCode(48+Math.random()*40);
    ctx.fillText(text, i*20, drops[i]*20);
    if(drops[i]*20 > canvas.height && Math.random() > 0.975) drops[i]=0;
    drops[i]++;
  }
}
setInterval(draw, 55);

// progress & level logic
const levels = [...Array(11).keys()]; // 0..10 (we defined content up to 10)
let current = 0;
const unlocked = new Set([0]); // start unlocked level 0

const startBtn = document.getElementById('startBtn');
const levelsBox = document.getElementById('levels');
const intro = document.getElementById('intro');
const levelIndicator = document.getElementById('levelIndicator');
const prevBtn = document.getElementById('prevLevel');
const nextBtn = document.getElementById('nextLevel');
const invisibleLogin = document.getElementById('invisibleLogin');
const loginBtn = document.getElementById('loginBtn');
const homeBtn = document.getElementById('homeBtn');

let username = null;

startBtn.onclick = ()=>{
  intro.classList.add('hidden');
  levelsBox.classList.remove('hidden');
  showLevel(0);
};

// nav
prevBtn.onclick = ()=> showLevel(Math.max(0,current-1));
nextBtn.onclick = ()=> {
  if (current+1 <= 10 && unlocked.has(current+1)) showLevel(current+1);
  else playError();
};

// show/hide levels
function showLevel(n){
  // hide all
  document.querySelectorAll('.level').forEach(el=> el.classList.add('hidden'));
  const el = document.getElementById('level'+n);
  if(!el) return;
  el.classList.remove('hidden');
  current = n;
  levelIndicator.innerText = `Level ${n}`;
}

// invisible login (level0) — clicking reveals console hint and unlocks level1
invisibleLogin.onclick = (e)=>{
  e.preventDefault();
  console.log("Console flag: FLAG{HELLO_CONSOLE_USER}");
  unlockLevel(1);
  playUnlock();
  alert("You found the hidden login! Level 1 unlocked.");
  showLevel(1);
};

// set localStorage flag for level3
localStorage.setItem("sssh","FLAG{LOCAL_STORAGE_LEGEND}");

// robots link button
document.getElementById('robotsBtn')?.addEventListener('click', (e)=>{
  e.preventDefault();
  // open backend robots endpoint
  window.open('/robots.txt', '_blank');
});

// Level 5: show API hint — user must call custom header
document.getElementById('apiHelp').textContent += '\n\nOpen console and run:\n' +
  "fetch('/api/fake').then(r=>r.text()).then(c=>console.log('no header =>',c));\n" +
  "fetch('/api/fake',{headers:{'X-CTF':'spectre'}}).then(r=>r.text()).then(console.log);";

// Caesar handler (level6)
document.getElementById('caesarBtn')?.addEventListener('click', async ()=>{
  const val = document.getElementById('caesarInp').value.trim();
  if(val === 'FLAG{CAESAR_SHIFT_14_WIN}'){
    unlockLevel(7);
    playUnlock();
    alert('Correct! Level 7 unlocked.');
    showLevel(7);
  } else {
    playError();
    alert('Wrong — decrypt TT GOB ZKXG with shift 14');
  }
});

// Submit final flag (level10)
document.getElementById('submitFlag')?.addEventListener('click', async ()=>{
  const u = document.getElementById('user').value.trim();
  const f = document.getElementById('flag').value.trim();
  if(!u || !f){ playError(); return; }
  const res = await fetch('/api/submit', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username:u,flag:f})
  });
  const result = await res.json();
  document.getElementById('submitMsg').innerText = result.message;
  if(result.ok){ unlockLevel(10); playUnlock(); }
});

// some sample flags unlock automation so user doesn't get stuck in demo
function checkAutoUnlocks(){
  // level1 -> visible CSS flag; assume they "found" it by viewing styles
  // but we auto-unlock if they open the console and type ack
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'k' && e.ctrlKey){ unlockLevel(2); console.log('cheat: unlocked level2'); }
  });
}
checkAutoUnlocks();

function unlockLevel(n){
  unlocked.add(n);
  // attempt to notify backend scoreboard unlock (optional)
  fetch('/api/unlock', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({level:n})});
}

function playUnlock(){ document.getElementById('sndUnlock')?.play().catch(()=>{}); }
function playError(){ document.getElementById('sndError')?.play().catch(()=>{}); }

// WebSocket scoreboard
let ws;
function connectWS(){
  try{
    ws = new WebSocket(`ws://${location.hostname}:8000/ws/scoreboard`);
    ws.onopen = ()=> console.log('WS open');
    ws.onmessage = (ev)=>{
      try{
        const data = JSON.parse(ev.data);
        renderScores(data);
      }catch(e){}
    };
    ws.onerror = (e)=> console.error('Scoreboard WS error', e);
  }catch(e){}
}
connectWS();

async function renderScores(arr){
  const box = document.getElementById('scores');
  if(!arr || arr.length === 0) box.innerText = 'No scores yet 😶';
  else {
    box.innerHTML = '<ol>'+arr.map(s=>`<li>${escapeHtml(s.username)} — ${s.score} pts</li>`).join('')+'</ol>';
  }
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// initial small hints & audio preload (create small beep files inline optional)
