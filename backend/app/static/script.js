/* =========================
   MATRIX BACKGROUND EFFECT
   ========================= */
const canvas = document.createElement("canvas");
document.getElementById("matrix").appendChild(canvas);

const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = "01";
const drops = [];

for (let i = 0; i < canvas.width / 10; i++) {
  drops[i] = 1;
}

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00ff00";
  ctx.font = "15px monospace";

  for (let i = 0; i < drops.length; i++) {
    let char = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(char, i * 10, drops[i] * 20);

    if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}
setInterval(drawMatrix, 40);

/* =========================
   LEVEL 0 FLAG SUBMISSION
   ========================= */
function submitFlag() {
  const input = document.getElementById("flagInput").value.trim();
  const result = document.getElementById("result");

  if (input === "FLAG{VIEW_SOURCE_PRO}") {
    result.innerHTML = "✔️ Correct! Redirecting to Level 1…";

    setTimeout(() => {
      window.location.href = "/static/level1.html";
    }, 1500);
  } else {
    result.innerHTML = "❌ Wrong flag. Try harder, agent.";
  }
}
