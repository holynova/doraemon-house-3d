import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ============ 基础场景 ============ */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd3f2);
scene.fog = new THREE.Fog(0x9fd3f2, 45, 95);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 300);
camera.position.set(11.5, 7.5, 13.5);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 2.4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 1.5;
controls.maxDistance = 45;
controls.autoRotateSpeed = 1.2;

const hemi = new THREE.HemisphereLight(0xd8ecff, 0xa89a80, 1.05);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
sun.position.set(14, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
sun.shadow.camera.far = 60;
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
  g.fillStyle = '#39434e'; g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 32) {
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y, s, 4);
    for (let x = 0; x < s; x += 32) {
      g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 2;
      g.beginPath(); g.arc(x + 16, y + 32, 13, Math.PI, 0); g.stroke();
    }
  }
}, 7, 3);
const tatamiTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#c3cd92'; g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(90,110,60,.25)'; g.lineWidth = 1;
  for (let y = 0; y < s; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(s, y); g.stroke(); }
  g.strokeStyle = '#2e5b3a'; g.lineWidth = 10; g.strokeRect(0, 0, s, s);
});
const woodTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#b28a5c'; g.fillRect(0, 0, s, s);
  for (let x = 0; x < s; x += 32) {
    g.fillStyle = `rgba(${120 + rnd() * 40 | 0},${80 + rnd() * 25 | 0},40,.35)`;
    g.fillRect(x, 0, 30, s);
    g.strokeStyle = 'rgba(60,35,15,.5)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, s); g.stroke();
    g.strokeStyle = 'rgba(90,55,25,.3)'; g.lineWidth = 1;
    for (let i = 0; i < 3; i++) { const gx = x + 6 + rnd() * 20; g.beginPath(); g.moveTo(gx, 0); g.bezierCurveTo(gx + 4, s * .3, gx - 4, s * .6, gx + 2, s); g.stroke(); }
  }
}, 3, 3);
const grassTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#79a95b'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = rnd() > .5 ? 'rgba(60,110,45,.5)' : 'rgba(150,200,110,.45)';
    g.fillRect(rnd() * s, rnd() * s, 2, 2 + rnd() * 3);
  }
}, 14, 14);
const plasterTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#f2ecdf'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 700; i++) {
    g.fillStyle = rnd() > .5 ? 'rgba(180,170,150,.25)' : 'rgba(255,255,255,.35)';
    g.fillRect(rnd() * s, rnd() * s, 2, 2);
  }
}, 2, 1);
const blockTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#b9b3a6'; g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(80,75,65,.6)'; g.lineWidth = 3;
  for (let y = 0; y <= s; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(s, y); g.stroke(); }
  for (let y = 0; y < s; y += 32) for (let x = (y / 32 % 2) * 32; x <= s; x += 64) {
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke();
  }
}, 6, 1);

/* ============ 材质与建模助手 ============ */
function M(color, o = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: o.rough ?? 0.92, metalness: o.metal ?? 0,
    map: o.map || null, transparent: !!o.transparent, opacity: o.opacity ?? 1,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1,
    side: o.side || THREE.FrontSide
  });
}
const extMats = [];   // 外墙材质（透视模式下变透明）
function extM(color, o = {}) { const m = M(color, o); extMats.push(m); return m; }

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
function tagPart(mesh, parent) {
  let n = parent;
  while (n) {
    if (n.userData && n.userData.isPart) { mesh.userData.partId = n.userData.partId; break; }
    n = n.parent;
  }
}
// 两点之间的墙体（轴对齐）
function wallSeg(x1, z1, x2, z2, y0, h, t, material, parent) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
  const m = (Math.abs(x2 - x1) > Math.abs(z2 - z1))
    ? box(len, h, t, material, cx, y0 + h / 2, cz, parent)
    : box(t, h, len, material, cx, y0 + h / 2, cz, parent);
  return m;
}

/* ============ 部件注册表 ============ */
const PARTS = {};
const CATS = { out: '外部', f1: '一楼', f2: '二楼', yard: '庭院' };
function defPart(id, meta) { PARTS[id] = Object.assign({ id, group: null }, meta); }
function P(id, parent) {
  const g = new THREE.Group();
  g.userData.isPart = true; g.userData.partId = id;
  PARTS[id].group = g;
  (parent || scene).add(g);
  return g;
}

