// static/app.js - frontend logic (simple, addictive UX)
(() => {
  const LEVELS = [
    {id:0, title:"Level 0 — FIND LOGIN", hint:"Find the hidden login (inspect, zoom, console)."},
    {id:1, title:"Level 1 — SELECT-TO-REVEAL", hint:"Select invisible text on a page to reveal flag."},
    {id:2, title:"Level 2 — VIEW SOURCE", hint:"Look at page source / static/login.html for a clue."},
    {id:3, title:"Level 3 — CONSOLE EASTER EGG", hint:"Open devtools console."},
    {id:4, title:"Level 4 — ZOOM TINY", hint:"Zoom to 500%."},
    {id:5, title:"Level 5 — EXIF IMAGE", hint:"Inspect EXIF of sample image in /static."},
    {id:6, title:"Level 6 — LOCALSTORAGE", hint:"Check localStorage key 'sssh'."},
    {id:7, title:"Level 7 — ROBOTS", hint:"Open /robots.txt."},
    {id:8, title:"Level 8 — API HEADER", hint:"Use X-CTF header trick (callApiHeader())."},
    {id:9, title:"Level 9 — CAESAR CIPHER", hint:"Decode shift-14."},
    {id:10, title:"Level10 — STEGO LSB", hint:"Download stego and extract bits."},
    {id:11, title:"Level11 — PDF LAYER", hint:"Download /pdf and try select-copy-paste."}
  ];

  const api = (path, opts)=> fetch(path, opts).then(r=>r.json()).catch(e=>({ok:false,msg:'network'}));
  let username = localStorage.getItem("spectre_user") || "guest";

  // intro typing
  const term = document.getElementById("term");
  const lines = [
    "SPECTRE NETWORK INITIALIZING...",
    "LOADING PUZZLES...",
    "ENGAGE AGENT — press ENTER"
  ];
  function typeIntro(cb){
    term.textContent = "";
    let i=0;
    const go = ()=>{
      if(i>=lines.length) { cb(); return; }
      let line = lines[i++], pos=0;
      const t = setInterval(()=> {
        term.textContent += line[pos++] || "\n";
        if(pos>line.length) { clearInterval(t); setTimeout(go, 200); }
      }, 12);
    };
    go();
  }

  document.getElementById("enter").addEventListener("click", ()=> {
    document.getElementById("intro").style.display = "none";
    document.getElementById("app").style.display = "block";
    buildLevels();
    connectWS();
  });

  // build levels UI
  function buildLevels(){
    const container = document.getElementById("levels-list");
    container.innerHTML = "";
    LEVELS.forEach(l=>{
      const card = document.createElement("div");
      card.className = "level-card locked";
      card.dataset.id = l.id;
      card.innerHTML = `<div style="display:flex;justify-content:space-between"><strong>${l.title}</strong><small>Level ${l.id}</small></div>
        <div class="hint">${l.hint}</div>
        <div id="area-${l.id}"></div>`;
      container.appendChild(card);
      renderArea(l.id);
    });
    unlockVisual(0);
    document.getElementById("username").value = username;
    document.getElementById("saveName").onclick = ()=> {
      username = document.getElementById("username").value.trim() || "guest";
      localStorage.setItem("spectre_user", username);
      alert("Handle saved: " + username);
    };
    document.getElementById("reset").onclick = ()=> {
      localStorage.removeItem("spectre_progress");
      alert("Progress reset (local). Refresh to ensure server state unaffected).");
    };
    document.getElementById("cheatHeader").onclick = ()=> {
      // open console info
      console.log("%cUse callApiHeader() in console to request header trick", "color:#ff4b5c;font-size:14px");
      alert("Open console and run callApiHeader()");
    };
  }

  function renderArea(id){
    const area = document.getElementById("area-"+id);
    area.innerHTML = "";
    if(id===0){
      // landing clues: tiny link, invisible text, tiny text to zoom, console hint
      const note = document.createElement("p");
      note.textContent = "Clues combine: hidden dot, invisible text, tiny-zoom and console hint.";
      area.appendChild(note);
      const a = document.createElement("a");
      a.href = "/static/login.html";
      a.textContent = ".";
      a.style.cssText = "position:absolute;right:8px;top:8px;font-size:2px;color:#000";
      area.appendChild(a);
      const inv = document.createElement("p");
      inv.textContent = "login";
      inv.className = "hidden";
      area.appendChild(inv);
      const tiny = document.createElement("p");
      tiny.className = "tiny";
      tiny.textContent = "zoom to see secret";
      area.appendChild(tiny);
      console.log("%cHint: open /static/login.html or inspect this area", "color:#ff6b6b;font-size:14px");
    } else {
      // default challenge UI
      const desc = document.createElement("p");
      desc.textContent = "Submit the flag for this level:";
      area.appendChild(desc);
      if(id === 5){
        const img = document.createElement("img");
        img.src = "/static/exif_sample.jpg";
        img.style.maxWidth = "220px";
        area.appendChild(img);
      }
      if(id === 11){
        const a = document.createElement("a");
        a.href = "/pdf";
        a.textContent = "Download challenge PDF";
        a.className="btn";
        a.target = "_blank";
        area.appendChild(a);
      }
      const input = document.createElement("input");
      input.id = "flag-"+id;
      input.placeholder = "FLAG{...}";
      input.style.marginTop = "8px";
      area.appendChild(input);
      const submit = document.createElement("button");
      submit.className = "btn";
      submit.textContent = "Submit";
      submit.onclick = ()=> submitFlag(id);
      area.appendChild(submit);
      const out = document.createElement("div");
      out.id = "out-"+id;
      area.appendChild(out);
    }
  }

  // submit flag to backend
  async function submitFlag(id){
    const flag = (document.getElementById("flag-"+id) || {}).value || "";
    if(!flag) { alert("Enter flag"); return; }
    const res = await api("/api/verify", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({username, level:id, flag})
    });
    const out = document.getElementById("out-"+id);
    if(res.ok){
      out.innerHTML = `<span style="color:lime">Correct! +${res.points} pts — total ${res.user_score}</span>`;
      unlockVisual(id+1);
    } else {
      out.innerHTML = `<span style="color:#ff6b6b">${res.msg || 'Wrong'}</span>`;
    }
  }

  // header trick helper exposed to console
  window.callApiHeader = async function(){
    const res = await fetch("/api/verify", {
      method:"POST",
      headers: {"Content-Type":"application/json", "X-CTF":"spectre"},
      body: JSON.stringify({username, level:8, flag:""})
    });
    const j = await res.json();
    console.log("Header response:", j);
    alert("Header trick result in console");
  };

  // unlock visual card
  function unlockVisual(level){
    const all = document.querySelectorAll(".level-card");
    all.forEach(c=>{
      const id = parseInt(c.dataset.id,10);
      if(id <= level) c.classList.remove("locked");
      else c.classList.add("locked");
    });
  }

  // scoreboard via websocket; update DOM on update
  let ws;
  function connectWS(){
    ws = new WebSocket((location.protocol==="https:"?"wss://":"ws://") + location.host + "/ws/scoreboard");
    ws.onopen = ()=> console.log("ws open");
    ws.onmessage = (e)=> {
      try {
        const m = JSON.parse(e.data);
        if(m.type === "score_update") loadScoreboard();
      } catch(e){}
    };
    loadScoreboard();
  }

  async function loadScoreboard(){
    const s = document.getElementById("scoreboard");
    const data = await fetch("/api/scoreboard").then(r=>r.json()).catch(()=>[]);
    if(data && data.length){
      s.innerHTML = data.map(u=>`<div><strong>${u[0] || u.username}</strong> — ${u[1] || u.score}</div>`).join("");
    } else {
      s.innerHTML = "<small>No scores yet</small>";
    }
  }

  // run intro typing
  (function init(){
    typeIntro();
    function typeIntro(){
      const pre = document.getElementById("term");
      let i=0;
      const lines = ["SPECTRE NETWORK BOOT","ENGAGE AGENT","PRESS ENTER"];
      (function next(){
        if(i>=lines.length) return;
        let line = lines[i++], pos=0;
        const t = setInterval(()=> {
          pre.textContent += line[pos++] || "\n";
          if(pos>line.length){ clearInterval(t); setTimeout(next,200); }
        },12);
      })();
    }
  })();

})();
