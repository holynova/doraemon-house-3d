import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ============ 基础场景（按 REFERENCE.md 新版动画间取重建） ============ */
const canvas = document.getElementById('c');
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

/* ============ 程序化纹理（精细版） ============ */
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

// 屋顶瓦：更细密的筒瓦
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
// 榻榻米：编织纹 + 布包边
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
// 木地板：细木板 + 木纹
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
// 木板塀：竖条木板
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
// 石材
const stoneTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#a9a49a'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = rnd() > .5 ? 'rgba(70,66,58,.3)' : 'rgba(220,215,200,.3)';
    const r = 1 + rnd() * 2.5;
    g.beginPath(); g.arc(rnd() * s, rnd() * s, r, 0, 7); g.fill();
  }
}, 2, 2);
// 灰泥外墙
const plasterTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#f2ecdf'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 700; i++) {
    g.fillStyle = rnd() > .5 ? 'rgba(180,170,150,.25)' : 'rgba(255,255,255,.35)';
    g.fillRect(rnd() * s, rnd() * s, 2, 2);
  }
}, 2, 1);
// 草地
const grassTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#79a95b'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = rnd() > .5 ? 'rgba(60,110,45,.5)' : 'rgba(150,200,110,.45)';
    g.fillRect(rnd() * s, rnd() * s, 2, 2 + rnd() * 3);
  }
}, 16, 16);

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

/* ============ 部件注册表（37个） ============ */
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

defPart('roof',      { name: '屋顶', cat: 'out', layer: 'roof', label: [0, 7.9, 0], viewDir: [1, .75, 1], desc: '切妻造的日式瓦屋顶，屋脊两端有鬼瓦镇守。深灰色的筒瓦是野比家最显眼的标志。' });
defPart('porchroof', { name: '玄关雨棚·昼寝屋顶', cat: 'out', layer: 'f1', label: [3.3, 3.9, 4.1], viewDir: [1, .6, 1], desc: '玄关门上的小瓦屋顶——大雄房间的窗户正对着它，大雄常从窗户爬出来在这里午睡晒太阳。' });
defPart('extwall1',  { name: '一楼外墙', cat: 'out', layer: 'f1', label: [-4.45, 1.7, 1], viewDir: [-1, .5, .6], desc: '米白色灰泥外墙配深色木质窗框与转角柱，典型的昭和年代木造民居。' });
defPart('extwall2',  { name: '二楼外墙', cat: 'out', layer: 'f2', label: [4.45, 4.7, 1], viewDir: [1, .5, .6], desc: '二楼的外墙。大雄房间的东窗和南窗都在这里——南窗正对着玄关屋顶。' });
defPart('door',      { name: '玄关大门', cat: 'out', layer: 'f1', label: [3.3, 1.7, 4.65], viewDir: [.5, .45, 1], desc: '野比家的玄关木门。每天放学，大雄都是哭着从这里冲进来的。' });
defPart('windows1',  { name: '一楼木窗', cat: 'out', layer: 'f1', label: [-4.45, 1.7, 1.9], viewDir: [-1, .5, .6], desc: '一楼的木框格子窗，糊着障子纸。晚上透出暖黄色的灯光。' });
defPart('windows2',  { name: '二楼木窗', cat: 'out', layer: 'f2', label: [4.45, 4.7, 2.2], viewDir: [1, .5, .6], desc: '二楼的木窗。大雄房间东窗在书桌上方，南窗正对玄关屋顶——他常从这里爬出去。' });
defPart('antenna',   { name: '电视天线', cat: 'out', layer: 'roof', label: [2.4, 8.6, 0], viewDir: [1, .6, .8], desc: '屋脊上的八木电视天线——这家人看电视全靠它（家里可没有空调）。' });
defPart('gutter',    { name: '雨水管', cat: 'out', layer: 'roof', label: [-4.3, 4.2, 3.6], viewDir: [-1, .4, 1], desc: '屋檐下的雨水槽和落水管，下雨天雨水顺着这里哗哗流进院子。' });
defPart('fence',     { name: '板塀', cat: 'out', layer: 'garden', label: [-5.5, 1.6, 6.5], viewDir: [-.6, .5, 1], desc: '环绕庭院的木板围墙（板塀），不是混凝土的——这才是动画里的样子。' });
defPart('gate',      { name: '木大门', cat: 'out', layer: 'garden', label: [3.3, 1.4, 6.5], viewDir: [.3, .5, 1], desc: '板塀上的木质推拉大门。大雄上学、和小伙伴出去玩都经过这里。' });
defPart('path',      { name: '石板路', cat: 'out', layer: 'garden', label: [1.2, 0.3, 5.6], viewDir: [.4, .7, 1], desc: '从大门通往玄关的石板小径。' });
defPart('dryer',     { name: '晾衣杆', cat: 'out', layer: 'garden', label: [-0.5, 2.0, 5.0], viewDir: [-.5, .5, 1], desc: '庭院里的晾衣杆（物干し）。妈妈每天在这里晾衣服、拍打被褥。' });
defPart('lantern',   { name: '石灯笼', cat: 'out', layer: 'garden', label: [-3.5, 1.3, 4.5], viewDir: [-1, .6, 1], desc: '庭院一角的石灯笼，和式庭院的标配。' });
defPart('plants',    { name: '植栽', cat: 'out', layer: 'garden', label: [5.8, 2.6, -4.5], viewDir: [1, .6, -1], desc: '庭院里的树木和灌木。练马区的独栋小院，总要有点绿色。' });
defPart('shed',      { name: '物置棚', cat: 'out', layer: 'garden', label: [-5.5, 2.4, -4.5], viewDir: [-1, .6, -1], desc: '后院的小储物棚，放着园艺工具和杂物。' });
defPart('genkan',    { name: '玄关', cat: 'f1', layer: 'f1', xray: 1, label: [3.3, 1.1, 2.6], desc: '下沉式的土间玄关：进门先脱鞋，鞋柜（下駄箱）里摆着全家人的鞋，旁边是伞架。' });
defPart('hallway',   { name: '廊下', cat: 'f1', layer: 'f1', xray: 1, noLabel: 1, desc: '一楼的走廊，串起玄关、客厅、餐厅厨房、浴室和接客室。' });
defPart('stairs',    { name: '楼梯', cat: 'f1', layer: 'f1', xray: 1, label: [0.3, 1.9, 0.6], desc: '通往二楼的木楼梯，配着扶手。楼梯下方是物入（储物间）。大雄每天噔噔噔跑上楼。' });
defPart('living',    { name: '客厅', cat: 'f1', layer: 'f1', xray: 1, label: [-2.2, 1.3, 1.9], desc: '8帖大的和室客厅（居間），铺着榻榻米。是全家人吃饭、看电视、大雄挨训的地方；晚上爸妈就睡在这里。' });
defPart('chabudai',  { name: '矮桌·坐垫', cat: 'f1', layer: 'f1', xray: 1, label: [-2.2, 0.9, 1.9], viewDir: [.7, .9, .7], desc: '客厅中央的矮桌（ちゃぶ台）和坐垫。妈妈的拿手咖喱就是在这张桌上开饭的。' });
defPart('tv',        { name: '电视机', cat: 'f1', layer: 'f1', xray: 1, label: [0.9, 1.3, 1.9], viewDir: [1, .6, .6], desc: '老式CRT电视机。大雄最爱看的《超人》特摄节目（致敬《奥特曼》）就是这台放的。' });
defPart('tokonoma',  { name: '床の间·佛坛', cat: 'f1', layer: 'f1', xray: 1, label: [0.1, 1.6, 0.5], viewDir: [.8, .7, -.6], desc: '客厅的床の间，供着佛坛——旧版在楼梯下，新版搬到了这里。逢年过节全家在这里祭拜。' });
defPart('dining',    { name: '餐厅', cat: 'f1', layer: 'f1', xray: 1, label: [-2.6, 1.2, -1.2], desc: '10帖大的饮食空间：餐桌配四把椅子。早餐和晚餐，一家四口（加一只机器猫）围坐在这里。' });
defPart('kitchen',   { name: '厨房', cat: 'f1', layer: 'f1', xray: 1, label: [-3.6, 1.5, -1.8], desc: 'L形流理台：水槽+水龙头、双口燃气灶、头顶的换气扇。妈妈每天在这里变出咖喱和汉堡肉。' });
defPart('fridge',    { name: '冰箱', cat: 'f1', layer: 'f1', xray: 1, label: [-0.6, 1.4, -3.0], viewDir: [.6, .6, -1], desc: '厨房角落的冰箱，门上贴着便签和磁贴。里面常备着麦茶和布丁——布丁是留给谁的呢？' });
defPart('bath',      { name: '浴室', cat: 'f1', layer: 'f1', xray: 1, label: [0.55, 1.3, -2.7], desc: '日式浴室：深浴缸+洗身区。规矩是先在外面洗干净再进浴缸泡——大雄总想偷懒。' });
defPart('washroom',  { name: '洗面所', cat: 'f1', layer: 'f1', xray: 1, label: [2.8, 1.3, -2.75], desc: '洗面脱衣所：洗面台+镜柜，角落里是洗衣机。早上全家排队刷牙的地方。' });
defPart('toilet',    { name: '厕所', cat: 'f1', layer: 'f1', xray: 1, label: [3.8, 1.1, -2.9], desc: '独立式厕所，和浴室分开。半夜大雄不敢一个人来上厕所，总要叫哆啦A梦陪。' });
defPart('reception', { name: '接客室', cat: 'f1', layer: 'f1', xray: 1, label: [3.3, 1.4, -0.2], desc: '爸爸的休憩间（応接室）：沙发、茶几，角落里立着他的高尔夫球包。客人不来时就是他的小天地。' });
defPart('nobita',    { name: '大雄的房间', cat: 'f2', layer: 'f2', xray: 1, label: [2.7, 4.9, 1.3], viewDir: [1, 1, 1], desc: '6帖大的大雄房间！二楼东侧，窗户正对玄关屋顶。无数故事都是从这个房间开始的。' });
defPart('desk',      { name: '书桌·时光机抽屉', cat: 'f2', layer: 'f2', xray: 1, label: [3.85, 4.1, 2.2], viewDir: [-.7, .5, .6], desc: '大雄的书桌，靠在东窗下。注意那个金色的抽屉——里面藏着时光机，哆啦A梦就是从这里来到20世纪的！' });
defPart('chair',     { name: '椅子', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '书桌前的椅子。大雄坐在这里"学习"（发呆）时，哆啦A梦常在旁边唠叨。' });
defPart('bed',       { name: '床', cat: 'f2', layer: 'f2', xray: 1, label: [1.75, 4.0, 2.4], viewDir: [-1, .7, .8], desc: '大雄的床。无数个清晨，他都是在这里被妈妈的"起床——！"叫醒的。' });
defPart('shelf',     { name: '书架', cat: 'f2', layer: 'f2', xray: 1, label: [2.05, 4.6, -0.5], viewDir: [.6, .7, -1], desc: '塞得满满的书架：漫画、图鉴、没写完的作业本——妈妈总念叨他不好好学习。' });
defPart('closet',    { name: '壁橱·哆啦A梦的床', cat: 'f2', layer: 'f2', xray: 1, label: [3.55, 4.3, -0.4], viewDir: [.8, .6, -.8], desc: '壁橱（押入れ）：推拉门里面，下层铺着被褥——那是哆啦A梦的床！怕老鼠的他，晚上就缩在这里。' });
defPart('washitsu',  { name: '和室', cat: 'f2', layer: 'f2', xray: 1, label: [-2.2, 4.6, 1.4], viewDir: [-1, 1, 1], desc: '二楼西侧的和室客房，铺着榻榻米。旧版动画里这里是奶奶的房间。' });
defPart('hall2',     { name: '二楼廊下', cat: 'f2', layer: 'f2', xray: 1, noLabel: 1, desc: '二楼走廊：从楼梯上来拐个弯才到大雄房间——这个转弯在动画里经常"变来变去"。' });
defPart('storeroom', { name: '纳户', cat: 'f2', layer: 'f2', xray: 1, label: [2.2, 4.3, -2.85], viewDir: [1, .9, -1], desc: '二楼北侧的纳户（储物间），堆着纸箱和换季被褥。' });

