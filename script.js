// ── MODE TOGGLE ──
let currentMode = 'forward'; // 'forward' | 'reverse'

function toggleMode() {
  currentMode = currentMode === 'forward' ? 'reverse' : 'forward';
  document.getElementById('panelForward').classList.toggle('hidden', currentMode !== 'forward');
  document.getElementById('panelReverse').classList.toggle('hidden', currentMode !== 'reverse');
  document.getElementById('tabForward').classList.toggle('active', currentMode === 'forward');
  document.getElementById('tabReverse').classList.toggle('active', currentMode === 'reverse');
  const btn = document.getElementById('modeToggleBtn');
  btn.innerHTML = currentMode === 'forward'
    ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 4h16M4 12h10M4 20h7"/><path d="M18 8l4 4-4 4"/></svg> Reverse Calculator`
    : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg> Standard Calculator`;
}

function switchTab(mode) {
  if (mode !== currentMode) toggleMode();
}

// ── SAMPLE DATA ──
const SAMPLES = {
  plain_ok:     { weave:'plain',       wm:50,  wf:50,  D:0.200, d:0.200 },
  fine_plain:   { weave:'plain',       wm:200, wf:200, D:0.053, d:0.053 },
  twill_needed: { weave:'twill',       wm:50,  wf:50,  D:0.300, d:0.300 },
  coarse_twill: { weave:'twill',       wm:30,  wf:30,  D:0.500, d:0.500 },
  plain_dutch:  { weave:'plain_dutch', wm:20,  wf:120, D:0.400, d:0.160 },
  plain_dutch2: { weave:'plain_dutch', wm:12,  wf:64,  D:0.560, d:0.200 },
  twill_dutch:  { weave:'twill_dutch', wm:24,  wf:110, D:0.630, d:0.200 },
  twill_dutch2: { weave:'twill_dutch', wm:16,  wf:80,  D:0.800, d:0.250 }
};

function loadSample(key) {
  const s = SAMPLES[key];
  document.getElementById('weaveType').value = s.weave;
  document.getElementById('warpMesh').value  = s.wm;
  document.getElementById('weftMesh').value  = s.wf;
  document.getElementById('warpDia').value   = s.D;
  document.getElementById('weftDia').value   = s.d;
  onWeaveChange();
  calculateMesh();
}

// ── SYNC FIELDS ──
function syncFields(src) {
  const weave = document.getElementById('weaveType').value;
  if (weave !== 'plain' && weave !== 'twill') return;
  if (src === 'warpMesh') document.getElementById('weftMesh').value = document.getElementById('warpMesh').value;
  if (src === 'weftMesh') document.getElementById('warpMesh').value = document.getElementById('weftMesh').value;
  if (src === 'warpDia')  document.getElementById('weftDia').value  = document.getElementById('warpDia').value;
  if (src === 'weftDia')  document.getElementById('warpDia').value  = document.getElementById('weftDia').value;
}

function onWeaveChange() {
  const weave = document.getElementById('weaveType').value;
  const isSquare = (weave === 'plain' || weave === 'twill');
  const isDutch  = (weave === 'plain_dutch' || weave === 'twill_dutch');

  document.getElementById('weftMesh').disabled = isSquare;
  document.getElementById('weftDia').disabled  = isSquare;

  document.getElementById('weftMeshHint').textContent = isSquare
    ? 'Auto-synced with Warp Mesh for square weaves'
    : isDutch ? 'Set weft (fine) mesh independently for Dutch weaves' : '';
  document.getElementById('weftDiaHint').textContent = isSquare
    ? 'Auto-synced with Warp Diameter for square weaves'
    : isDutch ? 'Set weft wire diameter independently for Dutch weaves' : '';

  document.getElementById('labelWarpMesh').textContent = isDutch ? 'Warp Mesh — coarse (wires/inch)' : 'Warp Mesh (wires/inch)';
  document.getElementById('labelWeftMesh').textContent = isDutch ? 'Weft Mesh — fine (wires/inch)'   : 'Weft Mesh (wires/inch)';
  document.getElementById('labelWarpDia').textContent  = isDutch ? 'Warp Wire Diameter D — coarse (mm)' : 'Wire Diameter D (mm)';
  document.getElementById('labelWeftDia').textContent  = isDutch ? 'Weft Wire Diameter d — fine (mm)'   : 'Wire Diameter d (mm)';

  document.getElementById('weaveInfoPlain').classList.toggle('show',      weave === 'plain');
  document.getElementById('weaveInfoTwill').classList.toggle('show',      weave === 'twill');
  document.getElementById('weaveInfoPlainDutch').classList.toggle('show', weave === 'plain_dutch');
  document.getElementById('weaveInfoTwillDutch').classList.toggle('show', weave === 'twill_dutch');

  if (isSquare) {
    document.getElementById('weftMesh').value = document.getElementById('warpMesh').value;
    document.getElementById('weftDia').value  = document.getElementById('warpDia').value;
  }
}

// ── ANIMATE NUMBER ──
function animateValue(id, target, decimals) {
  const el = document.getElementById(id);
  const duration = 900;
  const start = performance.now();
  const to = parseFloat(target);
  el.classList.remove('animating');
  void el.offsetWidth;
  el.classList.add('animating');
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const cur = to * ease;
    el.textContent = decimals ? cur.toFixed(decimals) : Math.round(cur);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = decimals ? to.toFixed(decimals) : Math.round(to);
  }
  requestAnimationFrame(step);
}

// ── VERDICT BANNER ──
const VERDICT_ICONS = {
  plain:       '<circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>',
  twill:       '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="17" r=".8" fill="currentColor"/>',
  plain_dutch: '<circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>',
  twill_dutch: '<circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>'
};

function showVerdict(type, title, detail) {
  const banner = document.getElementById('verdictBanner');
  banner.className = 'verdict-banner verdict-' + type;
  document.getElementById('verdictIcon').innerHTML = VERDICT_ICONS[type] || VERDICT_ICONS.plain;
  document.getElementById('verdictTitle').textContent  = title;
  document.getElementById('verdictDetail').textContent = detail;
  banner.style.display = 'flex';
}

// ── RATIO BAR ──
function barColor(r) { return r <= 0.5 ? '#22c55e' : r <= 0.67 ? '#f59e0b' : '#ef4444'; }

function showRatioBar({ warpR, warpPitch, warpDia, weftR, weftPitch, isDutch }) {
  document.getElementById('ratioCard').style.display = 'block';
  document.getElementById('ratioCardTitle').textContent = isDutch
    ? 'Weave Feasibility — Warp & Weft d/p Ratios'
    : 'Weave Feasibility — d/p Ratio';
  document.getElementById('warpBarLabel').textContent = isDutch ? 'Warp d/p (decisive factor)' : 'Warp d/p';

  const fill = document.getElementById('ratioBarFill');
  fill.style.width = '0%';
  setTimeout(() => { fill.style.width = Math.min(warpR*100, 100)+'%'; fill.style.background = barColor(warpR); }, 50);

  document.getElementById('weftBarSection').style.display = isDutch ? 'block' : 'none';
  document.getElementById('weftRatioVal').style.display   = isDutch ? 'block' : 'none';
  document.getElementById('weftPitchVal').style.display   = isDutch ? 'block' : 'none';
  document.getElementById('simpleRatioExtras').style.display = isDutch ? 'none' : 'block';

  if (isDutch) {
    const fillW = document.getElementById('ratioBarFillWeft');
    fillW.style.width = '0%';
    setTimeout(() => { fillW.style.width = Math.min(weftR*100, 100)+'%'; fillW.style.background = barColor(weftR); }, 80);
    document.getElementById('ratioDpWeft').textContent    = weftR.toFixed(3);
    document.getElementById('ratioPitchWeft').textContent = weftPitch.toFixed(4);
  }

  document.getElementById('ratioDp').textContent        = warpR.toFixed(3);
  document.getElementById('ratioPitchWarp').textContent = warpPitch.toFixed(4);
  document.getElementById('ratioDia').textContent       = warpDia.toFixed(3);
}

// ── MAIN CALCULATE ──
function calculateMesh() {
  const weave = document.getElementById('weaveType').value;
  const wm = parseFloat(document.getElementById('warpMesh').value) || 0;
  const wf = parseFloat(document.getElementById('weftMesh').value) || 0;
  const D  = parseFloat(document.getElementById('warpDia').value)  || 0;
  const d  = parseFloat(document.getElementById('weftDia').value)  || 0;

  document.getElementById('verdictBanner').style.display = 'none';
  document.getElementById('ratioCard').style.display     = 'none';

  const warpPitch = 25.4 / wm;
  const weftPitch = 25.4 / wf;
  const warpRatio = D / warpPitch;
  const weftRatio = d / weftPitch;

  let opening, thickness, weight, dynLabel, dynValue, dynUnit;

  if (weave === 'plain' || weave === 'twill') {
    opening   = (warpPitch - D) * 1000;
    thickness = D * 2;
    const openArea = Math.pow(1 - (wm * D) / 25.4, 2) * 100;
    weight    = D * D * 0.493 * wm;
    dynLabel  = 'Open Area';
    dynValue  = openArea;
    dynUnit   = '% open area';

    showRatioBar({ warpR: warpRatio, warpPitch, warpDia: D, isDutch: false });

    if (weave === 'plain') {
      if (warpRatio <= 0.5) {
        showVerdict('plain',
          `✅ Plain Weave — Feasible (d/p = ${warpRatio.toFixed(3)})`,
          `d/p ≤ 0.5  →  Wire is thin enough to crimp over every adjacent wire. Plain over-1 under-1 is geometrically possible.`
        );
      } else if (warpRatio <= 0.67) {
        showVerdict('twill',
          `⚠️ Plain Weave NOT feasible — Switch to Twill (d/p = ${warpRatio.toFixed(3)})`,
          `d/p > 0.5  →  Wire is too thick to crimp in plain weave. Twill (over-2 under-2) gives a longer crimp path and can accommodate this ratio.`
        );
      } else {
        showVerdict('twill',
          `❌ Plain Weave NOT feasible — Heavy Twill or Dutch required (d/p = ${warpRatio.toFixed(3)})`,
          `d/p > 0.67  →  Very dense packing. Plain weave is geometrically impossible. Use Twill Dutch weave for this specification.`
        );
      }
    } else {
      if (warpRatio <= 0.5) {
        showVerdict('plain',
          `ℹ️ Twill selected — Plain Weave is also feasible (d/p = ${warpRatio.toFixed(3)})`,
          `d/p ≤ 0.5  →  This spec can be made in plain weave too. Twill chosen will also work fine.`
        );
      } else if (warpRatio <= 0.67) {
        showVerdict('twill',
          `✅ Twill Weave — Correct choice (d/p = ${warpRatio.toFixed(3)})`,
          `d/p > 0.5  →  Plain weave not feasible. Twill (over-2 under-2) is the right weave for this wire-to-pitch ratio.`
        );
      } else {
        showVerdict('twill',
          `⚠️ Twill Weave — Marginal; Dutch Twill advised (d/p = ${warpRatio.toFixed(3)})`,
          `d/p > 0.67  →  Very tight packing. Standard twill is at its limit. Consider switching to Twill Dutch weave for best results.`
        );
      }
    }

  } else {
    // Dutch Weaves
    const L = warpPitch;
    opening   = D * ((L - D - d) / (L + D + d)) * 1000;
    thickness = D + d + d;
    weight    = (D*D * 0.493 * wm) / 2 + (d*d * 0.493 * wf) / 2;
    const constant = wf * d;
    dynLabel  = 'Dutch Constant';
    dynValue  = constant;
    dynUnit   = 'nf × d';

    showRatioBar({ warpR: warpRatio, warpPitch, warpDia: D, weftR: weftRatio, weftPitch, isDutch: true });

    if (weave === 'plain_dutch') {
      if (warpRatio <= 0.5) {
        showVerdict('plain_dutch',
          `✅ Plain Dutch Weave — Feasible (warp d/p = ${warpRatio.toFixed(3)})`,
          `Warp d/p ≤ 0.5  →  Warp wires can be crimped in plain (over-1 under-1) pattern. `
          + `Weft is packed tight (d/p = ${weftRatio.toFixed(3)} > 0.5) — that's the Dutch characteristic. Spec is geometrically valid.`
        );
      } else {
        showVerdict('twill_dutch',
          `⚠️ Plain Dutch NOT feasible — Switch to Twill Dutch (warp d/p = ${warpRatio.toFixed(3)})`,
          `Warp d/p > 0.5  →  Warp wires are too thick for plain crimping. `
          + `Twill Dutch (over-2 under-2 on warp) is required to accommodate this warp wire diameter at this mesh count.`
        );
      }
    } else {
      if (warpRatio > 0.5) {
        showVerdict('twill_dutch',
          `✅ Twill Dutch Weave — Feasible (warp d/p = ${warpRatio.toFixed(3)})`,
          `Warp d/p > 0.5  →  Warp wires need twill crimping (over-2 under-2). `
          + `Weft is densely packed (d/p = ${weftRatio.toFixed(3)}). Twill Dutch is the correct weave for this specification.`
        );
      } else {
        showVerdict('plain_dutch',
          `ℹ️ Twill Dutch selected — Plain Dutch is also feasible (warp d/p = ${warpRatio.toFixed(3)})`,
          `Warp d/p ≤ 0.5  →  Plain Dutch weave can also accommodate this specification. `
          + `Twill Dutch will work but Plain Dutch may offer simpler manufacture.`
        );
      }
    }
  }

  document.getElementById('dynLabel').textContent = dynLabel;
  document.getElementById('dynUnit').textContent  = dynUnit;

  animateValue('opening',   Math.max(0, opening),  false);
  animateValue('thickness', thickness,              3);
  animateValue('dynValue',  dynValue,               (weave === 'plain_dutch' || weave === 'twill_dutch') ? 3 : 1);
  animateValue('weight',    weight,                 3);

  const isDutch = (weave === 'plain_dutch' || weave === 'twill_dutch');
  const weaveLabels = { plain:'Plain', twill:'Twill', plain_dutch:'Plain Dutch', twill_dutch:'Twill Dutch' };
  let html = `
    <div class="summary-item"><p>Weave</p><p>${weaveLabels[weave]}</p></div>
    <div class="summary-item"><p>Warp Mesh</p><p>${wm || '—'} /in</p></div>
    <div class="summary-item"><p>Warp Dia D</p><p>${D} mm</p></div>
    <div class="summary-item"><p>Warp Pitch</p><p>${warpPitch.toFixed(4)} mm</p></div>`;
  if (isDutch) {
    html += `
    <div class="summary-item"><p>Weft Mesh</p><p>${wf || '—'} /in</p></div>
    <div class="summary-item"><p>Weft Dia d</p><p>${d} mm</p></div>
    <div class="summary-item"><p>Weft Pitch</p><p>${weftPitch.toFixed(4)} mm</p></div>
    <div class="summary-item"><p>Warp d/p</p><p>${warpRatio.toFixed(3)} ${warpRatio <= 0.5 ? '✅' : '⚠️'}</p></div>`;
  } else {
    html += `
    <div class="summary-item"><p>d/p Ratio</p><p>${warpRatio.toFixed(3)}</p></div>
    <div class="summary-item"><p>Plain Limit</p><p>d/p ≤ 0.50</p></div>
    <div class="summary-item"><p>Twill Limit</p><p>d/p ≤ 0.67</p></div>
    <div class="summary-item"><p>Feasibility</p><p>${warpRatio <= 0.5 ? '✅ Plain OK' : warpRatio <= 0.67 ? '⚠️ Twill req.' : '❌ Dutch req.'}</p></div>`;
  }
  document.getElementById('summaryGrid').innerHTML = html;
}

