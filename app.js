import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ============ 基础场景（布局按 REFERENCE.md 新版动画间取，v3 只做密度） ============ */
const canvas = document.getElementById('c');
const view = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd3f2);
scene.fog = new THREE.Fog(0x9fd3f2, 50, 110);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 300);
camera.position.set(12.5, 8, 14.5);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 2.4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 1.2;
controls.maxDistance = 50;
controls.autoRotateSpeed = 1.2;

const hemi = new THREE.HemisphereLight(0xd8ecff, 0xa89a80, 1.05);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
sun.position.set(14, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -17; sun.shadow.camera.right = 17;
sun.shadow.camera.top = 17; sun.shadow.camera.bottom = -17;
sun.shadow.camera.far = 70;
sun.shadow.bias = -0.0006;
scene.add(sun);

/* ============ 程序化纹理 ============ */
function canvasTex(size, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
let _s = 11;
function rnd() { _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646; }

const roofTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#3a444f'; g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 21) {
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, y, s, 3);
    for (let x = 0; x < s; x += 21) {
      const gr = g.createLinearGradient(x, y, x + 21, y);
      gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(.5, 'rgba(255,255,255,.10)'); gr.addColorStop(1, 'rgba(0,0,0,.35)');
      g.fillStyle = gr; g.fillRect(x, y + 3, 21, 18);
      g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1.5;
      g.beginPath(); g.arc(x + 10.5, y + 21, 8, Math.PI, 0); g.stroke();
    }
  }
}, 8, 4);
const tatamiTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#c6cf96'; g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 3) {
    g.strokeStyle = y % 6 ? 'rgba(95,115,60,.28)' : 'rgba(80,100,50,.4)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, y); g.lineTo(s, y); g.stroke();
  }
  for (let x = 0; x < s; x += 6) {
    g.strokeStyle = 'rgba(110,125,70,.18)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, s); g.stroke();
  }
  g.fillStyle = '#274d31'; g.fillRect(0, 0, s, 7); g.fillRect(0, s - 7, s, 7);
  g.fillStyle = '#3a6b45'; g.fillRect(0, 7, s, 2); g.fillRect(0, s - 9, s, 2);
});
const woodTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#b28a5c'; g.fillRect(0, 0, s, s);
  for (let x = 0; x < s; x += 22) {
    g.fillStyle = `rgba(${118 + rnd() * 42 | 0},${78 + rnd() * 26 | 0},42,.32)`;
    g.fillRect(x, 0, 20, s);
    g.strokeStyle = 'rgba(60,35,15,.55)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, s); g.stroke();
    g.strokeStyle = 'rgba(90,55,25,.28)'; g.lineWidth = 1;
    for (let i = 0; i < 4; i++) { const gx = x + 4 + rnd() * 14; g.beginPath(); g.moveTo(gx, 0); g.bezierCurveTo(gx + 3, s * .3, gx - 3, s * .6, gx + 2, s); g.stroke(); }
  }
}, 3, 3);
const fenceTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#8a6a45'; g.fillRect(0, 0, s, s);
  for (let x = 0; x < s; x += 26) {
    g.fillStyle = `rgba(${110 + rnd() * 36 | 0},${82 + rnd() * 24 | 0},50,.4)`;
    g.fillRect(x + 1, 0, 24, s);
    g.fillStyle = 'rgba(40,25,12,.6)'; g.fillRect(x, 0, 2, s);
    g.strokeStyle = 'rgba(70,48,26,.35)';
    for (let i = 0; i < 5; i++) { const gy = rnd() * s; g.beginPath(); g.moveTo(x + 3, gy); g.lineTo(x + 23, gy + rnd() * 8 - 4); g.stroke(); }
  }
}, 5, 1);
const stoneTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#a9a49a'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = rnd() > .5 ? 'rgba(70,66,58,.3)' : 'rgba(220,215,200,.3)';
    const r = 1 + rnd() * 2.5;
    g.beginPath(); g.arc(rnd() * s, rnd() * s, r, 0, 7); g.fill();
  }
}, 2, 2);
const plasterTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#f2ecdf'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 700; i++) {
    g.fillStyle = rnd() > .5 ? 'rgba(180,170,150,.25)' : 'rgba(255,255,255,.35)';
    g.fillRect(rnd() * s, rnd() * s, 2, 2);
  }
}, 2, 1);
const grassTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#79a95b'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = rnd() > .5 ? 'rgba(60,110,45,.5)' : 'rgba(150,200,110,.45)';
    g.fillRect(rnd() * s, rnd() * s, 2, 2 + rnd() * 3);
  }
}, 16, 16);
// 地毯图案
const rugTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#a8443c'; g.fillRect(0, 0, s, s);
  g.strokeStyle = '#e8d9a8'; g.lineWidth = 5; g.strokeRect(9, 9, s - 18, s - 18);
  g.lineWidth = 2.5; g.strokeRect(20, 20, s - 40, s - 40);
  g.save(); g.translate(s / 2, s / 2); g.rotate(Math.PI / 4);
  g.strokeStyle = '#e8d9a8'; g.lineWidth = 3; g.strokeRect(-22, -22, 44, 44);
  g.restore();
  g.fillStyle = '#e8d9a8';
  for (const [x, y] of [[0, 0], [s, 0], [0, s], [s, s]]) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); }
}, 1, 1);
// 襖画：红日青松
const paintTex = canvasTex(128, (g, s) => {
  const gr = g.createLinearGradient(0, 0, 0, s);
  gr.addColorStop(0, '#ece4cc'); gr.addColorStop(1, '#c9ba90');
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
  g.fillStyle = 'rgba(178,62,48,.88)'; g.beginPath(); g.arc(s * 0.66, s * 0.3, s * 0.15, 0, 7); g.fill();
  g.strokeStyle = 'rgba(52,74,46,.85)'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(s * 0.22, s); g.quadraticCurveTo(s * 0.3, s * 0.55, s * 0.14, s * 0.5); g.stroke();
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(s * 0.26, s * 0.72); g.quadraticCurveTo(s * 0.42, s * 0.66, s * 0.5, s * 0.6); g.stroke();
  g.fillStyle = 'rgba(52,74,46,.7)';
  for (let i = 0; i < 12; i++) { g.beginPath(); g.ellipse(s * (0.1 + rnd() * 0.45), s * (0.4 + rnd() * 0.3), 9, 4, rnd() * 3, 0, 7); g.fill(); }
});
// 日历：网格+红圈
const calendarTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#f5f2e8'; g.fillRect(0, 0, s, s);
  g.fillStyle = '#c03a30'; g.fillRect(0, 0, s, 26);
  g.fillStyle = '#fff'; g.font = 'bold 17px sans-serif'; g.textAlign = 'center';
  g.fillText('10', s / 2, 19);
  g.strokeStyle = '#b0a890'; g.lineWidth = 1;
  for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(8 + i * 28, 30); g.lineTo(8 + i * 28, s - 6); g.stroke(); }
  for (let j = 1; j < 4; j++) { g.beginPath(); g.moveTo(8, 30 + j * 24); g.lineTo(s - 8, 30 + j * 24); g.stroke(); }
  g.fillStyle = '#333'; g.font = '9px sans-serif';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) g.fillText(String(1 + r * 4 + c), 22 + c * 28, 46 + r * 24);
  g.strokeStyle = '#c03a30'; g.lineWidth = 3;
  g.beginPath(); g.arc(22 + 2 * 28, 46 + 2 * 24, 10, 0, 7); g.stroke(); // 考试日红圈
}, 1, 1);
// 特摄海报：放射线+剪影
const posterTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#1d2a4a'; g.fillRect(0, 0, s, s);
  g.save(); g.translate(s / 2, s * 0.42);
  for (let i = 0; i < 16; i++) {
    g.rotate(Math.PI / 8);
    g.fillStyle = i % 2 ? 'rgba(224,177,62,.25)' : 'rgba(224,177,62,.08)';
    g.beginPath(); g.moveTo(0, 0); g.lineTo(s, -8); g.lineTo(s, 8); g.fill();
  }
  g.restore();
  g.fillStyle = '#0d1526';
  g.fillRect(s * 0.42, s * 0.3, s * 0.16, s * 0.42); // 英雄剪影
  g.beginPath(); g.arc(s * 0.5, s * 0.24, s * 0.08, 0, 7); g.fill();
  g.fillStyle = '#e0b13e'; g.font = 'bold 13px sans-serif'; g.textAlign = 'center';
  g.fillText('ミラクルマン', s / 2, s * 0.86);
}, 1, 1);

/* ============ 材质与建模助手 ============ */
function M(color, o = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: o.rough ?? 0.92, metalness: o.metal ?? 0,
    map: o.map || null, transparent: !!o.transparent, opacity: o.opacity ?? 1,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1,
    side: o.side || THREE.FrontSide
  });
}
const extMats = [];
function extM(color, o = {}) { const m = M(color, o); extMats.push(m); return m; }

/* 共享材质（重复小物件复用，控制材质总数） */
const SH = {
  woodDark: M(0x4a3524, { rough: 0.8 }),
  woodMid: M(0x8a5f36, { map: woodTex, rough: 0.75 }),
  woodLight: M(0xb28a5c, { rough: 0.85 }),
  white: M(0xf7f7f7, { rough: 0.9 }),
  paper: M(0xf5efdd, { rough: 0.92 }),
  black: M(0x232323, { rough: 0.6 }),
  metal: M(0x9aa0a6, { metal: 0.45, rough: 0.45 }),
  steel: M(0xd0d4d8, { metal: 0.7, rough: 0.35 }),
  gold: M(0xd9b23a, { metal: 0.6, rough: 0.35 }),
  mirror: M(0xcfe0ea, { rough: 0.15, metal: 0.2 }),
  ceramic: M(0xf2f4f6, { rough: 0.4 }),
  stone: M(0xffffff, { map: stoneTex, rough: 0.95 }),
  tatami: M(0xffffff, { map: tatamiTex, rough: 0.95 }),
  tileFloor: M(0xb9c4c9, { rough: 0.9 }),
  curtainBlue: M(0x7fb3d9, { rough: 0.95 }),
  books: [0xd94f4f, 0x4f7ad9, 0x4fd97a, 0xe0b13e, 0x9b59b6, 0xe67e22, 0x1abc9c, 0x8a6a3a].map(c => M(c, { rough: 0.85 })),
  shoes: [0x8a4a3a, 0x3a5a8a, 0x5a5a5a, 0xb08d4a].map(c => M(c, { rough: 0.9 })),
  leaf: M(0x4d8a3f, { rough: 1 }),
  leaf2: M(0x5da24a, { rough: 1 }),
  trunk: M(0x6e4f30, { rough: 1 }),
  lampGlow: M(0xfff2c8, { emissive: 0xffe9a8, ei: 0.7 }),
};
function bookMat() { return SH.books[(rnd() * SH.books.length) | 0]; }

function box(w, h, d, material, x, y, z, parent, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z); m.rotation.y = ry;
  m.castShadow = m.receiveShadow = true;
  (parent || scene).add(m);
  tagPart(m, parent);
  return m;
}
function cyl(rt, rb, h, material, x, y, z, parent, seg = 14) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  (parent || scene).add(m);
  tagPart(m, parent);
  return m;
}
function sph(r, material, x, y, z, parent, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), material);
  m.position.set(x, y, z); m.scale.set(sx, sy, sz);
  m.castShadow = m.receiveShadow = true;
  (parent || scene).add(m);
  tagPart(m, parent);
  return m;
}
function cone(r, h, material, x, y, z, parent, seg = 14) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), material);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  (parent || scene).add(m);
  tagPart(m, parent);
  return m;
}
function tagPart(mesh, parent) {
  let n = parent;
  while (n) {
    if (n.userData && n.userData.isPart) { mesh.userData.partId = n.userData.partId; break; }
    n = n.parent;
  }
}
function wallSeg(x1, z1, x2, z2, y0, h, t, material, parent) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
  return (Math.abs(x2 - x1) > Math.abs(z2 - z1))
    ? box(len, h, t, material, cx, y0 + h / 2, cz, parent)
    : box(t, h, len, material, cx, y0 + h / 2, cz, parent);
}