/* ============ 尺寸常量 ============ */
const HX = 4.25, HZ = 3.5, T = 0.15;   // 半宽/半深/墙厚
const F1 = 0.2, WH = 2.7;              // 一楼地面/层高
const F2 = F1 + WH + 0.25;             // 二楼地面 3.15
const EAVE = F2 + WH;                  // 屋檐 5.85
const RIDGE = EAVE + 1.5;              // 屋脊 7.35

const gGarden = new THREE.Group(), gF1 = new THREE.Group(),
      gF2 = new THREE.Group(), gRoof = new THREE.Group();
scene.add(gGarden, gF1, gF2, gRoof);
const cutWalls = {};

/* ============ 庭院（板塀·木大门·晾衣杆·石灯笼） ============ */
(function buildGarden() {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), M(0xffffff, { map: grassTex, rough: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);
  const lot = box(15.4, 0.06, 13.4, M(0xa3a099, { rough: 1 }), 0, 0.0, 0, gGarden);
  lot.receiveShadow = true;

  // 木板塀（板塀）：竖条木板，高1.6
  const f = P('fence', gGarden);
  const plankM = M(0xffffff, { map: fenceTex, rough: 0.9 });
  const capM = M(0x5e4023, { rough: 0.85 });
  function fenceRun(x1, z1, x2, z2) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
    const horiz = Math.abs(x2 - x1) > Math.abs(z2 - z1);
    box(horiz ? len : 0.12, 1.6, horiz ? 0.12 : len, plankM, cx, 0.8, cz, f);
    box(horiz ? len + 0.06 : 0.2, 0.09, horiz ? 0.2 : len + 0.06, capM, cx, 1.64, cz, f); // 笠木
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

  // 木大门（推拉门，半开）
  const gt = P('gate', gGarden);
  const gateM = M(0x7a5636, { map: fenceTex, rough: 0.88 });
  box(0.24, 2.0, 0.24, capM, 2.6, 1.0, 6.5, gt);
  box(0.24, 2.0, 0.24, capM, 4.0, 1.0, 6.5, gt);
  const slide = new THREE.Group(); slide.position.set(2.6, 0, 6.5); slide.rotation.y = 0.28; gt.add(slide);
  box(1.15, 1.5, 0.07, gateM, 0.58, 0.85, 0, slide);
  box(1.15, 0.1, 0.1, capM, 0.58, 1.62, 0, slide);
  box(0.5, 0.34, 0.02, M(0xe8e2d2, { rough: 0.8 }), 0.58, 0.95, 0.045, slide); // 表札（门牌）
  box(0.3, 0.2, 0.025, M(0x2b2b2b), 0.58, 0.95, 0.048, slide);

  // 石板路：大门 -> 玄关雨棚
  const pt = P('path', gGarden);
  const stoneM = M(0xffffff, { map: stoneTex, rough: 1 });
  const pathPts = [[3.3, 6.1], [3.3, 5.45], [3.15, 4.8], [3.3, 4.15]];
  pathPts.forEach(([x, z], i) => {
    const s = box(0.72, 0.06, 0.55, stoneM, x, 0.05, z, pt, (i % 2 ? 0.08 : -0.06));
    s.receiveShadow = true;
  });

  // 晾衣杆（物干し）
  const dr = P('dryer', gGarden);
  const poleM = M(0x9aa0a8, { metal: 0.55, rough: 0.4 });
  cyl(0.035, 0.035, 2.1, poleM, -1.5, 1.05, 5.0, dr);
  cyl(0.035, 0.035, 2.1, poleM, 0.5, 1.05, 5.0, dr);
  const bar = cyl(0.03, 0.03, 2.3, poleM, -0.5, 2.05, 5.0, dr); bar.rotation.z = Math.PI / 2;
  // 晾着的衣物
  const shirtM = M(0x7fb3d9, { rough: 0.95 }), towelM = M(0xf0ead8, { rough: 0.95 });
  box(0.5, 0.62, 0.04, shirtM, -0.9, 1.68, 5.0, dr);
  box(0.34, 0.4, 0.04, towelM, 0.05, 1.8, 5.0, dr);

  // 石灯笼
  const ln = P('lantern', gGarden);
  const slM = M(0xffffff, { map: stoneTex, rough: 0.95 });
  box(0.5, 0.25, 0.5, slM, -3.5, 0.125, 4.5, ln);
  cyl(0.09, 0.11, 0.75, slM, -3.5, 0.6, 4.5, ln);
  box(0.44, 0.32, 0.44, slM, -3.5, 1.12, 4.5, ln);
  const glow = box(0.3, 0.2, 0.3, M(0xffe9a8, { emissive: 0xffd97a, ei: 0.5 }), -3.5, 1.1, 4.5, ln);
  glow.castShadow = false;
  cone(0.42, 0.3, slM, -3.5, 1.42, 4.5, ln, 4);
  sph(0.09, slM, -3.5, 1.62, 4.5, ln);

  // 植栽
  const pl = P('plants', gGarden);
  const trunkM = M(0x6e4f30, { rough: 1 }), leafM = M(0x4d8a3f, { rough: 1 }), leafM2 = M(0x5da24a, { rough: 1 });
  function tree(x, z, sc) {
    cyl(0.11 * sc, 0.17 * sc, 1.8 * sc, trunkM, x, 0.9 * sc, z, pl);
    sph(1.0 * sc, leafM, x, 2.3 * sc, z, pl);
    sph(0.7 * sc, leafM2, x + 0.6 * sc, 1.85 * sc, z + 0.3 * sc, pl);
    sph(0.62 * sc, leafM2, x - 0.55 * sc, 1.9 * sc, z - 0.3 * sc, pl);
  }
  tree(-5.6, 4.2, 1.0); tree(5.8, -4.5, 1.3); tree(-6.2, -2.0, 0.85); tree(6.0, 3.0, 0.7);
  for (let i = 0; i < 8; i++) sph(0.3 + rnd() * 0.16, i % 2 ? leafM : leafM2, -6.6 + i * 1.75, 0.26, -5.9, pl, 1, 0.72, 1);
  for (let i = 0; i < 5; i++) sph(0.28 + rnd() * 0.14, i % 2 ? leafM2 : leafM, 5.4 + (i % 2) * 0.9, 0.24, 5.7 - i * 0.35, pl, 1, 0.72, 1);

  // 物置棚（后院）
  const sh = P('shed', gGarden);
  const sw = M(0x9a7b52, { map: woodTex, rough: 0.9 });
  box(2.2, 2.0, 1.7, sw, -5.5, 1.0, -4.5, sh);
  const sr = box(2.6, 0.09, 2.1, M(0x4a4f55, { rough: 0.8 }), -5.5, 2.12, -4.5, sh);
  sr.rotation.z = 0.07;
  box(0.8, 1.55, 0.07, M(0x5e4023, { rough: 0.85 }), -5.5, 0.85, -4.5 + 0.86, sh);
  box(0.5, 0.7, 0.4, M(0x8a8f96, { rough: 0.8 }), -6.1, 0.35, -3.4, sh); // 室外杂物
})();