// ── RESET (forward) ──
function resetForm() {
  ['warpMesh','weftMesh','warpDia','weftDia'].forEach(id => document.getElementById(id).value = '');
  ['opening','thickness','dynValue','weight'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('animating');
    el.textContent = '—';
  });
  document.getElementById('summaryGrid').innerHTML = '';
  document.getElementById('verdictBanner').style.display = 'none';
  document.getElementById('ratioCard').style.display     = 'none';
}

// ──────────────────────────────────────────────────────────
// ── REVERSE CALCULATOR LOGIC ──
// ──────────────────────────────────────────────────────────

let reverseUnknown = 'mesh'; // 'mesh' | 'diameter'

// Standard wire diameters (mm) from wire gauge standards
const STD_DIAMETERS = [
  0.025, 0.032, 0.040, 0.050, 0.053, 0.063, 0.071, 0.080, 0.090, 0.100,
  0.112, 0.125, 0.140, 0.160, 0.180, 0.200, 0.224, 0.250, 0.280, 0.315,
  0.355, 0.400, 0.450, 0.500, 0.560, 0.630, 0.710, 0.800, 0.900, 1.000,
  1.120, 1.250, 1.400, 1.600, 1.800, 2.000
];

// Standard mesh counts (wires/inch)
const STD_MESHES = [
  4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20, 24, 28, 30, 32, 35, 40, 48, 50,
  60, 65, 70, 80, 100, 110, 120, 150, 165, 200, 230, 270, 325, 400, 500
];

