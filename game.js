import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = (id) => document.getElementById(id);
const sceneCanvas = $('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x10141b);
scene.fog = new THREE.FogExp2(0x151923, 0.027);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 120);
const renderer = new THREE.WebGLRenderer({ canvas: sceneCanvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.13;

const clock = new THREE.Clock();
const mats = {};
const mat = (name, color, roughness = .8, metalness = 0, extra = {}) => mats[name] = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
mat('ground', 0x202126, 0.98); mat('soil', 0x302a2b); mat('wood', 0x392321); mat('woodLight', 0x764331); mat('red', 0x9c3540); mat('redDark', 0x4a202b); mat('black', 0x12151c); mat('hair', 0x161923); mat('skin', 0xe7bd9e); mat('gold', 0xd8ae64, .3, .65); mat('cloth', 0xf0e7d5); mat('steel', 0xdbe5e4, .18, .8); mat('shadow', 0x11151c); mat('bark', 0x241d1c); mat('leaf', 0x1d3430); mat('leaf2', 0x35463c); mat('paper', 0xe3c68d, .7, 0, { emissive: 0xad5a35, emissiveIntensity: 1.2 });
scene.add(new THREE.HemisphereLight(0xb7c5df, 0x171113, 1.55));
const moon = new THREE.DirectionalLight(0xb9c9ee, 2.45); moon.position.set(-5, 12, 7); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); moon.shadow.camera.left = -17; moon.shadow.camera.right = 17; moon.shadow.camera.top = 15; moon.shadow.camera.bottom = -15; scene.add(moon);
const lanternLight = new THREE.PointLight(0xff8653, 26, 13, 2); lanternLight.position.set(-4, 2.4, -3); scene.add(lanternLight);
const fillLight = new THREE.PointLight(0x5591a3, 17, 18, 2); fillLight.position.set(5, 3, 0); scene.add(fillLight);

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
function mesh(geometry, material, parent, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
  const o = new THREE.Mesh(geometry, material); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}
function box(parent, material, x, y, z, sx, sy, sz) { return mesh(boxGeo, material, parent, x, y, z, sx, sy, sz); }
function cylinder(parent, material, r1, r2, h, x, y, z, segments = 10) { return mesh(new THREE.CylinderGeometry(r1, r2, h, segments), material, parent, x, y, z); }
function sphere(parent, material, x, y, z, sx, sy, sz, segments = 12) { return mesh(new THREE.SphereGeometry(1, segments, Math.max(8, segments - 2)), material, parent, x, y, z, sx, sy, sz); }

const ground = mesh(new THREE.PlaneGeometry(100, 100), mats.ground, scene, 0, -.12, 0, 1, 1, 1); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
const clearing = mesh(new THREE.CircleGeometry(13, 64), mats.soil, scene, 0, -.105, 0); clearing.rotation.x = -Math.PI / 2; clearing.receiveShadow = true;
const moonDisc = new THREE.Mesh(new THREE.CircleGeometry(1.3, 48), new THREE.MeshBasicMaterial({ color: 0xd7d5c7, transparent: true, opacity: .8 })); moonDisc.position.set(7, 10, -27); scene.add(moonDisc);
const moonGlow = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48), new THREE.MeshBasicMaterial({ color: 0x9ba9c0, transparent: true, opacity: .11, depthWrite: false })); moonGlow.position.copy(moonDisc.position); moonGlow.position.z -= .04; scene.add(moonGlow);

