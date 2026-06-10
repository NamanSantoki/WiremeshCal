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

function selectUnknown(val) {
  reverseUnknown = val;
  document.getElementById('optMesh').classList.toggle('selected', val === 'mesh');
  document.getElementById('optDia').classList.toggle('selected', val === 'diameter');

  // toggle input visibility
  document.getElementById('rInputMesh').style.display    = val === 'diameter' ? 'block' : 'none';
  document.getElementById('rInputDia').style.display     = val === 'mesh'     ? 'block' : 'none';
  document.getElementById('rInputMeshRow').style.display = val === 'mesh'     ? 'none'  : 'block';
  document.getElementById('rInputDiaRow').style.display  = val === 'diameter' ? 'none'  : 'block';

  // update label for known input
  if (val === 'mesh') {
    document.getElementById('rLabelKnownDia').textContent = 'Wire Diameter D (mm) — known';
    document.getElementById('rInfoPill').textContent      = 'Enter opening size (µm) + wire diameter → calculates the required mesh count.';
  } else {
    document.getElementById('rLabelKnownMesh').textContent = 'Mesh Count (wires/inch) — known';
    document.getElementById('rInfoPill').textContent       = 'Enter opening size (µm) + mesh count → calculates the required wire diameter.';
  }

  // clear results
  document.getElementById('reverseResults').innerHTML = '';
}

function calculateReverse() {
  const openingMicron = parseFloat(document.getElementById('rOpening').value) || 0;
  const weave = document.getElementById('rWeaveType').value;

  // Validate opening
  if (openingMicron <= 0) {
    showReverseError('Please enter a valid opening size in microns.');
    return;
  }

  const openingMm = openingMicron / 1000; // convert µm → mm

  let resultsHTML = '';

  if (reverseUnknown === 'mesh') {
    // Known: opening + diameter → find mesh
    const D = parseFloat(document.getElementById('rWarpDia').value) || 0;
    if (D <= 0) { showReverseError('Please enter a valid wire diameter.'); return; }

    // For plain/twill square weave:
    // opening = pitch - D  →  pitch = opening + D
    // mesh = 25.4 / pitch
    const pitch = openingMm + D;
    const mesh  = 25.4 / pitch;
    const ratio = D / pitch;
    const openArea = Math.pow(1 - (mesh * D) / 25.4, 2) * 100;
    const thickness = D * 2;
    const weight = D * D * 0.493 * mesh;

    const feasibility = ratio <= 0.5
      ? { label: '✅ Plain Weave OK', color: 'var(--green)', bg: 'var(--green-light)' }
      : ratio <= 0.67
        ? { label: '⚠️ Twill Weave needed', color: 'var(--amber)', bg: 'var(--amber-light)' }
        : { label: '❌ Dutch Weave required', color: 'var(--red)', bg: 'var(--red-light)' };

    resultsHTML = `
      <div class="solve-result-card">
        <div class="src-eyebrow">Calculated Result — Mesh Count</div>
        <div class="solve-result-row">
          <div>
            <div class="solve-big" id="rResultMesh">${mesh.toFixed(2)}</div>
            <div class="solve-unit">wires / inch</div>
          </div>
          <div class="solve-divider"></div>
          <div class="solve-sub-grid">
            <div class="solve-sub-item"><p>Pitch</p><p>${pitch.toFixed(4)} mm</p></div>
            <div class="solve-sub-item"><p>d/p Ratio</p><p>${ratio.toFixed(3)}</p></div>
            <div class="solve-sub-item"><p>Open Area</p><p>${openArea.toFixed(1)}%</p></div>
            <div class="solve-sub-item"><p>Thickness</p><p>${thickness.toFixed(3)} mm</p></div>
            <div class="solve-sub-item"><p>Weight</p><p>${weight.toFixed(3)} kg/m²</p></div>
            <div class="solve-sub-item"><p>Opening</p><p>${openingMicron} µm</p></div>
          </div>
        </div>
        <div style="margin-top:12px; padding:8px 12px; border-radius:7px; font-size:0.78rem; font-weight:600;
             background:${feasibility.bg}; color:${feasibility.color}; border: 1px solid ${feasibility.color}33;">
          ${feasibility.label} &nbsp;·&nbsp; d/p = ${ratio.toFixed(3)}
        </div>
      </div>
      <div class="solve-result-card">
        <div class="src-eyebrow">Nearest Standard Mesh Counts</div>
        ${nearestMeshSuggestions(mesh, D, openingMicron)}
      </div>`;

  } else {
    // Known: opening + mesh → find diameter
    const mesh = parseFloat(document.getElementById('rWarpMesh').value) || 0;
    if (mesh <= 0) { showReverseError('Please enter a valid mesh count.'); return; }

    // pitch = 25.4 / mesh
    // opening = pitch - D  →  D = pitch - opening
    const pitch = 25.4 / mesh;
    const D = pitch - openingMm;

    if (D <= 0) {
      showReverseError(`Opening (${openingMicron} µm = ${openingMm.toFixed(4)} mm) is larger than the pitch (${pitch.toFixed(4)} mm) at ${mesh} mesh. Decrease opening or increase mesh count.`);
      return;
    }

    const ratio = D / pitch;
    const openArea = Math.pow(1 - (mesh * D) / 25.4, 2) * 100;
    const thickness = D * 2;
    const weight = D * D * 0.493 * mesh;

    const feasibility = ratio <= 0.5
      ? { label: '✅ Plain Weave OK', color: 'var(--green)', bg: 'var(--green-light)' }
      : ratio <= 0.67
        ? { label: '⚠️ Twill Weave needed', color: 'var(--amber)', bg: 'var(--amber-light)' }
        : { label: '❌ Dutch Weave required', color: 'var(--red)', bg: 'var(--red-light)' };

    resultsHTML = `
      <div class="solve-result-card">
        <div class="src-eyebrow">Calculated Result — Wire Diameter</div>
        <div class="solve-result-row">
          <div>
            <div class="solve-big" id="rResultDia">${(D*1000).toFixed(1)}</div>
            <div class="solve-unit">µm &nbsp;=&nbsp; ${D.toFixed(4)} mm</div>
          </div>
          <div class="solve-divider"></div>
          <div class="solve-sub-grid">
            <div class="solve-sub-item"><p>Pitch</p><p>${pitch.toFixed(4)} mm</p></div>
            <div class="solve-sub-item"><p>d/p Ratio</p><p>${ratio.toFixed(3)}</p></div>
            <div class="solve-sub-item"><p>Open Area</p><p>${openArea.toFixed(1)}%</p></div>
            <div class="solve-sub-item"><p>Thickness</p><p>${thickness.toFixed(3)} mm</p></div>
            <div class="solve-sub-item"><p>Weight</p><p>${weight.toFixed(3)} kg/m²</p></div>
            <div class="solve-sub-item"><p>Opening</p><p>${openingMicron} µm</p></div>
          </div>
        </div>
        <div style="margin-top:12px; padding:8px 12px; border-radius:7px; font-size:0.78rem; font-weight:600;
             background:${feasibility.bg}; color:${feasibility.color}; border: 1px solid ${feasibility.color}33;">
          ${feasibility.label} &nbsp;·&nbsp; d/p = ${ratio.toFixed(3)}
        </div>
      </div>
      <div class="solve-result-card">
        <div class="src-eyebrow">Nearest Standard Wire Diameters</div>
        ${nearestDiaSuggestions(D, mesh, openingMicron)}
      </div>`;
  }

  document.getElementById('reverseResults').innerHTML = resultsHTML;
}

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