defPart('roof',    { name: '屋顶', cat: 'out', layer: 'roof', label: [0, 7.9, 0], viewDir: [1, .75, 1], desc: '切妻造的人字屋顶，铺着深灰色日式瓦片。屋脊上还竖着电视天线——大雄家看电视全靠它啦。' });
defPart('wall1',   { name: '一楼外墙', cat: 'out', layer: 'f1', label: [-3.75, 1.7, 1], viewDir: [-1, .5, .6], desc: '米白色灰泥外墙，配深色木质装饰，是典型的日本独栋小楼外立面。' });
defPart('wall2',   { name: '二楼外墙', cat: 'out', layer: 'f2', label: [3.75, 4.7, 1], viewDir: [1, .5, .6], desc: '二楼的外墙与窗户。大雄房间的窗户正对着街道，他老爱趴在窗台上发呆。' });
defPart('door',    { name: '玄关大门', cat: 'out', layer: 'f1', label: [2.5, 1.7, 3.45], desc: '野比家的玄关大门，上面还有小小的雨棚。每天放学，大雄都是哭着从这里冲进来的。' });
defPart('balcony', { name: '阳台', cat: 'out', layer: 'f2', label: [2.1, 4.6, 3.7], viewDir: [1, .5, 1], desc: '二楼南侧的阳台，妈妈常在这里晾衣服，视野正对着街道。' });
defPart('genkan',  { name: '玄关', cat: 'f1', layer: 'f1', xray: 1, label: [2.5, 1.1, 2.4], desc: '日本特色的玄关：进门先脱鞋，地面比室内低一级，旁边是鞋柜和雨伞架。' });
defPart('living',  { name: '客厅', cat: 'f1', layer: 'f1', xray: 1, label: [-1.6, 1.3, 1.2], desc: '铺着 8 张榻榻米的客厅（茶の間）。矮桌加坐垫，是全家人吃饭、看电视，也是大雄被妈妈训话的地方。' });
defPart('kitchen', { name: '厨房', cat: 'f1', layer: 'f1', xray: 1, label: [-2.2, 1.5, -1.8], desc: '狭长的日式厨房：料理台、水槽、燃气灶沿墙一字排开，角落里立着冰箱。妈妈的美味咖喱就是在这里诞生的。' });
defPart('bath',    { name: '浴室', cat: 'f1', layer: 'f1', xray: 1, label: [0.5, 1.3, -2.1], desc: '日式浴室：先在外面把身体洗干净，再进浴缸泡澡——这是日本家庭的讲究。' });
defPart('toilet',  { name: '厕所', cat: 'f1', layer: 'f1', xray: 1, label: [2.1, 1.1, -2.4], desc: '独立式厕所，和浴室分开，是日本住宅的常见布局。' });
defPart('stairs',  { name: '楼梯', cat: 'f1', layer: 'f1', xray: 1, label: [2.8, 1.9, 0.2], desc: '连接一楼和二楼的楼梯，大雄每天上楼回房间、哆啦A梦去壁橱睡觉都要经过。' });
defPart('hall1',   { name: '一楼走廊', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '一楼的走廊，串起玄关、客厅、厨房、浴室和楼梯。' });
defPart('nobita',  { name: '大雄的房间', cat: 'f2', layer: 'f2', xray: 1, label: [-1.6, 4.9, 1.4], viewDir: [1, 1, 1], desc: '大雄的房间！书桌、床、书架、壁橱一应俱全，窗外就是街道。无数故事都是从这个房间开始的。' });
defPart('desk',    { name: '书桌 · 时光机抽屉', cat: 'f2', layer: 'f2', xray: 1, label: [-1.6, 4.3, 2.6], viewDir: [.5, .5, 1], desc: '大雄的书桌。注意右下角那个金色的抽屉——里面藏着时光机，哆啦A梦每次都是从这里钻出来的！' });
defPart('nbed',    { name: '大雄的床', cat: 'f2', layer: 'f2', xray: 1, label: [-3.0, 4.1, 1.2], viewDir: [-1, .7, .8], desc: '大雄的床。无数个清晨，他都是在这里被妈妈的河东狮吼叫醒的。' });
defPart('shelf',   { name: '书架', cat: 'f2', layer: 'f2', xray: 1, label: [0.1, 4.8, 2.5], viewDir: [1, .6, .6], desc: '大雄的书架，摆满了漫画书——虽然妈妈总念叨他不好好学习。' });
defPart('proom',   { name: '父母卧室', cat: 'f2', layer: 'f2', xray: 1, label: [1.9, 4.6, 1.9], viewDir: [1, 1, 1], desc: '野比夫妇的卧室，温馨简洁，推开玻璃门就是南侧阳台。' });
defPart('store',   { name: '储物间', cat: 'f2', layer: 'f2', xray: 1, label: [-2.2, 4.4, -1.6], viewDir: [-1, .9, -1], desc: '二楼的储物间，堆着旧纸箱和换季的被褥，藏着不少回忆。' });
defPart('hall2',   { name: '二楼走廊', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '二楼的走廊，楼梯口装着护栏，通往大雄的房间、父母卧室和储物间。' });
defPart('fence',   { name: '围墙与大门', cat: 'yard', layer: 'garden', label: [2.5, 1.5, 6.1], viewDir: [.4, .5, 1], desc: '混凝土砌块围墙和木质大门，守护着小小的庭院。大雄上学、出门玩都要经过这扇门。' });
defPart('doghouse',{ name: '狗屋', cat: 'yard', layer: 'garden', label: [4.8, 1.4, 4.2], viewDir: [1, .5, .6], desc: '庭院里的红色小狗屋。' });
defPart('shed',    { name: '储物棚', cat: 'yard', layer: 'garden', label: [-5.3, 2.8, -3.8], viewDir: [-1, .6, -1], desc: '后院的储物棚，放着园艺工具和杂物。' });
defPart('trees',   { name: '树木花草', cat: 'yard', layer: 'garden', label: [-4.6, 3.1, 3.8], viewDir: [-1, .6, 1], desc: '庭院里的树木和灌木，把小院点缀得郁郁葱葱。' });

/* ============ 尺寸常量 ============ */
const W = 7, D = 6, T = 0.15;      // 房子宽 / 深 / 墙厚
const F1 = 0.2, WH = 2.7;          // 一楼地面 / 层高
const F2 = F1 + WH + 0.25;         // 二楼地面 = 3.15
const EAVE = F2 + WH;              // 屋檐高度 5.85
const RIDGE = EAVE + 1.5;          // 屋脊 7.35

/* 层组（用于分层展开与视角切换） */
const gGarden = new THREE.Group(), gF1 = new THREE.Group(),
      gF2 = new THREE.Group(), gRoof = new THREE.Group();
scene.add(gGarden, gF1, gF2, gRoof);
const cutWalls = {};  // 剖面视角时隐藏的墙分组

/* ============ 庭院 ============ */
(function buildGarden() {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), M(0xffffff, { map: grassTex, rough: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);
  // 院子地面（浅土色）
  const lot = box(14.4, 0.06, 12.4, M(0xa8a184, { rough: 1 }), 0, 0.0, 0, gGarden);
  lot.receiveShadow = true;

  const g = P('fence', gGarden);
  const blockM = M(0xffffff, { map: blockTex, rough: 0.95 });
  const FH = 1.1, FT = 0.18;
  wallSeg(-7, -6, 7, -6, 0, FH, FT, blockM, g);            // 北
  wallSeg(-7, 6, 1.8, 6, 0, FH, FT, blockM, g);            // 南左
  wallSeg(3.2, 6, 7, 6, 0, FH, FT, blockM, g);             // 南右
  wallSeg(-7, -6, -7, 6, 0, FH, FT, blockM, g);            // 西
  wallSeg(7, -6, 7, 6, 0, FH, FT, blockM, g);             // 东
  const postM = M(0x6b4a2f, { rough: 0.8 });
  box(0.28, 1.6, 0.28, postM, 1.8, 0.8, 6, g);
  box(0.28, 1.6, 0.28, postM, 3.2, 0.8, 6, g);
  // 木质大门（半开）
  const gate = new THREE.Group(); gate.position.set(1.8, 0, 6); gate.rotation.y = -0.55; g.add(gate);
  const woodM = M(0x8a5f36, { map: woodTex, rough: 0.85 });
  box(1.34, 1.0, 0.06, woodM, 0.67, 0.62, 0, gate);
  box(1.34, 0.08, 0.08, postM, 0.67, 1.1, 0, gate);
  // 石板路：大门 -> 玄关
  const stoneM = M(0x9d968a, { rough: 1 });
  for (let i = 0; i < 5; i++) box(0.75, 0.05, 0.55, stoneM, 2.5, 0.06, 5.5 - i * 0.62, g);

  // 狗屋
  const d = P('doghouse', gGarden);
  const dw = M(0xc9a06a, { map: woodTex }), dr = M(0xb3402e, { rough: 0.85 });
  box(1.0, 0.62, 0.9, dw, 4.8, 0.36, 4.2, d);
  const r1 = box(1.15, 0.07, 0.62, dr, 4.8, 0.82, 4.2 - 0.24, d); r1.rotation.x = 0.5;
  const r2 = box(1.15, 0.07, 0.62, dr, 4.8, 0.82, 4.2 + 0.24, d); r2.rotation.x = -0.5;
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), M(0x1a120c, { rough: 1 }));
  hole.position.set(4.8 - 0.51, 0.36, 4.2); hole.rotation.y = -Math.PI / 2; d.add(hole); tagPart(hole, d);
  box(0.5, 0.12, 0.04, M(0x7a4a28), 4.8 - 0.52, 0.72, 4.2, d); // 名牌

  // 储物棚
  const s = P('shed', gGarden);
  const sw = M(0x9a7b52, { map: woodTex, rough: 0.9 });
  box(2.2, 2.0, 1.7, sw, -5.3, 1.0, -3.8, s);
  const sr = box(2.6, 0.09, 2.1, M(0x4a4f55, { rough: 0.8 }), -5.3, 2.12, -3.8, s);
  sr.rotation.z = 0.07;
  box(0.8, 1.55, 0.07, M(0x5e4023, { rough: 0.85 }), -5.3, 0.85, -3.8 + 0.86, s);

  // 树木花草
  const t = P('trees', gGarden);
  const trunkM = M(0x6e4f30, { rough: 1 }), leafM = M(0x4d8a3f, { rough: 1 }), leafM2 = M(0x5da24a, { rough: 1 });
  function tree(x, z, sc) {
    cyl(0.11 * sc, 0.16 * sc, 1.7 * sc, trunkM, x, 0.85 * sc, z, t);
    sph(0.95 * sc, leafM, x, 2.1 * sc, z, t);
    sph(0.68 * sc, leafM2, x + 0.55 * sc, 1.7 * sc, z + 0.25 * sc, t);
    sph(0.6 * sc, leafM2, x - 0.5 * sc, 1.75 * sc, z - 0.3 * sc, t);
  }
  tree(-4.6, 3.8, 1.0); tree(5.2, -4.2, 1.25); tree(-5.8, 0.8, 0.8);
  for (let i = 0; i < 7; i++) sph(0.32 + rnd() * 0.15, i % 2 ? leafM : leafM2, -5.5 + i * 1.05, 0.28, 5.35, t, 1, 0.75, 1);
  // 空调室外机
  const ac = box(0.85, 0.6, 0.35, M(0xd8dce0, { rough: 0.6, metal: 0.2 }), 4.05, 0.32, 1.2, t);
  const fan = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20), M(0x555a60, { rough: 0.7 }));
  fan.position.set(4.05, 0.34, 1.2 + 0.18); t.add(fan); tagPart(fan, t);
})();