/* ============ 部件注册表（108个） ============ */
const PARTS = {};
const CATS = { out: '外部', f1: '一楼', f2: '二楼' };
function defPart(id, meta) { PARTS[id] = Object.assign({ id, group: null }, meta); }
function P(id, parent) {
  const g = new THREE.Group();
  g.userData.isPart = true; g.userData.partId = id;
  PARTS[id].group = g;
  (parent || scene).add(g);
  return g;
}
// ---- 外部 ----
defPart('roof', { name: '屋顶', cat: 'out', layer: 'roof', label: [0, 7.9, 0], viewDir: [1, .75, 1], desc: '切妻造的日式瓦屋顶。深灰色的筒瓦层层叠叠，是野比家最显眼的标志。' });
defPart('onigawara', { name: '鬼瓦', cat: 'out', layer: 'roof', label: [4.95, 7.62, 0], viewDir: [1, .5, .4], desc: '屋脊两端的鬼瓦——日本传统民居用来镇宅辟邪的瓦饰，瞪着眼睛守护着这个家。' });
defPart('rafter', { name: '椽木', cat: 'out', layer: 'roof', noLabel: 1, desc: '屋檐下整齐排列的椽木头（垂木），一根根支撑着出檐的瓦片。' });
defPart('gutter', { name: '雨水管', cat: 'out', layer: 'roof', label: [-4.95, 4.2, 3.7], viewDir: [-1, .4, 1], desc: '屋檐下的雨水槽、托架和落水管。下雨天，雨水顺着这里哗哗流进院子。' });
defPart('plinth', { name: '地基·踢脚', cat: 'out', layer: 'f1', label: [-4.5, 0.35, 2], viewDir: [-1, .4, .8], desc: '石材地基和外墙根部的粉刷踢脚，把木造的房子稳稳托离地面，防潮防腐。' });
defPart('extwall1', { name: '一楼外墙', cat: 'out', layer: 'f1', label: [-4.5, 1.7, 0.4], viewDir: [-1, .5, .6], desc: '米白色灰泥外墙配深色木质窗框与转角柱，典型的昭和年代木造民居。' });
defPart('extwall2', { name: '二楼外墙', cat: 'out', layer: 'f2', label: [4.5, 4.7, 0.6], viewDir: [1, .5, .6], desc: '二楼的外墙。大雄房间的东窗和南窗都在这里——南窗正对着玄关屋顶。' });
defPart('windows1', { name: '一楼木窗', cat: 'out', layer: 'f1', label: [-4.5, 1.7, 1.9], viewDir: [-1, .5, .6], desc: '一楼的木框格子窗，糊着障子纸，隐约透出里面的窗帘。晚上亮起暖黄色的灯。' });
defPart('windows2', { name: '二楼木窗', cat: 'out', layer: 'f2', label: [4.5, 4.7, 2.2], viewDir: [1, .5, .6], desc: '二楼的木窗。大雄房间东窗在书桌上方，南窗正对玄关屋顶——他常从这里爬出去。' });
defPart('amado', { name: '雨戸', cat: 'out', layer: 'f1', label: [-2.6, 1.5, 3.7], viewDir: [-.5, .5, 1], desc: '防雨的木质滑窗板（雨戸），平时收在窗边的戸袋里。台风天或出远门才拉出来——这几扇正半开着。' });
defPart('amado2', { name: '二楼雨戸', cat: 'out', layer: 'f2', noLabel: 1, desc: '大雄房间南窗的雨戸，同样半开着。' });
defPart('door', { name: '玄关大门', cat: 'out', layer: 'f1', label: [3.3, 1.7, 4.7], viewDir: [.5, .45, 1], desc: '野比家的玄关木门。每天放学，大雄都是哭着从这里冲进来的。' });
defPart('doorbell', { name: '门铃', cat: 'out', layer: 'f1', noLabel: 1, desc: '门边的对讲门铃。来客人时"叮咚"一响，大雄就知道又要乖乖打招呼了。' });
defPart('genkanlight', { name: '玄关灯', cat: 'out', layer: 'f1', noLabel: 1, desc: '玄关门旁的小灯。天黑回家，妈妈总会提前把它点亮。' });
defPart('doormat', { name: '门垫', cat: 'out', layer: 'f1', noLabel: 1, desc: '玄关外的门垫，进门前先在这里蹭蹭鞋底。' });
defPart('porchroof', { name: '玄关雨棚·昼寝屋顶', cat: 'out', layer: 'f1', label: [3.3, 3.95, 4.15], viewDir: [1, .6, 1], desc: '玄关门上的小瓦屋顶——大雄房间的窗户正对着它，大雄常从窗户爬出来在这里午睡晒太阳。' });
defPart('hirunefence', { name: '昼寝围栏', cat: 'out', layer: 'f1', noLabel: 1, desc: '雨棚屋顶边缘的木围栏，防止午睡的大雄翻下去（大概）。' });
defPart('hirunefuton', { name: '晒被褥', cat: 'out', layer: 'f1', noLabel: 1, desc: '搭在围栏上晒太阳的被褥，晒得暖烘烘、充满阳光的味道。' });
defPart('antenna', { name: '电视天线', cat: 'out', layer: 'roof', label: [2.4, 8.65, 0], viewDir: [1, .6, .8], desc: '屋脊上的八木电视天线——这家人看电视全靠它。' });
defPart('fence', { name: '板塀', cat: 'out', layer: 'garden', label: [-5.5, 1.6, 6.5], viewDir: [-.6, .5, 1], desc: '环绕庭院的木板围墙（板塀），不是混凝土的——这才是动画里的样子。' });
defPart('gate', { name: '木大门', cat: 'out', layer: 'garden', label: [3.3, 1.4, 6.5], viewDir: [.3, .5, 1], desc: '板塀上的木质推拉大门，挂着"野比"家的表札。大雄上学、出去玩都经过这里。' });
defPart('path', { name: '石板路', cat: 'out', layer: 'garden', label: [1.2, 0.3, 5.6], viewDir: [.4, .7, 1], desc: '从大门通往玄关的石板小径，石缝里长着青苔。' });
defPart('dryer', { name: '晾衣杆', cat: 'out', layer: 'garden', label: [-0.5, 2.1, 5.0], viewDir: [-.5, .5, 1], desc: '庭院里的晾衣杆（物干し）。妈妈每天在这里晾衣服、拍打被褥。' });
defPart('laundry', { name: '晾晒衣物', cat: 'out', layer: 'garden', noLabel: 1, desc: '杆子上晾着的T恤和毛巾，随风轻轻摆动——是妈妈刚洗好的。' });
defPart('lantern', { name: '石灯笼', cat: 'out', layer: 'garden', label: [-3.5, 1.35, 4.5], viewDir: [-1, .6, 1], desc: '庭院一角的石灯笼，火袋里透着微光，和式庭院的标配。' });
defPart('plants', { name: '植栽', cat: 'out', layer: 'garden', label: [5.8, 2.7, -4.5], viewDir: [1, .6, -1], desc: '庭院里的树木和灌木。练马区的独栋小院，总要有点绿色。' });
defPart('flowerbed', { name: '花坛', cat: 'out', layer: 'garden', noLabel: 1, desc: '墙边的花坛，开着几朵小花，是妈妈打理的。' });
defPart('bamboo', { name: '竹篱笆', cat: 'out', layer: 'garden', noLabel: 1, desc: '院角的一段竹篱笆，透着和风。' });
defPart('shed', { name: '物置棚', cat: 'out', layer: 'garden', label: [-5.5, 2.4, -4.5], viewDir: [-1, .6, -1], desc: '后院的小储物棚，放着园艺工具和杂物。' });
// ---- 一楼 ----
defPart('genkan', { name: '玄关', cat: 'f1', layer: 'f1', xray: 1, label: [3.3, 1.1, 2.6], desc: '下沉式的土间玄关：进门先脱鞋，旁边是鞋柜和伞架。' });
defPart('shoebox', { name: '鞋柜', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '玄关的下駄箱，三层隔板，门上还贴着备忘纸条。' });
defPart('shoes', { name: '全家的鞋', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '爸爸的皮鞋、妈妈的布鞋、大雄的运动鞋——每双都摆得整整齐齐。' });
defPart('umbstand', { name: '伞架', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '伞架里插着两把长伞一把折叠伞。东京的梅雨季，它可是劳模。' });
defPart('keybox', { name: '钥匙盒', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '墙上的小钥匙盒，挂着备用钥匙和自行车钥匙。' });
defPart('genkanmat', { name: '玄关垫', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '式台上的玄关垫，脱鞋换鞋都站在这儿。' });
defPart('hallway', { name: '廊下', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '一楼的走廊，串起玄关、客厅、餐厅厨房、浴室和接客室。' });
defPart('baseboard1', { name: '一楼踢脚线', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '走廊墙根的木质踢脚线，保护墙面不被鞋尖踢脏。' });
defPart('lamp1f', { name: '一楼灯具', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '各房间的吊灯和吸顶灯。晚上全家最亮的地方就是客厅这盏。' });
defPart('famphoto', { name: '全家福', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '走廊墙上的全家福：爸爸妈妈、大雄，还有一只蓝色的机器猫。' });
defPart('switch1', { name: '电灯开关', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '门边的电灯开关，大雄总够不着（小时候）。' });
defPart('stairs', { name: '楼梯', cat: 'f1', layer: 'f1', xray: 1, label: [0.3, 1.9, 0.6], desc: '通往二楼的木楼梯，扶手配着小柱和托架。大雄每天噔噔噔跑上楼。' });
defPart('understair', { name: '楼梯下储物间', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '楼梯下的物入小门，里面塞着扫除用具和旧报纸。' });
defPart('living', { name: '客厅', cat: 'f1', layer: 'f1', xray: 1, label: [-2.2, 1.3, 1.9], desc: '8帖大的和室客厅（居間），铺着榻榻米。是全家人吃饭、看电视、大雄挨训的地方。' });
defPart('chabudai', { name: '矮桌·坐垫', cat: 'f1', layer: 'f1', xray: 1, label: [-2.2, 0.9, 1.9], viewDir: [.7, .9, .7], desc: '客厅中央的矮桌（ちゃぶ台）和四个坐垫，垫子都缝了包边。妈妈的拿手咖喱就在这开饭。' });
defPart('tv', { name: '电视机', cat: 'f1', layer: 'f1', xray: 1, label: [0.9, 1.3, 1.9], viewDir: [1, .6, .6], desc: '老式CRT电视机，旁边放着遥控器。大雄最爱的特摄节目就是这台放的。' });
defPart('tokonoma', { name: '床の间', cat: 'f1', layer: 'f1', xray: 1, label: [0.1, 1.6, 0.5], viewDir: [.8, .7, -.6], desc: '客厅的床の间（壁龛）：抬高的木框地台，是和室最郑重的一角。' });
defPart('kakejiku', { name: '挂轴', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '床の间挂轴：红日青松图，上下还配着轴杆。逢年过节才换上这一幅。' });
defPart('butsudan', { name: '佛坛', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '床の间里的佛坛：须弥坛上两支蜡烛、香炉里插着线香，供着小碟点心。' });
defPart('ikebana', { name: '插花', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '床の间花瓶里的插花——妈妈的插花教室作业，讲究"真行草"。' });
defPart('fusumae', { name: '襖画', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '拉门上的画：淡彩的山水。推拉门一开一合，画也跟着"动"起来。' });
defPart('dining', { name: '餐厅', cat: 'f1', layer: 'f1', xray: 1, label: [-2.6, 1.2, -1.2], desc: '10帖大的饮食空间：餐桌配四把椅子，桌上摆着小花瓶。早餐晚餐，一家四口围坐在这里。' });
defPart('kitchen', { name: '厨房', cat: 'f1', layer: 'f1', xray: 1, label: [-3.6, 1.5, -1.8], desc: 'L形流理台：水槽、双口燃气灶。妈妈每天在这里变出咖喱和汉堡肉。' });
defPart('cabinet', { name: '吊柜', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '流理台上方的吊柜，两扇门带把手，存着碗碟干货。' });
defPart('ricecooker', { name: '电饭煲', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '电饭煲，保温灯常年亮着——这家的米饭就没断过。' });
defPart('microwave', { name: '微波炉', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '微波炉，热剩菜、化冻全靠它。' });
defPart('utensils', { name: '厨具挂架', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '墙上的挂杆：锅铲、汤勺、漏勺一字排开，伸手就能够到。' });
defPart('detergent', { name: '洗洁精·调料', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '水槽边的洗洁精、酱油和盐罐——厨房的"三剑客"。' });
defPart('kitchenmat', { name: '厨房地垫', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '水槽前的防滑地垫，妈妈做饭时站的老位置。' });
defPart('rangehood', { name: '换气扇', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '灶台上方的换气扇，炒菜时的油烟都靠它吸走，扇叶转得嗡嗡响。' });
defPart('backdoor', { name: '胜手口', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '厨房通往后院的后门（勝手口），倒垃圾、拿快递走这里。' });
defPart('fridge', { name: '冰箱', cat: 'f1', layer: 'f1', xray: 1, label: [-0.6, 1.4, -3.0], viewDir: [.6, .6, -1], desc: '厨房角落的冰箱，门上贴着便签和磁贴。里面常备麦茶和布丁——布丁是留给谁的呢？' });
defPart('bath', { name: '浴室', cat: 'f1', layer: 'f1', xray: 1, label: [0.55, 1.3, -2.7], desc: '日式浴室：深浴缸+洗身区。规矩是先在外面洗干净再进浴缸泡——大雄总想偷懒。' });
defPart('shower', { name: '淋浴', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '淋浴头加软管，挂在墙上。水压是爸爸调的，刚刚好。' });
defPart('tubcover', { name: '浴缸盖', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '浴缸的木质保温盖，卷起来的样子——泡澡前先把它挪开。' });
defPart('bathmirror', { name: '浴室镜', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '浴室的防雾镜，刚洗完澡照上去全是雾气。' });
defPart('bathgoods', { name: '凳·桶·洗剂', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '洗澡凳、小水桶和洗发水沐浴露三兄弟，整齐码在角落。' });
defPart('washroom', { name: '洗面所', cat: 'f1', layer: 'f1', xray: 1, label: [2.8, 1.3, -2.75], desc: '洗面脱衣所。早上全家排队刷牙、晚上排队洗澡前脱衣服的地方。' });
defPart('sink', { name: '洗面台', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '洗面台+镜柜：台盆、龙头，镜柜里藏着剃须刀和化妆水。' });
defPart('toothbrush', { name: '牙刷架', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '牙刷架上四支牙刷：蓝、粉、黄、绿，一人一支颜色分明。' });
defPart('washtowel', { name: '洗面毛巾', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '毛巾架上搭着两条毛巾，绣着名字，绝不拿错。' });
defPart('washer', { name: '洗衣机', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '波轮洗衣机，上面还放着待洗的衣物篮。' });
defPart('toilet', { name: '厕所', cat: 'f1', layer: 'f1', xray: 1, label: [3.8, 1.1, -2.9], desc: '独立式厕所，和浴室分开。半夜大雄不敢一个人来，总要叫哆啦A梦陪。' });
defPart('tproll', { name: '卷纸架', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '卷纸架上的卫生纸——永远在"还剩一点"和"用完了"之间徘徊。' });
defPart('tshelf', { name: '厕所置物架', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '马桶上方的小置物架，放着除臭剂和备用纸巾。' });
defPart('tslipper', { name: '厕所拖鞋', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '厕所专用的拖鞋，进门换鞋是规矩。' });
defPart('reception', { name: '接客室', cat: 'f1', layer: 'f1', xray: 1, label: [3.3, 1.4, -0.2], desc: '爸爸的休憩间（応接室）：客人不来时就是他的小天地。' });
defPart('sofa', { name: '沙发茶几', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '布艺沙发+小茶几。爸爸下班回来，第一件事就是瘫在这里。' });
defPart('golfbag', { name: '高尔夫球包', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '角落里的高尔夫球包——爸爸"下次一定去"的证明，球杆都落灰了。' });
defPart('ceiling1', { name: '一楼天花板', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '各房间的天花板（剖面视角会自动隐藏，方便看里面）。' });
// ---- 二楼 ----
defPart('nobita', { name: '大雄的房间', cat: 'f2', layer: 'f2', xray: 1, label: [2.7, 4.9, 1.3], viewDir: [1, 1, 1], desc: '6帖大的大雄房间！二楼东侧，窗户正对玄关屋顶。无数故事都是从这个房间开始的。' });
defPart('desk', { name: '书桌', cat: 'f2', layer: 'f2', xray: 1, label: [3.85, 4.15, 2.2], viewDir: [-.7, .5, .6], desc: '大雄的书桌，靠在东窗下。桌面上堆着没写完的作业。' });
defPart('timedrawer', { name: '时光机抽屉', cat: 'f2', layer: 'f2', xray: 1, label: [3.62, 4.4, 2.85], viewDir: [-.5, .4, 1], desc: '★那个金色的抽屉——里面藏着时光机！哆啦A梦就是从这里来到20世纪的。' });
defPart('deskdrawers', { name: '书桌抽屉', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '书桌的普通抽屉，塞着文具、橡皮和不知道什么时候的考卷（0分）。' });
defPart('desklamp', { name: '台灯', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '可活动的台灯，灯罩能转。深夜赶作业时，它是唯一的光。' });
defPart('penstand', { name: '笔筒', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '笔筒里的铅笔、圆珠笔和尺子——橡皮永远在失踪中。' });
defPart('chair', { name: '椅子', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '书桌前的椅子。大雄坐在这里"学习"（发呆）时，哆啦A梦常在旁边唠叨。' });
defPart('chairpad', { name: '椅垫', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '椅子上的坐垫，坐久了也不硌。' });
defPart('bed', { name: '床', cat: 'f2', layer: 'f2', xray: 1, label: [1.75, 4.0, 2.4], viewDir: [-1, .7, .8], desc: '大雄的床。无数个清晨，他都是在这里被妈妈的"起床——！"叫醒的。' });
defPart('nightstand', { name: '床头柜·闹钟', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '床头柜上的小闹钟——每天早上准时被妈妈"人工叫醒"，它反而成了摆设。' });
defPart('shelf', { name: '书架', cat: 'f2', layer: 'f2', xray: 1, label: [2.05, 4.6, -0.5], viewDir: [.6, .7, -1], desc: '塞得满满的书架：漫画竖排、大开本图鉴、横堆的杂志——妈妈总念叨他不好好学习。' });
defPart('closet', { name: '壁橱', cat: 'f2', layer: 'f2', xray: 1, label: [3.55, 4.3, -0.4], viewDir: [.8, .6, -.8], desc: '壁橱（押入れ）：推拉门半开着。' });
defPart('closetfuton', { name: '壁橱被褥', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '壁橱下层叠好的被褥和枕头——这就是哆啦A梦的床！怕老鼠的他，晚上就缩在这里。' });
defPart('rug', { name: '大雄房间地毯', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '房间中央的图案地毯，大雄常躺在上面看漫画。' });
defPart('wallclock', { name: '挂钟', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '墙上的挂钟。每次大雄迟到，它都显得格外刺眼。' });
defPart('calendar', { name: '日历', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '墙上的日历，考试日期被红圈标了出来（并打了个叉）。' });
defPart('poster', { name: '海报', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '墙上的特摄海报，大雄的"精神支柱"。' });
defPart('curtain', { name: '窗帘', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '东窗和南窗的窗帘，束了起来。窗外就是玄关屋顶——午睡圣地。' });
defPart('trashbin', { name: '垃圾桶', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '垃圾桶里的纸团：揉皱的0分考卷，大概。' });
defPart('washitsu', { name: '和室', cat: 'f2', layer: 'f2', xray: 1, label: [-2.2, 4.6, 1.4], viewDir: [-1, 1, 1], desc: '二楼西侧的和室客房，铺着榻榻米。' });
defPart('wcloset', { name: '和室壁橱', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '和室的壁橱，收着客用的被褥。' });
defPart('hall2', { name: '二楼廊下', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '二楼走廊：从楼梯上来拐个弯才到大雄房间——这个转弯在动画里经常"变来变去"。' });
defPart('baseboard2', { name: '二楼踢脚线', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '二楼走廊墙根的踢脚线。' });
defPart('hallphoto', { name: '墙上照片', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '走廊墙上的相框：大雄小时候的照片，缺了门牙的那张。' });
defPart('lamp2f', { name: '二楼灯具', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '二楼走廊和和室的吸顶灯。' });
defPart('storeroom', { name: '纳户', cat: 'f2', layer: 'f2', xray: 1, label: [2.2, 4.3, -2.85], viewDir: [1, .9, -1], desc: '二楼北侧的纳户（储物间），堆满了纸箱。' });
defPart('boxlabels', { name: '标签纸箱', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '贴着标签的纸箱："冬物""书""旧玩具"——搬家以来就没打开过。' });
defPart('oldtoys', { name: '旧玩具', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '大雄小时候的旧玩具：铁皮机器人、皮球和小汽车，都落了灰。' });
defPart('rolledrug', { name: '卷起的被褥', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '卷起来的换季被褥，捆得紧紧的。' });
defPart('ceiling2', { name: '二楼天花板', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '二楼各房间的天花板（剖面视角会自动隐藏）。' });

/* ============ 尺寸常量（布局与 v2 完全一致） ============ */
const HX = 4.25, HZ = 3.5, T = 0.15;
const F1 = 0.2, WH = 2.7;
const F2 = F1 + WH + 0.25;
const EAVE = F2 + WH;
const RIDGE = EAVE + 1.5;

const gGarden = new THREE.Group(), gF1 = new THREE.Group(),
      gF2 = new THREE.Group(), gRoof = new THREE.Group();
scene.add(gGarden, gF1, gF2, gRoof);
const cutWalls = {};