// A mountain pass framed by cedar trees, warm paper lanterns and a vermilion shrine gate.
const torii = new THREE.Group(); scene.add(torii); torii.position.set(0, 0, -6.5);
for (const x of [-3.1, 3.1]) { cylinder(torii, mats.red, .19, .23, 5.3, x, 2.65, 0, 12); cylinder(torii, mats.redDark, .26, .26, .15, x, .58, 0, 12); }
box(torii, mats.red, 0, 5.14, 0, 7.7, .35, .48); box(torii, mats.red, 0, 5.49, 0, 8.5, .25, .6); box(torii, mats.redDark, 0, 4.77, 0, 6.6, .18, .4);
for (const x of [-2.4, 2.4]) box(torii, mats.gold, x, 4.8, .26, .12, .5, .08);
function makeTree(x, z, scale = 1, variant = 0) {
  const g = new THREE.Group(); scene.add(g); g.position.set(x, 0, z); g.scale.setScalar(scale);
  cylinder(g, mats.bark, .16, .32, 4.2, 0, 2.1, 0, 8);
  const foliage = variant ? mats.leaf2 : mats.leaf;
  for (let i = 0; i < 4; i++) { const y = 2.5 + i * .72; const s = 1.45 - i * .27; const c = mesh(new THREE.ConeGeometry(s, 1.5, 7), foliage, g, (i % 2 ? .14 : -.14), y, 0); c.rotation.y = i * .7; }
  return g;
}
for (let i = 0; i < 20; i++) { const z = -13 + (i % 7) * 3.8, side = i % 2 ? 1 : -1; makeTree(side * (6.2 + ((i * 7) % 4)), z, .8 + ((i * 13) % 5) * .14, i % 3 === 0 ? 1 : 0); }
function makeLantern(x, z) {
  const g = new THREE.Group(); scene.add(g); g.position.set(x, 0, z);
  cylinder(g, mats.wood, .055, .075, 2.25, 0, 1.12, 0, 8);
  box(g, mats.wood, 0, 2.25, 0, .52, .12, .48); box(g, mats.paper, 0, 1.9, 0, .34, .6, .34); box(g, mats.wood, 0, 1.54, 0, .52, .1, .48); cylinder(g, mats.gold, .045, .045, .3, 0, 1.36, 0, 8);
  const light = new THREE.PointLight(0xff8151, 12, 7, 2); light.position.set(x, 2, z); scene.add(light);
}
makeLantern(-4.3, -2.6); makeLantern(4.4, -4.1); makeLantern(-6.3, 3.3); makeLantern(6.6, 2.5);

function makeCharacter(type) {
  const root = new THREE.Group(); scene.add(root);
  const rig = new THREE.Group(); root.add(rig);
  const demon = type === 'demon' || type === 'boss';
  const boss = type === 'boss';
  const palette = demon ? {
    skin: mat(`${type}Skin`, boss ? 0x8e3542 : 0x916052), cloth: mat(`${type}Cloth`, boss ? 0x321f2b : 0x32252a), hair: mat(`${type}Hair`, boss ? 0x27131e : 0x27191a), accent: mat(`${type}Accent`, boss ? 0xc34649 : 0x9e5140), eye: mat(`${type}Eye`, 0xff5148, .25, 0, { emissive: 0xc32222, emissiveIntensity: 2 }), steel: mats.steel,
  } : { skin: mats.skin, cloth: mats.cloth, hair: mats.hair, accent: mats.red, eye: mats.black, steel: mats.steel };
  const height = boss ? 1.42 : demon ? 1.14 : 1;
  const torso = new THREE.Group(); rig.add(torso); torso.position.y = .94 * height;
  // articulated torso, haori panels and obi
  box(torso, palette.cloth, 0, .05, 0, .55, .7, .33);
  if (!demon) {
    const haori = box(torso, mats.red, 0, -.02, -.19, .63, .67, .12); haori.material = mats.red;
    for (let i = 0; i < 3; i++) box(torso, mats.gold, -.18 + i * .18, -.03, -.26, .018, .54, .02);
    box(torso, mats.black, 0, -.28, .02, .62, .09, .38); box(torso, mats.gold, 0, -.28, .22, .16, .1, .05);
  } else {
    box(torso, palette.accent, 0, -.16, -.18, .58, .36, .12);
    for (let i = 0; i < 3; i++) { const rib = box(torso, palette.skin, -.34 + i * .17, .08, .177, .13, .045, .025); rib.rotation.z = -.13; }
  }
  const head = new THREE.Group(); torso.add(head); head.position.set(0, .55, 0);
  sphere(head, palette.skin, 0, 0, .02, .25 * height, .29 * height, .23 * height, 16);
  // swept hair fringe, ears and facial marks
  sphere(head, palette.hair, 0, .18 * height, -.035, .29 * height, .16 * height, .26 * height, 12);
  for (let i = 0; i < 5; i++) { const bang = mesh(new THREE.ConeGeometry(.09 * height, .32 * height, 5), palette.hair, head, -.19 * height + i * .095 * height, .06 * height, .2 * height, .65, 1, .7); bang.rotation.x = -.3; bang.rotation.z = (i - 2) * -.16; }
  const eyeMaterial = demon ? palette.eye : mats.black;
  for (const x of [-.095, .095]) sphere(head, eyeMaterial, x * height, .01 * height, .222 * height, .031 * height, .023 * height, .014, 8);
  if (demon) for (const x of [-.19, .19]) { const horn = mesh(new THREE.ConeGeometry(.075 * height, .3 * height, 6), palette.accent, head, x * height, .27 * height, -.01, 1, 1, 1); horn.rotation.z = x > 0 ? -.38 : .38; }
  const arms = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group(); torso.add(shoulder); shoulder.position.set(side * .34, .22, 0); arms.push(shoulder);
    sphere(shoulder, palette.cloth, 0, -.1, 0, .15, .17, .16, 10);
    const upper = cylinder(shoulder, palette.cloth, .1, .13, .42, side * .04, -.32, 0, 8); upper.rotation.z = side * -.14;
    sphere(shoulder, palette.skin, side * .04, -.55, .02, .09, .09, .09, 8);
    const sleeve = box(shoulder, demon ? palette.accent : mats.red, 0, -.25, -.04, .23, .23, .23);
    if (!demon) box(shoulder, mats.gold, 0, -.25, -.165, .1, .16, .025);
  }
  const legs = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(); rig.add(leg); leg.position.set(side * .16, .58 * height, 0); legs.push(leg);
    cylinder(leg, demon ? palette.cloth : mats.black, .09, .13, .44, 0, -.2, 0, 8);
    box(leg, mats.black, 0, -.44, .06, .17, .12, .3);
    if (!demon) box(leg, mats.gold, side * .04, -.2, .125, .018, .3, .02);
  }
  const sword = new THREE.Group(); torso.add(sword); sword.position.set(.45, -.28, .06); sword.rotation.z = -.7;
  cylinder(sword, mats.black, .042, .042, .33, 0, -.16, 0, 8);
  const guard = mesh(new THREE.TorusGeometry(.11, .018, 6, 12), mats.gold, sword, 0, .02, 0); guard.rotation.x = Math.PI / 2;
  const blade = mesh(new THREE.BoxGeometry(.045, .85, .035), palette.steel, sword, 0, .48, 0, 1, 1, 1); blade.material.side = THREE.DoubleSide;
  const edge = mesh(new THREE.BoxGeometry(.012, .79, .012), demon ? palette.accent : mats.gold, sword, .027, .49, .018);
  const wrap = mesh(new THREE.CylinderGeometry(.036, .045, .28, 8), mats.gold, sword, 0, -.16, .02); wrap.rotation.z = -.04;
  const aura = new THREE.PointLight(demon ? 0xed3f52 : 0x83d9ec, demon ? (boss ? 3 : 1.5) : 1.8, 3.4, 2); aura.position.set(0, .7, .2); torso.add(aura);
  root.scale.setScalar(boss ? 1.22 : 1);
  return { root, rig, torso, head, arms, legs, sword, aura, demon, boss, baseY: 0, attackPose: 0, hitFlash: 0, defeated: false, timeOffset: Math.random() * 6.28 };
}
const player = makeCharacter('player'); player.root.position.set(0, 0, 2.4);
let enemy = makeCharacter('demon'); enemy.root.position.set(0, 0, -1.7);
enemy.root.visible = false;
const actors = [player];