/* ============ 外部：地基、外墙、屋顶 ============ */
(function buildExterior() {
  // 地基
  box(W + 0.6, 0.5, D + 0.6, M(0x8f8a80, { rough: 1 }), 0, -0.05, 0, gF1);

  const plaster1 = extM(0xffffff, { map: plasterTex, rough: 0.95 });
  const plaster2 = extM(0xffffff, { map: plasterTex, rough: 0.95 });
  const trimM = M(0x4a3524, { rough: 0.8 });

  // 一楼外墙（南/北/西/东分组，南和东可在"一楼"视角隐藏做剖面）
  const w1 = P('wall1', gF1);
  const w1s = new THREE.Group(), w1n = new THREE.Group(), w1w = new THREE.Group(), w1e = new THREE.Group();
  w1.add(w1s, w1n, w1w, w1e);
  const y1 = F1, h1 = WH;
  box(W, h1, T, plaster1, 0, y1 + h1 / 2, D / 2 - T / 2, w1s);      // 南
  box(W, h1, T, plaster1, 0, y1 + h1 / 2, -D / 2 + T / 2, w1n);     // 北
  box(T, h1, D, plaster1, -W / 2 + T / 2, y1 + h1 / 2, 0, w1w);     // 西
  box(T, h1, D, plaster1, W / 2 - T / 2, y1 + h1 / 2, 0, w1e);      // 东
  // 二楼外墙
  const w2 = P('wall2', gF2);
  const w2s = new THREE.Group(), w2n = new THREE.Group(), w2w = new THREE.Group(), w2e = new THREE.Group();
  w2.add(w2s, w2n, w2w, w2e);
  const y2 = F2, h2 = WH;
  box(W, h2, T, plaster2, 0, y2 + h2 / 2, D / 2 - T / 2, w2s);
  box(W, h2, T, plaster2, 0, y2 + h2 / 2, -D / 2 + T / 2, w2n);
  box(T, h2, D, plaster2, -W / 2 + T / 2, y2 + h2 / 2, 0, w2w);
  box(T, h2, D, plaster2, W / 2 - T / 2, y2 + h2 / 2, 0, w2e);
  cutWalls.w1s = w1s; cutWalls.w1e = w1e; cutWalls.w2s = w2s; cutWalls.w2e = w2e;
  // 木质转角柱 & 顶部横梁框（非整块，避免遮挡剖面）
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(0.2, WH, 0.2, trimM, sx * (W / 2 - 0.02), F1 + WH / 2, sz * (D / 2 - 0.02), w1);
    box(0.2, WH, 0.2, trimM, sx * (W / 2 - 0.02), F2 + WH / 2, sz * (D / 2 - 0.02), w2);
  }
  function beamFrame(gs, gn, gw, ge, yb) {
    box(W + 0.12, 0.16, 0.16, trimM, 0, yb, D / 2, gs);
    box(W + 0.12, 0.16, 0.16, trimM, 0, yb, -D / 2, gn);
    box(0.16, 0.16, D + 0.12, trimM, -W / 2, yb, 0, gw);
    box(0.16, 0.16, D + 0.12, trimM, W / 2, yb, 0, ge);
  }
  beamFrame(w1s, w1n, w1w, w1e, F1 + WH - 0.06);
  beamFrame(w2s, w2n, w2w, w2e, F2 + WH - 0.06);

  // 窗户助手（贴在墙面外侧）
  const glassM = M(0xbfe3f2, { rough: 0.15, metal: 0.1, transparent: true, opacity: 0.55 });
  const frameM = M(0x3d2c1d, { rough: 0.75 });
  function win(w, h, x, y, z, ry, parent) {
    const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; parent.add(grp);
    box(w + 0.12, h + 0.12, 0.09, frameM, 0, 0, 0, grp);
    const gl = box(w, h, 0.03, glassM, 0, 0, 0.02, grp); gl.castShadow = false;
    box(0.045, h, 0.1, frameM, 0, 0, 0.01, grp);
    box(w, 0.045, 0.1, frameM, 0, 0, 0.01, grp);
    box(w + 0.2, 0.07, 0.14, frameM, 0, -h / 2 - 0.08, 0.02, grp); // 窗台
    return grp;
  }
  // 一楼窗
  win(2.6, 1.3, -1.5, F1 + 1.4, D / 2 + 0.01, 0, w1s);
  win(1.6, 1.0, -2.0, F1 + 1.55, -D / 2 - 0.01, Math.PI, w1n);
  win(0.7, 0.7, 0.5, F1 + 1.75, -D / 2 - 0.01, Math.PI, w1n);
  win(0.7, 0.7, 2.1, F1 + 1.75, -D / 2 - 0.01, Math.PI, w1n);
  win(1.8, 1.3, -W / 2 - 0.01, F1 + 1.4, 1.2, -Math.PI / 2, w1w);
  win(1.4, 1.0, -W / 2 - 0.01, F1 + 1.55, -1.8, -Math.PI / 2, w1w);
  win(1.2, 1.0, W / 2 + 0.01, F1 + 1.55, 0.5, Math.PI / 2, w1e);
  // 二楼窗
  win(2.0, 1.2, -1.6, F2 + 1.55, D / 2 + 0.01, 0, w2s);
  win(0.9, 1.2, 0.75, F2 + 1.55, D / 2 + 0.01, 0, w2s);
  win(1.0, 1.0, -2.2, F2 + 1.65, -D / 2 - 0.01, Math.PI, w2n);
  win(1.2, 1.0, 1.0, F2 + 1.65, -D / 2 - 0.01, Math.PI, w2n);
  win(1.4, 1.2, -W / 2 - 0.01, F2 + 1.55, 1.2, -Math.PI / 2, w2w);
  win(1.2, 1.2, W / 2 + 0.01, F2 + 1.55, 1.8, Math.PI / 2, w2e);

  // 玄关大门 + 雨棚
  const dr = P('door', gF1);
  const doorM = extM(0x5a3d24, { map: woodTex, rough: 0.8 });
  box(1.05, 2.05, 0.12, doorM, 2.5, F1 + 1.03, D / 2 + 0.02, dr);
  box(1.25, 2.2, 0.08, frameM, 2.5, F1 + 1.1, D / 2 - 0.02, dr);
  sph(0.045, M(0xd9b23a, { metal: 0.7, rough: 0.35 }), 2.85, F1 + 1.05, D / 2 + 0.1, dr);
  const can = box(1.9, 0.07, 1.15, M(0x4a4f55, { rough: 0.8 }), 2.5, 3.28, D / 2 + 0.5, dr);
  can.rotation.x = -0.16;
  box(0.09, 3.2, 0.09, trimM, 1.68, 1.6, D / 2 + 0.95, dr);
  box(0.09, 3.2, 0.09, trimM, 3.32, 1.6, D / 2 + 0.95, dr);
  const lampM = M(0xfff2c8, { emissive: 0xffd97a, ei: 0.9 });
  box(0.16, 0.22, 0.12, M(0x333333), 1.82, F1 + 2.15, D / 2 + 0.08, dr);
  sph(0.06, lampM, 1.82, F1 + 2.12, D / 2 + 0.12, dr).castShadow = false;
  box(0.9, 0.12, 0.5, M(0x9d968a), 2.5, 0.1, D / 2 + 0.35, dr); // 门前台阶

  // 屋顶
  const r = P('roof', gRoof);
  const tileM = M(0xffffff, { map: roofTex, rough: 0.9 });
  const slopeLen = Math.hypot(D / 2 + 0.9, RIDGE - EAVE);
  const ang = Math.atan2(RIDGE - EAVE, D / 2 + 0.9);
  const s1 = box(W + 1.4, 0.14, slopeLen, tileM, 0, (EAVE + RIDGE) / 2 + 0.02, (D / 4 + 0.45), r);
  s1.rotation.x = ang;
  const s2 = box(W + 1.4, 0.14, slopeLen, tileM, 0, (EAVE + RIDGE) / 2 + 0.02, -(D / 4 + 0.45), r);
  s2.rotation.x = -ang;
  box(W + 1.5, 0.16, 0.34, M(0x2c343d, { rough: 0.85 }), 0, RIDGE + 0.05, 0, r); // 屋脊
  // 山墙三角（位于 x=±W/2 端，三角形 spanning 进深 D）
  const tri = new THREE.Shape();
  tri.moveTo(-D / 2, 0); tri.lineTo(D / 2, 0); tri.lineTo(0, RIDGE - EAVE); tri.closePath();
  const triGeo = new THREE.ExtrudeGeometry(tri, { depth: 0.14, bevelEnabled: false });
  const gableM = extM(0xe8dfcc, { rough: 0.95 });
  for (const sx of [-1, 1]) {
    const m = new THREE.Mesh(triGeo, gableM);
    m.rotation.y = sx * Math.PI / 2;
    // +90°: shape X -> -Z, 挤出方向 -> +X ; -90°: shape X -> +Z, 挤出方向 -> -X
    m.position.set(sx > 0 ? W / 2 - 0.14 : -W / 2 + 0.14, EAVE, 0);
    m.castShadow = m.receiveShadow = true;
    r.add(m); tagPart(m, r);
  }
  // 雨水槽 & 落水管
  const gutM = M(0x6a7076, { metal: 0.4, rough: 0.5 });
  for (const sz of [-1, 1]) {
    const gtr = cyl(0.07, 0.07, W + 1.4, gutM, 0, EAVE - 0.08, sz * (D / 2 + 0.92), r);
    gtr.rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) cyl(0.055, 0.055, EAVE - 0.1, gutM, sx * (W / 2 + 0.6), (EAVE - 0.1) / 2, sz * (D / 2 + 0.92), r);
  }
  // 电视天线
  const antM = M(0x8a8f96, { metal: 0.6, rough: 0.4 });
  cyl(0.025, 0.025, 1.6, antM, 2.4, RIDGE + 0.8, 0, r);
  for (let i = 0; i < 5; i++) box(0.7 - i * 0.09, 0.03, 0.03, antM, 2.4, RIDGE + 1.35 - i * 0.16, 0, r);

  // 阳台（二楼南侧）
  const b = P('balcony', gF2);
  box(2.6, 0.16, 1.15, M(0xb9a68c, { map: woodTex }), 2.1, F2 - 0.02, D / 2 + 0.58, b);
  const railM = M(0x3d2c1d, { rough: 0.75 });
  for (let i = 0; i <= 6; i++) box(0.07, 1.0, 0.07, railM, 0.85 + i * (2.5 / 6), F2 + 0.55, D / 2 + 1.12, b);
  box(2.64, 0.08, 0.09, railM, 2.1, F2 + 1.05, D / 2 + 1.12, b);
  box(2.64, 0.06, 0.06, railM, 2.1, F2 + 0.6, D / 2 + 1.12, b);
  for (const sx of [0.85, 3.35]) {
    box(0.07, 1.0, 0.07, railM, sx, F2 + 0.55, D / 2 + 0.58, b);
    box(0.09, 0.08, 1.2, railM, sx, F2 + 1.05, D / 2 + 0.58, b);
  }
  // 阳台玻璃门（半开）
  box(1.7, 2.05, 0.1, frameM, 2.1, F2 + 1.03, D / 2 + 0.01, b);
  const bg1 = box(0.78, 1.9, 0.04, glassM, 1.72, F2 + 1.0, D / 2 + 0.03, b); bg1.castShadow = false;
  const bg2 = box(0.78, 1.9, 0.04, glassM, 2.52, F2 + 1.0, D / 2 + 0.07, b); bg2.castShadow = false;
  // 晾衣杆
  cyl(0.025, 0.025, 2.4, antM, 2.1, F2 + 1.7, D / 2 + 0.75, b).rotation.z = Math.PI / 2;
})();