/* ============ 庭院 ============ */
(function buildGarden() {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), M(0xffffff, { map: grassTex, rough: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);
  const lot = box(15.4, 0.06, 13.4, M(0xa3a099, { rough: 1 }), 0, 0.0, 0, gGarden);
  lot.receiveShadow = true;

  const f = P('fence', gGarden);
  const plankM = M(0xffffff, { map: fenceTex, rough: 0.9 });
  const capM = SH.woodDark;
  function fenceRun(x1, z1, x2, z2) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
    const horiz = Math.abs(x2 - x1) > Math.abs(z2 - z1);
    box(horiz ? len : 0.12, 1.6, horiz ? 0.12 : len, plankM, cx, 0.8, cz, f);
    box(horiz ? len + 0.06 : 0.2, 0.09, horiz ? 0.2 : len + 0.06, capM, cx, 1.64, cz, f);
    const n = Math.floor(len / 1.5);
    for (let i = 0; i <= n; i++) {
      const t = n ? i / n : 0.5;
      box(0.16, 1.75, 0.16, capM, x1 + (x2 - x1) * t, 0.875, z1 + (z2 - z1) * t, f);
    }
  }
  fenceRun(-7.5, -6.5, 7.5, -6.5);
  fenceRun(-7.5, 6.5, 2.6, 6.5);
  fenceRun(4.0, 6.5, 7.5, 6.5);
  fenceRun(-7.5, -6.5, -7.5, 6.5);
  fenceRun(7.5, -6.5, 7.5, 6.5);

  const gt = P('gate', gGarden);
  const gateM = M(0x7a5636, { map: fenceTex, rough: 0.88 });
  box(0.24, 2.0, 0.24, capM, 2.6, 1.0, 6.5, gt);
  box(0.24, 2.0, 0.24, capM, 4.0, 1.0, 6.5, gt);
  const slide = new THREE.Group(); slide.position.set(2.6, 0, 6.5); slide.rotation.y = 0.28; gt.add(slide);
  box(1.15, 1.5, 0.07, gateM, 0.58, 0.85, 0, slide);
  box(1.15, 0.1, 0.1, capM, 0.58, 1.62, 0, slide);
  box(0.5, 0.34, 0.02, M(0xe8e2d2, { rough: 0.8 }), 0.58, 0.95, 0.045, slide);
  box(0.3, 0.2, 0.025, M(0x2b2b2b), 0.58, 0.95, 0.048, slide);

  // 石板路（缝隙青苔）
  const pt = P('path', gGarden);
  const stoneM = SH.stone;
  const mossM = M(0x4d7a3f, { rough: 1 });
  const pathPts = [[3.3, 6.1], [3.3, 5.45], [3.15, 4.8], [3.3, 4.15]];
  pathPts.forEach(([x, z], i) => {
    box(0.72, 0.06, 0.55, stoneM, x, 0.05, z, pt, (i % 2 ? 0.08 : -0.06));
    for (let k = 0; k < 3; k++)
      sph(0.05 + rnd() * 0.04, mossM, x - 0.3 + rnd() * 0.6, 0.075, z - 0.22 + rnd() * 0.44, pt, 1, 0.4, 1).castShadow = false;
  });

  // 晾衣杆
  const dr = P('dryer', gGarden);
  const poleM = M(0x9aa0a8, { metal: 0.55, rough: 0.4 });
  cyl(0.035, 0.035, 2.1, poleM, -1.5, 1.05, 5.0, dr);
  cyl(0.035, 0.035, 2.1, poleM, 0.5, 1.05, 5.0, dr);
  const bar = cyl(0.03, 0.03, 2.3, poleM, -0.5, 2.05, 5.0, dr); bar.rotation.z = Math.PI / 2;
  // 晾衣绳（第二根，低位晾毛巾）
  const bar2 = cyl(0.02, 0.02, 1.8, poleM, -0.5, 1.55, 5.35, dr); bar2.rotation.z = Math.PI / 2;

  // 晾晒衣物（独立部件）
  const ld = P('laundry', gGarden);
  const shirtM = M(0x7fb3d9, { rough: 0.95 }), towelM = M(0xf0ead8, { rough: 0.95 }), sockM = M(0xe08a9a, { rough: 0.95 });
  function hangingCloth(x, y, w, h, mat, sway) {
    const g = new THREE.Group(); g.position.set(x, y, 5.0); g.rotation.z = sway; ld.add(g);
    box(w, h, 0.035, mat, 0, -h / 2, 0, g);
    box(w * 0.32, h * 0.28, 0.04, mat, -w * 0.3, -h * 0.14, 0, g); // 袖子
    box(w * 0.32, h * 0.28, 0.04, mat, w * 0.3, -h * 0.14, 0, g);
    box(0.05, 0.06, 0.05, SH.woodDark, -w * 0.32, 0.02, 0, g); // 衣夹
    box(0.05, 0.06, 0.05, SH.woodDark, w * 0.32, 0.02, 0, g);
  }
  hangingCloth(-0.95, 2.03, 0.52, 0.64, shirtM, 0.04);
  hangingCloth(-0.15, 2.03, 0.4, 0.5, towelM, -0.05);
  hangingCloth(0.35, 2.03, 0.3, 0.36, sockM, 0.07);

  // 石灯笼（火袋开口）
  const ln = P('lantern', gGarden);
  const slM = SH.stone;
  box(0.5, 0.25, 0.5, slM, -3.5, 0.125, 4.5, ln);
  cyl(0.09, 0.11, 0.75, slM, -3.5, 0.6, 4.5, ln);
  box(0.44, 0.34, 0.44, slM, -3.5, 1.14, 4.5, ln);
  // 火袋：四面开口透出暖光
  for (const [dx, dz, ry] of [[0, 0.2, 0], [0, -0.2, 0], [0.2, 0, Math.PI / 2], [-0.2, 0, Math.PI / 2]]) {
    const gl = box(0.14, 0.18, 0.02, M(0xffe9a8, { emissive: 0xffc86e, ei: 0.8 }), -3.5 + dx, 1.14, 4.5 + dz, ln, ry);
    gl.castShadow = false;
  }
  cone(0.42, 0.3, slM, -3.5, 1.46, 4.5, ln, 4);
  sph(0.09, slM, -3.5, 1.66, 4.5, ln);

  // 植栽（更多灌木+苔藓）
  const pl = P('plants', gGarden);
  function tree(x, z, sc) {
    cyl(0.11 * sc, 0.17 * sc, 1.8 * sc, SH.trunk, x, 0.9 * sc, z, pl);
    sph(1.0 * sc, SH.leaf, x, 2.3 * sc, z, pl);
    sph(0.7 * sc, SH.leaf2, x + 0.6 * sc, 1.85 * sc, z + 0.3 * sc, pl);
    sph(0.62 * sc, SH.leaf2, x - 0.55 * sc, 1.9 * sc, z - 0.3 * sc, pl);
  }
  tree(-5.6, 4.2, 1.0); tree(5.8, -4.5, 1.3); tree(-6.2, -2.0, 0.85); tree(6.0, 3.0, 0.7);
  for (let i = 0; i < 8; i++) sph(0.3 + rnd() * 0.16, i % 2 ? SH.leaf : SH.leaf2, -6.6 + i * 1.75, 0.26, -5.9, pl, 1, 0.72, 1);
  for (let i = 0; i < 5; i++) sph(0.28 + rnd() * 0.14, i % 2 ? SH.leaf2 : SH.leaf, 5.4 + (i % 2) * 0.9, 0.24, 5.7 - i * 0.35, pl, 1, 0.72, 1);
  for (let i = 0; i < 6; i++) sph(0.2 + rnd() * 0.12, SH.leaf2, -2.5 + rnd() * 5, 0.16, 4.2 + rnd() * 1.2, pl, 1, 0.6, 1); // 灯笼周边灌木
  for (let i = 0; i < 8; i++) sph(0.09, mossM, -4 + rnd() * 8, 0.05, 3.8 + rnd() * 2.4, pl, 1, 0.35, 1).castShadow = false; // 苔藓

  // 花坛
  const fb = P('flowerbed', gGarden);
  box(2.0, 0.28, 0.7, SH.stone, -5.8, 0.14, 2.2, fb);
  box(1.8, 0.1, 0.5, M(0x5a4028, { rough: 1 }), -5.8, 0.3, 2.2, fb);
  const flCols = [0xe08a9a, 0xe0b13e, 0xd94f4f, 0xf0f0f0];
  for (let i = 0; i < 6; i++) {
    const fx = -6.5 + i * 0.28 + rnd() * 0.1;
    cyl(0.015, 0.015, 0.22, SH.leaf, fx, 0.42, 2.2 + (rnd() - .5) * 0.3, fb, 6);
    sph(0.05, M(flCols[i % 4], { rough: 0.9 }), fx, 0.55, 2.2 + (rnd() - .5) * 0.3, fb);
  }

  // 竹篱笆（院角一段）
  const bb = P('bamboo', gGarden);
  const bamM = M(0xb8a86a, { rough: 0.9 });
  for (let i = 0; i < 12; i++) {
    const bx = -7.2 + i * 0.22;
    cyl(0.035, 0.035, 1.1 + (i % 3) * 0.06, bamM, bx, 0.58, -6.2 + (i % 2) * 0.02, bb, 8);
  }
  const bh1 = cyl(0.025, 0.025, 2.7, bamM, -6.0, 0.85, -6.2, bb, 8); bh1.rotation.z = Math.PI / 2;
  const bh2 = cyl(0.025, 0.025, 2.7, bamM, -6.0, 0.35, -6.2, bb, 8); bh2.rotation.z = Math.PI / 2;

  // 物置棚
  const sh = P('shed', gGarden);
  const sw = M(0x9a7b52, { map: woodTex, rough: 0.9 });
  box(2.2, 2.0, 1.7, sw, -5.5, 1.0, -4.5, sh);
  const sr = box(2.6, 0.09, 2.1, M(0x4a4f55, { rough: 0.8 }), -5.5, 2.12, -4.5, sh);
  sr.rotation.z = 0.07;
  box(0.8, 1.55, 0.07, M(0x5e4023, { rough: 0.85 }), -5.5, 0.85, -4.5 + 0.86, sh);
  box(0.04, 0.12, 0.04, SH.gold, -5.25, 0.9, -3.62, sh); // 门把手
  box(0.5, 0.7, 0.4, M(0x8a8f96, { rough: 0.8 }), -6.1, 0.35, -3.4, sh);
  cyl(0.16, 0.16, 0.5, M(0x3a6ab0, { rough: 0.8 }), -4.4, 0.25, -3.5, sh); // 水桶
  box(0.7, 0.08, 0.5, SH.woodDark, -4.35, 0.55, -3.5, sh); // 叠放的木板
})();