function onReverseWeaveChange() {
  const weave = document.getElementById('rWeaveType').value;
  const isDutch = (weave === 'plain_dutch' || weave === 'twill_dutch');
  document.getElementById('rSquareInputs').style.display = isDutch ? 'none' : 'block';
  document.getElementById('rDutchInputs').style.display  = isDutch ? 'block' : 'none';
  updateReverseInfoPill();
  document.getElementById('reverseResults').innerHTML = '';
  // re-apply unknown toggle for dutch sub-panels
  applyUnknownToDutch();
}

function applyUnknownToDutch() {
  const solveMesh = reverseUnknown === 'mesh';
  document.getElementById('rDutchSolveMesh').style.display = solveMesh ? 'block' : 'none';
  document.getElementById('rDutchSolveDia').style.display  = solveMesh ? 'none'  : 'block';
}

function selectUnknown(val) {
  reverseUnknown = val;
  document.getElementById('optMesh').classList.toggle('selected', val === 'mesh');
  document.getElementById('optDia').classList.toggle('selected', val === 'diameter');

  // square weave panels
  document.getElementById('rInputMesh').style.display = val === 'diameter' ? 'block' : 'none';
  document.getElementById('rInputDia').style.display  = val === 'mesh'     ? 'block' : 'none';

  // dutch weave sub-panels
  applyUnknownToDutch();

  updateReverseInfoPill();
  document.getElementById('reverseResults').innerHTML = '';
}

function updateReverseInfoPill() {
  const weave = document.getElementById('rWeaveType').value;
  const isDutch = (weave === 'plain_dutch' || weave === 'twill_dutch');
  const pill = document.getElementById('rInfoPill');
  if (!isDutch) {
    pill.textContent = reverseUnknown === 'mesh'
      ? 'Enter opening (µm) + wire diameter → calculates the required mesh count.'
      : 'Enter opening (µm) + mesh count → calculates the required wire diameter.';
  } else {
    pill.textContent = reverseUnknown === 'mesh'
      ? 'Dutch: enter opening (µm) + both wire diameters + weft mesh → finds warp mesh count.'
      : 'Dutch: enter opening (µm) + warp mesh + weft wire diameter + weft mesh → finds warp wire diameter.';
  }
}