/* ============ 一楼室内 ============ */
(function buildF1() {
  const inWallM = M(0xf5efe2, { rough: 0.95 });
  const woodM = M(0xffffff, { map: woodTex, rough: 0.85 });
  const darkWood = M(0x4a3524, { rough: 0.8 });

  // 室内地面
  box(W - 0.3, 0.04, D - 0.3, woodM, 0, F1 + 0.005, 0, P('hall1', gF1));

  // 隔墙
  const iw = P('hall1', gF1);
  wallSeg(-3.5, -0.5, -2.0, -0.5, F1, WH, 0.1, inWallM, iw);   // 客厅/厨房
  wallSeg(-0.8, -0.5, -0.5, -0.5, F1, WH, 0.1, inWallM, iw);
  const fusM = M(0xe8dcc2, { rough: 0.9 });                     // 拉门（半开）
  box(0.7, 2.0, 0.06, fusM, -1.65, F1 + 1.0, -0.5, iw);
  wallSeg(-0.5, -3, -0.5, -1.2, F1, WH, 0.1, inWallM, iw);      // 浴室西
  wallSeg(1.5, -3, 1.5, -1.2, F1, WH, 0.1, inWallM, iw);        // 浴室东
  wallSeg(-0.5, -1.2, 0.3, -1.2, F1, WH, 0.1, inWallM, iw);     // 浴室北（门洞）
  wallSeg(1.1, -1.2, 1.5, -1.2, F1, WH, 0.1, inWallM, iw);
  wallSeg(1.5, -3, 1.5, -1.8, F1, WH, 0.1, inWallM, iw);        // 厕所西
  wallSeg(2.7, -3, 2.7, -1.8, F1, WH, 0.1, inWallM, iw);        // 厕所东
  wallSeg(1.5, -1.8, 1.8, -1.8, F1, WH, 0.1, inWallM, iw);     // 厕所北（门洞）
  wallSeg(2.4, -1.8, 2.7, -1.8, F1, WH, 0.1, inWallM, iw);
  wallSeg(0.5, -0.5, 0.5, 0.5, F1, WH, 0.1, inWallM, iw);       // 客厅/走廊
  wallSeg(0.5, 1.7, 0.5, 3, F1, WH, 0.1, inWallM, iw);

  // ---- 玄关 ----
  const gk = P('genkan', gF1);
  box(2.0, 0.08, 1.2, M(0x8f8a80, { rough: 1 }), 2.5, 0.06, 2.4, gk);   // 下沉地面
  box(2.0, 0.14, 0.28, darkWood, 2.5, 0.13, 1.72, gk);                  // 台阶
  const shoe = box(0.38, 1.25, 1.05, M(0x6b4a2f, { map: woodTex }), 3.28, F1 + 0.63, 2.4, gk);
  box(0.02, 1.1, 0.02, darkWood, 3.08, F1 + 0.6, 2.4, gk);              // 鞋柜门缝
  cyl(0.09, 0.11, 0.5, M(0x7a6a55), 1.72, F1 + 0.25, 2.72, gk);         // 雨伞架

  // ---- 客厅 ----
  const lv = P('living', gF1);
  const tatM = M(0xffffff, { map: tatamiTex, rough: 0.95 });
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++)
    box(0.9, 0.045, 1.65, tatM, -3.4 + 0.45 + c * 0.9, F1 + 0.028, -0.4 + 0.825 + r * 1.65, lv);
  const tableM = M(0x7a4f2c, { map: woodTex, rough: 0.7 });
  box(1.5, 0.07, 0.9, tableM, -1.6, F1 + 0.4, 1.25, lv);                // 矮桌
  for (const sx of [-0.65, 0.65]) for (const sz of [-0.35, 0.35])
    box(0.07, 0.37, 0.07, tableM, -1.6 + sx, F1 + 0.2, 1.25 + sz, lv);
  const zabCols = [0xb34a3f, 0x3f6db3, 0x4a9a5e, 0xc7a23a];
  zabCols.forEach((cc, i) => {
    const a = i * Math.PI / 2;
    box(0.55, 0.09, 0.55, M(cc, { rough: 0.95 }), -1.6 + Math.cos(a) * 1.15, F1 + 0.09, 1.25 + Math.sin(a) * 0.85, lv, -a);
  });
  box(1.25, 0.38, 0.4, darkWood, -1.6, F1 + 0.19, -0.28, lv);           // 电视柜
  box(1.15, 0.68, 0.09, M(0x1c1c20, { rough: 0.5 }), -1.6, F1 + 1.0, -0.26, lv);
  const scr = box(1.02, 0.55, 0.02, M(0x0a1626, { emissive: 0x1d4e6e, ei: 0.55, rough: 0.3 }), -1.6, F1 + 1.0, -0.21, lv);
  scr.castShadow = false;
  cyl(0.02, 0.02, 0.5, M(0x333333), -1.6, F1 + 2.45, 1.25, lv);         // 吊灯线
  const shade = cyl(0.28, 0.42, 0.3, M(0xf5e8c8, { emissive: 0xffe9a8, ei: 0.35 }), -1.6, F1 + 2.15, 1.25, lv, 18);
  shade.castShadow = false;

  // ---- 厨房 ----
  const k = P('kitchen', gF1);
  const cabM = M(0xd8cfbc, { rough: 0.8 }), topM = M(0x9aa0a6, { metal: 0.3, rough: 0.5 });
  box(0.62, 0.85, 2.2, cabM, -3.14, F1 + 0.425, -1.8, k);
  box(0.66, 0.05, 2.24, topM, -3.14, F1 + 0.875, -1.8, k);
  box(0.4, 0.12, 0.7, M(0x6a7076, { metal: 0.4, rough: 0.4 }), -3.14, F1 + 0.86, -1.4, k); // 水槽
  cyl(0.025, 0.025, 0.25, topM, -3.0, F1 + 1.0, -1.4, k);
  box(1.9, 0.85, 0.62, cabM, -2.1, F1 + 0.425, -2.64, k);
  box(1.94, 0.05, 0.66, topM, -2.1, F1 + 0.875, -2.64, k);
  box(0.7, 0.06, 0.5, M(0x222222, { rough: 0.6 }), -2.4, F1 + 0.92, -2.64, k); // 灶台
  for (const sx of [-0.15, 0.15]) for (const sz of [-0.12, 0.12])
    cyl(0.07, 0.07, 0.03, M(0x444444), -2.4 + sx, F1 + 0.96, -2.64 + sz, k);
  box(0.72, 1.7, 0.72, M(0xe8ecef, { rough: 0.5, metal: 0.15 }), -0.95, F1 + 0.85, -2.6, k); // 冰箱
  box(0.02, 0.7, 0.03, M(0x888888), -0.6, F1 + 1.1, -2.6, k);

  // ---- 浴室 ----
  const b = P('bath', gF1);
  box(2.0, 0.03, 1.8, M(0xb9c4c9, { rough: 0.9 }), 0.5, F1 + 0.01, -2.1, b);
  box(1.35, 0.62, 0.9, M(0xeef2f4, { rough: 0.4 }), 0.5, F1 + 0.31, -2.5, b); // 浴缸
  const wtr = box(1.15, 0.05, 0.7, M(0x3f9fd9, { transparent: true, opacity: 0.8, rough: 0.2 }), 0.5, F1 + 0.55, -2.5, b);
  wtr.castShadow = false;
  cyl(0.03, 0.03, 0.3, topM, 0.15, F1 + 0.9, -2.88, b).rotation.x = 0.5;  // 水龙头
  cyl(0.03, 0.03, 0.3, topM, 0.45, F1 + 0.9, -2.88, b).rotation.x = 0.5;
  box(0.35, 0.25, 0.35, M(0xc9a06a, { map: woodTex }), 1.15, F1 + 0.125, -1.6, b); // 浴凳

  // ---- 厕所 ----
  const t2 = P('toilet', gF1);
  box(1.2, 0.03, 1.2, M(0xb9c4c9, { rough: 0.9 }), 2.1, F1 + 0.01, -2.4, t2);
  box(0.48, 0.42, 0.2, M(0xf2f4f6, { rough: 0.4 }), 2.1, F1 + 0.95, -2.88, t2); // 水箱
  cyl(0.2, 0.16, 0.42, M(0xf2f4f6, { rough: 0.4 }), 2.1, F1 + 0.21, -2.5, t2);  // 便器
  box(0.5, 0.09, 0.58, M(0xe4e8ec, { rough: 0.4 }), 2.1, F1 + 0.46, -2.5, t2);  // 座圈

  // ---- 楼梯 ----
  const st = P('stairs', gF1);
  const stepM = M(0x8a5f36, { map: woodTex, rough: 0.8 });
  const N = 14, rise = (F2 - F1) / N, run = 2.8 / N;
  for (let i = 0; i < N; i++)
    box(0.9, rise, run + 0.02, stepM, 2.8, F1 + (i + 1) * rise - rise / 2, 1.6 - run * (i + 0.5), st);
  const railM2 = M(0x4a3524, { rough: 0.7 });
  const rail = box(0.06, 0.06, 3.4, railM2, 2.32, F1 + 1.9, 0.15, st);
  rail.rotation.x = Math.atan2(F2 - F1, 2.8);
  for (let i = 0; i < 5; i++)
    box(0.05, 1.0, 0.05, railM2, 2.32, F1 + 0.6 + i * 0.62, 1.3 - i * 0.62, st);
})();