/* ============ 外部：地基·外墙·屋顶 ============ */
(function buildExterior() {
  // 地基·踢脚（独立部件）
  const pl = P('plinth', gF1);
  box(HX * 2 + 0.6, 0.5, HZ * 2 + 0.6, SH.stone, 0, -0.05, 0, pl);
  const kickM = M(0xffffff, { map: plasterTex, rough: 0.95 });
  box(HX * 2 + 0.68, 0.14, HZ * 2 + 0.68, kickM, 0, 0.13, 0, pl); // 粉刷踢脚
  box(HX * 2 + 0.72, 0.05, HZ * 2 + 0.72, SH.stone, 0, 0.025, 0, pl); // 石材压边

  const plaster1 = extM(0xffffff, { map: plasterTex, rough: 0.95 });
  const plaster2 = extM(0xffffff, { map: plasterTex, rough: 0.95 });
  const trimM = SH.woodDark;

  const w1 = P('extwall1', gF1);
  const w1s = new THREE.Group(), w1n = new THREE.Group(), w1w = new THREE.Group(), w1e = new THREE.Group();
  w1.add(w1s, w1n, w1w, w1e);
  box(HX * 2, WH, T, plaster1, 0, F1 + WH / 2, HZ - T / 2, w1s);
  box(HX * 2, WH, T, plaster1, 0, F1 + WH / 2, -HZ + T / 2, w1n);
  box(T, WH, HZ * 2, plaster1, -HX + T / 2, F1 + WH / 2, 0, w1w);
  box(T, WH, HZ * 2, plaster1, HX - T / 2, F1 + WH / 2, 0, w1e);
  const w2 = P('extwall2', gF2);
  const w2s = new THREE.Group(), w2n = new THREE.Group(), w2w = new THREE.Group(), w2e = new THREE.Group();
  w2.add(w2s, w2n, w2w, w2e);
  box(HX * 2, WH, T, plaster2, 0, F2 + WH / 2, HZ - T / 2, w2s);
  box(HX * 2, WH, T, plaster2, 0, F2 + WH / 2, -HZ + T / 2, w2n);
  box(T, WH, HZ * 2, plaster2, -HX + T / 2, F2 + WH / 2, 0, w2w);
  box(T, WH, HZ * 2, plaster2, HX - T / 2, F2 + WH / 2, 0, w2e);
  cutWalls.w1s = w1s; cutWalls.w1e = w1e; cutWalls.w2s = w2s; cutWalls.w2e = w2e;
  w1s.userData.cut = '1'; w1e.userData.cut = '1';
  w2s.userData.cut = '2'; w2e.userData.cut = '2';
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(0.2, WH, 0.2, trimM, sx * (HX - 0.02), F1 + WH / 2, sz * (HZ - 0.02), w1);
    box(0.2, WH, 0.2, trimM, sx * (HX - 0.02), F2 + WH / 2, sz * (HZ - 0.02), w2);
  }
  function beamFrame(gs, gn, gw, ge, yb) {
    box(HX * 2 + 0.12, 0.16, 0.16, trimM, 0, yb, HZ, gs);
    box(HX * 2 + 0.12, 0.16, 0.16, trimM, 0, yb, -HZ, gn);
    box(0.16, 0.16, HZ * 2 + 0.12, trimM, -HX, yb, 0, gw);
    box(0.16, 0.16, HZ * 2 + 0.12, trimM, HX, yb, 0, ge);
  }
  beamFrame(w1s, w1n, w1w, w1e, F1 + WH - 0.06);
  beamFrame(w2s, w2n, w2w, w2e, F2 + WH - 0.06);

  // 木窗：木框 + 格子 + 障子纸 + 纱窗 + 窗台板（cut: '1' 一楼剖面隐藏 / '2' 二楼剖面隐藏）
  const frameM = M(0x3d2c1d, { rough: 0.75 });
  const paperM = M(0xf5efdd, { transparent: true, opacity: 0.72, emissive: 0x443e2e, ei: 0.25, rough: 0.9 });
  const screenM = M(0x2e3134, { transparent: true, opacity: 0.35, rough: 0.9 });
  function win(w, h, x, y, z, ry, part, cut, curtainMat) {
    const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry;
    if (cut) grp.userData.cut = cut;
    part.add(grp);
    box(w + 0.14, h + 0.14, 0.1, frameM, 0, 0, 0, grp);
    const sm = box(w - 0.04, h - 0.04, 0.015, screenM, 0, 0, 0.005, grp); sm.castShadow = false; // 纱窗
    if (curtainMat) { const cm = box(w * 0.92, h * 0.96, 0.02, curtainMat, 0, 0, -0.025, grp); cm.castShadow = false; } // 窗帘
    const pp = box(w, h, 0.03, paperM, 0, 0, 0.03, grp); pp.castShadow = false; // 障子纸
    for (let i = 1; i < 3; i++) box(0.04, h, 0.11, frameM, -w / 2 + (w / 3) * i, 0, 0.02, grp); // 竖格子
    box(w, 0.04, 0.11, frameM, 0, 0, 0.02, grp); // 横格子
    box(w + 0.22, 0.07, 0.15, frameM, 0, -h / 2 - 0.09, 0.03, grp); // 窗台板
    return grp;
  }
  const win1 = P('windows1', gF1);
  const win2 = P('windows2', gF2);
  const cBlue = SH.curtainBlue, cGreen = M(0x6a9a6a, { rough: 0.95 });
  win(1.8, 1.25, -2.6, F1 + 1.42, HZ + 0.01, 0, win1, '1', cBlue);
  win(1.4, 1.25, -0.4, F1 + 1.42, HZ + 0.01, 0, win1, '1', cBlue);
  win(1.6, 1.0, -2.4, F1 + 1.55, -HZ - 0.01, Math.PI, win1, null);
  win(1.2, 1.0, 1.0, F1 + 1.55, -HZ - 0.01, Math.PI, win1, null);
  win(1.8, 1.25, -HX - 0.01, F1 + 1.42, 1.9, -Math.PI / 2, win1, null, cGreen);
  win(1.4, 1.0, -HX - 0.01, F1 + 1.55, -1.6, -Math.PI / 2, win1, null);
  win(1.2, 1.0, HX + 0.01, F1 + 1.55, -0.2, Math.PI / 2, win1, '1');
  win(1.0, 1.0, HX + 0.01, F1 + 1.55, -2.9, Math.PI / 2, win1, '1');
  win(1.4, 1.2, HX + 0.01, F2 + 1.55, 2.2, Math.PI / 2, win2, '2');
  win(1.6, 1.2, 2.6, F2 + 1.55, HZ + 0.01, 0, win2, '2');
  win(1.8, 1.2, -HX - 0.01, F2 + 1.55, 1.5, -Math.PI / 2, win2, null);
  win(1.2, 1.0, -2.0, F2 + 1.65, -HZ - 0.01, Math.PI, win2, null);
  win(1.0, 1.0, 2.5, F2 + 1.65, -HZ - 0.01, Math.PI, win2, null);

  // 雨戸（防雨滑窗板）
  const am = P('amado', gF1);
  const slatM = M(0x6b4a2f, { rough: 0.85 });
  function amadoPanel(w, h, x, y, z, ry, cut) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry;
    g.userData.cut = cut; am.add(g);
    box(w, 0.055, 0.06, SH.woodDark, 0, h / 2, 0, g);
    box(w, 0.055, 0.06, SH.woodDark, 0, -h / 2, 0, g);
    box(0.055, h, 0.06, SH.woodDark, -w / 2, 0, 0, g);
    box(0.055, h, 0.06, SH.woodDark, w / 2, 0, 0, g);
    for (let i = 0; i < 5; i++) box(w - 0.07, 0.1, 0.03, slatM, 0, -h / 2 + 0.16 + i * (h - 0.32) / 4, 0, g);
  }
  // 客厅南窗：戸袋 + 半开
  box(0.3, 1.55, 0.2, SH.woodDark, -1.55, F1 + 1.42, HZ + 0.14, am).userData.cut = '1';
  amadoPanel(0.95, 1.4, -3.05, F1 + 1.42, HZ + 0.16, 0, '1');
  amadoPanel(0.95, 1.4, -2.05, F1 + 1.42, HZ + 0.16, 0, '1');
  // 接客室东窗：关闭
  amadoPanel(0.68, 1.15, HX + 0.16, F1 + 1.55, -0.51, Math.PI / 2, '1');
  amadoPanel(0.68, 1.15, HX + 0.16, F1 + 1.55, 0.11, Math.PI / 2, '1');
  // 大雄房间南窗：半开（挂在 gF2 下，f1 剖面时随二楼一起隐藏）
  const am2 = P('amado2', gF2);
  box(0.3, 1.5, 0.2, SH.woodDark, 3.65, F2 + 1.55, HZ + 0.14, am2).userData.cut = '2';
  (function () {
    const g1 = new THREE.Group(); g1.position.set(2.15, F2 + 1.55, HZ + 0.16); g1.userData.cut = '2'; am2.add(g1);
    box(0.85, 0.055, 0.06, SH.woodDark, 0, 0.675, 0, g1); box(0.85, 0.055, 0.06, SH.woodDark, 0, -0.675, 0, g1);
    box(0.055, 1.35, 0.06, SH.woodDark, -0.425, 0, 0, g1); box(0.055, 1.35, 0.06, SH.woodDark, 0.425, 0, 0, g1);
    for (let i = 0; i < 5; i++) box(0.78, 0.1, 0.03, slatM, 0, -0.52 + i * 0.26, 0, g1);
    const g2 = new THREE.Group(); g2.position.set(3.05, F2 + 1.55, HZ + 0.16); g2.userData.cut = '2'; am2.add(g2);
    box(0.85, 0.055, 0.06, SH.woodDark, 0, 0.675, 0, g2); box(0.85, 0.055, 0.06, SH.woodDark, 0, -0.675, 0, g2);
    box(0.055, 1.35, 0.06, SH.woodDark, -0.425, 0, 0, g2); box(0.055, 1.35, 0.06, SH.woodDark, 0.425, 0, 0, g2);
    for (let i = 0; i < 5; i++) box(0.78, 0.1, 0.03, slatM, 0, -0.52 + i * 0.26, 0, g2);
  })();

  // 玄关大门
  const dr = P('door', gF1);
  dr.userData.cut = '1';
  const doorM = extM(0x5a3d24, { map: woodTex, rough: 0.8 });
  const frameM2 = M(0x3d2c1d, { rough: 0.75 });
  box(1.3, 2.2, 0.1, frameM2, 3.3, F1 + 1.1, HZ - 0.02, dr);
  box(1.05, 2.05, 0.12, doorM, 3.3, F1 + 1.03, HZ + 0.02, dr);
  box(0.9, 0.7, 0.02, M(0x6b4a2f, { rough: 0.8 }), 3.3, F1 + 1.45, HZ + 0.09, dr); // 门上装饰格
  sph(0.045, SH.gold, 3.62, F1 + 1.05, HZ + 0.1, dr);
  box(0.9, 0.12, 0.5, SH.stone, 3.3, 0.1, HZ + 0.35, dr); // 门前台阶石

  // 门铃/对讲机
  const db = P('doorbell', gF1);
  db.userData.cut = '1';
  box(0.12, 0.2, 0.06, SH.white, 2.62, F1 + 1.5, HZ + 0.1, db);
  const dbtn = cyl(0.02, 0.02, 0.02, SH.black, 2.62, F1 + 1.52, HZ + 0.14, db, 8); dbtn.rotation.x = Math.PI / 2;
  box(0.1, 0.06, 0.02, SH.black, 2.62, F1 + 1.42, HZ + 0.13, db); // 扬声器孔

  // 玄关灯
  const gl = P('genkanlight', gF1);
  gl.userData.cut = '1';
  box(0.16, 0.22, 0.12, M(0x333333), 2.52, F1 + 2.15, HZ + 0.08, gl);
  const glb = sph(0.06, M(0xfff2c8, { emissive: 0xffd97a, ei: 0.9 }), 2.52, F1 + 2.12, HZ + 0.13, gl);
  glb.castShadow = false;

  // 门垫
  const dm = P('doormat', gF1);
  dm.userData.cut = '1';
  box(0.95, 0.03, 0.55, M(0x8a7a5a, { rough: 1 }), 3.3, 0.145, HZ + 1.15, dm);
  box(0.95, 0.032, 0.08, M(0x6a5a42, { rough: 1 }), 3.3, 0.145, HZ + 1.0, dm);

  // 玄关雨棚（昼寝屋顶）
  const pr = P('porchroof', gF1);
  pr.userData.cut = '1';
  const tileM = M(0xffffff, { map: roofTex, rough: 0.9 });
  const canopy = box(1.9, 0.09, 1.3, tileM, 3.3, 3.28, HZ + 0.6, pr);
  canopy.rotation.x = -0.14;
  box(0.1, 3.1, 0.1, SH.woodDark, 2.45, 1.55, HZ + 1.1, pr);
  box(0.1, 3.1, 0.1, SH.woodDark, 4.15, 1.55, HZ + 1.1, pr);
  box(1.9, 0.06, 0.08, SH.woodDark, 3.3, 3.05, HZ + 1.18, pr); // 雨棚前梁

  // 昼寝围栏
  const hf = P('hirunefence', gF1);
  hf.userData.cut = '1';
  for (let i = 0; i <= 6; i++) box(0.06, 0.55, 0.06, SH.woodDark, 2.45 + i * (1.7 / 6), 3.62, HZ + 1.18, hf);
  box(1.78, 0.07, 0.08, SH.woodDark, 3.3, 3.9, HZ + 1.18, hf);
  for (const sx of [2.45, 4.15]) {
    box(0.06, 0.55, 0.06, SH.woodDark, sx, 3.62, HZ + 0.35, hf);
    box(0.08, 0.07, 0.9, SH.woodDark, sx, 3.9, HZ + 0.76, hf);
  }
  // 晒被褥
  const hfut = P('hirunefuton', gF1);
  hfut.userData.cut = '1';
  const futM = M(0xf0ece0, { rough: 0.95 });
  const f1 = box(1.1, 0.1, 0.7, futM, 3.0, 3.98, HZ + 1.18, hfut); f1.rotation.z = 0.03;
  box(0.5, 0.09, 0.4, M(0xffffff, { rough: 0.95 }), 2.8, 4.06, HZ + 1.18, hfut); // 枕头

  // 主屋顶
  const r = P('roof', gRoof);
  const slopeLen = Math.hypot(HZ + 0.9, RIDGE - EAVE);
  const ang = Math.atan2(RIDGE - EAVE, HZ + 0.9);
  const s1 = box(HX * 2 + 1.4, 0.14, slopeLen, tileM, 0, (EAVE + RIDGE) / 2 + 0.02, (HZ / 4 + 0.45), r);
  s1.rotation.x = ang;
  const s2 = box(HX * 2 + 1.4, 0.14, slopeLen, tileM, 0, (EAVE + RIDGE) / 2 + 0.02, -(HZ / 4 + 0.45), r);
  s2.rotation.x = -ang;
  box(HX * 2 + 1.5, 0.18, 0.36, M(0x2c343d, { rough: 0.85 }), 0, RIDGE + 0.05, 0, r);
  // 山墙三角
  const tri = new THREE.Shape();
  tri.moveTo(-HZ, 0); tri.lineTo(HZ, 0); tri.lineTo(0, RIDGE - EAVE); tri.closePath();
  const triGeo = new THREE.ExtrudeGeometry(tri, { depth: 0.14, bevelEnabled: false });
  const gableM = extM(0xe8dfcc, { rough: 0.95 });
  for (const sx of [-1, 1]) {
    const m = new THREE.Mesh(triGeo, gableM);
    m.rotation.y = sx * Math.PI / 2;
    m.position.set(sx > 0 ? HX - 0.14 : -HX + 0.14, EAVE, 0);
    m.castShadow = m.receiveShadow = true;
    r.add(m); tagPart(m, r);
  }

  // 鬼瓦（独立部件）
  const oni = P('onigawara', gRoof);
  const oniM = M(0x2c343d, { rough: 0.8 });
  for (const sx of [-1, 1]) {
    box(0.5, 0.42, 0.5, oniM, sx * (HX + 0.62), RIDGE + 0.12, 0, oni);
    cyl(0.16, 0.2, 0.22, oniM, sx * (HX + 0.62), RIDGE + 0.42, 0, oni, 8);
    box(0.34, 0.1, 0.34, oniM, sx * (HX + 0.62), RIDGE + 0.32, 0, oni); // 鬼瓦台座
  }

  // 椽木（独立部件）
  const rf = P('rafter', gRoof);
  for (const sz of [-1, 1]) {
    for (let i = 0; i < 17; i++) {
      const x = -HX - 0.5 + i * ((HX * 2 + 1.0) / 16);
      const t = box(0.09, 0.09, 0.62, SH.woodDark, x, EAVE - 0.12, sz * (HZ + 0.62), rf);
      t.rotation.x = sz * ang;
    }
  }

  // 雨水槽 & 落水管（含托架、接头）
  const gt2 = P('gutter', gRoof);
  const gutM = M(0x6a7076, { metal: 0.4, rough: 0.5 });
  for (const sz of [-1, 1]) {
    const gtr = cyl(0.07, 0.07, HX * 2 + 1.4, gutM, 0, EAVE - 0.08, sz * (HZ + 0.92), gt2);
    gtr.rotation.z = Math.PI / 2;
    for (let i = 0; i < 6; i++) { // 托架
      const bx = -HX - 0.5 + i * ((HX * 2 + 1.0) / 5);
      box(0.05, 0.12, 0.05, gutM, bx, EAVE - 0.16, sz * (HZ + 0.92), gt2);
    }
    for (const sx of [-1, 1]) { // 落水管 + 接头
      cyl(0.055, 0.055, EAVE - 0.1, gutM, sx * (HX + 0.6), (EAVE - 0.1) / 2, sz * (HZ + 0.92), gt2);
      cyl(0.07, 0.07, 0.12, gutM, sx * (HX + 0.6), 2.6, sz * (HZ + 0.92), gt2); // 接头
      box(0.16, 0.1, 0.16, gutM, sx * (HX + 0.6), EAVE - 0.2, sz * (HZ + 0.92), gt2); // 斗
    }
  }

  // 电视天线
  const an = P('antenna', gRoof);
  const antM = M(0x8a8f96, { metal: 0.6, rough: 0.4 });
  cyl(0.025, 0.025, 1.6, antM, 2.4, RIDGE + 0.8, 0, an);
  for (let i = 0; i < 5; i++) box(0.7 - i * 0.09, 0.03, 0.03, antM, 2.4, RIDGE + 1.35 - i * 0.16, 0, an);
  box(0.3, 0.2, 0.04, antM, 2.4, RIDGE + 0.5, 0.1, an); // 放大器盒
})();