/* ============ 外部：地基·外墙·屋顶 ============ */
(function buildExterior() {
  box(HX * 2 + 0.6, 0.5, HZ * 2 + 0.6, M(0x8f8a80, { rough: 1 }), 0, -0.05, 0, gF1);

  const plaster1 = extM(0xffffff, { map: plasterTex, rough: 0.95 });
  const plaster2 = extM(0xffffff, { map: plasterTex, rough: 0.95 });
  const trimM = M(0x4a3524, { rough: 0.8 });

  // 一楼外墙（分组：南/北/西/东，南和东在"一楼"视角隐藏做剖面）
  const w1 = P('extwall1', gF1);
  const w1s = new THREE.Group(), w1n = new THREE.Group(), w1w = new THREE.Group(), w1e = new THREE.Group();
  w1.add(w1s, w1n, w1w, w1e);
  box(HX * 2, WH, T, plaster1, 0, F1 + WH / 2, HZ - T / 2, w1s);
  box(HX * 2, WH, T, plaster1, 0, F1 + WH / 2, -HZ + T / 2, w1n);
  box(T, WH, HZ * 2, plaster1, -HX + T / 2, F1 + WH / 2, 0, w1w);
  box(T, WH, HZ * 2, plaster1, HX - T / 2, F1 + WH / 2, 0, w1e);
  // 二楼外墙
  const w2 = P('extwall2', gF2);
  const w2s = new THREE.Group(), w2n = new THREE.Group(), w2w = new THREE.Group(), w2e = new THREE.Group();
  w2.add(w2s, w2n, w2w, w2e);
  box(HX * 2, WH, T, plaster2, 0, F2 + WH / 2, HZ - T / 2, w2s);
  box(HX * 2, WH, T, plaster2, 0, F2 + WH / 2, -HZ + T / 2, w2n);
  box(T, WH, HZ * 2, plaster2, -HX + T / 2, F2 + WH / 2, 0, w2w);
  box(T, WH, HZ * 2, plaster2, HX - T / 2, F2 + WH / 2, 0, w2e);
  cutWalls.w1s = w1s; cutWalls.w1e = w1e; cutWalls.w2s = w2s; cutWalls.w2e = w2e;
  cutWalls.w1 = w1; cutWalls.w2 = w2;
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

  // 木窗：木框 + 格子 + 障子纸
  const winParts = P('windows1', gF1);
  const frameM = M(0x3d2c1d, { rough: 0.75 });
  const paperM = M(0xf5efdd, { transparent: true, opacity: 0.75, emissive: 0x443e2e, ei: 0.25, rough: 0.9 });
  function win(w, h, x, y, z, ry, parent) {
    const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; parent.add(grp);
    box(w + 0.14, h + 0.14, 0.1, frameM, 0, 0, 0, grp);
    const pp = box(w, h, 0.03, paperM, 0, 0, 0.02, grp); pp.castShadow = false;
    for (let i = 1; i < 3; i++) box(0.04, h, 0.11, frameM, -w / 2 + (w / 3) * i, 0, 0.01, grp);
    box(w, 0.04, 0.11, frameM, 0, 0, 0.01, grp);
    box(w + 0.22, 0.07, 0.15, frameM, 0, -h / 2 - 0.09, 0.02, grp);
    return grp;
  }
  // 一楼窗（南/北/西/东分组）
  win(1.8, 1.25, -2.6, F1 + 1.42, HZ + 0.01, 0, w1s);
  win(1.4, 1.25, -0.4, F1 + 1.42, HZ + 0.01, 0, w1s);
  win(1.6, 1.0, -2.4, F1 + 1.55, -HZ - 0.01, Math.PI, w1n);
  win(1.2, 1.0, 1.0, F1 + 1.55, -HZ - 0.01, Math.PI, w1n);
  win(1.8, 1.25, -HX - 0.01, F1 + 1.42, 1.9, -Math.PI / 2, w1w);
  win(1.4, 1.0, -HX - 0.01, F1 + 1.55, -1.6, -Math.PI / 2, w1w);
  win(1.2, 1.0, HX + 0.01, F1 + 1.55, -0.2, Math.PI / 2, w1e);
  win(1.0, 1.0, HX + 0.01, F1 + 1.55, -2.9, Math.PI / 2, w1e);
  // 二楼窗：大雄房间东窗（书桌上方）+ 南窗（正对雨棚屋顶）+ 和室窗
  const win2 = P('windows2', gF2);
  win(1.4, 1.2, HX + 0.01, F2 + 1.55, 2.2, Math.PI / 2, w2e);
  win(1.6, 1.2, 2.6, F2 + 1.55, HZ + 0.01, 0, w2s);
  win(1.8, 1.2, -HX - 0.01, F2 + 1.55, 1.5, -Math.PI / 2, w2w);
  win(1.2, 1.0, -2.0, F2 + 1.65, -HZ - 0.01, Math.PI, w2n);
  win(1.0, 1.0, 2.5, F2 + 1.65, -HZ - 0.01, Math.PI, w2n);

  // 玄关大门 + 雨棚屋顶（昼寝屋顶）
  const dr = P('door', gF1);
  const doorM = extM(0x5a3d24, { map: woodTex, rough: 0.8 });
  box(1.3, 2.2, 0.1, frameM, 3.3, F1 + 1.1, HZ - 0.02, dr);
  box(1.05, 2.05, 0.12, doorM, 3.3, F1 + 1.03, HZ + 0.02, dr);
  sph(0.045, M(0xd9b23a, { metal: 0.7, rough: 0.35 }), 3.62, F1 + 1.05, HZ + 0.1, dr);
  box(0.9, 0.12, 0.5, M(0x9d968a), 3.3, 0.1, HZ + 0.35, dr);
  const pr = P('porchroof', gF1);
  const tileM = M(0xffffff, { map: roofTex, rough: 0.9 });
  const canopy = box(1.9, 0.09, 1.3, tileM, 3.3, 3.28, HZ + 0.6, pr);
  canopy.rotation.x = -0.14;
  box(0.1, 3.1, 0.1, trimM, 2.45, 1.55, HZ + 1.1, pr);
  box(0.1, 3.1, 0.1, trimM, 4.15, 1.55, HZ + 1.1, pr);
  const lampM = M(0xfff2c8, { emissive: 0xffd97a, ei: 0.9 });
  box(0.16, 0.22, 0.12, M(0x333333), 2.52, F1 + 2.15, HZ + 0.08, pr);
  const lb = sph(0.06, lampM, 2.52, F1 + 2.12, HZ + 0.12, pr); lb.castShadow = false;

  // 主屋顶：切妻造 + 鬼瓦
  const r = P('roof', gRoof);
  const slopeLen = Math.hypot(HZ + 0.9, RIDGE - EAVE);
  const ang = Math.atan2(RIDGE - EAVE, HZ + 0.9);
  const s1 = box(HX * 2 + 1.4, 0.14, slopeLen, tileM, 0, (EAVE + RIDGE) / 2 + 0.02, (HZ / 4 + 0.45), r);
  s1.rotation.x = ang;
  const s2 = box(HX * 2 + 1.4, 0.14, slopeLen, tileM, 0, (EAVE + RIDGE) / 2 + 0.02, -(HZ / 4 + 0.45), r);
  s2.rotation.x = -ang;
  box(HX * 2 + 1.5, 0.18, 0.36, M(0x2c343d, { rough: 0.85 }), 0, RIDGE + 0.05, 0, r);
  // 鬼瓦（屋脊两端）
  const oniM = M(0x2c343d, { rough: 0.8 });
  for (const sx of [-1, 1]) {
    box(0.5, 0.42, 0.5, oniM, sx * (HX + 0.62), RIDGE + 0.12, 0, r);
    cyl(0.16, 0.2, 0.22, oniM, sx * (HX + 0.62), RIDGE + 0.42, 0, r, 8);
  }
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
  // 雨水槽 & 落水管
  const gt = P('gutter', gRoof);
  const gutM = M(0x6a7076, { metal: 0.4, rough: 0.5 });
  for (const sz of [-1, 1]) {
    const gtr = cyl(0.07, 0.07, HX * 2 + 1.4, gutM, 0, EAVE - 0.08, sz * (HZ + 0.92), gt);
    gtr.rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) cyl(0.055, 0.055, EAVE - 0.1, gutM, sx * (HX + 0.6), (EAVE - 0.1) / 2, sz * (HZ + 0.92), gt);
  }
  // 电视天线
  const an = P('antenna', gRoof);
  const antM = M(0x8a8f96, { metal: 0.6, rough: 0.4 });
  cyl(0.025, 0.025, 1.6, antM, 2.4, RIDGE + 0.8, 0, an);
  for (let i = 0; i < 5; i++) box(0.7 - i * 0.09, 0.03, 0.03, antM, 2.4, RIDGE + 1.35 - i * 0.16, 0, an);
})();