/* ============ 二楼室内 ============ */
(function buildF2() {
  const inWallM = M(0xf5efe2, { rough: 0.95 });
  const woodM = M(0xffffff, { map: woodTex, rough: 0.85 });
  const darkWood = M(0x4a3524, { rough: 0.8 });

  // 二楼楼板（楼梯口留洞）
  const slabM = M(0xd9c9a8, { rough: 0.9 });
  box(5.8, 0.25, 6, slabM, -0.6, F2 - 0.125, 0, P('hall2', gF2));
  box(1.2, 0.25, 1.4, slabM, 2.9, F2 - 0.125, -2.3, P('hall2', gF2));
  box(1.2, 0.25, 1.3, slabM, 2.9, F2 - 0.125, 2.35, P('hall2', gF2));
  box(0.2, 0.25, 3.3, slabM, 3.4, F2 - 0.125, 0.05, P('hall2', gF2));
  box(W - 0.3, 0.04, D - 0.3, woodM, 0, F2 + 0.005, 0, P('hall2', gF2)); // 木地板

  // 隔墙
  const iw = P('hall2', gF2);
  wallSeg(0.3, -0.3, 0.3, 1.2, F2, WH, 0.1, inWallM, iw);    // 大雄/父母（门洞）
  wallSeg(0.3, 2.0, 0.3, 3, F2, WH, 0.1, inWallM, iw);
  wallSeg(0.3, 0.8, 1.6, 0.8, F2, WH, 0.1, inWallM, iw);      // 父母北墙（门洞）
  wallSeg(2.4, 0.8, 3.5, 0.8, F2, WH, 0.1, inWallM, iw);
  wallSeg(-3.5, -0.3, -0.9, -0.3, F2, WH, 0.1, inWallM, iw);  // 大雄南墙（门洞）
  wallSeg(-0.1, -0.3, 0.3, -0.3, F2, WH, 0.1, inWallM, iw);
  wallSeg(-1, -3, -1, -0.3, F2, WH, 0.1, inWallM, iw);        // 储物间
  wallSeg(-3.5, -0.3, -2.4, -0.3, F2, WH, 0.1, inWallM, iw);
  wallSeg(-1.6, -0.3, -1, -0.3, F2, WH, 0.1, inWallM, iw);
  const fusM = M(0xe8dcc2, { rough: 0.9 });
  box(0.06, 2.0, 0.5, fusM, 0.3, F2 + 1.0, 1.45, iw);          // 拉门（半开）
  box(0.5, 2.0, 0.06, fusM, -0.65, F2 + 1.0, -0.3, iw);

  // 楼梯口护栏
  const railM = M(0x4a3524, { rough: 0.7 });
  for (let i = 0; i <= 5; i++) box(0.06, 0.95, 0.06, railM, 2.32, F2 + 0.48, -1.55 + i * 0.65, iw);
  box(0.07, 0.07, 3.3, railM, 2.32, F2 + 0.98, 0.05, iw);
  for (let i = 0; i <= 2; i++) box(0.06, 0.95, 0.06, railM, 2.45 + i * 0.45, F2 + 0.48, 1.68, iw);
  box(1.0, 0.07, 0.07, railM, 2.85, F2 + 0.98, 1.68, iw);

  // ---- 大雄的房间（壳：壁橱+地毯）----
  const nr = P('nobita', gF2);
  box(1.7, 2.25, 0.55, M(0xd9c9a8, { rough: 0.9 }), -2.4, F2 + 1.125, 0.02, nr); // 壁橱
  box(0.8, 2.05, 0.05, fusM, -2.62, F2 + 1.03, 0.32, nr);
  const cd2 = box(0.8, 2.05, 0.05, fusM, -2.18, F2 + 1.03, 0.32, nr); cd2.position.x = -2.05; // 半开
  box(2.3, 0.025, 1.7, M(0xb34a3f, { rough: 0.95 }), -1.5, F2 + 0.03, 1.15, nr); // 地毯
  // 墙上海报
  box(0.7, 0.9, 0.03, M(0x2b9fd9, { rough: 0.8 }), -0.5, F2 + 1.7, -0.22, nr);

  // ---- 书桌（含时光机抽屉）----
  const dk = P('desk', gF2);
  const deskM = M(0x8a5f36, { map: woodTex, rough: 0.7 });
  box(1.25, 0.06, 0.62, deskM, -1.6, F2 + 0.72, 2.58, dk);
  for (const sx of [-0.55, 0.55]) for (const sz of [-0.24, 0.24])
    box(0.06, 0.7, 0.06, deskM, -1.6 + sx, F2 + 0.36, 2.58 + sz, dk);
  box(0.44, 0.62, 0.55, deskM, -1.18, F2 + 0.38, 2.58, dk);    // 抽屉柜
  for (let i = 0; i < 2; i++)
    box(0.38, 0.16, 0.02, M(0x9a6b3d, { rough: 0.7 }), -1.18, F2 + 0.52 - i * 0.22, 2.87, dk);
  const magic = box(0.38, 0.17, 0.03, M(0xd4a017, { emissive: 0x8a5f00, ei: 0.5, rough: 0.4, metal: 0.3 }), -1.18, F2 + 0.16, 2.87, dk); // 时光机抽屉
  magic.castShadow = false;
  sph(0.03, M(0x5a3d20), -1.18, F2 + 0.16, 2.9, dk);
  box(0.35, 0.22, 0.28, M(0x3f6db3, { rough: 0.7 }), -1.85, F2 + 0.86, 2.55, dk); // 台灯座书本
  cyl(0.02, 0.02, 0.3, M(0x333333), -1.85, F2 + 1.05, 2.55, dk);
  sph(0.09, M(0xfff2c8, { emissive: 0xffe9a8, ei: 0.4 }), -1.78, F2 + 1.18, 2.55, dk).castShadow = false;
  for (let i = 0; i < 4; i++)   // 桌上书本
    box(0.05, 0.24 - i * 0.02, 0.18, M([0xd94f4f, 0x4f7ad9, 0x4fd97a, 0xe0b13e][i], { rough: 0.8 }), -1.35 + i * 0.06, F2 + 0.85, 2.45, dk);
  // 椅子
  box(0.44, 0.06, 0.44, darkWood, -1.5, F2 + 0.45, 1.95, dk);
  box(0.44, 0.5, 0.06, darkWood, -1.5, F2 + 0.72, 1.75, dk);
  for (const sx of [-0.18, 0.18]) for (const sz of [-0.18, 0.18])
    box(0.05, 0.45, 0.05, darkWood, -1.5 + sx, F2 + 0.22, 1.95 + sz, dk);

  // ---- 大雄的床 ----
  const bd = P('nbed', gF2);
  const bedM = M(0x7a4f2c, { map: woodTex, rough: 0.75 });
  box(0.98, 0.28, 2.0, bedM, -2.95, F2 + 0.14, 1.2, bd);
  box(0.98, 0.75, 0.08, bedM, -2.95, F2 + 0.5, 0.24, bd);      // 床头板
  box(0.9, 0.18, 1.92, M(0xf0ece0, { rough: 0.95 }), -2.95, F2 + 0.36, 1.2, bd);
  box(0.6, 0.12, 0.35, M(0xffffff, { rough: 0.95 }), -2.95, F2 + 0.5, 0.55, bd); // 枕头
  box(0.92, 0.09, 1.15, M(0x3f6db3, { rough: 0.95 }), -2.95, F2 + 0.48, 1.55, bd); // 被子

  // ---- 书架 ----
  const sh = P('shelf', gF2);
  const shelfM = M(0x6b4a2f, { map: woodTex, rough: 0.75 });
  box(0.32, 1.8, 0.95, shelfM, 0.1, F2 + 0.9, 2.45, sh);
  const bookCols = [0xd94f4f, 0x4f7ad9, 0x4fd97a, 0xe0b13e, 0x9b59b6, 0xe67e22, 0x1abc9c];
  for (let s = 0; s < 4; s++) {
    const sy = F2 + 0.32 + s * 0.42;
    box(0.28, 0.04, 0.9, shelfM, 0.1, sy, 2.45, sh);
    let bx = 2.08;
    while (bx < 2.78) {
      const bw = 0.05 + rnd() * 0.04, bh = 0.26 + rnd() * 0.1;
      box(0.2, bh, bw, M(bookCols[(rnd() * 7) | 0], { rough: 0.85 }), 0.1, sy + 0.02 + bh / 2, bx + bw / 2, sh);
      bx += bw + 0.008;
    }
  }
  box(0.28, 0.04, 0.9, shelfM, 0.1, F2 + 1.82, 2.45, sh);

  // ---- 父母卧室 ----
  const pr = P('proom', gF2);
  box(1.5, 0.3, 2.05, bedM, 2.7, F2 + 0.15, 1.9, pr);
  box(0.08, 0.85, 2.05, bedM, 3.42, F2 + 0.55, 1.9, pr);       // 床头板（东墙）
  box(1.42, 0.2, 1.97, M(0xf0ece0, { rough: 0.95 }), 2.7, F2 + 0.39, 1.9, pr);
  box(0.35, 0.13, 0.62, M(0xffffff), 3.05, F2 + 0.53, 1.45, pr);
  box(0.35, 0.13, 0.62, M(0xffffff), 3.05, F2 + 0.53, 2.35, pr);
  box(1.44, 0.1, 1.2, M(0x9a6b8a, { rough: 0.95 }), 2.7, F2 + 0.52, 2.15, pr); // 被子
  box(1.25, 0.9, 0.48, M(0x8a5f36, { map: woodTex }), 1.0, F2 + 0.45, 1.1, pr); // 衣柜
  box(0.02, 0.75, 0.02, darkWood, 1.0, F2 + 0.45, 1.1, pr);
  cyl(0.03, 0.05, 1.5, darkWood, 0.55, F2 + 0.75, 2.7, pr);     // 落地灯
  const lsh = cyl(0.22, 0.3, 0.32, M(0xf5e8c8, { emissive: 0xffe9a8, ei: 0.35 }), 0.55, F2 + 1.55, 2.7, pr, 16);
  lsh.castShadow = false;
  box(0.9, 0.04, 0.6, M(0xc7a23a, { rough: 0.95 }), 1.9, F2 + 0.025, 1.9, pr); // 地毯

  // ---- 储物间 ----
  const st2 = P('store', gF2);
  const cardM = M(0xb08d5a, { rough: 0.95 });
  box(0.9, 0.6, 0.7, cardM, -3.0, F2 + 0.3, -2.4, st2);
  box(0.7, 0.5, 0.6, cardM, -2.95, F2 + 0.85, -2.35, st2);
  box(0.8, 0.55, 0.75, cardM, -1.9, F2 + 0.275, -2.5, st2);
  box(0.6, 0.45, 0.5, cardM, -1.85, F2 + 0.775, -2.45, st2);
  const fut = cyl(0.28, 0.28, 1.4, M(0x8a9ab3, { rough: 0.95 }), -1.6, F2 + 0.28, -1.2, st2, 12);
  fut.rotation.z = Math.PI / 2;
})();

