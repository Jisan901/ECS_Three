
function dot2(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

function mix(a, b, t) {
  return a * (1 - t) + b * t;
}

function floorVec4(v) {
  return v.map(Math.floor);
}

function fractVec4(v) {
  return v.map(x => x - Math.floor(x));
}

function modVec4(v, m) {
  return v.map(x => ((x % m) + m) % m);
}

function fade(t) {
  return [
    t[0] * t[0] * t[0] * (t[0] * (t[0] * 6 - 15) + 10),
    t[1] * t[1] * t[1] * (t[1] * (t[1] * 6 - 15) + 10),
  ];
}

// Simulates permutation (usually done with a noise texture or hash)
function permute(x) {
  return x.map(v => (((34 * v + 1) * v) % 289));
}

export function cnoise(P) {
  const Px = P[0], Py = P[1];

  let Pi = [
    Math.floor(Px), Math.floor(Py),
    Math.floor(Px) + 1, Math.floor(Py) + 1
  ];

  let Pf = [
    Px - Math.floor(Px), Py - Math.floor(Py),
    Px - Math.floor(Px) - 1, Py - Math.floor(Py) - 1
  ];

  Pi = modVec4(Pi, 289.0);

  const ix = [Pi[0], Pi[2], Pi[0], Pi[2]];
  const iy = [Pi[1], Pi[1], Pi[3], Pi[3]];
  const fx = [Pf[0], Pf[2], Pf[0], Pf[2]];
  const fy = [Pf[1], Pf[1], Pf[3], Pf[3]];

  const i = permute(permute(ix)).map((val, idx) => val + iy[idx]);

  let gx = i.map(x => 2.0 * fract(x * 0.0243902439) - 1.0);
  let gy = gx.map(Math.abs).map(x => x - 0.5);
  const tx = gx.map(x => Math.floor(x + 0.5));
  gx = gx.map((x, i) => x - tx[i]);

  const g00 = [gx[0], gy[0]];
  const g10 = [gx[1], gy[1]];
  const g01 = [gx[2], gy[2]];
  const g11 = [gx[3], gy[3]];

  const norm = [
    1.79284291400159 - 0.85373472095314 * dot2(g00, g00),
    1.79284291400159 - 0.85373472095314 * dot2(g01, g01),
    1.79284291400159 - 0.85373472095314 * dot2(g10, g10),
    1.79284291400159 - 0.85373472095314 * dot2(g11, g11)
  ];

  g00[0] *= norm[0]; g00[1] *= norm[0];
  g01[0] *= norm[1]; g01[1] *= norm[1];
  g10[0] *= norm[2]; g10[1] *= norm[2];
  g11[0] *= norm[3]; g11[1] *= norm[3];

  const n00 = dot2(g00, [fx[0], fy[0]]);
  const n10 = dot2(g10, [fx[1], fy[1]]);
  const n01 = dot2(g01, [fx[2], fy[2]]);
  const n11 = dot2(g11, [fx[3], fy[3]]);

  const fade_xy = fade([Pf[0], Pf[1]]);
  const nx0 = mix(n00, n10, fade_xy[0]);
  const nx1 = mix(n01, n11, fade_xy[0]);
  const nxy = mix(nx0, nx1, fade_xy[1]);

  return 2.3 * nxy;
}

// Helper
function fract(x) {
  return x - Math.floor(x);
}