/* ============ 一楼室内 ============ */
(function buildF1() {
  const floorM = M(0x9a7b52, { map: woodTex, rough: 0.85 });
  const tatM = SH.tatami;
  const wallM = M(0xf2ecdc, { rough: 0.95 });
  const shadeM = M(0xf5f0e0, { rough: 0.8, side: THREE.DoubleSide });
  function pendant(x, y, z, parent) {
    cyl(0.015, 0.015, 0.6, SH.black, x, y - 0.35, z, parent, 6);
    const sh = cyl(0.26, 0.12, 0.2, shadeM, x, y - 0.72, z, parent, 16); sh.castShadow = false;
    const bl = sph(0.06, SH.lampGlow, x, y - 0.78, z, parent); bl.castShadow = false;
  }

  // ---- 玄关 ----
  const gk = P('genkan', gF1);
  box(1.6, 0.05, 2.5, M(0xffffff, { map: stoneTex, rough: 0.95 }), 3.3, 0.225, 2.25, gk); // 土间
  box(1.6, 0.12, 0.4, floorM, 3.3, 0.31, 0.85, gk); // 式台
  for (let i = 0; i < 3; i++) { // 引戸（玻璃拉门）
    const gl2 = box(0.02, 1.9, 0.72, M(0xcfe0ea, { transparent: true, opacity: 0.4, rough: 0.2 }), 2.65 + i * 0.72, F1 + 1.15, 1.02, gk);
    gl2.castShadow = false;
  }
  box(2.6, 0.1, 0.12, SH.woodDark, 3.3, F1 + 2.15, 1.02, gk); // 门楣

  // 鞋柜
  const sb = P('shoebox', gF1);
  const sbM = M(0x7a5a38, { map: woodTex, rough: 0.85 });
  box(0.35, 1.1, 0.9, sbM, 3.9, F1 + 0.55, 1.55, sb);
  box(0.02, 1.0, 0.8, M(0x5a4028, { rough: 0.85 }), 3.72, F1 + 0.55, 1.55, sb); // 柜门
  sph(0.025, SH.gold, 3.7, F1 + 0.55, 1.35, sb); // 把手
  box(0.3, 0.02, 0.7, SH.white, 3.9, F1 + 1.12, 1.55, sb); // 柜顶纸
  const note = box(0.18, 0.12, 0.005, SH.paper, 3.71, F1 + 0.8, 1.7, sb); note.castShadow = false; // 备忘纸条

  // 全家的鞋
  const sh2 = P('shoes', gF1);
  function shoe(x, y, z, ry, mat) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; sh2.add(g);
    box(0.115, 0.025, 0.29, SH.black, 0, 0.012, 0, g);
    box(0.11, 0.07, 0.24, mat, 0, 0.06, -0.01, g);
    sph(0.055, mat, 0, 0.06, 0.13, g, 1, 0.8, 1.1);
  }
  const sm0 = SH.shoes[0], sm1 = SH.shoes[1], sm2 = SH.shoes[2], sm3 = SH.shoes[3];
  shoe(3.82, F1 + 1.13, 1.4, 0.1, sm0); shoe(3.98, F1 + 1.13, 1.4, -0.08, sm0); // 爸爸皮鞋（柜顶）
  shoe(3.84, F1 + 1.13, 1.72, 0.05, sm1); shoe(4.0, F1 + 1.13, 1.7, 0.12, sm1); // 妈妈布鞋
  shoe(2.95, 0.26, 1.75, 1.45, sm2); shoe(2.95, 0.26, 1.95, 1.6, sm2); // 大雄运动鞋（土间）
  shoe(2.7, 0.26, 1.78, 1.5, sm3); shoe(2.7, 0.26, 1.98, 1.42, sm3); // 备用鞋

  // 伞架
  const us = P('umbstand', gF1);
  const umM = M(0x4a5a6a, { rough: 0.6, metal: 0.3 });
  cyl(0.17, 0.14, 0.52, umM, 2.75, F1 + 0.26, 1.3, us, 12);
  const umCols = [0x3a6ab0, 0xd94f4f, 0x4a4a4a];
  [[2.71, 0.03, 0], [2.79, -0.04, 1], [2.75, 0.06, 2]].forEach(([ux, dx, ci], i) => {
    const g = new THREE.Group(); g.position.set(ux, F1 + 0.5, 1.3 + dx); g.rotation.z = (i - 1) * 0.07; us.add(g);
    const cloth = cone(0.085, 0.78, M(umCols[ci], { rough: 0.9 }), 0, 0.45, 0, g, 10);
    cyl(0.014, 0.014, 0.9, SH.woodDark, 0, 0.4, 0, g, 8);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 12, Math.PI), SH.woodDark);
    hook.position.set(0, 0.88, 0); hook.castShadow = true; g.add(hook); tagPart(hook, g);
    sph(0.015, SH.woodDark, 0, 0.86, 0, g);
  });

  // 钥匙盒
  const kb = P('keybox', gF1);
  box(0.07, 0.22, 0.3, M(0x7a5a38, { rough: 0.85 }), HX - 0.1, F1 + 1.6, 2.2, kb);
  box(0.02, 0.16, 0.24, M(0xcfe0ea, { transparent: true, opacity: 0.45, rough: 0.3 }), HX - 0.14, F1 + 1.6, 2.2, kb); // 玻璃门
  for (let i = 0; i < 2; i++) {
    const kx = HX - 0.16, kz = 2.14 + i * 0.12;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 6, 12), SH.gold);
    ring.position.set(kx, F1 + 1.58, kz); ring.rotation.y = Math.PI / 2; ring.castShadow = true; kb.add(ring); tagPart(ring, kb);
    box(0.015, 0.07, 0.025, SH.gold, kx, F1 + 1.52, kz, kb); // 钥匙
  }

  // 玄关垫
  const gm = P('genkanmat', gF1);
  const gmm = box(1.3, 0.025, 0.32, M(0x9a8a6a, { rough: 1 }), 3.3, 0.382, 0.85, gm);
  gmm.receiveShadow = true;

  // 廊下
  const hw = P('hallway', gF1);
  box(2.4, 0.06, 2.6, floorM, 2.2, F1 - 0.03, -0.1, hw);
  box(0.95, 0.025, 2.3, tatM, 2.2, F1 + 0.015, -0.1, hw); // 走廊地毯
  // 一楼踢脚线
  const bb1 = P('baseboard1', gF1);
  const bbM = M(0x4a3524, { rough: 0.8 });
  box(0.03, 0.09, 2.5, bbM, 1.03, F1 + 0.045, -0.1, bb1);
  box(2.4, 0.09, 0.03, bbM, 2.2, F1 + 0.045, -1.33, bb1);
  box(0.03, 0.09, 1.6, bbM, 2.47, F1 + 0.045, 0.4, bb1);

  // 一楼灯具
  const l1 = P('lamp1f', gF1);
  pendant(3.3, F1 + 2.55, 2.2, l1);
  pendant(2.2, F1 + 2.55, -0.1, l1);
  pendant(-2.2, F1 + 2.55, 1.9, l1);
  pendant(-2.6, F1 + 2.55, -1.2, l1);
  pendant(3.3, F1 + 2.55, -0.2, l1);
  pendant(0.3, F1 + 2.55, 0.6, l1);

  // 全家福
  const fp = P('famphoto', gF1);
  box(0.05, 0.55, 0.75, SH.woodDark, 2.53, F1 + 1.7, 0.55, fp);
  box(0.02, 0.47, 0.67, M(0xd8e2ea, { rough: 0.9 }), 2.55, F1 + 1.7, 0.55, fp);
  const ppl = [[0xd94f4f, 0.14], [0x4f7ad9, 0.11], [0xe0b13e, 0.09], [0x3a9ad9, 0.12]];
  ppl.forEach(([c, h], i) => {
    sph(0.045, M(0xf0c8a0, { rough: 0.9 }), 2.57, F1 + 1.72 + h, 0.32 + i * 0.15, fp);
    box(0.03, h, 0.07, M(c, { rough: 0.9 }), 2.57, F1 + 1.68 + h / 2, 0.32 + i * 0.15, fp);
  });

  // 电灯开关
  const sw = P('switch1', gF1);
  box(0.025, 0.13, 0.09, SH.white, 2.53, F1 + 1.2, -0.75, sw);
  box(0.03, 0.05, 0.03, M(0xd0d0d0), 2.535, F1 + 1.22, -0.75, sw);

  // 楼梯（含栏杆小柱+扶手托架）
  const st = P('stairs', gF1);
  const stepM = M(0x8a5f36, { map: woodTex, rough: 0.8 });
  const N = 12, rise = (F2 - F1) / N, run = 0.21;
  for (let i = 0; i < N; i++) {
    const sx = 0.5, sz = 1.2 - i * run;
    box(0.85, 0.05, run + 0.02, stepM, sx, F1 + rise * (i + 1) - 0.025, sz, st);
    box(0.85, rise, 0.04, stepM, sx, F1 + rise * (i + 0.5), sz - run / 2, st);
  }
  box(0.06, 2.6, 2.8, wallM, 0.02, F1 + 1.3, 0.0, st); // 梯侧墙
  const railAng = Math.atan2(F2 - F1, N * run);
  const railLen = Math.hypot(F2 - F1, N * run) + 0.3;
  const rail = box(0.07, 0.07, railLen, SH.woodDark, 0.98, F1 + (F2 - F1) / 2 + 0.95, -0.06, st);
  rail.rotation.x = railAng;
  for (let i = 0; i < 7; i++) { // 栏杆小柱
    const t = i / 6;
    const bz = 1.2 - t * (N * run), by = F1 + t * (F2 - F1);
    box(0.045, 0.85, 0.045, SH.woodDark, 0.98, by + 0.45, bz, st);
    if (i % 2 === 0) box(0.05, 0.09, 0.12, SH.woodDark, 0.98, by + 0.86, bz, st); // 扶手托架
  }

  // 楼梯下储物间
  const us2 = P('understair', gF1);
  us2.userData.cut = '1';
  box(0.05, 1.3, 0.7, M(0x7a5a38, { rough: 0.85 }), 1.0, F1 + 0.65, 0.85, us2);
  sph(0.03, SH.gold, 1.04, F1 + 0.65, 0.65, us2);
  box(0.4, 0.5, 0.4, M(0x9a8a6a, { rough: 1 }), 0.6, F1 + 0.25, 0.85, us2); // 纸箱（透过门缝看不见，随缘）

  // ---- 客厅 ----
  const lv = P('living', gF1);
  box(5.2, 0.06, 2.6, floorM, -1.6, F1 - 0.03, 1.9, lv);
  for (let i = 0; i < 3; i++) box(1.65, 0.025, 2.5, tatM, -3.35 + i * 1.7, F1 + 0.015, 1.9, lv);

  // 矮桌·坐垫
  const cb = P('chabudai', gF1);
  const cbM = M(0x6b4a2f, { map: woodTex, rough: 0.7 });
  box(1.2, 0.07, 0.8, cbM, -2.2, 0.56, 1.9, cb);
  for (const [dx, dz] of [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]])
    box(0.07, 0.32, 0.07, cbM, -2.2 + dx, 0.38, 1.9 + dz, cb);
  const cusCols = [0x9a4a3a, 0x3a6a9a, 0x4a8a4a, 0xb08d3a];
  [[-2.2, 1.15], [-2.2, 2.65], [-2.95, 1.9], [-1.45, 1.9]].forEach(([cx, cz], i) => {
    box(0.44, 0.03, 0.44, SH.woodDark, cx, F1 + 0.03, cz, cb); // 包边底
    box(0.4, 0.08, 0.4, M(cusCols[i], { rough: 0.95 }), cx, F1 + 0.08, cz, cb);
  });
  cyl(0.09, 0.07, 0.1, M(0x7a9a6a, { rough: 0.9 }), -2.2, 0.65, 1.9, cb, 8); // 桌上茶杯

  // 电视机
  const tv2 = P('tv', gF1);
  box(0.9, 0.45, 0.6, SH.woodDark, 0.5, F1 + 0.225, 1.9, tv2); // 电视柜
  box(0.8, 0.62, 0.65, M(0x4a3a2a, { rough: 0.6 }), 0.5, F1 + 0.76, 1.9, tv2);
  const scr = box(0.6, 0.45, 0.02, M(0x1a2530, { emissive: 0x2a4a6a, ei: 0.35, rough: 0.3 }), 0.5, F1 + 0.76, 1.9 - 0.33, tv2);
  scr.castShadow = false;
  for (const dx of [-0.2, 0.2]) { // 兔耳天线
    const a = cyl(0.008, 0.008, 0.6, SH.metal, 0.5 + dx, F1 + 1.35, 1.9, tv2, 6);
    a.rotation.z = dx * 2.2;
  }
  cyl(0.03, 0.03, 0.03, SH.black, 0.78, F1 + 0.7, 1.62, tv2, 8); // 旋钮
  box(0.16, 0.03, 0.06, SH.black, 0.5, F1 + 0.46, 1.75, tv2); // 遥控器

  // 床の间
  const tk = P('tokonoma', gF1);
  const tkM = M(0x6b4a2f, { map: woodTex, rough: 0.7 });
  box(1.5, 0.14, 0.95, tkM, 0.0, F1 + 0.07, 1.05, tk); // 地台
  box(1.5, 0.05, 0.95, M(0x3d2c1d, { rough: 0.8 }), 0.0, F1 + 0.165, 1.05, tk); // 台面框

  // 挂轴
  const kj = P('kakejiku', gF1);
  const kjM = M(0xffffff, { map: paintTex, rough: 0.9 });
  box(0.56, 1.06, 0.02, kjM, 0.0, F1 + 1.62, 0.62, kj); // 画心（红日青松）
  const rod1 = cyl(0.022, 0.022, 0.7, SH.woodDark, 0.0, F1 + 2.18, 0.62, kj, 8); rod1.rotation.z = Math.PI / 2;
  const rod2 = cyl(0.028, 0.028, 0.66, SH.woodDark, 0.0, F1 + 1.06, 0.62, kj, 8); rod2.rotation.z = Math.PI / 2;
  box(0.62, 0.06, 0.015, M(0x2a3a5a, { rough: 0.9 }), 0.0, F1 + 2.12, 0.62, kj); // 天地头

  // 佛坛
  const bs = P('butsudan', gF1);
  const bsM = M(0x2a1d12, { rough: 0.55 });
  box(0.44, 0.55, 0.32, bsM, 0.5, F1 + 0.19 + 0.275, 1.05, bs);
  box(0.36, 0.4, 0.02, SH.gold, 0.5, F1 + 0.19 + 0.28, 1.05 - 0.17, bs); // 金色内龛
  box(0.5, 0.04, 0.36, bsM, 0.5, F1 + 0.19 + 0.02, 1.05, bs); // 须弥坛
  for (const dx of [-0.13, 0.13]) { // 烛台
    cyl(0.03, 0.04, 0.12, SH.gold, 0.5 + dx, F1 + 0.19 + 0.1, 1.05, bs, 8);
    cyl(0.012, 0.012, 0.1, SH.white, 0.5 + dx, F1 + 0.19 + 0.2, 1.05, bs, 6);
    const fl = sph(0.014, M(0xffd97a, { emissive: 0xff9a3a, ei: 1.2 }), 0.5 + dx, F1 + 0.19 + 0.27, 1.05, bs);
    fl.castShadow = false;
  }
  cyl(0.05, 0.06, 0.07, M(0x3a4a6a, { rough: 0.6 }), 0.5, F1 + 0.19 + 0.075, 1.05, bs, 10); // 香炉
  for (let i = 0; i < 3; i++) cyl(0.004, 0.004, 0.14, M(0x8a4a3a), 0.5 - 0.02 + i * 0.02, F1 + 0.19 + 0.16, 1.05, bs, 5); // 线香
  cyl(0.07, 0.07, 0.025, SH.white, 0.5, F1 + 0.19 + 0.032, 0.88, bs, 10); // 供品碟
  sph(0.028, M(0xe09a3a, { rough: 0.8 }), 0.47, F1 + 0.19 + 0.06, 0.88, bs);
  sph(0.028, M(0xe09a3a, { rough: 0.8 }), 0.53, F1 + 0.19 + 0.06, 0.88, bs);

  // 插花
  const ik = P('ikebana', gF1);
  cyl(0.055, 0.085, 0.3, M(0x4a6a8a, { rough: 0.5 }), -0.5, F1 + 0.19 + 0.15, 1.05, ik, 12); // 花瓶
  for (let i = 0; i < 3; i++) {
    const st3 = cyl(0.008, 0.008, 0.55, SH.leaf, -0.5 + (i - 1) * 0.05, F1 + 0.55, 1.05 + (i % 2) * 0.04, ik, 6);
    st3.rotation.z = (i - 1) * 0.22;
    sph(0.045, M([0xe08a9a, 0xf0f0f0, 0xe0b13e][i], { rough: 0.9 }), -0.5 + (i - 1) * 0.14, F1 + 0.82, 1.05 + (i % 2) * 0.05, ik);
  }
  sph(0.06, SH.leaf2, -0.56, F1 + 0.5, 1.1, ik, 1, 0.6, 1);

  // 襖画
  const fe = P('fusumae', gF1);
  const fuM = M(0xffffff, { map: paintTex, rough: 0.92 });
  const fuFrame = M(0x2a2a2a, { rough: 0.8 });
  function fusuma(w, x, y, z, ry, cut) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry;
    if (cut) g.userData.cut = cut;
    fe.add(g);
    box(w, 2.3, 0.07, fuM, 0, 0, 0, g);
    box(w + 0.04, 0.06, 0.09, fuFrame, 0, 1.12, 0, g);
    box(w + 0.04, 0.06, 0.09, fuFrame, 0, -1.12, 0, g);
    sph(0.035, SH.black, 0, 0, 0.05, g); // 引手
  }
  fusuma(1.9, -3.15, F1 + 1.15, 0.58, 0, null);
  fusuma(1.9, -1.25, F1 + 1.15, 0.58, 0, '1');
  fusuma(2.0, 1.02, F1 + 1.15, 1.9, Math.PI / 2, '1');

  // ---- 餐厅 ----
  const dn = P('dining', gF1);
  box(4.0, 0.06, 3.0, floorM, -2.2, F1 - 0.03, -1.55, dn);
  const dtM = M(0x7a5a38, { map: woodTex, rough: 0.75 });
  box(1.6, 0.06, 0.95, dtM, -2.6, 0.78, -1.2, dn); // 餐桌
  for (const [dx, dz] of [[-0.7, -0.38], [0.7, -0.38], [-0.7, 0.38], [0.7, 0.38]])
    box(0.08, 0.72, 0.08, dtM, -2.6 + dx, 0.4, -1.2 + dz, dn);
  const chM = M(0x8a6a44, { rough: 0.8 });
  [[-3.1, -1.2, 0], [-2.1, -1.2, 0], [-2.6, -0.5, Math.PI], [-2.6, -1.9, 0]].forEach(([cx, cz, ry]) => {
    const g = new THREE.Group(); g.position.set(cx, F1, cz); g.rotation.y = ry; dn.add(g);
    box(0.4, 0.05, 0.4, chM, 0, 0.45, 0, g);
    box(0.4, 0.5, 0.05, chM, 0, 0.75, -0.19, g);
    for (const [dx, dz] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]])
      box(0.04, 0.45, 0.04, chM, dx, 0.225, dz, g);
  });
  cyl(0.05, 0.07, 0.16, SH.ceramic, -2.6, 0.89, -1.2, dn, 10); // 桌上小花瓶
  sph(0.05, M(0xe08a9a, { rough: 0.9 }), -2.6, 1.0, -1.2, dn);
  box(0.5, 0.04, 0.3, SH.paper, -2.25, 0.83, -1.35, dn, 0.2); // 餐垫

  // ---- 厨房 ----
  const kt = P('kitchen', gF1);
  box(2.6, 0.06, 1.9, M(0xb9c4c9, { rough: 0.9 }), -3.0, F1 - 0.03, -2.2, kt);
  const ctM = M(0xd8d8d8, { rough: 0.4 });
  box(2.0, 0.82, 0.62, M(0xe8e8e8, { rough: 0.7 }), -3.2, F1 + 0.41, -2.7, kt); // 主柜体
  box(2.04, 0.05, 0.66, ctM, -3.2, F1 + 0.845, -2.7, kt); // 台面
  box(0.62, 0.82, 1.3, M(0xe8e8e8, { rough: 0.7 }), -2.32, F1 + 0.41, -2.05, kt); // L形转角
  box(0.66, 0.05, 1.34, ctM, -2.32, F1 + 0.845, -2.05, kt);
  box(0.5, 0.14, 0.42, SH.steel, -3.0, F1 + 0.82, -2.7, kt); // 水槽
  for (const dx of [-0.08, 0.08]) { // 双龙头
    cyl(0.02, 0.02, 0.28, SH.steel, -3.0 + dx, F1 + 1.0, -2.92, kt, 8);
    const sp = cyl(0.016, 0.016, 0.16, SH.steel, -3.0 + dx, F1 + 1.13, -2.85, kt, 8); sp.rotation.x = Math.PI / 2;
  }
  sph(0.02, M(0x3a6ab0), -3.08, F1 + 0.95, -2.92, kt); // 冷
  sph(0.02, M(0xd94f4f), -2.92, F1 + 0.95, -2.92, kt); // 热
  box(0.62, 0.05, 0.52, SH.black, -3.75, F1 + 0.895, -2.7, kt); // 燃气灶
  for (const dx of [-0.15, 0.15]) cyl(0.09, 0.09, 0.02, M(0x333333), -3.75 + dx, F1 + 0.93, -2.7, kt, 12);
  cyl(0.14, 0.14, 0.12, SH.steel, -3.9, F1 + 0.98, -2.7, kt, 14); // 锅
  cyl(0.145, 0.145, 0.02, SH.steel, -3.9, F1 + 1.05, -2.7, kt, 14); // 锅盖
  sph(0.02, SH.black, -3.9, F1 + 1.07, -2.7, kt);

  // 吊柜
  const cab = P('cabinet', gF1);
  const cabM = M(0xe0d8c8, { rough: 0.8 });
  box(1.7, 0.72, 0.36, cabM, -3.2, F1 + 2.0, -3.1, cab);
  box(0.81, 0.62, 0.02, M(0xd0c8b8, { rough: 0.8 }), -3.62, F1 + 2.0, -2.91, cab); // 门
  box(0.81, 0.62, 0.02, M(0xd0c8b8, { rough: 0.8 }), -2.78, F1 + 2.0, -2.91, cab);
  sph(0.025, SH.gold, -3.28, F1 + 2.0, -2.89, cab); // 把手
  sph(0.025, SH.gold, -3.12, F1 + 2.0, -2.89, cab);

  // 电饭煲
  const rc = P('ricecooker', gF1);
  cyl(0.17, 0.19, 0.24, SH.white, -2.32, F1 + 0.99, -2.0, rc, 16);
  cyl(0.12, 0.14, 0.06, SH.white, -2.32, F1 + 1.13, -2.0, rc, 16); // 盖
  box(0.08, 0.03, 0.02, M(0xe0a03a, { emissive: 0xe0a03a, ei: 0.5 }), -2.32, F1 + 1.0, -1.83, rc); // 保温灯

  // 微波炉
  const mw = P('microwave', gF1);
  box(0.52, 0.32, 0.38, M(0x3a3a3a, { rough: 0.5 }), -4.0, F1 + 1.03, -2.2, mw);
  box(0.36, 0.24, 0.02, M(0x1a2530, { rough: 0.3 }), -4.05, F1 + 1.03, -2.2 + 0.2, mw);
  box(0.06, 0.2, 0.02, M(0x555555), -3.76, F1 + 1.03, -2.2 + 0.2, mw); // 操作面板

  // 厨具挂架
  const ut = P('utensils', gF1);
  const rail2 = cyl(0.015, 0.015, 1.2, SH.steel, -3.0, F1 + 1.55, -3.28, ut, 8); rail2.rotation.z = Math.PI / 2;
  [[-3.4, 0], [-3.0, 1], [-2.6, 2]].forEach(([ux], i) => {
    const g = new THREE.Group(); g.position.set(ux, F1 + 1.55, -3.28); ut.add(g);
    const hook2 = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.005, 6, 10), SH.steel);
    hook2.position.y = -0.02; g.add(hook2); tagPart(hook2, g);
    if (i === 0) { cyl(0.012, 0.012, 0.28, SH.woodDark, 0, -0.2, 0, g, 6); cyl(0.05, 0.03, 0.05, SH.steel, 0, -0.38, 0, g, 10); } // 汤勺
    if (i === 1) { cyl(0.012, 0.012, 0.24, SH.woodDark, 0, -0.18, 0, g, 6); box(0.09, 0.12, 0.015, SH.steel, 0, -0.34, 0, g); } // 锅铲
    if (i === 2) { cyl(0.012, 0.012, 0.26, SH.woodDark, 0, -0.19, 0, g, 6); const st4 = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 14), SH.steel); st4.position.y = -0.36; g.add(st4); tagPart(st4, g); } // 漏勺
  });

  // 洗洁精·调料
  const dt2 = P('detergent', gF1);
  cyl(0.035, 0.04, 0.14, M(0x7ac84a, { rough: 0.5 }), -2.68, F1 + 0.94, -2.55, dt2, 10); // 洗洁精
  cyl(0.012, 0.012, 0.06, M(0x7ac84a), -2.68, F1 + 1.04, -2.55, dt2, 8);
  cyl(0.03, 0.03, 0.16, M(0x4a2a1a, { rough: 0.5 }), -2.58, F1 + 0.95, -2.58, dt2, 10); // 酱油
  cyl(0.025, 0.03, 0.08, SH.white, -2.48, F1 + 0.91, -2.52, dt2, 10); // 盐

  // 厨房地垫
  const km = P('kitchenmat', gF1);
  box(1.5, 0.025, 0.55, M(0x6a9a7a, { rough: 1 }), -3.1, F1 + 0.035, -1.95, km);

  // 换气扇
  const rh = P('rangehood', gF1);
  box(0.72, 0.45, 0.55, M(0xc0c4c8, { metal: 0.3, rough: 0.5 }), -3.75, F1 + 1.95, -2.7, rh);
  box(0.3, 0.75, 0.3, M(0xc0c4c8, { metal: 0.3, rough: 0.5 }), -3.75, F1 + 2.4, -2.7, rh); // 烟道
  for (let i = 0; i < 4; i++) box(0.6, 0.02, 0.4, M(0x8a8f96, { rough: 0.6 }), -3.75, F1 + 1.75 + i * 0.005, -2.7, rh); // 滤网

  // 胜手口
  const bd = P('backdoor', gF1);
  const bdM = M(0x5a4a34, { map: woodTex, rough: 0.85 });
  box(0.07, 2.0, 0.85, SH.woodDark, -HX + 0.02, F1 + 1.0, -2.5, bd);
  box(0.09, 1.85, 0.7, bdM, -HX + 0.04, F1 + 0.95, -2.5, bd);
  box(0.02, 0.6, 0.5, M(0xcfe0ea, { transparent: true, opacity: 0.45, rough: 0.2 }), -HX + 0.09, F1 + 1.4, -2.5, bd);
  sph(0.03, SH.gold, -HX + 0.1, F1 + 1.0, -2.25, bd);

  // 冰箱
  const fr = P('fridge', gF1);
  const frM = M(0xf0f0f0, { rough: 0.4, metal: 0.1 });
  box(0.72, 1.72, 0.66, frM, -0.6, F1 + 0.86, -3.0, fr);
  box(0.02, 0.6, 0.05, M(0xd0d0d0), -0.25, F1 + 1.2, -2.95, fr); // 上门把手
  box(0.02, 0.5, 0.05, M(0xd0d0d0), -0.25, F1 + 0.7, -2.95, fr);
  const magCols = [0xd94f4f, 0x4f7ad9, 0xe0b13e];
  magCols.forEach((c, i) => sph(0.02, M(c, { rough: 0.6 }), -0.5 + i * 0.18, F1 + 1.45, -2.66, fr));
  box(0.15, 0.1, 0.01, SH.paper, -0.65, F1 + 1.3, -2.66, fr); // 便签

  // ---- 浴室 ----
  const bt = P('bath', gF1);
  bt.userData.cut = '1';
  box(1.9, 0.06, 1.2, SH.tileFloor, 0.55, F1 - 0.03, -2.7, bt);
  const btWallM = M(0xd8e2e8, { rough: 0.7 });
  box(0.1, 2.5, 1.2, btWallM, -0.42, F1 + 1.25, -2.7, bt);
  box(0.1, 2.5, 1.2, btWallM, 1.52, F1 + 1.25, -2.7, bt);
  box(1.9, 2.5, 0.1, btWallM, 0.55, F1 + 1.25, -3.32, bt);
  const tubM = M(0xf0f4f6, { rough: 0.35 });
  box(0.95, 0.68, 1.05, tubM, 0.95, F1 + 0.34, -2.85, bt); // 浴缸
  box(0.83, 0.1, 0.93, M(0x7ab8d9, { rough: 0.25 }), 0.95, F1 + 0.6, -2.85, bt); // 水面
  box(1.03, 0.06, 1.13, tubM, 0.95, F1 + 0.7, -2.85, bt); // 缸沿

  // 淋浴
  const shw = P('shower', gF1);
  shw.userData.cut = '1';
  const arm = cyl(0.015, 0.015, 0.35, SH.steel, -0.35, F1 + 1.75, -2.6, shw, 8); arm.rotation.z = 0.5;
  cone(0.09, 0.08, SH.steel, -0.18, F1 + 1.68, -2.6, shw, 14); // 淋浴头
  cyl(0.07, 0.07, 0.015, SH.steel, -0.18, F1 + 1.64, -2.6, shw, 14);
  for (let i = 0; i < 3; i++) { // 软管
    const hp = cyl(0.012, 0.012, 0.3, M(0x8a8f96, { rough: 0.5 }), -0.32 + i * 0.05, F1 + 1.5 - i * 0.25, -2.6, shw, 6);
    hp.rotation.z = 0.25;
  }
  cyl(0.03, 0.03, 0.06, SH.steel, -0.35, F1 + 1.1, -2.6, shw, 8); // 水龙头
  sph(0.02, M(0xd94f4f), -0.31, F1 + 1.1, -2.6, shw);

  // 浴缸盖
  const tc = P('tubcover', gF1);
  tc.userData.cut = '1';
  const tcM = M(0xb08a5a, { map: woodTex, rough: 0.85 });
  for (let i = 0; i < 5; i++) {
    const sl = box(0.85, 0.03, 0.17, tcM, 0.95, F1 + 0.95, -2.2 + i * 0.05, tc);
    sl.rotation.x = -0.35;
  }

  // 浴室镜
  const bm = P('bathmirror', gF1);
  bm.userData.cut = '1';
  box(0.02, 0.5, 0.4, SH.white, 1.46, F1 + 1.55, -2.6, bm);
  box(0.015, 0.44, 0.34, SH.mirror, 1.45, F1 + 1.55, -2.6, bm);

  // 凳·桶·洗剂
  const bg = P('bathgoods', gF1);
  bg.userData.cut = '1';
  box(0.32, 0.24, 0.26, M(0x7ab8d9, { rough: 0.7 }), -0.1, F1 + 0.12, -2.3, bg); // 洗澡凳
  cyl(0.14, 0.11, 0.24, M(0xe08a3a, { rough: 0.7 }), 0.28, F1 + 0.12, -2.35, bg, 12); // 水桶
  const botCols = [0x4a9ad9, 0x7ac84a, 0xe0b13e];
  botCols.forEach((c, i) => {
    cyl(0.035, 0.04, 0.16, M(c, { rough: 0.5 }), -0.28 + i * 0.1, F1 + 0.08, -3.1, bg, 8);
    cyl(0.012, 0.012, 0.05, SH.white, -0.28 + i * 0.1, F1 + 0.18, -3.1, bg, 6);
  });

  // ---- 洗面所 ----
  const wr = P('washroom', gF1);
  wr.userData.cut = '1';
  box(1.6, 0.06, 1.2, SH.tileFloor, 2.8, F1 - 0.03, -2.75, wr);
  box(0.1, 2.5, 1.2, M(0xe8e4d8, { rough: 0.9 }), 3.62, F1 + 1.25, -2.75, wr); // 东墙内衬
  box(1.6, 2.5, 0.1, M(0xe8e4d8, { rough: 0.9 }), 2.8, F1 + 1.25, -3.32, wr); // 北墙内衬

  // 洗面台
  const sk = P('sink', gF1);
  sk.userData.cut = '1';
  box(0.72, 0.78, 0.5, SH.white, 2.5, F1 + 0.39, -3.0, sk); // 柜体
  cyl(0.24, 0.18, 0.14, SH.ceramic, 2.5, F1 + 0.85, -3.0, sk, 16); // 台盆
  cyl(0.02, 0.02, 0.22, SH.steel, 2.5, F1 + 1.0, -3.18, sk, 8); // 龙头
  const sp2 = cyl(0.015, 0.015, 0.14, SH.steel, 2.5, F1 + 1.1, -3.11, sk, 8); sp2.rotation.x = Math.PI / 2;
  box(0.72, 0.62, 0.16, M(0xd8d0c0, { rough: 0.8 }), 2.5, F1 + 1.65, -3.2, sk); // 镜柜
  box(0.62, 0.52, 0.02, SH.mirror, 2.5, F1 + 1.65, -3.11, sk); // 镜面

  // 牙刷架
  const tb = P('toothbrush', gF1);
  tb.userData.cut = '1';
  box(0.22, 0.09, 0.12, SH.ceramic, 2.85, F1 + 0.9, -3.05, tb);
  const tbCols = [0x3a6ab0, 0xe08a9a, 0xe0b13e, 0x4a9a4a];
  tbCols.forEach((c, i) => {
    cyl(0.009, 0.009, 0.13, M(c, { rough: 0.6 }), 2.79 + i * 0.04, F1 + 1.0, -3.05, tb, 6);
    box(0.02, 0.03, 0.015, M(c, { rough: 0.6 }), 2.79 + i * 0.04, F1 + 1.07, -3.05, tb);
  });

  // 洗面毛巾
  const wt = P('washtowel', gF1);
  wt.userData.cut = '1';
  const rail3 = cyl(0.014, 0.014, 0.55, SH.steel, 3.3, F1 + 1.45, -3.28, wt, 8); rail3.rotation.z = Math.PI / 2;
  [[3.15, 0xe08a9a], [3.45, 0x7ab8d9]].forEach(([tx, c]) => {
    const tm = M(c, { rough: 0.95 });
    box(0.24, 0.36, 0.025, tm, tx, F1 + 1.26, -3.27, wt);
    box(0.24, 0.03, 0.04, tm, tx, F1 + 1.45, -3.27, wt);
  });

  // 洗衣机
  const wm = P('washer', gF1);
  wm.userData.cut = '1';
  box(0.62, 0.92, 0.6, SH.white, 3.2, F1 + 0.46, -2.35, wm);
  cyl(0.2, 0.2, 0.03, M(0xd0d8de, { rough: 0.4 }), 3.2, F1 + 0.93, -2.35, wm, 18); // 顶盖
  box(0.4, 0.12, 0.02, M(0xe8e8e8, { rough: 0.5 }), 3.2, F1 + 0.75, -2.04, wm); // 操作面板
  cyl(0.22, 0.18, 0.35, M(0xd9a86a, { rough: 0.9 }), 2.55, F1 + 0.175, -2.3, wm, 12); // 衣物篮
  sph(0.12, M(0x9a8a7a, { rough: 1 }), 2.55, F1 + 0.32, -2.3, wm, 1, 0.5, 1); // 待洗衣物

  // ---- 厕所 ----
  const to = P('toilet', gF1);
  to.userData.cut = '1';
  box(1.2, 0.06, 1.2, SH.tileFloor, 3.8, F1 - 0.03, -2.9, to);
  box(0.55, 0.38, 0.2, SH.white, 3.8, F1 + 1.05, -3.3, to); // 水箱
  box(0.06, 0.04, 0.12, SH.steel, 4.12, F1 + 1.1, -3.3, to); // 冲水把手
  box(0.5, 0.4, 0.62, SH.white, 3.8, F1 + 0.2, -2.95, to); // 便器
  cyl(0.19, 0.21, 0.06, M(0xe8e8e8, { rough: 0.5 }), 3.8, F1 + 0.43, -2.95, to, 16); // 座圈

  // 卷纸架
  const tp = P('tproll', gF1);
  tp.userData.cut = '1';
  const arm2 = cyl(0.012, 0.012, 0.22, SH.steel, 3.45, F1 + 0.85, -3.28, tp, 8); arm2.rotation.z = Math.PI / 2;
  cyl(0.055, 0.055, 0.11, SH.white, 3.5, F1 + 0.85, -3.28, tp, 14); // 纸卷
  const tp2 = box(0.1, 0.22, 0.005, SH.white, 3.5, F1 + 0.68, -3.22, tp); tp2.castShadow = false; // 垂下的纸

  // 厕所置物架
  const ts = P('tshelf', gF1);
  ts.userData.cut = '1';
  box(0.62, 0.04, 0.22, M(0x9a7b52, { rough: 0.85 }), 3.8, F1 + 1.45, -3.28, ts);
  cyl(0.05, 0.06, 0.12, M(0x7ab8d9, { rough: 0.6 }), 3.65, F1 + 1.53, -3.28, ts, 10); // 除臭剂
  cyl(0.05, 0.05, 0.1, SH.white, 3.95, F1 + 1.52, -3.28, ts, 12); // 备用纸卷

  // 厕所拖鞋
  const tsl = P('tslipper', gF1);
  tsl.userData.cut = '1';
  [[3.7, -2.3], [3.9, -2.3]].forEach(([sx, sz]) => {
    box(0.11, 0.03, 0.28, M(0x6a9a6a, { rough: 0.9 }), sx, F1 + 0.015, sz, tsl);
    box(0.11, 0.025, 0.08, M(0x6a9a6a, { rough: 0.9 }), sx, F1 + 0.05, sz - 0.02, tsl);
  });

  // ---- 接客室 ----
  const rc2 = P('reception', gF1);
  box(1.6, 0.06, 2.4, floorM, 3.3, F1 - 0.03, -0.2, rc2);
  const rcWall = box(0.12, 2.5, 2.4, wallM, 2.5, F1 + 1.25, -0.2, rc2); rcWall.userData.cut = '1';
  const rcWall2 = box(1.6, 2.5, 0.12, wallM, 3.3, F1 + 1.25, -1.4, rc2); rcWall2.userData.cut = '1';

  // 沙发茶几
  const sf = P('sofa', gF1);
  sf.userData.cut = '1';
  const sfM = M(0x7a6a8a, { rough: 0.95 });
  box(1.5, 0.32, 0.65, sfM, 3.3, F1 + 0.16, -0.95, sf);
  box(1.5, 0.55, 0.18, sfM, 3.3, F1 + 0.55, -1.2, sf);
  box(0.18, 0.5, 0.65, sfM, 2.66, F1 + 0.25, -0.95, sf);
  box(0.18, 0.5, 0.65, sfM, 3.94, F1 + 0.25, -0.95, sf);
  box(0.62, 0.12, 0.55, M(0x8a7a9a, { rough: 0.95 }), 2.95, F1 + 0.38, -0.95, sf); // 坐垫×2
  box(0.62, 0.12, 0.55, M(0x8a7a9a, { rough: 0.95 }), 3.65, F1 + 0.38, -0.95, sf);
  box(0.95, 0.05, 0.55, SH.woodDark, 3.3, F1 + 0.32, -0.25, sf); // 茶几
  for (const [dx, dz] of [[-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2]])
    box(0.05, 0.3, 0.05, SH.woodDark, 3.3 + dx, F1 + 0.15, -0.25 + dz, sf);
  cyl(0.07, 0.05, 0.09, SH.ceramic, 3.3, F1 + 0.39, -0.25, sf, 10); // 茶杯
  box(0.4, 0.02, 0.28, M(0x3a6ab0, { rough: 0.8 }), 3.05, F1 + 0.355, -0.25, sf, 0.15); // 杂志

  // 高尔夫球包
  const gf = P('golfbag', gF1);
  gf.userData.cut = '1';
  const bag = cyl(0.15, 0.13, 0.95, M(0x4a3a2a, { rough: 0.85 }), 3.85, F1 + 0.5, 0.35, gf, 12);
  bag.rotation.z = 0.08;
  for (let i = 0; i < 3; i++) {
    cyl(0.008, 0.008, 0.85, SH.metal, 3.8 + i * 0.05, F1 + 1.25, 0.32 + (i - 1) * 0.05, gf, 6);
    box(0.05, 0.04, 0.09, SH.metal, 3.8 + i * 0.05, F1 + 1.68, 0.32 + (i - 1) * 0.05, gf);
  }

  // 一楼天花板（剖面自动隐藏）
  const c1 = P('ceiling1', gF1);
  c1.userData.cut = '12x';
  const ceM = M(0xf5f2e8, { rough: 0.95 });
  const rooms1 = [
    [-1.6, 1.9, 5.2, 2.6], [-2.2, -1.55, 4.0, 3.0], [-3.0, -2.2, 2.6, 1.9],
    [0.55, -2.7, 1.9, 1.2], [2.8, -2.75, 1.6, 1.2], [3.8, -2.9, 1.2, 1.2],
    [3.3, -0.2, 1.6, 2.4], [2.2, -0.1, 2.4, 2.6], [3.3, 2.2, 1.6, 2.5]
  ];
  rooms1.forEach(([cx, cz, w, d]) => box(w, 0.05, d, ceM, cx, F1 + WH - 0.025, cz, c1));
})();