/* ============ 交互 ============ */
const view = document.getElementById('view');
const panel = document.getElementById('panel');
const labelWrap = document.getElementById('labels');
const infoEl = document.getElementById('info');
const infoName = document.getElementById('infoName');
const infoCat = document.getElementById('infoCat');
const infoDesc = document.getElementById('infoDesc');
let viewW = 800, viewH = 600;
let cur = 'exterior', selected = null, labelsOn = true;
let fly = null, hlBox = null;
const tmpBox = new THREE.Box3();
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function flyTo(pos, tgt) { fly = { pos: pos.clone(), tgt: tgt.clone() }; }
controls.addEventListener('start', () => { fly = null; });

// 部件列表
const partsWrap = document.getElementById('parts');
for (const ck of ['out', 'f1', 'f2', 'yard']) {
  const h = document.createElement('div'); h.className = 'cat'; h.textContent = CATS[ck];
  partsWrap.appendChild(h);
  for (const id in PARTS) {
    const p = PARTS[id];
    if (p.cat !== ck) continue;
    const b = document.createElement('button');
    b.className = 'pbtn'; b.dataset.part = id; b.textContent = p.name;
    b.onclick = () => selectPart(id);
    partsWrap.appendChild(b);
  }
}

// 视角模式
function setMode(m) {
  cur = m;
  document.querySelectorAll('.vbtn').forEach(b => b.classList.toggle('on', b.dataset.view === m));
  gRoof.visible = (m === 'exterior');
  gF2.visible = (m !== 'f1');
  // 一楼/二楼视角：隐藏南+东外墙，做娃娃屋剖面
  const cut1 = (m === 'f1'), cut2 = (m === 'f2');
  cutWalls.w1s.visible = !cut1; cutWalls.w1e.visible = !cut1;
  cutWalls.w2s.visible = !cut2; cutWalls.w2e.visible = !cut2;
  PARTS['door'].group.visible = !cut1;   // 大门在南墙上
  const xray = (m === 'xray');
  extMats.forEach(mt => { mt.transparent = xray; mt.opacity = xray ? 0.13 : 1; mt.depthWrite = !xray; mt.needsUpdate = true; });
  if (m === 'exterior') flyTo(V(11.5, 7.5, 13.5), V(0, 2.4, 0));
  if (m === 'f1') flyTo(V(7.2, 6.6, 10.8), V(-0.5, 1.0, -0.5));
  if (m === 'f2') flyTo(V(7.6, 10.6, 10.2), V(-0.3, 4.1, -0.3));
  if (m === 'xray') flyTo(V(11, 8.5, 12.5), V(0, 2.8, 0));
}
document.querySelectorAll('.vbtn').forEach(b => b.onclick = () => setMode(b.dataset.view));