// ── Dutch opening formula (forward):
//   opening = D * (L - D - d) / (L + D + d)   where L = warp pitch = 25.4/wm
//
// Reverse for warp mesh (wm):
//   Given: opening_mm, D, d, wf  →  find wm
//   Let L = warp pitch = 25.4/wm
//   opening_mm = D*(L - D - d)/(L + D + d)
//   opening_mm*(L + D + d) = D*(L - D - d)
//   opening_mm*L + opening_mm*(D+d) = D*L - D*(D+d)
//   L*(opening_mm - D) = -D*(D+d) - opening_mm*(D+d)
//   L*(opening_mm - D) = -(D+d)*(D + opening_mm)
//   L = -(D+d)*(D + opening_mm) / (opening_mm - D)
//   L = (D+d)*(D + opening_mm) / (D - opening_mm)
//   wm = 25.4 / L
//
// Reverse for warp dia D:
//   Given: opening_mm, wm, d, wf  →  find D
//   L = 25.4/wm  (known)
//   opening_mm*(L + D + d) = D*(L - D - d)
//   opening_mm*L + opening_mm*D + opening_mm*d = D*L - D^2 - D*d
//   D^2 + D*(opening_mm + L + d) - D*L + opening_mm*L + opening_mm*d = 0
//   D^2 + D*(opening_mm + d - L + L) ... re-expand carefully:
//   D^2 + opening_mm*D + D*d + D*L + opening_mm*L + opening_mm*d - D*L + D^2 ... wait
//   Let me re-derive cleanly:
//   opening*(L+D+d) = D*(L-D-d)
//   opening*L + opening*D + opening*d = D*L - D^2 - D*d
//   D^2 + D*(opening + d - L + opening + d) ... hmm, collect D terms:
//   D^2 + D*(opening + d) + D*L - D*L + D*d + D^2 ... let me be very explicit:
//   Move everything to one side:
//   opening*L + opening*D + opening*d - D*L + D^2 + D*d = 0
//   D^2 + D*(opening - L + d + opening ... no
//
//   More carefully:
//   opening*(L + D + d) = D*(L - D - d)
//   opening*L + opening*D + opening*d = D*L - D² - D*d
//   D² + D*d + opening*D - D*L + D*d + opening*d + opening*L = 0  ... NO, let me just move all to left:
//   opening*L + opening*D + opening*d - D*L + D² + D*d = 0
//   D² + D*(opening + d - L + d ... wait: coefficients of D:
//   from opening*D → +opening
//   from -D*L     → -L
//   from D*d      → +d
//   So: D² + D*(opening - L + d) + opening*(L + d) = 0
//   quadratic in D: a=1, b=(opening - L + d), c=opening*(L+d)
//   D = [-b ± sqrt(b²-4c)] / 2

function dutchReverseWarpMesh(openingMm, D, d) {
  // L = (D + d) * (D + openingMm) / (D - openingMm)
  if (D <= openingMm) return null; // no solution (opening must be < D for Dutch)
  const L = (D + d) * (D + openingMm) / (D - openingMm);
  if (L <= 0) return null;
  return 25.4 / L;
}

function dutchReverseWarpDia(openingMm, wm, d) {
  const L = 25.4 / wm;
  // D² + D*(openingMm - L + d) + openingMm*(L + d) = 0
  const a = 1;
  const b = openingMm - L + d;
  const c = openingMm * (L + d);
  const disc = b*b - 4*a*c;
  if (disc < 0) return null;
  const D1 = (-b + Math.sqrt(disc)) / 2;
  const D2 = (-b - Math.sqrt(disc)) / 2;
  // pick positive root that makes physical sense (D > 0, D > openingMm for Dutch)
  const candidates = [D1, D2].filter(v => v > 0 && v > openingMm);
  if (!candidates.length) return null;
  return Math.min(...candidates);
}

function dutchOpeningCheck(wm, D, d) {
  // verify: opening = D*(L-D-d)/(L+D+d)
  const L = 25.4 / wm;
  return D * (L - D - d) / (L + D + d) * 1000; // µm
}

function dutchFeasibility(wm, D, weave) {
  const warpPitch = 25.4 / wm;
  const ratio = D / warpPitch;
  if (weave === 'plain_dutch') {
    return ratio <= 0.5
      ? { label: '✅ Plain Dutch — Warp d/p OK', color: 'var(--green)', bg: 'var(--green-light)' }
      : { label: '⚠️ Warp d/p > 0.5 — Switch to Twill Dutch', color: 'var(--amber)', bg: 'var(--amber-light)' };
  } else {
    return ratio > 0.5
      ? { label: '✅ Twill Dutch — Warp d/p correct', color: 'var(--green)', bg: 'var(--green-light)' }
      : { label: 'ℹ️ Warp d/p ≤ 0.5 — Plain Dutch also feasible', color: 'var(--blue)', bg: 'var(--blue-light)' };
  }
}

