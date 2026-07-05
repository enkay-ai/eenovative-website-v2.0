/* ============================================================
   EENOVATIVE — Synapse Field (Three.js hero)
   A neural constellation: drifting nodes, live connection lines,
   ember signal pulses, and a rotating wireframe icosahedron core.
   Degrades gracefully: reduced-motion or no WebGL -> static glow.
   ============================================================ */
(function () {
  const host = document.getElementById('field');
  if (!host || typeof THREE === 'undefined') return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }

  const isMobile = window.innerWidth < 720;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  renderer.setSize(host.clientWidth, host.clientHeight);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04070f, 0.055);

  const camera = new THREE.PerspectiveCamera(60, host.clientWidth / host.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 13);

  const group = new THREE.Group();
  scene.add(group);

  /* ---------- Nodes ---------- */
  const COUNT = isMobile ? 320 : 640;
  const base = new Float32Array(COUNT * 3);   // rest positions
  const pos = new Float32Array(COUNT * 3);    // live positions
  const phase = new Float32Array(COUNT * 3);  // drift phases

  for (let i = 0; i < COUNT; i++) {
    // flattened ellipsoid cloud, denser toward centre-right
    const r = Math.pow(Math.random(), 0.62);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * 11.5 * Math.sin(phi) * Math.cos(theta) + 2.2;
    const y = r * 5.6 * Math.sin(phi) * Math.sin(theta);
    const z = r * 5.0 * Math.cos(phi);
    base.set([x, y, z], i * 3);
    pos.set([x, y, z], i * 3);
    phase.set([Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28], i * 3);
  }

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  // two point layers: many faint blue, few bright ember
  const nodesBlue = new THREE.Points(nodeGeo, new THREE.PointsMaterial({
    color: 0x6da3ff, size: isMobile ? 0.055 : 0.045, transparent: true, opacity: 0.85,
    sizeAttenuation: true, depthWrite: false
  }));
  group.add(nodesBlue);

  const emberCount = Math.floor(COUNT * 0.08);
  const emberPos = new Float32Array(emberCount * 3);
  const emberIdx = [];
  for (let i = 0; i < emberCount; i++) {
    const idx = Math.floor(Math.random() * COUNT);
    emberIdx.push(idx);
    emberPos.set([pos[idx * 3], pos[idx * 3 + 1], pos[idx * 3 + 2]], i * 3);
  }
  const emberGeo = new THREE.BufferGeometry();
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
  const nodesEmber = new THREE.Points(emberGeo, new THREE.PointsMaterial({
    color: 0xff8a3d, size: isMobile ? 0.11 : 0.09, transparent: true, opacity: 0.95,
    sizeAttenuation: true, depthWrite: false
  }));
  group.add(nodesEmber);

  /* ---------- Edges (precomputed neighbours) ---------- */
  const MAX_DIST = isMobile ? 2.1 : 1.85;
  const MAX_EDGES = isMobile ? 500 : 1100;
  const edges = [];
  outer:
  for (let i = 0; i < COUNT; i++) {
    for (let j = i + 1; j < COUNT; j++) {
      const dx = base[i * 3] - base[j * 3];
      const dy = base[i * 3 + 1] - base[j * 3 + 1];
      const dz = base[i * 3 + 2] - base[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < MAX_DIST * MAX_DIST) {
        edges.push([i, j]);
        if (edges.length >= MAX_EDGES) break outer;
      }
    }
  }

  const linePos = new Float32Array(edges.length * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    color: 0x3f6fd1, transparent: true, opacity: 0.22, depthWrite: false
  }));
  group.add(lines);

  /* ---------- Signal pulses travelling along edges ---------- */
  const PULSES = isMobile ? 8 : 16;
  const pulsePos = new Float32Array(PULSES * 3);
  const pulseState = [];
  for (let p = 0; p < PULSES; p++) {
    pulseState.push({ edge: Math.floor(Math.random() * edges.length), t: Math.random(), speed: 0.004 + Math.random() * 0.009 });
  }
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
  const pulses = new THREE.Points(pulseGeo, new THREE.PointsMaterial({
    color: 0xffa563, size: 0.16, transparent: true, opacity: 0.9, sizeAttenuation: true, depthWrite: false
  }));
  group.add(pulses);

  /* ---------- Icosahedron core ---------- */
  const core = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.5, 1)),
    new THREE.LineBasicMaterial({ color: 0x7ea8ee, transparent: true, opacity: 0.5 })
  );
  core.position.set(4.4, 0.4, -1);
  group.add(core);

  const innerCore = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.15, 0)),
    new THREE.LineBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: 0.75 })
  );
  innerCore.position.copy(core.position);
  group.add(innerCore);

  /* ---------- Interaction ---------- */
  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', function (e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let visible = true;
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; });

  const io = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting && !document.hidden;
  });
  io.observe(host);

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);

  /* ---------- Animate ---------- */
  const clock = new THREE.Clock();

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;

    const t = clock.getElapsedTime();

    // node drift
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = base[i3] + Math.sin(t * 0.5 + phase[i3]) * 0.22;
      pos[i3 + 1] = base[i3 + 1] + Math.cos(t * 0.42 + phase[i3 + 1]) * 0.22;
      pos[i3 + 2] = base[i3 + 2] + Math.sin(t * 0.36 + phase[i3 + 2]) * 0.18;
    }
    nodeGeo.attributes.position.needsUpdate = true;

    // ember nodes track their parents
    for (let e = 0; e < emberCount; e++) {
      const idx = emberIdx[e] * 3;
      emberPos.set([pos[idx], pos[idx + 1], pos[idx + 2]], e * 3);
    }
    emberGeo.attributes.position.needsUpdate = true;

    // edges follow nodes
    for (let e = 0; e < edges.length; e++) {
      const [a, b] = edges[e];
      linePos.set([pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2], pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]], e * 6);
    }
    lineGeo.attributes.position.needsUpdate = true;

    // pulses ride edges
    for (let p = 0; p < PULSES; p++) {
      const s = pulseState[p];
      s.t += s.speed;
      if (s.t >= 1) { s.t = 0; s.edge = Math.floor(Math.random() * edges.length); }
      const [a, b] = edges[s.edge];
      const k = s.t;
      pulsePos.set([
        pos[a * 3] + (pos[b * 3] - pos[a * 3]) * k,
        pos[a * 3 + 1] + (pos[b * 3 + 1] - pos[a * 3 + 1]) * k,
        pos[a * 3 + 2] + (pos[b * 3 + 2] - pos[a * 3 + 2]) * k
      ], p * 3);
    }
    pulseGeo.attributes.position.needsUpdate = true;

    // core rotation
    core.rotation.x = t * 0.12;
    core.rotation.y = t * 0.18;
    innerCore.rotation.x = -t * 0.3;
    innerCore.rotation.y = -t * 0.22;

    // parallax + slow autorotate
    mx += (tx - mx) * 0.045;
    my += (ty - my) * 0.045;
    group.rotation.y = t * 0.03 + mx * 0.14;
    group.rotation.x = my * 0.09;
    camera.position.x = mx * 0.6;
    camera.position.y = -my * 0.4;
    camera.lookAt(1.5, 0, 0);

    renderer.render(scene, camera);
  }

  if (reduced) {
    // render one static frame only
    for (let e = 0; e < edges.length; e++) {
      const [a, b] = edges[e];
      linePos.set([pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2], pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]], e * 6);
    }
    lineGeo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  } else {
    frame();
  }
})();