// 开关
const tLabels = document.getElementById('tLabels');
tLabels.onclick = () => { labelsOn = !labelsOn; tLabels.classList.toggle('on', labelsOn); };
const tRotate = document.getElementById('tRotate');
tRotate.onclick = () => { controls.autoRotate = !controls.autoRotate; tRotate.classList.toggle('on', controls.autoRotate); };
document.getElementById('explode').addEventListener('input', e => {
  const t = e.target.value / 100;
  gRoof.position.y = 4.6 * t;
  gF2.position.y = 2.3 * t;
});
document.getElementById('menuBtn').onclick = () => { panel.classList.toggle('hide'); setTimeout(onResize, 260); };
document.getElementById('infoX').onclick = () => infoEl.classList.remove('show');

// 选择部件
function ensureVisible(p) {
  const L = p.layer;
  if (L === 'roof') { if (cur !== 'exterior') setMode('exterior'); return; }
  if (L === 'garden') return;
  if (p.id === 'door' && cur === 'f1') { setMode('exterior'); return; }  // 一楼剖面时大门隐藏
  if (p.xray) {
    if (cur === 'exterior') setMode('xray');
    else if (cur === 'f1' && L === 'f2') setMode('xray');
    else if (cur === 'f2' && L === 'f1') setMode('xray');
  } else if (cur === 'f1' && L === 'f2') setMode('xray');
}
function clearHl() {
  if (hlBox) { scene.remove(hlBox); hlBox.geometry.dispose(); hlBox.material.dispose(); hlBox = null; }
}
function selectPart(id) {
  const p = PARTS[id];
  if (!p || !p.group) return;
  ensureVisible(p);
  selected = id;
  document.querySelectorAll('.pbtn').forEach(b => b.classList.toggle('on', b.dataset.part === id));
  document.querySelectorAll('.lbl').forEach(el => el.classList.toggle('hot', el.dataset.part === id));
  infoName.textContent = p.name;
  infoCat.textContent = CATS[p.cat] + (p.layer === 'roof' ? ' · 屋顶' : p.layer === 'f2' ? ' · 二楼' : p.layer === 'f1' ? ' · 一楼' : ' · 庭院');
  infoDesc.textContent = p.desc;
  infoEl.classList.add('show');
  p.group.updateWorldMatrix(true, true);
  tmpBox.setFromObject(p.group);
  if (!tmpBox.isEmpty()) {
    const c = tmpBox.getCenter(new THREE.Vector3());
    const size = tmpBox.getSize(new THREE.Vector3()).length();
    const dir = V(...(p.viewDir || [1, 0.6, 1])).normalize();
    flyTo(c.clone().addScaledVector(dir, Math.max(2.6, size * 1.5)), c);
  }
  clearHl();
  hlBox = new THREE.Box3Helper(tmpBox, 0xffb020);
  hlBox.material.depthTest = false;
  hlBox.renderOrder = 999;
  scene.add(hlBox);
}
function clearSelection() {
  selected = null; clearHl();
  infoEl.classList.remove('show');
  document.querySelectorAll('.pbtn').forEach(b => b.classList.remove('on'));
  document.querySelectorAll('.lbl').forEach(el => el.classList.remove('hot'));
}