function calculateReverse() {
  const openingMicron = parseFloat(document.getElementById('rOpening').value) || 0;
  const weave = document.getElementById('rWeaveType').value;
  const isDutch = (weave === 'plain_dutch' || weave === 'twill_dutch');

  if (openingMicron <= 0) { showReverseError('Please enter a valid opening size in microns.'); return; }
  const openingMm = openingMicron / 1000;

  let resultsHTML = '';

  if (!isDutch) {
    // ── SQUARE WEAVE (plain / twill) ──
    if (reverseUnknown === 'mesh') {
      const D = parseFloat(document.getElementById('rWarpDia').value) || 0;
      if (D <= 0) { showReverseError('Please enter a valid wire diameter.'); return; }

      const pitch = openingMm + D;
      const mesh  = 25.4 / pitch;
      const ratio = D / pitch;
      const openArea = Math.pow(1 - (mesh * D) / 25.4, 2) * 100;
      const thickness = D * 2;
      const weight = D * D * 0.493 * mesh;

      const feas = ratio <= 0.5
        ? { label: '✅ Plain Weave OK', color: 'var(--green)', bg: 'var(--green-light)' }
        : ratio <= 0.67
          ? { label: '⚠️ Twill Weave needed', color: 'var(--amber)', bg: 'var(--amber-light)' }
          : { label: '❌ Dutch Weave required', color: 'var(--red)', bg: 'var(--red-light)' };

      resultsHTML = `
        <div class="solve-result-card">
          <div class="src-eyebrow">Result — Warp Mesh Count</div>
          <div class="solve-result-row">
            <div>
              <div class="solve-big">${mesh.toFixed(2)}</div>
              <div class="solve-unit">wires / inch</div>
            </div>
            <div class="solve-divider"></div>
            <div class="solve-sub-grid">
              <div class="solve-sub-item"><p>Pitch</p><p>${pitch.toFixed(4)} mm</p></div>
              <div class="solve-sub-item"><p>d/p Ratio</p><p>${ratio.toFixed(3)}</p></div>
              <div class="solve-sub-item"><p>Open Area</p><p>${openArea.toFixed(1)}%</p></div>
              <div class="solve-sub-item"><p>Thickness</p><p>${thickness.toFixed(3)} mm</p></div>
              <div class="solve-sub-item"><p>Weight</p><p>${weight.toFixed(3)} kg/m²</p></div>
              <div class="solve-sub-item"><p>Opening</p><p>${openingMicron} µm ✓</p></div>
            </div>
          </div>
          <div style="margin-top:12px;padding:8px 12px;border-radius:7px;font-size:0.78rem;font-weight:600;
            background:${feas.bg};color:${feas.color};border:1px solid ${feas.color}33;">
            ${feas.label} &nbsp;·&nbsp; d/p = ${ratio.toFixed(3)}
          </div>
        </div>
        <div class="solve-result-card">
          <div class="src-eyebrow">Nearest Standard Mesh Counts</div>
          ${nearestMeshSuggestions(mesh, D, openingMicron, false)}
        </div>`;

    } else {
      // solve for diameter
      const mesh = parseFloat(document.getElementById('rWarpMesh').value) || 0;
      if (mesh <= 0) { showReverseError('Please enter a valid mesh count.'); return; }

      const pitch = 25.4 / mesh;
      const D = pitch - openingMm;

      if (D <= 0) {
        showReverseError(`Opening (${openingMicron} µm) ≥ pitch (${(pitch*1000).toFixed(0)} µm) at ${mesh} mesh. Reduce opening or increase mesh.`);
        return;
      }

      const ratio = D / pitch;
      const openArea = Math.pow(1 - (mesh * D) / 25.4, 2) * 100;
      const thickness = D * 2;
      const weight = D * D * 0.493 * mesh;

      const feas = ratio <= 0.5
        ? { label: '✅ Plain Weave OK', color: 'var(--green)', bg: 'var(--green-light)' }
        : ratio <= 0.67
          ? { label: '⚠️ Twill Weave needed', color: 'var(--amber)', bg: 'var(--amber-light)' }
          : { label: '❌ Dutch Weave required', color: 'var(--red)', bg: 'var(--red-light)' };

      resultsHTML = `
        <div class="solve-result-card">
          <div class="src-eyebrow">Result — Wire Diameter</div>
          <div class="solve-result-row">
            <div>
              <div class="solve-big">${(D*1000).toFixed(1)}</div>
              <div class="solve-unit">µm &nbsp;=&nbsp; ${D.toFixed(4)} mm</div>
            </div>
            <div class="solve-divider"></div>
            <div class="solve-sub-grid">
              <div class="solve-sub-item"><p>Pitch</p><p>${pitch.toFixed(4)} mm</p></div>
              <div class="solve-sub-item"><p>d/p Ratio</p><p>${ratio.toFixed(3)}</p></div>
              <div class="solve-sub-item"><p>Open Area</p><p>${openArea.toFixed(1)}%</p></div>
              <div class="solve-sub-item"><p>Thickness</p><p>${thickness.toFixed(3)} mm</p></div>
              <div class="solve-sub-item"><p>Weight</p><p>${weight.toFixed(3)} kg/m²</p></div>
              <div class="solve-sub-item"><p>Opening</p><p>${openingMicron} µm ✓</p></div>
            </div>
          </div>
          <div style="margin-top:12px;padding:8px 12px;border-radius:7px;font-size:0.78rem;font-weight:600;
            background:${feas.bg};color:${feas.color};border:1px solid ${feas.color}33;">
            ${feas.label} &nbsp;·&nbsp; d/p = ${ratio.toFixed(3)}
          </div>
        </div>
        <div class="solve-result-card">
          <div class="src-eyebrow">Nearest Standard Wire Diameters</div>
          ${nearestDiaSuggestions(D, mesh, openingMicron, false)}
        </div>`;
    }

  } else {
    // ── DUTCH WEAVE (plain_dutch / twill_dutch) ──
    if (reverseUnknown === 'mesh') {
      // Known: opening + D + d + wf → find wm
      const D  = parseFloat(document.getElementById('rDutchD').value)       || 0;
      const d  = parseFloat(document.getElementById('rDutchd').value)       || 0;
      const wf = parseFloat(document.getElementById('rDutchWeftMesh').value) || 0;
      if (D <= 0 || d <= 0 || wf <= 0) { showReverseError('Please fill in all three known values (D, d, weft mesh).'); return; }
      if (D <= d)  { showReverseError('Warp diameter D must be larger than weft diameter d in Dutch weave.'); return; }
      if (D <= openingMm) { showReverseError(`Wire diameter D (${D} mm) must be greater than opening (${openingMm.toFixed(4)} mm) for Dutch weave geometry.`); return; }

      const wm = dutchReverseWarpMesh(openingMm, D, d);
      if (!wm || wm <= 0) { showReverseError('No valid solution found. Check that opening < D and geometry is feasible.'); return; }

      const warpPitch = 25.4 / wm;
      const weftPitch = 25.4 / wf;
      const warpRatio = D / warpPitch;
      const weftRatio = d / weftPitch;
      const thickness = D + 2*d;
      const weight = (D*D*0.493*wm)/2 + (d*d*0.493*wf)/2;
      const constant = wf * d;
      const verifyOpening = dutchOpeningCheck(wm, D, d);
      const feas = dutchFeasibility(wm, D, weave);

      resultsHTML = `
        <div class="solve-result-card">
          <div class="src-eyebrow">Result — Warp Mesh Count (Dutch)</div>
          <div class="solve-result-row">
            <div>
              <div class="solve-big">${wm.toFixed(2)}</div>
              <div class="solve-unit">wires / inch (warp)</div>
            </div>
            <div class="solve-divider"></div>
            <div class="solve-sub-grid">
              <div class="solve-sub-item"><p>Warp Pitch</p><p>${warpPitch.toFixed(4)} mm</p></div>
              <div class="solve-sub-item"><p>Warp d/p</p><p>${warpRatio.toFixed(3)} ${warpRatio<=0.5?'✅':'⚠️'}</p></div>
              <div class="solve-sub-item"><p>Weft d/p</p><p>${weftRatio.toFixed(3)}</p></div>
              <div class="solve-sub-item"><p>Thickness</p><p>${thickness.toFixed(3)} mm</p></div>
              <div class="solve-sub-item"><p>Dutch Const.</p><p>${constant.toFixed(3)}</p></div>
              <div class="solve-sub-item"><p>Opening ✓</p><p>${verifyOpening.toFixed(1)} µm</p></div>
            </div>
          </div>
          <div style="margin-top:12px;padding:8px 12px;border-radius:7px;font-size:0.78rem;font-weight:600;
            background:${feas.bg};color:${feas.color};border:1px solid ${feas.color}33;">
            ${feas.label} &nbsp;·&nbsp; Warp d/p = ${warpRatio.toFixed(3)}
          </div>
        </div>
        <div class="solve-result-card">
          <div class="src-eyebrow">Nearest Standard Warp Mesh Counts</div>
          ${nearestMeshSuggestions(wm, D, openingMicron, true, d, wf)}
        </div>`;

    } else {
      // Known: opening + wm + d + wf → find D
      const wm = parseFloat(document.getElementById('rDutchWarpMesh').value)  || 0;
      const d  = parseFloat(document.getElementById('rDutchdKnown').value)    || 0;
      const wf = parseFloat(document.getElementById('rDutchWeftMesh2').value) || 0;
      if (wm <= 0 || d <= 0 || wf <= 0) { showReverseError('Please fill in all three known values (warp mesh, d, weft mesh).'); return; }

      const D = dutchReverseWarpDia(openingMm, wm, d);
      if (!D || D <= 0) { showReverseError('No valid solution found. The opening may be too large for this mesh/diameter combination.'); return; }
      if (D <= d) { showReverseError(`Calculated warp diameter D (${D.toFixed(4)} mm) ≤ weft diameter d (${d} mm). Adjust inputs.`); return; }

      const warpPitch = 25.4 / wm;
      const weftPitch = 25.4 / wf;
      const warpRatio = D / warpPitch;
      const weftRatio = d / weftPitch;
      const thickness = D + 2*d;
      const weight = (D*D*0.493*wm)/2 + (d*d*0.493*wf)/2;
      const constant = wf * d;
      const verifyOpening = dutchOpeningCheck(wm, D, d);
      const feas = dutchFeasibility(wm, D, weave);

      resultsHTML = `
        <div class="solve-result-card">
          <div class="src-eyebrow">Result — Warp Wire Diameter D (Dutch)</div>
          <div class="solve-result-row">
            <div>
              <div class="solve-big">${(D*1000).toFixed(1)}</div>
              <div class="solve-unit">µm &nbsp;=&nbsp; ${D.toFixed(4)} mm (warp)</div>
            </div>
            <div class="solve-divider"></div>
            <div class="solve-sub-grid">
              <div class="solve-sub-item"><p>Warp Pitch</p><p>${warpPitch.toFixed(4)} mm</p></div>
              <div class="solve-sub-item"><p>Warp d/p</p><p>${warpRatio.toFixed(3)} ${warpRatio<=0.5?'✅':'⚠️'}</p></div>
              <div class="solve-sub-item"><p>Weft d/p</p><p>${weftRatio.toFixed(3)}</p></div>
              <div class="solve-sub-item"><p>Thickness</p><p>${thickness.toFixed(3)} mm</p></div>
              <div class="solve-sub-item"><p>Dutch Const.</p><p>${constant.toFixed(3)}</p></div>
              <div class="solve-sub-item"><p>Opening ✓</p><p>${verifyOpening.toFixed(1)} µm</p></div>
            </div>
          </div>
          <div style="margin-top:12px;padding:8px 12px;border-radius:7px;font-size:0.78rem;font-weight:600;
            background:${feas.bg};color:${feas.color};border:1px solid ${feas.color}33;">
            ${feas.label} &nbsp;·&nbsp; Warp d/p = ${warpRatio.toFixed(3)}
          </div>
        </div>
        <div class="solve-result-card">
          <div class="src-eyebrow">Nearest Standard Warp Wire Diameters</div>
          ${nearestDiaSuggestions(D, wm, openingMicron, true, d, wf)}
        </div>`;
    }
  }

  document.getElementById('reverseResults').innerHTML = resultsHTML;
}