/* ============ 二楼 ============ */
(function buildF2() {
  const floorM2 = M(0x9a7b52, { map: woodTex, rough: 0.85 });
  const wallM2 = M(0xf2ecdc, { rough: 0.95 });
  const shadeM2 = M(0xf5f0e0, { rough: 0.8, side: THREE.DoubleSide });
  function pendant2(x, y, z, parent) {
    cyl(0.015, 0.015, 0.6, SH.black, x, y - 0.35, z, parent, 6);
    const sh = cyl(0.26, 0.12, 0.2, shadeM2, x, y - 0.72, z, parent, 16); sh.castShadow = false;
    const bl = sph(0.06, SH.lampGlow, x, y - 0.78, z, parent); bl.castShadow = false;
  }
  box(HX * 2, 0.25, HZ * 2, floorM2, 0, F1 + WH + 0.125, 0, gF2);

  // ---- 大雄的房间 ----
  const nb = P('nobita', gF2);
  box(3.25, 0.025, 2.9, M(0x9a7b52, { map: woodTex, rough: 0.85 }), 2.625, F2 + 0.012, 2.05, nb);
  const nw1 = box(0.1, 2.5, 4.9, wallM2, 1.0, F2 + 1.25, 1.05, nb); nw1.userData.cut = '2';

  // 书桌
  const dk = P('desk', gF2);
  const dkM = M(0x8a5f36, { map: woodTex, rough: 0.75 });
  box(0.7, 0.06, 1.4, dkM, HX - 0.35, F2 + 0.72, 2.2, dk); // 桌面
  for (const [dx, dz] of [[-0.28, -0.6], [0.28, -0.6], [-0.28, 0.6], [0.28, 0.6]])
    box(0.06, 0.69, 0.06, dkM, HX - 0.35 + dx, F2 + 0.36, 2.2 + dz, dk);
  box(0.6, 0.6, 0.4, dkM, HX - 0.35, F2 + 0.36, 2.78, dk); // 侧柜
  box(0.5, 0.03, 0.4, SH.paper, HX - 0.35, F2 + 0.76, 2.2, dk); // 作业本
  box(0.2, 0.06, 0.28, M(0xd94f4f, { rough: 0.85 }), HX - 0.45, F2 + 0.78, 2.45, dk, 0.3); // 没写完的作业
  cyl(0.035, 0.045, 0.12, SH.ceramic, HX - 0.15, F2 + 0.81, 1.85, dk, 10); // 水杯

  // 时光机抽屉（金色高亮）
  const td = P('timedrawer', gF2);
  const tdF = box(0.5, 0.2, 0.035, SH.gold, HX - 0.35, F2 + 0.55, 3.0, td);
  tdF.castShadow = true;
  sph(0.028, M(0x8a6a1a, { metal: 0.7, rough: 0.3 }), HX - 0.35, F2 + 0.55, 3.03, td); // 金把手
  box(0.46, 0.16, 0.3, M(0x6a5a2a, { rough: 0.7 }), HX - 0.35, F2 + 0.55, 2.85, td); // 抽屉内腔（微开）

  // 书桌普通抽屉
  const dd = P('deskdrawers', gF2);
  for (const dy of [0.42, 0.2]) {
    box(0.02, 0.16, 0.3, M(0x9a6f42, { rough: 0.8 }), HX - 0.66, F2 + dy, 2.78, dd);
    sph(0.02, SH.woodDark, HX - 0.68, F2 + dy, 2.78, dd);
  }
  box(0.5, 0.02, 0.34, M(0x8a6a3a, { rough: 0.9 }), HX - 0.35, F2 + 0.12, 2.78, dd); // 抽屉里塞的旧考卷

  // 台灯
  const dl = P('desklamp', gF2);
  cyl(0.08, 0.1, 0.04, M(0x3a6ab0, { rough: 0.5 }), HX - 0.55, F2 + 0.77, 1.72, dl, 12);
  const armA = cyl(0.015, 0.015, 0.4, M(0x3a6ab0, { rough: 0.5 }), HX - 0.55, F2 + 0.95, 1.72, dl, 8);
  armA.rotation.z = 0.3;
  const armB = cyl(0.015, 0.015, 0.35, M(0x3a6ab0, { rough: 0.5 }), HX - 0.42, F2 + 1.08, 1.72, dl, 8);
  armB.rotation.z = -0.9;
  const shade = cone(0.11, 0.14, M(0x3a6ab0, { rough: 0.5, side: THREE.DoubleSide }), HX - 0.28, F2 + 1.05, 1.72, dl, 14);
  shade.rotation.z = -1.1;
  const bulb = sph(0.035, M(0xfff2c8, { emissive: 0xffe9a8, ei: 1.0 }), HX - 0.25, F2 + 1.02, 1.72, dl);
  bulb.castShadow = false;

  // 笔筒
  const ps = P('penstand', gF2);
  cyl(0.05, 0.042, 0.11, M(0xd94f4f, { rough: 0.7 }), HX - 0.18, F2 + 0.8, 2.52, ps, 12);
  const penCols = [0x2a2a2a, 0x3a6ab0, 0xd9b23a];
  penCols.forEach((c, i) => {
    const pn = cyl(0.008, 0.008, 0.16, M(c, { rough: 0.6 }), HX - 0.18 + (i - 1) * 0.02, F2 + 0.9, 2.52 + (i % 2) * 0.015, ps, 6);
    pn.rotation.z = (i - 1) * 0.12;
  });
  box(0.16, 0.008, 0.03, M(0xd9b23a, { rough: 0.7 }), HX - 0.18, F2 + 0.755, 2.32, ps, 0.2); // 尺子
  box(0.05, 0.02, 0.035, M(0xf0f0f0, { rough: 0.9 }), HX - 0.1, F2 + 0.76, 2.6, ps); // 橡皮

  // 椅子
  const ch2 = P('chair', gF2);
  const chM2 = M(0x6b4a2f, { rough: 0.8 });
  box(0.44, 0.05, 0.44, chM2, HX - 1.15, F2 + 0.45, 2.2, ch2);
  box(0.44, 0.52, 0.05, chM2, HX - 1.15, F2 + 0.75, 2.4, ch2);
  for (const [dx, dz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]])
    box(0.04, 0.45, 0.04, chM2, HX - 1.15 + dx, F2 + 0.225, 2.2 + dz, ch2);

  // 椅垫
  const cp = P('chairpad', gF2);
  box(0.4, 0.045, 0.4, M(0x9a4a3a, { rough: 0.95 }), HX - 1.15, F2 + 0.5, 2.2, cp);

  // 床
  const bd2 = P('bed', gF2);
  const bdM2 = M(0x8a5f36, { map: woodTex, rough: 0.8 });
  box(0.09, 0.85, 1.05, bdM2, 1.32, F2 + 0.425, 2.4, bd2); // 床头板
  box(1.95, 0.22, 1.0, bdM2, 2.32, F2 + 0.26, 2.4, bd2); // 床架
  box(1.85, 0.16, 0.92, SH.white, 2.32, F2 + 0.45, 2.4, bd2); // 床垫
  box(0.42, 0.11, 0.62, M(0xf5f5f5, { rough: 0.95 }), 1.62, F2 + 0.58, 2.4, bd2); // 枕头
  box(1.05, 0.09, 0.96, M(0x4f7ad9, { rough: 0.95 }), 2.75, F2 + 0.57, 2.4, bd2); // 被子
  box(1.05, 0.03, 0.2, M(0x6a9ae0, { rough: 0.95 }), 2.75, F2 + 0.6, 2.05, bd2); // 被头折边

  // 床头柜·闹钟
  const ns = P('nightstand', gF2);
  box(0.46, 0.52, 0.42, dkM, 1.32, F2 + 0.26, 1.5, ns);
  box(0.4, 0.14, 0.02, M(0x9a6f42, { rough: 0.8 }), 1.32, F2 + 0.38, 1.28, ns); // 抽屉线
  box(0.17, 0.13, 0.09, M(0x3a3a3a, { rough: 0.5 }), 1.32, F2 + 0.585, 1.5, ns); // 闹钟
  const face = cyl(0.045, 0.045, 0.015, SH.white, 1.32, F2 + 0.585, 1.45, ns, 12);
  face.rotation.x = Math.PI / 2;
  box(0.008, 0.035, 0.005, SH.black, 1.32, F2 + 0.59, 1.44, ns); // 指针
  sph(0.02, M(0xd9b23a, { metal: 0.6, rough: 0.4 }), 1.25, F2 + 0.66, 1.5, ns); // 铃×2
  sph(0.02, M(0xd9b23a, { metal: 0.6, rough: 0.4 }), 1.39, F2 + 0.66, 1.5, ns);

  // 书架（框体+背板，书在前面）
  const shf = P('shelf', gF2);
  const shM = M(0x7a5a38, { map: woodTex, rough: 0.85 });
  box(1.3, 1.9, 0.05, shM, 1.7, F2 + 0.95, -0.36, shf); // 背板
  box(0.05, 1.9, 0.3, shM, 1.075, F2 + 0.95, -0.23, shf); // 侧板
  box(0.05, 1.9, 0.3, shM, 2.325, F2 + 0.95, -0.23, shf);
  box(1.3, 0.05, 0.3, shM, 1.7, F2 + 1.875, -0.23, shf); // 顶板
  for (let s = 0; s < 3; s++) {
    const sy = F2 + 0.35 + s * 0.52;
    box(1.2, 0.04, 0.26, shM, 1.7, sy - 0.24, -0.22, shf);
    let bx = 1.16;
    while (bx < 2.14) { // 竖排书
      const bw = 0.045 + rnd() * 0.035, bh = 0.3 + rnd() * 0.1;
      box(bw, bh, 0.2, bookMat(), bx + bw / 2, sy - 0.22 + bh / 2, -0.22, shf, (rnd() - .5) * 0.04);
      bx += bw + 0.008;
      if (rnd() < 0.12 && bx < 2.04) { bx += 0.06; } // 偶尔空隙
    }
  }
  for (let i = 0; i < 4; i++) // 横堆杂志
    box(0.3, 0.045, 0.22, bookMat(), 1.9, F2 + 0.14 + i * 0.05, -0.22, shf, (rnd() - .5) * 0.1);
  const big = box(0.34, 0.44, 0.06, bookMat(), 1.28, F2 + 0.55, -0.2, shf); big.rotation.z = 0.18; // 大开本

  // 壁橱（框体，开口朝南进大雄房间）
  const cl = P('closet', gF2);
  const clM = M(0xe8e0cc, { rough: 0.9 });
  box(1.5, 0.06, 0.62, clM, 3.5, F2 + 1.92, -0.1, cl); // 顶
  box(1.5, 0.06, 0.62, clM, 3.5, F2 + 0.03, -0.1, cl); // 底
  box(0.06, 1.95, 0.62, clM, 2.78, F2 + 0.975, -0.1, cl); // 侧
  box(0.06, 1.95, 0.62, clM, 4.22, F2 + 0.975, -0.1, cl);
  box(1.5, 1.95, 0.05, clM, 3.5, F2 + 0.975, -0.38, cl); // 背
  box(1.38, 0.04, 0.55, clM, 3.5, F2 + 0.95, -0.1, cl); // 中层板
  const clDoorM = M(0xd8cba8, { rough: 0.9 });
  box(0.68, 1.8, 0.05, clDoorM, 3.18, F2 + 0.95, 0.23, cl); // 拉门（左关）
  box(0.68, 1.8, 0.05, clDoorM, 3.82, F2 + 0.95, 0.28, cl); // 拉门（右半开）

  // 壁橱被褥（哆啦A梦的床）
  const cf = P('closetfuton', gF2);
  const futM2 = M(0xf0ece0, { rough: 0.95 });
  for (let i = 0; i < 3; i++)
    box(0.62, 0.17, 0.5, i === 1 ? M(0xd8e8f0, { rough: 0.95 }) : futM2, 3.5, F2 + 0.15 + i * 0.18, -0.1, cf);
  box(0.4, 0.12, 0.3, SH.white, 3.5, F2 + 0.75, -0.1, cf); // 枕头
  box(0.5, 0.3, 0.36, M(0x9a4a3a, { rough: 0.9 }), 3.9, F2 + 0.2, -0.1, cf, 0.1); // 备用坐垫

  // 地毯
  const rg = P('rug', gF2);
  const rug = box(1.9, 0.03, 1.5, M(0xffffff, { map: rugTex, rough: 1 }), 2.7, F2 + 0.028, 1.55, rg);
  rug.receiveShadow = true;

  // 挂钟
  const wc = P('wallclock', gF2);
  wc.userData.cut = '2';
  const wcF = cyl(0.17, 0.17, 0.05, M(0x5a3d24, { rough: 0.7 }), 1.06, F2 + 1.95, 1.6, wc, 20);
  wcF.rotation.z = Math.PI / 2;
  const wcF2 = cyl(0.14, 0.14, 0.055, SH.white, 1.06, F2 + 1.95, 1.6, wc, 20);
  wcF2.rotation.z = Math.PI / 2;
  box(0.01, 0.09, 0.015, SH.black, 1.095, F2 + 1.97, 1.6, wc); // 时针
  const minh = box(0.01, 0.13, 0.012, SH.black, 1.095, F2 + 1.95, 1.6, wc); minh.rotation.x = 0.9;

  // 日历
  const cal = P('calendar', gF2);
  cal.userData.cut = '2';
  box(0.02, 0.42, 0.32, M(0xffffff, { map: calendarTex, rough: 0.9 }), 1.06, F2 + 1.45, 2.35, cal);

  // 海报
  const po = P('poster', gF2);
  po.userData.cut = '2';
  box(0.55, 0.75, 0.02, M(0xffffff, { map: posterTex, rough: 0.85 }), 2.2, F2 + 1.75, HZ - 0.17, po);

  // 窗帘
  const cur = P('curtain', gF2);
  cur.userData.cut = '2';
  const curM = SH.curtainBlue;
  for (const cz of [1.72, 2.68]) { // 东窗
    box(0.06, 1.35, 0.3, curM, HX - 0.18, F2 + 1.5, cz, cur);
    box(0.07, 0.08, 0.32, M(0xd9b23a, { rough: 0.8 }), HX - 0.18, F2 + 1.1, cz, cur); // 束带
  }
  const rod3 = cyl(0.015, 0.015, 1.7, SH.woodDark, HX - 0.18, F2 + 2.22, 2.2, cur, 8); rod3.rotation.x = Math.PI / 2;
  for (const cx of [2.0, 3.2]) { // 南窗
    box(0.3, 1.35, 0.06, curM, cx, F2 + 1.5, HZ - 0.18, cur);
    box(0.32, 0.08, 0.07, M(0xd9b23a, { rough: 0.8 }), cx, F2 + 1.1, HZ - 0.18, cur);
  }
  const rod4 = cyl(0.015, 0.015, 1.9, SH.woodDark, 2.6, F2 + 2.22, HZ - 0.18, cur, 8); rod4.rotation.z = Math.PI / 2;

  // 垃圾桶
  const tb2 = P('trashbin', gF2);
  cyl(0.15, 0.12, 0.3, M(0x8a9a6a, { rough: 0.8 }), 2.0, F2 + 0.15, 3.05, tb2, 14);
  sph(0.05, SH.paper, 1.95, F2 + 0.32, 3.02, tb2, 1, 0.8, 1); // 纸团
  sph(0.045, SH.paper, 2.08, F2 + 0.05, 3.12, tb2, 1, 0.7, 1); // 地上的纸团

  // ---- 二楼和室（客房） ----
  const ws = P('washitsu', gF2);
  box(2.95, 0.025, 2.8, SH.tatami, -2.725, F2 + 0.012, 2.05, ws);
  const ww1 = box(0.1, 2.5, 2.9, wallM2, -1.2, F2 + 1.25, 2.05, ws); ww1.userData.cut = '2';
  const ww2 = box(3.05, 2.5, 0.1, wallM2, -2.725, F2 + 1.25, 0.6, ws); ww2.userData.cut = '2';
  const ltM = M(0x6b4a2f, { map: woodTex, rough: 0.7 });
  box(0.95, 0.06, 0.65, ltM, -2.7, F2 + 0.36, 2.0, ws); // 矮桌
  for (const [dx, dz] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]])
    box(0.06, 0.33, 0.06, ltM, -2.7 + dx, F2 + 0.17, 2.0 + dz, ws);
  [[-2.7, 1.35], [-2.7, 2.65]].forEach(([cx, cz], i) => {
    box(0.42, 0.08, 0.42, M(i ? 0x3a6a9a : 0x9a4a3a, { rough: 0.95 }), cx, F2 + 0.06, cz, ws);
  });
  box(0.4, 0.8, 0.025, M(0xffffff, { map: paintTex, rough: 0.9 }), -2.7, F2 + 1.65, 0.67, ws); // 小挂轴
  cyl(0.02, 0.02, 0.5, SH.woodDark, -2.7, F2 + 2.07, 0.67, ws, 8).rotation.z = Math.PI / 2;

  // 和室壁橱
  const wcl = P('wcloset', gF2);
  const wclM = M(0xe8e0cc, { rough: 0.9 });
  box(0.05, 1.8, 1.2, wclM, -4.18, F2 + 0.9, 1.0, wcl); // 背
  box(0.55, 1.8, 0.05, wclM, -3.9, F2 + 0.9, 0.43, wcl); // 侧
  box(0.55, 1.8, 0.05, wclM, -3.9, F2 + 0.9, 1.57, wcl);
  box(0.6, 0.06, 1.2, wclM, -3.9, F2 + 1.77, 1.0, wcl); // 顶
  box(0.6, 0.06, 1.2, wclM, -3.9, F2 + 0.03, 1.0, wcl); // 底
  box(0.05, 1.65, 0.55, M(0xd8cba8, { rough: 0.9 }), -3.58, F2 + 0.9, 0.74, wcl); // 拉门
  box(0.05, 1.65, 0.55, M(0xd8cba8, { rough: 0.9 }), -3.58, F2 + 0.9, 1.28, wcl);
  box(0.45, 0.16, 0.95, futM2, -3.9, F2 + 0.14, 1.0, wcl); // 客用被褥
  box(0.45, 0.16, 0.95, futM2, -3.9, F2 + 0.31, 1.0, wcl);

  // ---- 二楼廊下 ----
  const h2 = P('hall2', gF2);
  box(2.2, 0.025, 2.6, floorM2, -0.1, F2 + 0.012, -0.3, h2);

  // 二楼踢脚线
  const bb2 = P('baseboard2', gF2);
  const bbM2 = M(0x4a3524, { rough: 0.8 });
  box(0.03, 0.09, 2.5, bbM2, 0.93, F2 + 0.045, -0.3, bb2);
  box(0.03, 0.09, 2.8, bbM2, -1.27, F2 + 0.045, 2.05, bb2);

  // 墙上照片
  const hp = P('hallphoto', gF2);
  hp.userData.cut = '2';
  box(0.04, 0.42, 0.52, SH.woodDark, 0.93, F2 + 1.7, -0.5, hp);
  box(0.02, 0.34, 0.44, M(0xd8e2ea, { rough: 0.9 }), 0.91, F2 + 1.7, -0.5, hp);
  sph(0.05, M(0xf0c8a0, { rough: 0.9 }), 0.9, F2 + 1.74, -0.5, hp);
  box(0.02, 0.14, 0.1, M(0x4f7ad9, { rough: 0.9 }), 0.9, F2 + 1.63, -0.5, hp); // 缺牙的大雄

  // 二楼灯具
  const l2 = P('lamp2f', gF2);
  pendant2(2.7, F2 + 2.55, 1.9, l2);
  pendant2(-2.7, F2 + 2.55, 2.0, l2);
  pendant2(-0.1, F2 + 2.55, -0.3, l2);

  // ---- 纳户 ----
  const sr2 = P('storeroom', gF2);
  box(2.6, 0.025, 2.6, M(0x8a7a62, { rough: 1 }), 2.2, F2 + 0.012, -2.0, sr2);
  const srW = (w, h, d, x, y, z) => { const m = box(w, h, d, wallM2, x, y, z, sr2); m.userData.cut = '2'; };
  srW(2.6, 2.5, 0.1, 2.2, F2 + 1.25, -3.3);
  srW(2.6, 2.5, 0.1, 2.2, F2 + 1.25, -0.7);
  srW(0.1, 2.5, 2.6, 0.9, F2 + 1.25, -2.0);
  srW(0.1, 2.5, 2.6, 3.5, F2 + 1.25, -2.0);

  // 标签纸箱
  const bl2 = P('boxlabels', gF2);
  const cb3 = M(0xb08d5a, { rough: 0.95 });
  const cbLbl = ['冬物', '书', '旧玩具'];
  [[1.55, 0.225, 0.6, 0.45, 0.5], [2.35, 0.175, 0.5, 0.35, 0.45], [1.7, 0.6, 0.45, 0.3, 0.4]].forEach(([bx, by, bw, bh, bd3], i) => {
    box(bw, bh, bd3, cb3, bx, F2 + by, -2.6, bl2, (i - 1) * 0.06);
    box(0.22, 0.13, 0.012, SH.paper, bx, F2 + by + 0.05, -2.6 + bd3 / 2 + 0.006, bl2, (i - 1) * 0.06);
    box(bw * 0.9, 0.02, bd3 * 0.9, M(0x8a6a3a, { rough: 0.95 }), bx, F2 + by + bh / 2 + 0.005, -2.6, bl2); // 封箱胶带
  });

  // 旧玩具
  const ot = P('oldtoys', gF2);
  box(0.26, 0.32, 0.2, M(0xc0c4c8, { metal: 0.4, rough: 0.5 }), 2.95, F2 + 0.16, -2.1, ot, 0.3); // 铁皮机器人
  box(0.2, 0.18, 0.18, M(0xc0c4c8, { metal: 0.4, rough: 0.5 }), 2.95, F2 + 0.41, -2.1, ot, 0.3);
  cyl(0.008, 0.008, 0.12, SH.metal, 2.95, F2 + 0.55, -2.1, ot, 6);
  sph(0.02, M(0xd94f4f), 2.95, F2 + 0.62, -2.1, ot);
  sph(0.13, M(0xd94f4f, { rough: 0.7 }), 1.4, F2 + 0.13, -1.5, ot); // 皮球
  const car = new THREE.Group(); car.position.set(2.5, F2, -1.4); car.rotation.y = 0.5; ot.add(car);
  box(0.32, 0.1, 0.16, M(0x3a6ab0, { rough: 0.6 }), 0, 0.09, 0, car);
  box(0.16, 0.08, 0.14, M(0x3a6ab0, { rough: 0.6 }), -0.02, 0.17, 0, car);
  for (const [wx, wz] of [[-0.1, -0.09], [0.1, -0.09], [-0.1, 0.09], [0.1, 0.09]]) {
    const wh = cyl(0.035, 0.035, 0.03, SH.black, wx, 0.035, wz, car, 10);
    wh.rotation.x = Math.PI / 2;
  }

  // 卷起的被褥
  const rr = P('rolledrug', gF2);
  const roll = cyl(0.17, 0.17, 1.05, M(0x9a8a9a, { rough: 0.95 }), 1.35, F2 + 0.17, -2.9, rr, 14);
  roll.rotation.z = Math.PI / 2;
  for (const sx of [1.1, 1.6]) {
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.175, 0.015, 6, 16), M(0x6a5a4a, { rough: 0.9 }));
    strap.position.set(sx, F2 + 0.17, -2.9); strap.rotation.y = Math.PI / 2;
    strap.castShadow = true; rr.add(strap); tagPart(strap, rr);
  }

  // 二楼天花板（剖面自动隐藏）
  const c2 = P('ceiling2', gF2);
  c2.userData.cut = '2x';
  const ceM2 = M(0xf5f2e8, { rough: 0.95 });
  [[2.625, 2.05, 3.25, 2.9], [2.625, -0.05, 3.25, 1.3], [-2.725, 2.05, 3.05, 2.9],
   [-0.1, -0.3, 2.2, 2.6], [2.2, -2.0, 2.6, 2.6]].forEach(([cx, cz, w, d]) =>
    box(w, 0.05, d, ceM2, cx, F2 + WH - 0.025, cz, c2));
})();