// 点击射线拾取
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
let downX = 0, downY = 0;
canvas.addEventListener('pointerdown', e => { downX = e.clientX; downY = e.clientY; });
canvas.addEventListener('pointerup', e => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
  const r = canvas.getBoundingClientRect();
  ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(scene.children, true);
  for (const h of hits) {
    let n = h.object;
    while (n) {
      if (n.userData && n.userData.partId) { selectPart(n.userData.partId); return; }
      n = n.parent;
    }
  }
  clearSelection();
});

// 标注
const labelEls = [];
for (const id in PARTS) {
  const p = PARTS[id];
  if (p.noLabel || !p.label) continue;
  const el = document.createElement('div');
  el.className = 'lbl'; el.textContent = p.name; el.dataset.part = id;
  el.style.display = 'none';
  labelWrap.appendChild(el);
  labelEls.push({ id, el, v: V(...p.label) });
}
function isShown(obj) { let n = obj; while (n) { if (!n.visible) return false; n = n.parent; } return true; }
const pv = new THREE.Vector3();
function refreshLabels() {
  for (const { id, el, v } of labelEls) {
    const p = PARTS[id];
    // 室内部件标注只在能看到室内的视角下显示，避免穿墙
    const showXray = cur === 'xray' || (cur === 'f1' && p.layer === 'f1') || (cur === 'f2' && p.layer === 'f2');
    if (!labelsOn || !isShown(p.group) || (p.xray && !showXray)) { el.style.display = 'none'; continue; }
    pv.copy(v).applyMatrix4(p.group.matrixWorld).project(camera);
    if (pv.z > 1 || pv.z < -1) { el.style.display = 'none'; continue; }
    el.style.display = 'block';
    el.style.left = ((pv.x * 0.5 + 0.5) * viewW) + 'px';
    el.style.top = ((-pv.y * 0.5 + 0.5) * viewH) + 'px';
  }
}

// 自适应
function onResize() {
  viewW = view.clientWidth; viewH = view.clientHeight;
  if (viewW < 2 || viewH < 2) return;
  renderer.setSize(viewW, viewH);
  camera.aspect = viewW / viewH;
  camera.fov = viewW < viewH ? 62 : 48; // 竖屏拉开视野，房子能完整入镜
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);

// 主循环
function animate() {
  requestAnimationFrame(animate);
  if (fly) {
    camera.position.lerp(fly.pos, 0.07);
    controls.target.lerp(fly.tgt, 0.07);
    if (camera.position.distanceTo(fly.pos) < 0.06) fly = null;
  }
  controls.update();
  if (selected && hlBox && PARTS[selected].group) tmpBox.setFromObject(PARTS[selected].group);
  refreshLabels();
  renderer.render(scene, camera);
}

if (window.matchMedia('(max-width: 760px)').matches) panel.classList.add('hide'); // 手机默认收起侧栏
onResize();
setMode('exterior');
animate();
document.getElementById('loading').style.display = 'none';