// ── NEAREST SUGGESTIONS ──

function nearestMeshSuggestions(calcMesh, D, targetOpeningMicron, isDutch, d, wf) {
  const candidates = STD_MESHES.slice();
  candidates.sort((a, b) => Math.abs(a - calcMesh) - Math.abs(b - calcMesh));
  const top3 = candidates.slice(0, 3);

  return top3.map(m => {
    let actualOpening, ratio;
    if (isDutch) {
      actualOpening = dutchOpeningCheck(m, D, d);
      ratio = D / (25.4 / m);
    } else {
      const pitch = 25.4 / m;
      actualOpening = (pitch - D) * 1000;
      ratio = D / pitch;
    }
    const diff = actualOpening - targetOpeningMicron;
    const diffStr = (diff >= 0 ? '+' : '') + diff.toFixed(0);
    const active = Math.abs(m - calcMesh) < 0.5;
    const ratioTag = isDutch ? ` · warp d/p ${ratio.toFixed(3)} ${ratio<=0.5?'✅':'⚠️'}` : '';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;
      margin-bottom:6px; border-radius:8px; border:1px solid ${active?'var(--blue-border)':'var(--border)'};
      background:${active?'var(--blue-light)':'var(--bg)'};">
      <div>
        <span style="font-weight:700;font-family:'DM Mono',monospace;font-size:0.9rem;">${m} mesh</span>
        <span style="font-size:0.72rem;color:var(--text-muted);margin-left:8px;">→ ${Math.max(0,actualOpening).toFixed(0)} µm${ratioTag}</span>
      </div>
      <span style="font-size:0.72rem;font-weight:600;color:${diff>=0?'var(--green)':'var(--red)'};">${diffStr} µm</span>
    </div>`;
  }).join('');
}

function nearestDiaSuggestions(calcD, mesh, targetOpeningMicron, isDutch, d, wf) {
  const candidates = STD_DIAMETERS.slice();
  candidates.sort((a, b) => Math.abs(a - calcD) - Math.abs(b - calcD));
  const top3 = candidates.filter(v => !isDutch || v > (d||0)).slice(0, 3);

  return top3.map(D => {
    let actualOpening, ratio;
    if (isDutch) {
      actualOpening = dutchOpeningCheck(mesh, D, d);
      ratio = D / (25.4 / mesh);
    } else {
      const pitch = 25.4 / mesh;
      actualOpening = (pitch - D) * 1000;
      ratio = D / pitch;
    }
    const diff = actualOpening - targetOpeningMicron;
    const diffStr = (diff >= 0 ? '+' : '') + diff.toFixed(0);
    const active = Math.abs(D - calcD) < 0.001;
    const ratioTag = isDutch ? ` · d/p ${ratio.toFixed(3)} ${ratio<=0.5?'✅':'⚠️'}` : '';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;
      margin-bottom:6px; border-radius:8px; border:1px solid ${active?'var(--blue-border)':'var(--border)'};
      background:${active?'var(--blue-light)':'var(--bg)'};">
      <div>
        <span style="font-weight:700;font-family:'DM Mono',monospace;font-size:0.9rem;">${D.toFixed(3)} mm</span>
        <span style="font-size:0.72rem;color:var(--text-muted);margin-left:8px;">→ ${Math.max(0,actualOpening).toFixed(0)} µm${ratioTag}</span>
      </div>
      <span style="font-size:0.72rem;font-weight:600;color:${diff>=0?'var(--green)':'var(--red)'};">${diffStr} µm</span>
    </div>`;
  }).join('');
}

