// ===== PAGE NAVIGATION =====
function showPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  el.classList.add('active');

  const titles = {
    dashboard:    ['Dashboard', 'Gewächshaus Übersicht'],
    bewaesserung: ['Bewässerung', 'Zonensteuerung & Automatik'],
    klima:        ['Klima', 'Temperatur, Lüftung & Luftfeuchtigkeit'],
    beleuchtung:  ['Beleuchtung', 'Lichtsteuerung & Zeitprogramm'],
    sensoren:     ['Sensoren', 'Live-Messwerte & Status'],
    zeitplaene:   ['Zeitpläne', 'Automatische Ablaufprogramme'],
    verlauf:      ['Verlauf', 'Ereignisprotokoll'],
  };
  document.getElementById('pageTitle').textContent = titles[id][0];
  document.getElementById('pageSub').textContent   = titles[id][1];

  if (id === 'dashboard') drawChart();
}

// ===== SIDEBAR TOGGLE =====
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  document.getElementById('timeDisplay').textContent =
    now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// ===== LIVE SENSOR SIMULATION =====
function randomIn(min, max, dec = 1) {
  return (Math.random() * (max - min) + min).toFixed(dec);
}

function updateSensors() {
  document.getElementById('tempVal').textContent  = randomIn(22, 27) + '°C';
  document.getElementById('humVal').textContent   = randomIn(60, 78, 0) + '%';
  document.getElementById('lightVal').textContent = randomIn(3800, 5000, 0) + ' lx';
  document.getElementById('soilVal').textContent  = randomIn(38, 58, 0) + '%';
}
setInterval(updateSensors, 4000);

// ===== TOAST =====
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== WATERING =====
function startWater(zone) {
  showToast('💧 Zone ' + zone + ' wird bewässert (10 min)...');
}

// ===== TEMPERATURE ADJUST =====
const heizVal = { val: 22 };
function adjustTemp(type, delta) {
  heizVal.val = Math.min(35, Math.max(10, heizVal.val + delta));
  document.getElementById('heizTemp').textContent   = heizVal.val + '°C';
  document.getElementById('heizTarget').textContent = 'Ziel: ' + heizVal.val + '°C';
  showToast('Heizung: Zieltemperatur ' + heizVal.val + '°C');
}

// ===== LIGHT ICON =====
function updateLight(id, val) {
  const el = document.getElementById(id);
  if (val < 30) el.classList.add('dim');
  else          el.classList.remove('dim');
}

// ===== TEMPERATURE CHART =====
function drawChart() {
  const canvas = document.getElementById('tempChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = canvas.parentElement.clientWidth - 40;
  canvas.height = 200;

  const W = canvas.width, H = canvas.height;
  const data = [18, 19, 21, 23, 24, 25, 26, 25, 24, 24, 23, 22];
  const labels = ['6h','7h','8h','9h','10h','11h','12h','13h','14h','15h','16h','17h'];
  const min = 15, max = 30;
  const pad = { top: 20, right: 20, bottom: 40, left: 40 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top  - pad.bottom;

  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (ch / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(max - ((max - min) / 4) * i) + '°', pad.left - 6, y + 4);
  }

  const xStep = cw / (data.length - 1);

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
  grad.addColorStop(0, 'rgba(34,197,94,0.25)');
  grad.addColorStop(1, 'rgba(34,197,94,0)');
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = pad.left + i * xStep;
    const y = pad.top + ch - ((v - min) / (max - min)) * ch;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.left + (data.length - 1) * xStep, pad.top + ch);
  ctx.lineTo(pad.left, pad.top + ch);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  data.forEach((v, i) => {
    const x = pad.left + i * xStep;
    const y = pad.top + ch - ((v - min) / (max - min)) * ch;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots + Labels
  data.forEach((v, i) => {
    const x = pad.left + i * xStep;
    const y = pad.top + ch - ((v - min) / (max - min)) * ch;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.strokeStyle = '#0f1214';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x, H - 10);
  });
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  drawChart();
  window.addEventListener('resize', drawChart);
});