/* ============ 一楼室内 ============ */
(function buildF1() {
  const inWallM = M(0xf5efe2, { rough: 0.95 });
  const woodM = M(0xffffff, { map: woodTex, rough: 0.85 });
  const darkWood = M(0x4a3524, { rough: 0.8 });
  const fusM = M(0xe9dcc0, { rough: 0.9 });   // 襖

  // 室内木地板
  box(HX * 2 - 0.3, 0.04, HZ * 2 - 0.3, woodM, 0, F1 + 0.005, 0, P('hallway', gF1));

  // 隔墙
  const iw = P('hallway', gF1);
  const W2 = (x1, z1, x2, z2, gap) => { // 带门洞的墙，gap=[a,b]沿墙方向
    if (gap) {
      if (Math.abs(x2 - x1) > Math.abs(z2 - z1)) {
        const [a, b] = gap;
        if (a > Math.min(x1, x2)) wallSeg(Math.min(x1, x2), z1, a, z1, F1, WH, 0.1, inWallM, iw);
        if (b < Math.max(x1, x2)) wallSeg(b, z1, Math.max(x1, x2), z1, F1, WH, 0.1, inWallM, iw);
      } else {
        const [a, b] = gap;
        if (a > Math.min(z1, z2)) wallSeg(x1, Math.min(z1, z2), x1, a, F1, WH, 0.1, inWallM, iw);
        if (b < Math.max(z1, z2)) wallSeg(x1, b, x1, Math.max(z1, z2), F1, WH, 0.1, inWallM, iw);
      }
    } else wallSeg(x1, z1, x2, z2, F1, WH, 0.1, inWallM, iw);
  };
  W2(2.3, 1.7, 4.25, 1.7, [2.9, 3.7]);      // 玄関/応接室
  W2(2.3, 1.7, 2.3, 3.5, [2.2, 3.0]);       // 玄関/廊下
  W2(2.3, -2.3, 2.3, 1.7, [-0.5, 0.3]);     // 応接室/廊下
  W2(2.3, -2.3, 4.25, -2.3, null);          // 応接室北墙
  W2(1.3, 0.3, 1.3, 3.5, [1.0, 2.2]);       // 廊下/居間（大开口）
  W2(-4.25, 0.3, 1.3, 0.3, [-1.5, -0.3]);   // 居間/DK（襖口）
  W2(-0.2, -0.8, -0.2, 2.0, null);          // 階段室西墙
  W2(0.8, -0.8, 0.8, 2.0, null);            // 階段室东墙
  W2(-0.2, -0.8, 0.8, -0.8, null);          // 階段室北墙
  W2(-0.2, 2.0, 0.8, 2.0, [0.0, 0.6]);      // 階段室南墙（入口）
  W2(-0.2, -3.5, -0.2, 0.3, null);          // DK/浴室
  W2(1.3, -3.5, 1.3, -1.9, [-2.8, -2.0]);   // 浴室/廊下（门）
  W2(-0.2, -1.9, 1.3, -1.9, null);          // 浴室南墙
  W2(2.3, -3.5, 2.3, -2.0, [-2.9, -2.1]);   // 廊下/洗面所
  W2(3.3, -3.5, 3.3, -2.0, [-2.9, -2.2]);   // 洗面所/トイレ
  W2(2.3, -2.0, 3.3, -2.0, null);           // 洗面所南墙
  W2(3.3, -2.3, 4.25, -2.3, null);          // トイレ南墙
  // 襖（半开）
  box(0.75, 2.0, 0.06, fusM, -1.1, F1 + 1.0, 0.3, iw);
  // 廊下吊灯
  cyl(0.015, 0.015, 0.4, M(0x333333), 1.8, F1 + 2.5, 1.0, iw);
  const hl = sph(0.16, M(0xf5e8c8, { emissive: 0xffe9a8, ei: 0.4 }), 1.8, F1 + 2.25, 1.0, iw); hl.castShadow = false;

  // ---- 玄关 ----
  const gk = P('genkan', gF1);
  box(1.95, 0.08, 1.8, M(0x8f8a80, { rough: 1 }), 3.275, 0.06, 2.6, gk);   // 下沉土间
  box(1.95, 0.14, 0.28, darkWood, 3.275, 0.13, 1.62, gk);                  // 台阶
  // 鞋柜（下駄箱）
  const shoeM = M(0x6b4a2f, { map: woodTex, rough: 0.8 });
  box(0.38, 1.15, 1.5, shoeM, 4.03, F1 + 0.575, 2.6, gk);
  for (let i = 0; i < 3; i++) box(0.34, 0.03, 1.44, darkWood, 4.03, F1 + 0.3 + i * 0.32, 2.6, gk);
  const shoeCols = [0x8a4a3a, 0x3a5a8a, 0x5a5a5a, 0xb08d4a];
  for (let i = 0; i < 4; i++)
    box(0.16, 0.09, 0.26, M(shoeCols[i], { rough: 0.9 }), 4.0, F1 + 0.36 + (i % 3) * 0.32, 2.15 + (i > 1 ? 0.55 : 0), gk);
  // 伞架 + 雨伞
  cyl(0.1, 0.12, 0.5, M(0x7a6a55, { rough: 0.9 }), 2.52, F1 + 0.25, 3.25, gk);
  for (const [dx, c] of [[0, 0x3a6ab0], [0.07, 0xb03a3a]]) {
    cyl(0.012, 0.012, 0.75, M(0x444444), 2.52 + dx, F1 + 0.55, 3.25, gk);
    cone(0.055, 0.5, M(c, { rough: 0.85 }), 2.52 + dx, F1 + 0.75, 3.25, gk, 8);
  }

  // ---- 楼梯 ----
  const st = P('stairs', gF1);
  const stepM = M(0x8a5f36, { map: woodTex, rough: 0.8 });
  const N = 15, rise = (F2 - F1) / N, run = 2.8 / N;
  for (let i = 0; i < N; i++)
    box(1.0, rise, run + 0.02, stepM, 0.3, F1 + (i + 1) * rise - rise / 2, 2.0 - run * (i + 0.5), st);
  const railM = M(0x4a3524, { rough: 0.7 });
  const rail = box(0.07, 0.07, 3.5, railM, 0.84, F1 + 1.95, 0.6, st);
  rail.rotation.x = Math.atan2(F2 - F1, 2.8);
  for (let i = 0; i < 6; i++)
    box(0.06, 1.0, 0.06, railM, 0.84, F1 + 0.65 + i * 0.5, 1.75 - i * 0.47, st);
  box(0.7, 1.9, 0.05, M(0x6b4a2f, { map: woodTex }), 0.3, F1 + 0.95, 2.03, st); // 楼下物入门

  // ---- 客厅（8帖） ----
  const lv = P('living', gF1);
  const tatM = M(0xffffff, { map: tatamiTex, rough: 0.95 });
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++)
    box(0.9, 0.045, 1.5, tatM, -4.15 + 0.45 + c * 0.9, F1 + 0.028, 0.5 + 0.75 + r * 1.5, lv);
  // 床の间 + 佛坛（北墙）
  const tk = P('tokonoma', gF1);
  box(1.2, 0.16, 0.6, woodM, 0.1, F1 + 0.08, 0.62, tk);          // 床框
  box(1.1, 1.9, 0.06, M(0xd9c9a8, { rough: 0.95 }), 0.1, F1 + 1.05, 0.36, tk); // 背板
  box(0.34, 0.85, 0.02, M(0xf5f0e0, { rough: 0.9 }), 0.1, F1 + 1.7, 0.4, tk);  // 挂轴
  box(0.2, 0.5, 0.015, M(0x2b2b2b), 0.1, F1 + 1.68, 0.415, tk);
  const altarM = M(0x2e1d12, { rough: 0.6 });
  box(0.55, 0.7, 0.35, altarM, 0.1, F1 + 0.51, 0.62, tk);        // 佛坛
  box(0.45, 0.05, 0.28, M(0xd9b23a, { metal: 0.5, rough: 0.4 }), 0.1, F1 + 0.88, 0.62, tk);
  for (const dx of [-0.15, 0.15]) {
    cyl(0.02, 0.025, 0.16, M(0xf0ead8), 0.1 + dx, F1 + 0.99, 0.62, tk);
    const fl = sph(0.02, M(0xffb13e, { emissive: 0xff8c1e, ei: 1.2 }), 0.1 + dx, F1 + 1.08, 0.62, tk); fl.castShadow = false;
  }
  // 矮桌 + 坐垫
  const cb = P('chabudai', gF1);
  const tableM = M(0x7a4f2c, { map: woodTex, rough: 0.7 });
  box(1.45, 0.07, 0.9, tableM, -2.3, F1 + 0.4, 1.95, cb);
  for (const sx of [-0.62, 0.62]) for (const sz of [-0.35, 0.35])
    box(0.07, 0.37, 0.07, tableM, -2.3 + sx, F1 + 0.2, 1.95 + sz, cb);
  box(0.5, 0.04, 0.3, M(0xd94f4f, { rough: 0.9 }), -2.3, F1 + 0.455, 1.95, cb); // 桌布？小托盘
  const zabCols = [0xb34a3f, 0x3f6db3, 0x4a9a5e, 0xc7a23a];
  zabCols.forEach((cc, i) => {
    const a = i * Math.PI / 2 + 0.4;
    box(0.55, 0.09, 0.55, M(cc, { rough: 0.95 }), -2.3 + Math.cos(a) * 1.15, F1 + 0.09, 1.95 + Math.sin(a) * 0.85, cb, -a);
  });
  // CRT电视（东墙）
  const tvp = P('tv', gF1);
  box(1.1, 0.4, 0.45, darkWood, 1.0, F1 + 0.2, 1.95, tvp);
  box(0.85, 0.62, 0.6, M(0x2a2a2e, { rough: 0.5 }), 1.0, F1 + 0.72, 1.95, tvp);
  const scr = box(0.02, 0.44, 0.5, M(0x0a1626, { emissive: 0x2a6a9e, ei: 0.5, rough: 0.3 }), 0.56, F1 + 0.72, 1.95, tvp);
  scr.castShadow = false;
  cyl(0.02, 0.3, 0.06, M(0x222222), 1.0, F1 + 1.06, 1.95, tvp); // 天线
  // 吊灯
  cyl(0.02, 0.02, 0.5, M(0x333333), -2.3, F1 + 2.45, 1.95, lv);
  const shade = cyl(0.3, 0.44, 0.32, M(0xf5e8c8, { emissive: 0xffe9a8, ei: 0.35 }), -2.3, F1 + 2.14, 1.95, lv, 18);
  shade.castShadow = false;

  // ---- 接客室 ----
  const rc = P('reception', gF1);
  box(1.9, 0.03, 2.9, M(0xc7b299, { rough: 0.95 }), 3.275, F1 + 0.015, -0.3, rc); // 地毯
  const sofaM = M(0x5a7a5e, { rough: 0.95 });
  box(1.7, 0.35, 0.7, sofaM, 3.6, F1 + 0.175, -1.2, rc);
  box(1.7, 0.55, 0.22, sofaM, 3.6, F1 + 0.6, -1.52, rc);
  for (const dx of [-0.75, 0.75]) box(0.22, 0.5, 0.7, sofaM, 3.6 + dx, F1 + 0.4, -1.2, rc);
  box(0.9, 0.35, 0.55, tableM, 3.3, F1 + 0.175, 0.1, rc);
  // 书架 + 高尔夫球包（爸爸的爱好）
  box(0.35, 1.6, 1.2, darkWood, 2.5, F1 + 0.8, -1.85, rc);
  for (let s = 0; s < 3; s++) {
    box(0.3, 0.04, 1.1, darkWood, 2.5, F1 + 0.45 + s * 0.42, -1.85, rc);
    let bz = -2.3;
    while (bz < -1.45) { const bw = 0.05 + rnd() * 0.04; box(0.2, 0.26 + rnd() * 0.08, bw, M([0xd94f4f, 0x4f7ad9, 0x4fd97a][(rnd() * 3) | 0], { rough: 0.85 }), 2.5, F1 + 0.6 + s * 0.42, bz + bw / 2, rc); bz += bw + 0.01; }
  }
  cyl(0.14, 0.16, 0.95, M(0x8a3a3a, { rough: 0.85 }), 4.0, F1 + 0.475, 1.3, rc); // 高尔夫球包
  for (let i = 0; i < 4; i++) {
    const cl = cyl(0.012, 0.012, 0.7, M(0xcccccc, { metal: 0.6 }), 4.0 + (rnd() - .5) * 0.1, F1 + 1.2, 1.3 + (rnd() - .5) * 0.1, rc);
    cl.rotation.z = (rnd() - .5) * 0.2;
  }
})();