// Ringed arena lantern motes, drifting maple leaves and edge stones.
const particles = [];
const moteMat = new THREE.MeshBasicMaterial({ color: 0xd5ad77, transparent: true, opacity: .6 });
for (let i = 0; i < 70; i++) { const p = mesh(new THREE.SphereGeometry(.018 + Math.random() * .025, 6, 5), moteMat, scene, (Math.random() - .5) * 15, .25 + Math.random() * 4.5, (Math.random() - .5) * 16); particles.push({ mesh: p, speed: .12 + Math.random() * .3, phase: Math.random() * 6.3, x: p.position.x, z: p.position.z }); }
for (let i = 0; i < 34; i++) { const a = i / 34 * Math.PI * 2; const r = 9 + Math.random() * 3; const stone = mesh(new THREE.DodecahedronGeometry(.22 + Math.random() * .25, 0), i % 3 ? mats.bark : mats.woodLight, scene, Math.sin(a) * r, -.02, Math.cos(a) * r, 1.2, .45, .8); stone.rotation.y = a; }

const audio = { ctx: null, enabled: true };
function tone(freq, duration, wave = 'sine', volume = .035, endFreq = null) {
  if (!audio.enabled) return;
  try { audio.ctx ??= new (window.AudioContext || window.webkitAudioContext)(); const o = audio.ctx.createOscillator(), g = audio.ctx.createGain(); o.type = wave; o.frequency.setValueAtTime(freq, audio.ctx.currentTime); if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, audio.ctx.currentTime + duration); g.gain.setValueAtTime(volume, audio.ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001, audio.ctx.currentTime + duration); o.connect(g); g.connect(audio.ctx.destination); o.start(); o.stop(audio.ctx.currentTime + duration); } catch {}
}
function sound(kind) {
  if (kind === 'slash') tone(540, .19, 'sawtooth', .035, 130);
  if (kind === 'form') { tone(220, .5, 'sine', .05, 780); tone(460, .35, 'triangle', .025, 1100); }
  if (kind === 'hit') { tone(105, .13, 'square', .045, 48); tone(820, .12, 'sine', .024, 210); }
  if (kind === 'hurt') tone(190, .34, 'sawtooth', .05, 62);
  if (kind === 'arrival') { tone(78, .8, 'triangle', .065, 38); tone(180, .55, 'sine', .03, 72); }
}
function showToast(text) { const el = $('toast'); el.textContent = text; el.classList.add('visible'); clearTimeout(showToast.timeout); showToast.timeout = setTimeout(() => el.classList.remove('visible'), 1900); }
function showImpact(text) { const el = $('impact-text'); el.textContent = text; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); }
function updateMeter(id, percent) { $(id).style.width = `${Math.max(0, Math.min(100, percent))}%`; }
function updateVitals() { updateMeter('health-fill', playerHp); $('health-value').textContent = `${Math.ceil(playerHp)} / 100`; updateMeter('breath-fill', breath); $('breath-value').textContent = `${Math.floor(breath)}%`; }
function setEnemyHud(target) {
  if (!target) { $('enemy-panel').classList.remove('visible'); return; }
  $('enemy-panel').classList.add('visible'); $('enemy-name').textContent = target.boss ? 'THE CRIMSON WIDOW' : target === sideDemon ? 'THE ASH-EATER' : 'THE HOLLOW';
  $('enemy-kind').textContent = target.boss ? 'UPPER MOON · BOSS' : 'LESSER DEMON'; updateMeter('enemy-fill', target.hp / target.maxHp * 100);
  $('enemy-fill').style.background = target.boss ? 'linear-gradient(90deg,#a51d35,#ff6357)' : 'linear-gradient(90deg,#d43d45,#f17563)';
}
function spawnSlash(form, who = player) {
  const g = new THREE.Group(); scene.add(g); g.position.set(who.root.position.x, .95, who.root.position.z);
  g.rotation.y = who.root.rotation.y;
  const color = who === player ? (form ? 0x7be0dc : 0xf3d18d) : 0xff4c5a;
  for (let i = 0; i < (form ? 3 : 1); i++) {
    const arc = mesh(new THREE.TorusGeometry(form ? 1.25 + i * .36 : 1.12, form ? .035 : .045, 7, 42, Math.PI * (form ? 1.35 : 1.15)), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .94, blending: THREE.AdditiveBlending, depthWrite: false }), g, 0, (i - 1) * .1, .14 + i * .12);
    arc.rotation.z = form ? i * .4 : -.48;
  }
  if (form) { const wave = new THREE.Mesh(new THREE.TorusGeometry(1.7, .055, 8, 48), new THREE.MeshBasicMaterial({ color: 0x60bcd0, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false })); wave.rotation.x = Math.PI / 2; wave.position.y = -.35; g.add(wave); }
  effects.push({ mesh: g, ttl: form ? .72 : .34, max: form ? .72 : .34, form });
}
function sparkBurst(x, y, z, color = 0xffc674, count = 13) {
  for (let i = 0; i < count; i++) {
    const p = mesh(new THREE.SphereGeometry(.035 + Math.random() * .045, 6, 5), new THREE.MeshBasicMaterial({ color, transparent: true }), scene, x, y, z);
    const a = Math.random() * Math.PI * 2, speed = 1.1 + Math.random() * 3;
    particles.push({ mesh: p, speed: 0, vx: Math.cos(a) * speed, vy: .7 + Math.random() * 2.5, vz: Math.sin(a) * speed, life: .35 + Math.random() * .35, phase: 0, spark: true });
  }
}
const effects = [];
let state = 'title', playerHp = 100, breath = 100, attackCd = 0, dodgeCd = 0, invulnerable = 0, combo = 0, comboTime = 0, cameraShake = 0;
let mainDemon = enemy, sideDemon = null, enemies = [], bossArrivalAt = 0, sideSpawned = false, bossIntro = false, resultShown = false, gameTime = 0, dialogueTimer = 0;
const keys = new Set(), touchMove = new Set();
function startGame() {
  if (state !== 'title') return;
  state = 'intro'; gameTime = 0; $('cutscene').classList.add('hidden'); $('objective-text').textContent = 'Purge the lesser demon'; $('objective-sub').textContent = 'Something watches from beyond the trees…';
  enemy.root.visible = true; enemy.hp = enemy.maxHp = 100; enemy.attackCd = 2.4; enemy.windup = 0; enemy.moveSpeed = 1.05; enemies = [enemy]; mainDemon = enemy; setEnemyHud(enemy); $('dialogue-name').textContent = 'THE SLAYER'; $('dialogue-copy').textContent = 'This mountain ends here.'; $('dialogue').classList.add('visible'); dialogueTimer = 2.6;
  tone(245, .5, 'sine', .025, 310);
}
function spawnBoss() {
  if (bossIntro || state === 'win') return;
  bossIntro = true; state = 'bossIntro'; gameTime = 0;
  $('objective-text').textContent = 'Survive the Crimson Widow'; $('objective-sub').textContent = 'An Upper Moon has entered the pass.';
  $('dialogue-name').textContent = 'THE CRIMSON WIDOW'; $('dialogue-copy').textContent = 'How sweet. The little sun came all this way to die.'; $('dialogue').classList.add('visible'); dialogueTimer = 3.2;
  $('chapter-label').textContent = 'CHAPTER 01 · THE CRIMSON WIDOW'; showImpact('UPPER MOON'); sound('arrival'); cameraShake = .45;
  enemy = makeCharacter('boss'); enemy.root.position.set(0, 0, -4.8); enemy.root.visible = true; enemy.hp = enemy.maxHp = 245; enemy.attackCd = 2.2; enemy.windup = 0; enemy.moveSpeed = .78; enemy.boss = true;
  mainDemon = enemy; enemies.push(enemy); setEnemyHud(enemy);
  const circle = mesh(new THREE.TorusGeometry(1.3, .035, 6, 36), new THREE.MeshBasicMaterial({ color: 0xee394b, transparent: true, opacity: .8, blending: THREE.AdditiveBlending }), scene, 0, .04, -4.7); circle.rotation.x = -Math.PI / 2; effects.push({ mesh: circle, ttl: 1.4, max: 1.4, form: true, shrink: true });
}
function spawnSideDemon() {
  if (sideSpawned) return; sideSpawned = true;
  sideDemon = makeCharacter('demon'); sideDemon.root.position.set(-4.3, 0, -2.6); sideDemon.root.visible = true;
  sideDemon.hp = sideDemon.maxHp = 72; sideDemon.attackCd = 1.5; sideDemon.windup = 0; sideDemon.moveSpeed = 1.35; enemies.push(sideDemon);
  $('objective-text').textContent = 'Defeat the demons'; $('objective-sub').textContent = 'The Ash-Eater joins the fight!'; showImpact('ANOTHER DEMON'); sound('arrival');
  setTimeout(() => { if (state === 'fight') showToast('A side demon has joined the fight!'); }, 250);
}
function takeDamage(target, amount, form) {
  if (!target || target.defeated) return;
  target.hp -= amount; target.hitFlash = .2; target.attackCd = Math.max(target.attackCd || 0, .45); target.windup = 0;
  sparkBurst(target.root.position.x, 1.05, target.root.position.z, target.boss ? 0x80e6dc : 0xffc36c, form ? 25 : 15); sound('hit'); cameraShake = Math.max(cameraShake, form ? .24 : .13);
  showImpact(form ? 'WATER FORM' : (combo >= 3 ? 'PERFECT CUT' : 'SLASH'));
  if (target === mainDemon || target.boss) setEnemyHud(target);
  if (target.hp <= 0) {
    target.hp = 0; target.defeated = true; target.attackCd = 999; target.root.rotation.z = .9; target.root.scale.y = .3; setTimeout(() => { target.root.visible = false; }, 900); sparkBurst(target.root.position.x, 1, target.root.position.z, 0xed594c, 28);
    if (!target.boss && target === mainDemon) { $('enemy-panel').classList.remove('visible'); $('objective-text').textContent = 'The Upper Moon awakens'; $('objective-sub').textContent = 'Something emerges from the darkness…'; showImpact('PURIFIED'); bossArrivalAt = performance.now() + 1800; }
    else if (target === sideDemon) { showToast('The Ash-Eater has been purified.'); if (mainDemon && !mainDemon.defeated) setEnemyHud(mainDemon); }
    else if (target.boss) { $('enemy-panel').classList.remove('visible'); $('objective-text').textContent = 'The pass is quiet'; $('objective-sub').textContent = 'You have made it to dawn.'; showImpact('DEMON SLAYER'); }
    checkVictory();
  }
}
function checkVictory() {
  if (mainDemon?.boss && mainDemon.defeated && (!sideDemon || sideDemon.defeated)) { state = 'win'; $('result-screen').classList.remove('hidden'); $('result-screen').querySelector('.result-kicker').textContent = 'THE NIGHT IS OVER'; $('result-screen').querySelector('h2').innerHTML = 'DAWN<br><em>REMEMBERS.</em>'; $('result-screen').querySelector('p').textContent = 'The mountain is quiet again. For tonight.'; }
}
function playerAttack(form = false) {
  if (state !== 'fight' || attackCd > 0) return;
  if (form && breath < 28) { showToast('Not enough breath.'); return; }
  if (form) breath -= 28; else { combo = comboTime > 0 ? Math.min(combo + 1, 4) : 1; comboTime = 1.1; breath = Math.min(100, breath + 4); }
  attackCd = form ? .8 : .36; player.attackPose = form ? .62 : .34; sound(form ? 'form' : 'slash'); spawnSlash(form);
  const target = enemies.filter(e => !e.defeated && e.root.visible).sort((a, b) => a.root.position.distanceTo(player.root.position) - b.root.position.distanceTo(player.root.position))[0];
  if (target) {
    const d = target.root.position.distanceTo(player.root.position);
    const toward = new THREE.Vector3(target.root.position.x - player.root.position.x, 0, target.root.position.z - player.root.position.z).normalize();
    const face = new THREE.Vector3(Math.sin(player.root.rotation.y), 0, Math.cos(player.root.rotation.y));
    if (d < (form ? 4.4 : 3.25) && toward.dot(face) > -.15) takeDamage(target, form ? 46 : 20 + combo * 3, form);
    else if (d < (form ? 5.2 : 3.9)) showToast('Face your target.');
  }
  updateVitals();
}
function dodge() {
  if (state !== 'fight' || dodgeCd > 0) return;
  dodgeCd = .72; invulnerable = .45; player.attackPose = -.35; breath = Math.min(100, breath + 8); sound('slash');
  const forward = new THREE.Vector3(Math.sin(player.root.rotation.y), 0, Math.cos(player.root.rotation.y));
  player.root.position.addScaledVector(forward, -.62); cameraShake = Math.max(cameraShake, .07); updateVitals();
}
function hurtPlayer(amount) {
  if (invulnerable > 0 || state !== 'fight') return;
  playerHp = Math.max(0, playerHp - amount); invulnerable = .82; player.hitFlash = .3; cameraShake = .3; sound('hurt'); updateVitals(); $('combat-flash').classList.remove('flash'); void $('combat-flash').offsetWidth; $('combat-flash').classList.add('flash');
  if (playerHp <= 0) { state = 'lose'; $('result-screen').classList.remove('hidden'); $('result-screen').querySelector('.result-kicker').textContent = 'THE MOUNTAIN CLAIMS ANOTHER'; $('result-screen').querySelector('h2').innerHTML = 'NIGHT<br><em>ENDURES.</em>'; $('result-screen').querySelector('p').textContent = 'Your blade will rise again. Start over?'; }
}