function nearestMeshSuggestions(calcMesh, D, targetOpeningMicron) {
  const candidates = STD_MESHES.filter(m => m > 0);
  candidates.sort((a, b) => Math.abs(a - calcMesh) - Math.abs(b - calcMesh));
  const top3 = candidates.slice(0, 3);

  return top3.map(m => {
    const pitch = 25.4 / m;
    const actualOpening = (pitch - D) * 1000;
    const ratio = D / pitch;
    const diff = actualOpening - targetOpeningMicron;
    const diffStr = (diff >= 0 ? '+' : '') + diff.toFixed(0);
    const active = m === Math.round(calcMesh) || Math.abs(m - calcMesh) < 0.5;
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;
      margin-bottom:6px; border-radius:8px; border:1px solid ${active ? 'var(--blue-border)' : 'var(--border)'};
      background:${active ? 'var(--blue-light)' : 'var(--bg)'};">
      <div>
        <span style="font-weight:700;font-family:'DM Mono',monospace;font-size:0.9rem;">${m} mesh</span>
        <span style="font-size:0.72rem;color:var(--text-muted);margin-left:10px;">→ ${Math.max(0, actualOpening).toFixed(0)} µm opening</span>
      </div>
      <span style="font-size:0.72rem;font-weight:600;color:${diff >= 0 ? 'var(--green)' : 'var(--red)'};">${diffStr} µm</span>
    </div>`;
  }).join('');
}

function nearestDiaSuggestions(calcD, mesh, targetOpeningMicron) {
  const candidates = STD_DIAMETERS.slice();
  candidates.sort((a, b) => Math.abs(a - calcD) - Math.abs(b - calcD));
  const top3 = candidates.slice(0, 3);

  return top3.map(D => {
    const pitch = 25.4 / mesh;
    const actualOpening = (pitch - D) * 1000;
    const diff = actualOpening - targetOpeningMicron;
    const diffStr = (diff >= 0 ? '+' : '') + diff.toFixed(0);
    const active = Math.abs(D - calcD) < 0.001;
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;
      margin-bottom:6px; border-radius:8px; border:1px solid ${active ? 'var(--blue-border)' : 'var(--border)'};
      background:${active ? 'var(--blue-light)' : 'var(--bg)'};">
      <div>
        <span style="font-weight:700;font-family:'DM Mono',monospace;font-size:0.9rem;">${D.toFixed(3)} mm</span>
        <span style="font-size:0.72rem;color:var(--text-muted);margin-left:10px;">→ ${Math.max(0, actualOpening).toFixed(0)} µm opening</span>
      </div>
      <span style="font-size:0.72rem;font-weight:600;color:${diff >= 0 ? 'var(--green)' : 'var(--red)'};">${diffStr} µm</span>
    </div>`;
  }).join('');
}

function showReverseError(msg) {
  document.getElementById('reverseResults').innerHTML = `
    <div style="padding:16px 18px; border-radius:10px; background:var(--red-light);
      border:1px solid var(--red-border); color:var(--red); font-size:0.85rem; font-weight:500;">
      ⚠️ ${msg}
    </div>`;
}

function resetReverse() {
  ['rOpening','rWarpDia','rWarpMesh'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('reverseResults').innerHTML = '';
}

// ── INIT ──
onWeaveChange();
selectUnknown('mesh');