(function buildF1b() {
  const darkWood = M(0x4a3524, { rough: 0.8 });
  const cabM = M(0xd8cfbc, { rough: 0.8 });
  const topM = M(0x9aa0a6, { metal: 0.3, rough: 0.5 });

  // ---- 餐厅 ----
  const dn = P('dining', gF1);
  const dtableM = M(0x7a4f2c, { map: woodTex, rough: 0.7 });
  box(1.5, 0.06, 0.95, dtableM, -2.6, F1 + 0.68, -0.9, dn);
  for (const sx of [-0.65, 0.65]) for (const sz of [-0.38, 0.38])
    box(0.07, 0.66, 0.07, dtableM, -2.6 + sx, F1 + 0.35, -0.9 + sz, dn);
  // 桌上：小花瓶 + 茶杯
  cyl(0.05, 0.07, 0.18, M(0x4f7ad9, { rough: 0.6 }), -2.6, F1 + 0.8, -0.9, dn);
  sph(0.09, M(0xe08a9a, { rough: 0.9 }), -2.6, 0.95, -0.9, dn, 1, 0.8, 1);
  for (const dx of [-0.4, 0.4]) cyl(0.035, 0.03, 0.07, M(0xf0f0f0), -2.6 + dx, F1 + 0.745, -0.7, dn);
  // 4把椅子
  function chair(x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, F1, z); g.rotation.y = ry; dn.add(g);
    box(0.42, 0.05, 0.42, dtableM, 0, 0.44, 0, g);
    box(0.42, 0.5, 0.05, dtableM, 0, 0.72, -0.185, g);
    for (const sx of [-0.17, 0.17]) for (const sz of [-0.17, 0.17])
      box(0.045, 0.44, 0.045, dtableM, sx, 0.22, sz, g);
  }
  chair(-2.6, -0.15, Math.PI); chair(-2.6, -1.65, 0); chair(-3.5, -0.9, Math.PI / 2); chair(-1.7, -0.9, -Math.PI / 2);

  // ---- 厨房 ----
  const k = P('kitchen', gF1);
  // 西墙流理台
  box(0.62, 0.85, 2.5, cabM, -3.94, F1 + 0.425, -1.75, k);
  box(0.66, 0.05, 2.54, topM, -3.94, F1 + 0.875, -1.75, k);
  box(0.42, 0.14, 0.72, M(0x6a7076, { metal: 0.4, rough: 0.4 }), -3.94, F1 + 0.86, -1.3, k); // 水槽
  const fc1 = cyl(0.022, 0.022, 0.22, topM, -3.8, F1 + 1.0, -1.3, k); fc1.rotation.z = -0.4; // 水龙头
  const fc2 = cyl(0.022, 0.022, 0.16, topM, -3.72, F1 + 1.06, -1.3, k); fc2.rotation.x = Math.PI / 2;
  // 沥水架 + 碗碟
  box(0.4, 0.06, 0.5, M(0x8a8f96, { rough: 0.7 }), -3.94, F1 + 0.93, -2.2, k);
  for (let i = 0; i < 4; i++) box(0.02, 0.2, 0.2, M(0xf0f0f0, { rough: 0.5 }), -4.02 + i * 0.055, F1 + 1.04, -2.2, k);
  cyl(0.09, 0.07, 0.1, M(0x4f7ad9, { rough: 0.6 }), -3.85, F1 + 0.95, -2.45, k);
  // 北墙灶台
  box(2.5, 0.85, 0.62, cabM, -1.75, F1 + 0.425, -3.19, k);
  box(2.54, 0.05, 0.66, topM, -1.75, F1 + 0.875, -3.19, k);
  box(0.75, 0.07, 0.5, M(0x222222, { rough: 0.6 }), -2.1, F1 + 0.93, -3.19, k); // 燃气灶
  for (const dx of [-0.17, 0.17]) {
    cyl(0.09, 0.09, 0.03, M(0x3a3a3a), -2.1 + dx, F1 + 0.97, -3.19, k);
    cyl(0.03, 0.03, 0.05, M(0x666666), -2.1 + dx, F1 + 1.0, -3.05, k);
  }
  box(0.4, 0.12, 0.3, M(0xd94f4f, { rough: 0.6 }), -1.3, F1 + 0.96, -3.19, k); // 锅
  // 换气扇
  box(0.9, 0.5, 0.55, M(0xd8dce0, { metal: 0.3, rough: 0.5 }), -2.1, F1 + 1.75, -3.2, k);
  box(0.3, 1.0, 0.3, M(0xb9bec4, { metal: 0.3, rough: 0.5 }), -2.1, F1 + 2.4, -3.2, k);
  const fan = cyl(0.16, 0.16, 0.04, M(0x555a60), -2.1, F1 + 1.52, -3.2, k, 12); fan.rotation.x = Math.PI / 2;
  // 切菜板 + 菜刀
  box(0.3, 0.025, 0.2, M(0xe0c890, { rough: 0.8 }), -1.0, F1 + 0.915, -3.19, k);
  box(0.16, 0.012, 0.035, M(0xcccccc, { metal: 0.7 }), -1.0, F1 + 0.93, -3.1, k);
  // 胜手口（后门）
  box(0.85, 2.0, 0.08, M(0x6b4a2f, { map: woodTex }), -3.6, F1 + 1.0, -3.46, k);

  // ---- 冰箱 ----
  const fr = P('fridge', gF1);
  const frM = M(0xe8ecef, { rough: 0.45, metal: 0.15 });
  box(0.72, 1.7, 0.68, frM, -0.55, F1 + 0.85, -3.1, fr);
  box(0.72, 0.02, 0.02, M(0x888888), -0.55, F1 + 1.15, -2.75, fr);
  box(0.02, 0.25, 0.03, M(0x888888), -0.28, F1 + 1.35, -2.75, fr);
  const magCols = [0xd94f4f, 0x4f7ad9, 0xe0b13e, 0x4fd97a];
  magCols.forEach((c, i) => box(0.05, 0.05, 0.015, M(c, { rough: 0.6 }), -0.75 + i * 0.14, F1 + 1.42, -2.75, fr));
  box(0.16, 0.12, 0.012, M(0xfffbe8, { rough: 0.9 }), -0.55, F1 + 1.28, -2.75, fr); // 便签

  // ---- 浴室 ----
  const b = P('bath', gF1);
  box(1.5, 0.03, 1.6, M(0xb9c4c9, { rough: 0.9 }), 0.55, F1 + 0.01, -2.7, b);
  box(1.35, 0.62, 0.9, M(0xeef2f4, { rough: 0.4 }), 0.55, F1 + 0.31, -3.0, b); // 浴缸
  const wtr = box(1.15, 0.05, 0.7, M(0x3f9fd9, { transparent: true, opacity: 0.8, rough: 0.2 }), 0.55, F1 + 0.55, -3.0, b);
  wtr.castShadow = false;
  for (const dx of [-0.25, 0.25]) { // 水龙头
    const f1 = cyl(0.028, 0.028, 0.22, topM, 0.55 + dx, F1 + 0.95, -3.4, b); f1.rotation.x = 0.45;
  }
  const sh = cone(0.07, 0.09, topM, -0.05, F1 + 1.75, -3.42, b, 10); sh.rotation.x = Math.PI; // 淋浴头
  cyl(0.015, 0.015, 0.4, topM, -0.05, F1 + 1.95, -3.44, b);
  box(0.5, 0.7, 0.02, M(0xcfe0ea, { rough: 0.2, metal: 0.1 }), 1.22, F1 + 1.4, -2.6, b); // 镜子
  box(0.32, 0.24, 0.32, M(0xc9a06a, { map: woodTex }), 0.1, F1 + 0.12, -2.2, b); // 浴凳
  cyl(0.14, 0.11, 0.22, M(0xd94f4f, { rough: 0.7 }), 0.95, F1 + 0.11, -2.15, b); // 水桶

  // ---- 洗面所 ----
  const wr = P('washroom', gF1);
  box(1.0, 0.03, 1.5, M(0xb9c4c9, { rough: 0.9 }), 2.8, F1 + 0.01, -2.75, wr);
  cyl(0.16, 0.12, 0.5, M(0xf2f4f6, { rough: 0.4 }), 2.5, F1 + 0.25, -3.3, wr); // 洗面台柱
  cyl(0.26, 0.2, 0.14, M(0xf2f4f6, { rough: 0.4 }), 2.5, F1 + 0.57, -3.3, wr, 18); // 面盆
  cyl(0.02, 0.02, 0.18, topM, 2.5, F1 + 0.72, -3.38, wr);
  box(0.6, 0.7, 0.12, M(0xd8cfbc, { rough: 0.7 }), 2.5, F1 + 1.35, -3.42, wr); // 镜柜
  box(0.5, 0.6, 0.02, M(0xcfe0ea, { rough: 0.15, metal: 0.2 }), 2.5, F1 + 1.35, -3.35, wr);
  const wm = box(0.6, 0.85, 0.6, M(0xe8ecef, { rough: 0.5 }), 3.05, F1 + 0.425, -2.4, wr); // 洗衣机
  const wdoor = cyl(0.2, 0.2, 0.03, M(0x3a4a5a, { rough: 0.3 }), 3.05, F1 + 0.5, -2.09, wr, 18);
  wdoor.rotation.x = Math.PI / 2;
  box(0.4, 0.25, 0.3, M(0x9ab3d9, { rough: 0.9 }), 3.05, F1 + 0.98, -2.4, wr); // 洗衣篮

  // ---- 厕所 ----
  const t2 = P('toilet', gF1);
  box(0.95, 0.03, 1.2, M(0xb9c4c9, { rough: 0.9 }), 3.775, F1 + 0.01, -2.9, t2);
  box(0.48, 0.42, 0.2, M(0xf2f4f6, { rough: 0.4 }), 3.775, F1 + 0.95, -3.38, t2); // 水箱
  cyl(0.2, 0.16, 0.42, M(0xf2f4f6, { rough: 0.4 }), 3.775, F1 + 0.21, -3.0, t2);
  box(0.5, 0.09, 0.58, M(0xe4e8ec, { rough: 0.4 }), 3.775, F1 + 0.46, -3.0, t2);
  box(0.06, 0.14, 0.12, M(0xffffff, { rough: 0.9 }), 3.55, F1 + 0.75, -3.3, t2); // 纸巾架
  cyl(0.055, 0.055, 0.11, M(0xf5f5f5, { rough: 0.9 }), 3.55, F1 + 0.68, -3.3, t2);
})();