// ── QUICK EXAMPLE LOADER ──
function rLoadSample(s) {
  document.getElementById('rWeaveType').value = s.weave;
  document.getElementById('rOpening').value   = s.opening;
  onReverseWeaveChange();
  selectUnknown(s.unknown);

  const isDutch = (s.weave === 'plain_dutch' || s.weave === 'twill_dutch');
  if (!isDutch) {
    if (s.unknown === 'mesh' && s.D) document.getElementById('rWarpDia').value  = s.D;
    if (s.unknown === 'diameter' && s.mesh) document.getElementById('rWarpMesh').value = s.mesh;
  } else {
    if (s.unknown === 'mesh') {
      if (s.D)  document.getElementById('rDutchD').value        = s.D;
      if (s.d)  document.getElementById('rDutchd').value        = s.d;
      if (s.wf) document.getElementById('rDutchWeftMesh').value = s.wf;
    } else {
      if (s.wm) document.getElementById('rDutchWarpMesh').value  = s.wm;
      if (s.d)  document.getElementById('rDutchdKnown').value    = s.d;
      if (s.wf) document.getElementById('rDutchWeftMesh2').value = s.wf;
    }
  }
  calculateReverse();
}

function showReverseError(msg) {
  document.getElementById('reverseResults').innerHTML = `
    <div style="padding:16px 18px; border-radius:10px; background:var(--red-light);
      border:1px solid var(--red-border); color:var(--red); font-size:0.85rem; font-weight:500;">
      ⚠️ ${msg}
    </div>`;
}