/* ============ 视角与剖面 ============ */
for (const id of ['roof', 'onigawara', 'rafter', 'gutter', 'antenna'])
  if (PARTS[id] && PARTS[id].group) PARTS[id].group.userData.cut = '12x';

let mode = 'out';
let cutMode = {};
const MODES = {
  out: { pos: [11.5, 8.5, 13.5], tgt: [0, 2.6, 0] },
  f1: { pos: [0.5, 5.2, 14.5], tgt: [0, 1.5, 0] },
  f2: { pos: [0.5, 9.5, 14.0], tgt: [0, 4.4, 0] },
  xray: { pos: [12.5, 9.5, 12.5], tgt: [0, 3.0, 0] },
};
function applyCutObj(o) {
  const flag = o.userData && o.userData.cut;
  if (flag && String(flag).split('').some(f => cutMode[f])) { o.visible = false; return; }
  o.visible = true;
  for (const ch of o.children) applyCutObj(ch);
}
function setMode(m) {
  mode = m;
  cutMode = m === 'f1' ? { 1: 1 } : m === 'f2' ? { 2: 1 } : m === 'xray' ? { 1: 1, 2: 1, x: 1 } : {};
  for (const id in PARTS) { const g = PARTS[id].group; if (g) applyCutObj(g); }
  gF2.visible = (m !== 'f1');
  const c = MODES[m];
  camera.position.set(...c.pos);
  controls.target.set(...c.tgt);
  controls.update();
  const VMAP = { exterior: 'out', f1: 'f1', f2: 'f2', xray: 'xray' };
  document.querySelectorAll('.vbtn').forEach(b => b.classList.toggle('on', VMAP[b.dataset.view] === m));
}