/* ============ 二楼室内 ============ */
(function buildF2() {
  const inWallM = M(0xf5efe2, { rough: 0.95 });
  const woodM = M(0xffffff, { map: woodTex, rough: 0.85 });
  const darkWood = M(0x4a3524, { rough: 0.8 });
  const fusM = M(0xe9dcc0, { rough: 0.9 });

  // 二楼楼板（楼梯口留洞 x[-0.2,0.8] z[-0.8,2.0]）
  const slabM = M(0xd9c9a8, { rough: 0.9 });
  const h2 = P('hall2', gF2);
  box(4.05, 0.25, 7, slabM, -2.225, F2 - 0.125, 0, h2);
  box(3.45, 0.25, 7, slabM, 2.525, F2 - 0.125, 0, h2);
  box(1.0, 0.25, 2.7, slabM, 0.3, F2 - 0.125, -2.15, h2);
  box(1.0, 0.25, 1.5, slabM, 0.3, F2 - 0.125, 2.75, h2);
  box(HX * 2 - 0.3, 0.04, HZ * 2 - 0.3, woodM, 0, F2 + 0.005, 0, h2);

  // 隔墙
  const iw = P('hall2', gF2);
  const W2 = (x1, z1, x2, z2, gap) => {
    if (gap) {
      if (Math.abs(x2 - x1) > Math.abs(z2 - z1)) {
        const [a, b] = gap;
        if (a > Math.min(x1, x2)) wallSeg(Math.min(x1, x2), z1, a, z1, F2, WH, 0.1, inWallM, iw);
        if (b < Math.max(x1, x2)) wallSeg(b, z1, Math.max(x1, x2), z1, F2, WH, 0.1, inWallM, iw);
      } else {
        const [a, b] = gap;
        if (a > Math.min(z1, z2)) wallSeg(x1, Math.min(z1, z2), x1, a, F2, WH, 0.1, inWallM, iw);
        if (b < Math.max(z1, z2)) wallSeg(x1, b, x1, Math.max(z1, z2), F2, WH, 0.1, inWallM, iw);
      }
    } else wallSeg(x1, z1, x2, z2, F2, WH, 0.1, inWallM, iw);
  };
  W2(1.2, -0.8, 1.2, 3.5, [-0.6, 0.0]);    // 大雄房间西墙（门）
  W2(-0.2, -2.2, -0.2, 3.5, [-1.9, -1.1]); // 和室东墙（门）
  W2(-4.25, -2.2, -0.2, -2.2, null);       // 和室北墙
  W2(-0.2, -2.2, 4.25, -2.2, [0.6, 1.4]);  // 纳户南墙（门）
  box(0.06, 2.0, 0.55, fusM, 1.2, F2 + 1.0, -0.3, iw);  // 拉门半开
  // 楼梯口护栏
  const railM = M(0x4a3524, { rough: 0.7 });
  for (let i = 0; i <= 6; i++) box(0.06, 0.95, 0.06, railM, -0.2, F2 + 0.48, -0.8 + i * 0.47, iw);
  box(0.07, 0.07, 2.9, railM, -0.2, F2 + 0.98, 0.6, iw);
  for (let i = 0; i <= 2; i++) box(0.06, 0.95, 0.06, railM, -0.1 + i * 0.45, F2 + 0.48, 2.0, iw);
  box(1.0, 0.07, 0.07, railM, 0.3, F2 + 0.98, 2.0, iw);

  // ---- 大雄的房间 ----
  const nr = P('nobita', gF2);
  box(2.0, 0.025, 1.5, M(0xb34a3f, { rough: 0.95 }), 2.7, F2 + 0.028, 1.5, nr); // 地毯
  // 挂钟（西墙）
  cyl(0.16, 0.16, 0.05, M(0xf0f0f0, { rough: 0.6 }), 1.24, F2 + 1.9, 1.0, nr, 18).rotation.z = Math.PI / 2;
  cyl(0.02, 0.02, 0.06, M(0x333333), 1.28, F2 + 1.9, 1.0, nr, 8).rotation.z = Math.PI / 2;
  // 窗帘
  const curM = M(0x7fb3d9, { rough: 0.95 });
  for (const [x, z, ry] of [[4.14, 1.35, Math.PI / 2], [4.14, 3.05, Math.PI / 2], [1.65, 3.39, 0], [3.55, 3.39, 0]]) {
    box(0.28, 1.5, 0.08, curM, x, F2 + 1.55, z, nr, ry);
  }

  // ---- 书桌（东窗下，面朝东） ----
  const dk = P('desk', gF2);
  const deskM = M(0x8a5f36, { map: woodTex, rough: 0.7 });
  box(0.65, 0.06, 1.3, deskM, 3.9, F2 + 0.72, 2.2, dk);   // 桌面
  for (const sx of [-0.26, 0.26]) for (const sz of [-0.58, 0.58])
    box(0.06, 0.7, 0.06, deskM, 3.9 + sx, F2 + 0.36, 2.2 + sz, dk);
  box(0.55, 0.62, 0.42, deskM, 3.9, F2 + 0.38, 2.62, dk); // 抽屉柜（北侧）
  box(0.5, 0.15, 0.02, M(0x9a6b3d, { rough: 0.7 }), 3.62, F2 + 0.55, 2.84, dk);
  // ★ 时光机抽屉（金色）
  const magic = box(0.5, 0.16, 0.03, M(0xd4a017, { emissive: 0x8a5f00, ei: 0.55, rough: 0.4, metal: 0.3 }), 3.62, F2 + 0.2, 2.84, dk);
  magic.castShadow = false;
  sph(0.028, M(0x5a3d20), 3.6, F2 + 0.2, 2.87, dk);
  // 台灯
  cyl(0.09, 0.11, 0.04, M(0x3f6db3, { rough: 0.6 }), 4.05, F2 + 0.77, 1.75, dk);
  const arm = cyl(0.018, 0.018, 0.34, M(0x333333), 4.0, F2 + 0.95, 1.75, dk); arm.rotation.z = 0.35;
  const lsh = cone(0.1, 0.12, M(0x3f6db3, { rough: 0.6 }), 3.9, F2 + 1.08, 1.75, dk, 12); lsh.rotation.z = 0.9;
  const lb2 = sph(0.045, M(0xfff2c8, { emissive: 0xffe9a8, ei: 0.7 }), 3.84, F2 + 1.06, 1.75, dk); lb2.castShadow = false;
  // 书本 + 笔筒 + 文具
  const bookCols = [0xd94f4f, 0x4f7ad9, 0x4fd97a, 0xe0b13e];
  for (let i = 0; i < 5; i++)
    box(0.16, 0.035, 0.22, M(bookCols[i % 4], { rough: 0.85 }), 3.95, F2 + 0.77 + i * 0.037, 2.45, dk, 0.12 * (i % 2 ? 1 : -1));
  cyl(0.05, 0.04, 0.11, M(0xe07a3a, { rough: 0.7 }), 3.7, F2 + 0.8, 1.85, dk);
  for (let i = 0; i < 3; i++) {
    const pn = cyl(0.008, 0.008, 0.16, M([0xd94f4f, 0x333333, 0x4f7ad9][i]), 3.7 + (i - 1) * 0.02, F2 + 0.9, 1.85, dk, 6);
    pn.rotation.z = (i - 1) * 0.12;
  }
  box(0.2, 0.03, 0.28, M(0xf5f0e0, { rough: 0.9 }), 3.8, F2 + 0.765, 2.15, dk); // 作业本
  // 椅子
  const ch = P('chair', gF2);
  box(0.44, 0.06, 0.44, darkWood, 3.05, F2 + 0.45, 2.2, ch);
  box(0.06, 0.5, 0.44, darkWood, 2.85, F2 + 0.72, 2.2, ch);
  for (const sx of [-0.18, 0.18]) for (const sz of [-0.18, 0.18])
    box(0.05, 0.45, 0.05, darkWood, 3.05 + sx, F2 + 0.22, 2.2 + sz, ch);
  box(0.4, 0.05, 0.4, M(0x3f6db3, { rough: 0.95 }), 3.05, F2 + 0.5, 2.2, ch); // 椅垫

  // ---- 床（西墙） ----
  const bd = P('bed', gF2);
  const bedM = M(0x7a4f2c, { map: woodTex, rough: 0.75 });
  box(1.0, 0.28, 2.0, bedM, 1.75, F2 + 0.14, 2.4, bd);
  box(1.0, 0.8, 0.08, bedM, 1.75, F2 + 0.55, 1.44, bd);       // 床头板（北）
  for (const sx of [1.3, 2.2]) for (const sz of [1.5, 3.3])
    box(0.08, 0.14, 0.08, bedM, sx, F2 + 0.07, sz, bd);
  box(0.92, 0.18, 1.92, M(0xf0ece0, { rough: 0.95 }), 1.75, F2 + 0.36, 2.4, bd);
  box(0.62, 0.13, 0.36, M(0xffffff, { rough: 0.95 }), 1.75, F2 + 0.5, 1.75, bd); // 枕头
  box(0.94, 0.1, 1.15, M(0x3f6db3, { rough: 0.95 }), 1.75, F2 + 0.48, 2.75, bd); // 被子
  box(0.94, 0.04, 0.3, M(0x2e4f8a, { rough: 0.95 }), 1.75, F2 + 0.52, 2.35, bd); // 被头折边

  // ---- 书架（北墙，摆满书） ----
  const sh = P('shelf', gF2);
  const shelfM = M(0x6b4a2f, { map: woodTex, rough: 0.75 });
  box(1.3, 1.8, 0.32, shelfM, 2.05, F2 + 0.9, -0.62, sh);
  for (let s = 0; s < 4; s++) {
    const sy = F2 + 0.32 + s * 0.42;
    box(1.24, 0.04, 0.28, shelfM, 2.05, sy, -0.62, sh);
    let bx = 1.46;
    while (bx < 2.6) {
      const bw = 0.05 + rnd() * 0.045, bh = 0.26 + rnd() * 0.1;
      const lean = rnd() > 0.88 ? 0.14 : 0;
      const bk = box(bw, bh, 0.2, M(bookCols[(rnd() * 4) | 0], { rough: 0.85 }), bx + bw / 2, sy + 0.02 + bh / 2, -0.62, sh);
      bk.rotation.z = lean;
      bx += bw + 0.008;
    }
  }
  box(1.24, 0.04, 0.28, shelfM, 2.05, F2 + 1.82, -0.62, sh);
  box(0.24, 0.18, 0.2, M(0xd94f4f, { rough: 0.8 }), 2.05, F2 + 1.95, -0.62, sh); // 顶层小物

  // ---- 壁橱（哆啦A梦的床） ----
  const cl = P('closet', gF2);
  box(1.35, 2.2, 0.75, M(0xd9c9a8, { rough: 0.9 }), 3.575, F2 + 1.1, -0.42, cl);
  box(0.62, 2.0, 0.05, fusM, 3.32, F2 + 1.0, -0.02, cl);
  const cd2 = box(0.62, 2.0, 0.05, fusM, 3.83, F2 + 1.0, -0.02, cl); cd2.position.x = 3.95; // 半开
  box(1.25, 0.04, 0.65, darkWood, 3.575, F2 + 1.12, -0.42, cl);    // 中隔板
  box(1.1, 0.16, 0.6, M(0x8ab3d9, { rough: 0.95 }), 3.575, F2 + 0.2, -0.42, cl); // 下层被褥（哆啦A梦的床）
  box(0.5, 0.12, 0.4, M(0xffffff, { rough: 0.95 }), 3.4, F2 + 0.32, -0.42, cl);  // 枕头
  box(0.4, 0.3, 0.5, M(0xb08d5a, { rough: 0.95 }), 3.7, F1 * 0 + F2 + 1.32, -0.42, cl); // 上层纸箱

  // ---- 和室 ----
  const wr = P('washitsu', gF2);
  const tatM = M(0xffffff, { map: tatamiTex, rough: 0.95 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++)
    box(1.9, 0.045, 1.7, tatM, -4.15 + 0.95 + c * 1.9, F2 + 0.028, -2.0 + 0.85 + r * 1.7, wr);
  box(1.0, 0.16, 0.5, woodM, -3.9, F2 + 0.08, -1.9, wr);          // 床の间
  box(0.9, 1.8, 0.06, M(0xd9c9a8, { rough: 0.95 }), -4.2, F2 + 1.0, -1.9, wr);
  box(0.3, 0.8, 0.02, M(0xf5f0e0), -4.16, F2 + 1.6, -1.9, wr);
  box(0.9, 0.06, 0.6, M(0x7a4f2c, { map: woodTex }), -2.2, F2 + 0.36, 0.8, wr); // 矮桌
  for (const sx of [-0.35, 0.35]) for (const sz of [-0.22, 0.22])
    box(0.06, 0.33, 0.06, M(0x7a4f2c), -2.2 + sx, F2 + 0.18, 0.8 + sz, wr);
  box(0.55, 0.09, 0.55, M(0x4a9a5e, { rough: 0.95 }), -2.2, F2 + 0.09, 1.7, wr);
  box(0.55, 0.09, 0.55, M(0xc7a23a, { rough: 0.95 }), -2.2, F2 + 0.09, -0.1, wr);
  box(1.4, 2.1, 0.6, M(0xd9c9a8, { rough: 0.9 }), -1.0, F2 + 1.05, 2.9, wr); // 押入
  box(0.65, 1.9, 0.05, fusM, -1.18, F2 + 0.95, 3.22, wr);
  box(0.65, 1.9, 0.05, fusM, -0.52, F2 + 0.95, 3.22, wr);

  // ---- 纳户 ----
  const sr = P('storeroom', gF2);
  const cardM = M(0xb08d5a, { rough: 0.95 });
  box(0.9, 0.6, 0.7, cardM, 2.2, F2 + 0.3, -2.9, sr);
  box(0.7, 0.5, 0.6, cardM, 2.25, F2 + 0.85, -2.85, sr);
  box(0.8, 0.55, 0.75, cardM, 3.4, F2 + 0.275, -3.0, sr);
  box(0.6, 0.45, 0.5, cardM, 3.35, F2 + 0.775, -2.95, sr);
  const fut = cyl(0.28, 0.28, 1.4, M(0x8a9ab3, { rough: 0.95 }), 1.2, F2 + 0.28, -2.9, sr, 12);
  fut.rotation.z = Math.PI / 2;
  box(0.5, 0.7, 0.35, M(0x7a7f8a, { rough: 0.9 }), 3.9, F2 + 0.35, -2.5, sr); // 旧扇风机？纸箱
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
for (const ck of ['out', 'f1', 'f2']) {
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
  const cut1 = (m === 'f1'), cut2 = (m === 'f2');
  cutWalls.w1s.visible = !cut1; cutWalls.w1e.visible = !cut1;
  cutWalls.w2s.visible = !cut2; cutWalls.w2e.visible = !cut2;
  PARTS['door'].group.visible = !cut1;
  PARTS['porchroof'].group.visible = !cut1;
  const xray = (m === 'xray');
  extMats.forEach(mt => { mt.transparent = xray; mt.opacity = xray ? 0.13 : 1; mt.depthWrite = !xray; mt.needsUpdate = true; });
  if (m === 'exterior') flyTo(V(12.5, 8, 14.5), V(0, 2.4, 0));
  if (m === 'f1') flyTo(V(7.8, 7.0, 11.6), V(-0.6, 1.0, -0.4));
  if (m === 'f2') flyTo(V(8.2, 11.2, 11.0), V(-0.2, 4.1, -0.2));
  if (m === 'xray') flyTo(V(12, 9.2, 13.5), V(0, 2.8, 0));
}
document.querySelectorAll('.vbtn').forEach(b => b.onclick = () => setMode(b.dataset.view));

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

function ensureVisible(p) {
  const L = p.layer;
  if (L === 'roof') { if (cur !== 'exterior') setMode('exterior'); return; }
  if (L === 'garden') return;
  if ((p.id === 'door' || p.id === 'porchroof') && cur === 'f1') { setMode('exterior'); return; }
  if (p.xray) {
    if (cur === 'exterior') setMode('xray');
    else if (cur === 'f1' && L === 'f2') setMode('xray');
    else if (cur === 'f2' && L === 'f1') setMode('xray');
  } else if (cur === 'f1' && L === 'f2') setMode('xray');
}
function clearHl() {
  if (hlBox) { scene.remove(hlBox); hlBox.geometry.dispose(); hlBox.material.dispose(); hlBox = null; }
}
const LAYER_TXT = { roof: ' · 屋顶', f2: ' · 二楼', f1: ' · 一楼', garden: ' · 庭院' };
function selectPart(id) {
  const p = PARTS[id];
  if (!p || !p.group) return;
  ensureVisible(p);
  selected = id;
  document.querySelectorAll('.pbtn').forEach(b => b.classList.toggle('on', b.dataset.part === id));
  document.querySelectorAll('.lbl').forEach(el => el.classList.toggle('hot', el.dataset.part === id));
  infoName.textContent = p.name;
  infoCat.textContent = CATS[p.cat] + (LAYER_TXT[p.layer] || '');
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
    const showXray = cur === 'xray' || (cur === 'f1' && p.layer === 'f1') || (cur === 'f2' && p.layer === 'f2');
    if (!labelsOn || !isShown(p.group) || (p.xray && !showXray)) { el.style.display = 'none'; continue; }
    pv.copy(v).applyMatrix4(p.group.matrixWorld).project(camera);
    if (pv.z > 1 || pv.z < -1) { el.style.display = 'none'; continue; }
    el.style.display = 'block';
    el.style.left = ((pv.x * 0.5 + 0.5) * viewW) + 'px';
    el.style.top = ((-pv.y * 0.5 + 0.5) * viewH) + 'px';
  }
}

function onResize() {
  viewW = view.clientWidth; viewH = view.clientHeight;
  if (viewW < 2 || viewH < 2) return;
  renderer.setSize(viewW, viewH);
  camera.aspect = viewW / viewH;
  camera.fov = viewW < viewH ? 62 : 48;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', () => setTimeout(onResize, 300));

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

if (window.matchMedia('(max-width: 760px)').matches) panel.classList.add('hide');
onResize();
setMode('exterior');
animate();
document.getElementById('loading').style.display = 'none';