function animateActor(actor, t, dt, moving = false) {
  if (!actor || !actor.root.visible) return;
  actor.hitFlash = Math.max(0, actor.hitFlash - dt);
  actor.attackPose = THREE.MathUtils.damp(actor.attackPose, 0, 9, dt);
  const pace = moving ? Math.sin(t * (actor.boss ? 7 : 10) + actor.timeOffset) : Math.sin(t * 2.2 + actor.timeOffset) * .04;
  actor.rig.position.y = Math.abs(pace) * (moving ? .07 : .025);
  actor.torso.rotation.z = moving ? Math.sin(t * 5 + actor.timeOffset) * .025 : 0;
  actor.torso.rotation.x = actor.attackPose > 0 ? -.14 - actor.attackPose * .18 : actor.attackPose < 0 ? .16 : 0;
  actor.head.rotation.x = Math.sin(t * 1.7 + actor.timeOffset) * .035;
  actor.arms[0].rotation.x = moving ? Math.sin(t * 10 + Math.PI) * .32 : 0;
  actor.arms[1].rotation.x = moving ? Math.sin(t * 10) * .32 : 0;
  actor.arms[0].rotation.z = actor.attackPose > 0 ? -.8 * Math.min(1, actor.attackPose * 2) : 0;
  actor.arms[1].rotation.z = actor.attackPose > 0 ? -.6 * Math.min(1, actor.attackPose * 2) : 0;
  actor.legs[0].rotation.x = moving ? Math.sin(t * 10) * .42 : Math.sin(t * 2 + actor.timeOffset) * .025;
  actor.legs[1].rotation.x = moving ? Math.sin(t * 10 + Math.PI) * .42 : Math.sin(t * 2 + actor.timeOffset + 1) * .025;
  actor.sword.rotation.z = -.7 - (actor.attackPose > 0 ? actor.attackPose * 1.9 : actor.attackPose * .4);
  actor.sword.rotation.x = actor.attackPose > .3 ? -.6 : 0;
  actor.aura.intensity = actor.demon ? (actor.boss ? 3.8 : 1.6) + Math.sin(t * 4) * .55 : 1.1 + Math.sin(t * 3) * .25;
  actor.root.traverse(o => { if (o.isMesh && o.material && o.material.emissive && o.material.emissive.getHex() === 0xc32222) o.material.emissiveIntensity = 1.6 + Math.sin(t * 8) * .7; });
  if (actor.defeated) { actor.root.rotation.z = THREE.MathUtils.damp(actor.root.rotation.z, 1.25, 4, dt); actor.root.scale.y = THREE.MathUtils.damp(actor.root.scale.y, .04, 5, dt); }
}
function updateEnemy(actor, dt) {
  if (!actor || actor.defeated || !actor.root.visible || state !== 'fight') return;
  const dx = player.root.position.x - actor.root.position.x, dz = player.root.position.z - actor.root.position.z;
  const d = Math.hypot(dx, dz) || .001;
  actor.root.rotation.y = Math.atan2(dx, dz);
  actor.attackCd = Math.max(0, actor.attackCd - dt);
  if (actor.windup > 0) {
    actor.windup -= dt; actor.attackPose = -.35;
    if (actor.windup <= 0) {
      spawnSlash(false, actor); sound('slash');
      if (d < (actor.boss ? 2.45 : 1.95)) hurtPlayer(actor.boss ? 20 : 13);
      else showToast('You evaded the attack!');
      actor.attackCd = actor.boss ? 1.55 : 1.8;
    }
  } else if (d > (actor.boss ? 2.2 : 1.55)) {
    actor.root.position.x += dx / d * actor.moveSpeed * dt; actor.root.position.z += dz / d * actor.moveSpeed * dt;
  } else if (actor.attackCd <= 0) {
    actor.windup = actor.boss ? .78 : .62; actor.attackPose = -.3; cameraShake = Math.max(cameraShake, .035);
  }
  if (actor.boss && !sideSpawned && actor.hp <= actor.maxHp * .58) spawnSideDemon();
}
function update(dt) {
  const t = clock.elapsedTime;
  gameTime += dt; attackCd = Math.max(0, attackCd - dt); dodgeCd = Math.max(0, dodgeCd - dt); invulnerable = Math.max(0, invulnerable - dt); comboTime = Math.max(0, comboTime - dt);
  if (state === 'intro' && gameTime > dialogueTimer) { state = 'fight'; $('dialogue').classList.remove('visible'); showToast('WASD to move · J to slash · K for Water Form'); }
  if (state === 'bossIntro' && gameTime > dialogueTimer) { state = 'fight'; $('dialogue').classList.remove('visible'); showToast('The Crimson Widow has arrived.'); }
  if (bossArrivalAt && performance.now() > bossArrivalAt) { bossArrivalAt = 0; spawnBoss(); }
  const movingNow = state === 'fight';
  let mx = 0, mz = 0;
  if (keys.has('KeyA') || keys.has('ArrowLeft') || touchMove.has('left')) mx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight') || touchMove.has('right')) mx += 1;
  if (keys.has('KeyW') || keys.has('ArrowUp') || touchMove.has('up')) mz -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown') || touchMove.has('down')) mz += 1;
  const len = Math.hypot(mx, mz);
  let walking = false;
  if (movingNow && len > .05) {
    mx /= Math.max(1, len); mz /= Math.max(1, len); walking = true;
    player.root.position.x += mx * 4.35 * dt; player.root.position.z += mz * 4.35 * dt;
    player.root.rotation.y = Math.atan2(mx, mz);
  } else if (movingNow) {
    const target = enemies.filter(e => !e.defeated && e.root.visible).sort((a, b) => a.root.position.distanceTo(player.root.position) - b.root.position.distanceTo(player.root.position))[0];
    if (target) { const dx = target.root.position.x - player.root.position.x, dz = target.root.position.z - player.root.position.z; player.root.rotation.y = THREE.MathUtils.damp(player.root.rotation.y, Math.atan2(dx, dz), 2.4, dt); }
  }
  player.root.position.x = THREE.MathUtils.clamp(player.root.position.x, -8.2, 8.2); player.root.position.z = THREE.MathUtils.clamp(player.root.position.z, -9.5, 7.7);
  if (movingNow) { breath = Math.min(100, breath + dt * 2.7); updateVitals(); }
  if (state === 'fight') for (const e of enemies) updateEnemy(e, dt);
  animateActor(player, t, dt, walking);
  for (const e of enemies) animateActor(e, t, dt, e && !e.defeated && e.root.position.distanceTo(player.root.position) > 1.7);
  for (let i = effects.length - 1; i >= 0; i--) {
    const fx = effects[i]; fx.ttl -= dt; const k = Math.max(0, fx.ttl / fx.max); fx.mesh.traverse(o => { if (o.material && o.material.transparent) o.material.opacity = k * .92; });
    if (fx.shrink) fx.mesh.scale.setScalar(1 + (1 - k) * 2.8);
    if (fx.ttl <= 0) { scene.remove(fx.mesh); fx.mesh.traverse(o => { if (o.material && o.material !== mats.steel) o.material.dispose?.(); }); effects.splice(i, 1); }
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (p.spark) { p.life -= dt; p.mesh.position.x += p.vx * dt; p.mesh.position.y += p.vy * dt; p.mesh.position.z += p.vz * dt; p.vy -= 4.5 * dt; p.mesh.material.opacity = Math.max(0, p.life * 2.1); if (p.life <= 0) { scene.remove(p.mesh); p.mesh.geometry.dispose(); p.mesh.material.dispose(); particles.splice(i, 1); } }
    else { p.phase += dt * p.speed; p.mesh.position.y += Math.sin(p.phase) * dt * .16; p.mesh.position.x = p.x + Math.sin(p.phase * .5) * .24; }
  }
  const cinematic = state === 'intro' || state === 'bossIntro';
  const camX = player.root.position.x * .25, camZ = player.root.position.z + (cinematic ? 10.1 : 12.7);
  camera.position.x = THREE.MathUtils.damp(camera.position.x, camX, cinematic ? 1.2 : 2.4, dt);
  camera.position.y = THREE.MathUtils.damp(camera.position.y, cinematic ? 5.7 : 7.0 + Math.sin(t * .22) * .12, cinematic ? 1.2 : 2.2, dt);
  camera.position.z = THREE.MathUtils.damp(camera.position.z, camZ, cinematic ? 1.2 : 2.2, dt);
  const shake = cameraShake; cameraShake = Math.max(0, cameraShake - dt * 1.9);
  camera.position.x += (Math.random() - .5) * shake * .13; camera.position.y += (Math.random() - .5) * shake * .12;
  const focusX = state === 'bossIntro' ? (player.root.position.x + enemy.root.position.x) * .5 : player.root.position.x * .18;
  const focusZ = state === 'bossIntro' ? (player.root.position.z + enemy.root.position.z) * .5 : player.root.position.z - 1.2;
  camera.lookAt(focusX, 1.05, focusZ);
  lanternLight.intensity = 24 + Math.sin(t * 7) * 2.5;
  renderer.render(scene, camera);
}
function frame() { requestAnimationFrame(frame); update(Math.min(clock.getDelta(), .05)); }
frame();