/* ============ 侧栏 ============ */
const panel = document.getElementById('panel');
const listEl = document.getElementById('parts');
const secNames = { out: '外部', f1: '一楼', f2: '二楼' };
const secEls = {};
for (const k of ['out', 'f1', 'f2']) {
  const h = document.createElement('div');
  h.className = 'cat'; h.textContent = secNames[k] + ' · ' + Object.keys(PARTS).filter(id => PARTS[id].cat === k && PARTS[id].group).length + '个部件';
  listEl.appendChild(h); secEls[k] = h;
}
const btns = {};
for (const id in PARTS) {
  const p = PARTS[id];
  if (!p.group) continue;
  const b = document.createElement('button');
  b.className = 'pbtn'; b.textContent = p.name; b.dataset.id = id;
  b.onclick = () => { ensureVisible(id); select(id); };
  btns[id] = b;
}
// 把按钮按部件注册顺序排到各组内
for (const k of ['out', 'f1', 'f2']) {
  const frag = document.createDocumentFragment();
  for (const id in PARTS) if (PARTS[id].cat === k && btns[id]) frag.appendChild(btns[id]);
  secEls[k].after(frag);
}
const VMAP = { exterior: 'out', f1: 'f1', f2: 'f2', xray: 'xray' };
document.querySelectorAll('.vbtn').forEach(b => b.onclick = () => setMode(VMAP[b.dataset.view]));
document.getElementById('tRotate').onclick = e => {
  controls.autoRotate = !controls.autoRotate;
  e.target.classList.toggle('on', controls.autoRotate);
};
document.getElementById('explode').addEventListener('input', e => {
  const v = e.target.value / 100;
  gRoof.position.y = v * 3.0;
  gF2.position.y = v * 1.5;
});
document.getElementById('tLabels').onclick = e => {
  labelsOn = !labelsOn;
  e.target.classList.toggle('on', labelsOn);
  document.getElementById('labels').style.display = labelsOn ? '' : 'none';
};
document.getElementById('menuBtn').onclick = () => panel.classList.toggle('hide');
if (matchMedia('(max-width:760px)').matches) panel.classList.add('hide');

/* ============ 标注 ============ */
let labelsOn = true;
const labelLayer = document.getElementById('labels');
const labelObjs = [];
for (const id in PARTS) {
  const p = PARTS[id];
  if (!p.group || p.noLabel || !p.label) continue;
  const d = document.createElement('div');
  d.className = 'lbl'; d.textContent = p.name;
  d.onclick = () => { ensureVisible(id); select(id); };
  labelLayer.appendChild(d);
  labelObjs.push({ id, el: d, pos: new THREE.Vector3(...p.label) });
}
function groupVisible(g) {
  let n = g;
  while (n) { if (!n.visible) return false; n = n.parent; }
  return true;
}
const _v = new THREE.Vector3();
function updateLabels() {
  const w = view.clientWidth, h = view.clientHeight;
  for (const L of labelObjs) {
    const g = PARTS[L.id].group;
    if (!labelsOn || !groupVisible(g)) { L.el.style.display = 'none'; continue; }
    const p = PARTS[L.id];
    // 室内部件标注只在能看到室内的视角下显示，避免穿墙串层
    const showXray = mode === 'xray' || (mode === 'f1' && p.layer === 'f1') || (mode === 'f2' && p.layer === 'f2');
    if (p.xray && !showXray) { L.el.style.display = 'none'; continue; }
    _v.copy(L.pos).project(camera);
    if (_v.z > 1 || _v.z < -1) { L.el.style.display = 'none'; continue; }
    L.el.style.display = '';
    L.el.style.left = ((_v.x * 0.5 + 0.5) * w) + 'px';
    L.el.style.top = ((-_v.y * 0.5 + 0.5) * h) + 'px';
  }
}

/* ============ 选中 ============ */
const info = document.getElementById('info');
let boxHelper = null;
function select(id) {
  const p = PARTS[id];
  if (!p || !p.group) return;
  document.querySelectorAll('.pbtn').forEach(b => b.classList.toggle('on', b.dataset.id === id));
  labelObjs.forEach(L => L.el.classList.toggle('hot', L.id === id));
  document.getElementById('infoName').textContent = p.name;
  document.getElementById('infoCat').textContent = secNames[p.cat] || '';
  document.getElementById('infoDesc').textContent = p.desc;
  info.classList.add('show');
  if (boxHelper) { scene.remove(boxHelper); boxHelper.geometry.dispose(); boxHelper = null; }
  const bb = new THREE.Box3().setFromObject(p.group);
  if (!bb.isEmpty()) {
    boxHelper = new THREE.Box3Helper(bb, 0xffc93a);
    scene.add(boxHelper);
  }
  const center = bb.isEmpty() ? new THREE.Vector3(...(p.label || [0, 2, 0])) : bb.getCenter(new THREE.Vector3());
  const dir = p.viewDir || [1, 0.75, 1];
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(9);
  camera.position.copy(center).add(d);
  controls.target.copy(center);
  controls.update();
}
document.getElementById('infoX').onclick = () => {
  info.classList.remove('show');
  if (boxHelper) { scene.remove(boxHelper); boxHelper = null; }
  document.querySelectorAll('.pbtn,.lbl').forEach(b => b.classList.remove('on', 'hot'));
};
function ensureVisible(id) {
  const p = PARTS[id];
  if (!p) return;
  if (p.layer === 'roof') { if (mode !== 'out') setMode('out'); }
  else if (p.layer === 'f2' && mode === 'f1') setMode('f2');
  else if (p.layer === 'garden' && mode !== 'out' && mode !== 'xray') setMode('out');
}

/* ============ 点击拾取 ============ */
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2();
let downXY = null;
renderer.domElement.addEventListener('pointerdown', e => { downXY = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!downXY) return;
  const dx = e.clientX - downXY[0], dy = e.clientY - downXY[1];
  downXY = null;
  if (dx * dx + dy * dy > 25) return;
  const r = renderer.domElement.getBoundingClientRect();
  ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects([gGarden, gF1, gF2, gRoof], true);
  for (const h of hits) {
    let n = h.object;
    while (n && !(n.userData && n.userData.partId)) n = n.parent;
    // 跳过被隐藏部件
    if (n && groupVisible(n)) { ensureVisible(n.userData.partId); select(n.userData.partId); return; }
  }
});

/* ============ 自适应（手机修复保留） ============ */
function onResize() {
  const w = view.clientWidth || window.innerWidth;
  const h = view.clientHeight || window.innerHeight;
  const W = Math.max(1, w), H = Math.max(1, h);
  renderer.setSize(W, H);
  camera.aspect = W / H;
  const portrait = H > W && matchMedia('(max-width:760px)').matches;
  camera.fov = portrait ? 62 : 50;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', () => setTimeout(onResize, 300));
onResize();
setMode('out');
document.getElementById('loading').style.display = 'none';

/* ============ 主循环 ============ */
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  // 晾晒衣物随风轻摆
  const ld = PARTS.laundry && PARTS.laundry.group;
  if (ld && ld.visible) ld.rotation.z = Math.sin(t * 1.3) * 0.012;
  controls.update();
  renderer.render(scene, camera);
  updateLabels();
}
animate();

// 上报 mesh 总数（控制台）
let meshCount = 0;
scene.traverse(o => { if (o.isMesh) meshCount++; });
console.log('[nobi-house v3] parts:', Object.keys(btns).length, 'meshes:', meshCount);

// 调试钩子（自动化验证用）
window.__nobi = { select, setMode, PARTS, camera, controls, renderer, THREE };