function resetReverse() {
  ['rOpening','rWarpDia','rWarpMesh',
   'rDutchD','rDutchd','rDutchWeftMesh',
   'rDutchWarpMesh','rDutchdKnown','rDutchWeftMesh2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('reverseResults').innerHTML = '';
}

// ──────────────────────────────────────────────────────────
// ── MICRON EXPLORER ──
// Given a target opening (µm), scan standard mesh counts and
// standard wire diameters to find feasible combinations across
// Plain, Twill, Plain Dutch and Twill Dutch weaves.
// ──────────────────────────────────────────────────────────

let micronDebounce = null;

function onMicronInput() {
  clearTimeout(micronDebounce);
  micronDebounce = setTimeout(runMicronExplorer, 250);
}

function micronWeaveMeta(type) {
  return {
    plain:       { label: 'Plain',       cls: 'plain',       badge: 'badge-plain' },
    twill:       { label: 'Twill',       cls: 'twill',       badge: 'badge-twill' },
    plain_dutch: { label: 'Plain Dutch', cls: 'plain_dutch', badge: 'badge-plain-dutch' },
    twill_dutch: { label: 'Twill Dutch', cls: 'twill_dutch', badge: 'badge-twill-dutch' }
  }[type];
}

// Scan square weaves (plain / twill): pitch = opening + D, mesh = 25.4/pitch.
// For each standard diameter, find nearest standard mesh and re-derive the
// actual opening that mesh+dia combo gives, then classify by d/p ratio.
function scanSquareWeaves(openingMicron) {
  const openingMm = openingMicron / 1000;
  const out = [];

  STD_DIAMETERS.forEach(D => {
    const idealPitch = openingMm + D;
    if (idealPitch <= 0) return;
    const idealMesh = 25.4 / idealPitch;
    if (idealMesh < 4 || idealMesh > 500) return;

    // nearest standard mesh to the ideal one
    let nearestMesh = STD_MESHES[0];
    let bestDiff = Infinity;
    STD_MESHES.forEach(m => {
      const diff = Math.abs(m - idealMesh);
      if (diff < bestDiff) { bestDiff = diff; nearestMesh = m; }
    });

    const pitch = 25.4 / nearestMesh;
    const actualOpeningUm = (pitch - D) * 1000;
    if (actualOpeningUm <= 0) return;

    const ratio = D / pitch;
    const weave = ratio <= 0.5 ? 'plain' : (ratio <= 0.67 ? 'twill' : null);
    if (!weave) return; // too tight for square weave at all — skip

    const diffUm = actualOpeningUm - openingMicron;
    const pctDiff = Math.abs(diffUm) / openingMicron;
    if (pctDiff > 0.18) return; // keep only reasonably close matches

    out.push({
      weave, mesh: nearestMesh, wf: nearestMesh, D, d: D,
      openingUm: actualOpeningUm, ratio, diffUm, pctDiff
    });
  });

  return out;
}

// Scan Dutch weaves: pick a fine weft mesh/dia pair, then solve for warp
// mesh given a coarse warp diameter, snapping to nearest standard warp mesh.
function scanDutchWeaves(openingMicron) {
  const openingMm = openingMicron / 1000;
  const out = [];

  // Candidate weft (fine) diameters — must be noticeably finer than warp.
  const weftCandidates = STD_DIAMETERS.filter(d => d <= 0.5);

  STD_DIAMETERS.forEach(D => {
    weftCandidates.forEach(d => {
      if (D <= d * 1.15) return; // warp must be meaningfully thicker than weft
      if (D <= openingMm) return; // Dutch geometry requires D > opening

      const idealWm = dutchReverseWarpMesh(openingMm, D, d);
      if (!idealWm || idealWm < 4 || idealWm > 500) return;

      let nearestWm = STD_MESHES[0];
      let bestDiff = Infinity;
      STD_MESHES.forEach(m => {
        const diff = Math.abs(m - idealWm);
        if (diff < bestDiff) { bestDiff = diff; nearestWm = m; }
      });

      // pick a plausible fine weft mesh: dense enough to pack against warp pitch
      const warpPitch = 25.4 / nearestWm;
      const warpRatio = D / warpPitch;
      let wf = Math.round((25.4 / (d * 2.1)) / 5) * 5; // rough packed estimate
      if (!isFinite(wf) || wf <= 0) wf = nearestWm * 2;
      let nearestWf = STD_MESHES.reduce((best, m) =>
        Math.abs(m - wf) < Math.abs(best - wf) ? m : best, STD_MESHES[0]);

      const actualOpeningUm = dutchOpeningCheck(nearestWm, D, d);
      if (actualOpeningUm <= 0) return;

      const diffUm = actualOpeningUm - openingMicron;
      const pctDiff = Math.abs(diffUm) / openingMicron;
      if (pctDiff > 0.18) return;

      const weave = warpRatio <= 0.5 ? 'plain_dutch' : 'twill_dutch';

      out.push({
        weave, mesh: nearestWm, wf: nearestWf, D, d,
        openingUm: actualOpeningUm, ratio: warpRatio, diffUm, pctDiff
      });
    });
  });

  return out;
}

function dedupeAndRank(results, openingMicron) {
  // Dedup by weave+mesh+D rounded, keep closest match per key
  const map = new Map();
  results.forEach(r => {
    const key = `${r.weave}|${r.mesh}|${r.D.toFixed(3)}`;
    const existing = map.get(key);
    if (!existing || Math.abs(r.diffUm) < Math.abs(existing.diffUm)) map.set(key, r);
  });
  const deduped = Array.from(map.values());
  deduped.sort((a, b) => Math.abs(a.diffUm) - Math.abs(b.diffUm));
  return deduped;
}

function pickDiverseTop(results, count) {
  // Try to surface a mix of weave types rather than one type dominating.
  const byType = { plain: [], twill: [], plain_dutch: [], twill_dutch: [] };
  results.forEach(r => byType[r.weave].push(r));
  Object.keys(byType).forEach(k => byType[k].sort((a, b) => Math.abs(a.diffUm) - Math.abs(b.diffUm)));

  const picked = [];
  const types = ['plain', 'twill', 'plain_dutch', 'twill_dutch'];
  let round = 0;
  while (picked.length < count) {
    let addedAny = false;
    for (const t of types) {
      if (picked.length >= count) break;
      if (byType[t][round]) { picked.push(byType[t][round]); addedAny = true; }
    }
    round++;
    if (!addedAny) break;
  }
  picked.sort((a, b) => Math.abs(a.diffUm) - Math.abs(b.diffUm));
  return picked;
}

function renderMicronCard(r, openingMicron) {
  const meta = micronWeaveMeta(r.weave);
  const isDutch = r.weave === 'plain_dutch' || r.weave === 'twill_dutch';
  const diffStr = (r.diffUm >= 0 ? '+' : '') + r.diffUm.toFixed(1);
  const diffColor = Math.abs(r.diffUm) <= openingMicron * 0.05 ? 'var(--green)' : 'var(--amber)';
  const ratioOk = r.ratio <= (r.weave === 'twill' ? 0.67 : 0.5) || isDutch;

  return `
    <div class="solve-result-card" style="margin-bottom:12px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div class="src-eyebrow" style="margin-bottom:0;">${meta.label} Weave</div>
        <span class="sample-badge ${meta.badge}">${meta.label.toUpperCase()}</span>
      </div>
      <div class="solve-result-row">
        <div>
          <div class="solve-big" style="font-size:1.6rem;">${r.openingUm.toFixed(1)}</div>
          <div class="solve-unit">µm actual opening &nbsp;(target ${openingMicron} µm)</div>
        </div>
        <div class="solve-divider"></div>
        <div class="solve-sub-grid">
          <div class="solve-sub-item"><p>${isDutch ? 'Warp Mesh' : 'Mesh'}</p><p>${r.mesh} /in</p></div>
          ${isDutch ? `<div class="solve-sub-item"><p>Weft Mesh</p><p>${r.wf} /in</p></div>` : ''}
          <div class="solve-sub-item"><p>${isDutch ? 'Warp Dia D' : 'Wire Dia'}</p><p>${r.D.toFixed(3)} mm</p></div>
          ${isDutch ? `<div class="solve-sub-item"><p>Weft Dia d</p><p>${r.d.toFixed(3)} mm</p></div>` : ''}
          <div class="solve-sub-item"><p>${isDutch ? 'Warp d/p' : 'd/p Ratio'}</p><p>${r.ratio.toFixed(3)} ${ratioOk ? '✅' : '⚠️'}</p></div>
          <div class="solve-sub-item"><p>Δ vs Target</p><p style="color:${diffColor};">${diffStr} µm</p></div>
        </div>
      </div>
    </div>`;
}

function runMicronExplorer() {
  const wrap = document.getElementById('micronResultsWrap');
  const val = parseFloat(document.getElementById('micronInput').value) || 0;

  if (val <= 0) { wrap.innerHTML = ''; return; }

  const square = scanSquareWeaves(val);
  const dutch  = scanDutchWeaves(val);
  const all = dedupeAndRank([...square, ...dutch], val);

  if (!all.length) {
    wrap.innerHTML = `
      <div style="margin-top:16px;padding:16px 18px; border-radius:10px; background:var(--red-light);
        border:1px solid var(--red-border); color:var(--red); font-size:0.85rem; font-weight:500;">
        ⚠️ No feasible standard combinations found within ±18% of ${val} µm. Try a different opening size.
      </div>`;
    return;
  }

  const top = pickDiverseTop(all, Math.min(8, Math.max(5, Math.min(8, all.length))));

  wrap.innerHTML = `
    <div style="margin-top:18px;">
      <div class="samples-label" style="margin-bottom:12px;">
        ${top.length} Feasible Combinations for ${val} µm Opening (Plain · Twill · Dutch)
      </div>
      <div class="reverse-solve-results" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:0;">
        ${top.map(r => renderMicronCard(r, val)).join('')}
      </div>
    </div>`;
}

// ── INIT ──
onWeaveChange();
onReverseWeaveChange();
selectUnknown('mesh');