$('start-button').addEventListener('click', startGame);
$('replay-button').addEventListener('click', () => location.reload());
$('sound-button').addEventListener('click', () => {
  audio.enabled = !audio.enabled; $('sound-label').textContent = audio.enabled ? 'SOUND ON' : 'SOUND OFF'; $('sound-icon').textContent = audio.enabled ? '♪' : '×';
  if (audio.enabled) { audio.ctx?.resume(); tone(440, .12, 'sine', .02); }
});
window.addEventListener('keydown', (event) => {
  const code = event.code;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) event.preventDefault();
  if (code === 'Enter' && (state === 'intro' || state === 'bossIntro')) { state = 'fight'; $('dialogue').classList.remove('visible'); showToast(state === 'fight' && bossIntro ? 'The Crimson Widow has arrived.' : 'The lesser demon is closing in.'); return; }
  if (code === 'Enter' && state === 'title') { startGame(); return; }
  keys.add(code);
  if (event.repeat) return;
  if (code === 'KeyJ' || code === 'Numpad1') playerAttack(false);
  if (code === 'KeyK' || code === 'Numpad2') playerAttack(true);
  if (code === 'Space' || code === 'ShiftLeft' || code === 'ShiftRight') dodge();
  if (code === 'Escape' && state === 'fight') showToast('J slash · K Water Form · Space dodge');
});
window.addEventListener('keyup', (event) => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());
sceneCanvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || state !== 'fight') return;
  playerAttack(false);
});
for (const button of document.querySelectorAll('[data-move]')) {
  const direction = button.dataset.move;
  button.addEventListener('pointerdown', (e) => { e.preventDefault(); button.setPointerCapture?.(e.pointerId); touchMove.add(direction); });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, () => touchMove.delete(direction));
}
for (const button of document.querySelectorAll('[data-action]')) {
  const action = button.dataset.action;
  button.addEventListener('pointerdown', (e) => { e.preventDefault(); if (action === 'slash') playerAttack(false); if (action === 'form') playerAttack(true); if (action === 'dodge') dodge(); });
}
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8)); renderer.setSize(innerWidth, innerHeight);
});
updateVitals();
setTimeout(() => $('loading').classList.add('done'), 500);
