import {
  add, assign, abs, dot, float, floor, fract, mix, mod, mul, sub,
  vec2, vec4, Fn, 
} from 'three/tsl';
import type { Node, TSL } from 'three/webgpu';

// // Permute function from IQ's GLSL code
export const permute = Fn(({x}:{x: TSL.ShaderNodeObject<Node>}) =>
  mod(mul(add(mul(float(34.0), x), float(1.0)), x), float(289.0)));

// Fade function: 6t⁵ - 15t⁴ + 10t³
export const fade = Fn(({t}: {t: TSL.ShaderNodeObject<Node>}) =>
  mul(t, t, t, add(mul(t, sub(mul(t, float(6.0)), float(15.0))), float(10.0))));

// Classic 2D Perlin noise in TSL
export const cnoise = Fn(({P}:{P: TSL.ShaderNodeObject<Node>}) => {
  const Pi = floor(vec4(P.x, P.y, P.x, P.y));
  const Pf = sub(fract(vec4(P.x, P.y, P.x, P.y)), vec4(0.0, 0.0, 1.0, 1.0));
  const Pi289 = mod(Pi, float(289.0));

  const ix = vec4(Pi289.x, Pi289.z, Pi289.x, Pi289.z);
  const iy = vec4(Pi289.y, Pi289.y, Pi289.w, Pi289.w);
  const fx = vec4(Pf.x, Pf.z, Pf.x, Pf.z);
  const fy = vec4(Pf.y, Pf.y, Pf.w, Pf.w);

  const i = permute({x:add(permute({x:ix}), iy)});
  let gx = sub(mul(float(2.0), fract(mul(i, float(1.0 / 41.0)))), float(1.0));
  let gy = sub(abs(gx), float(0.5));
  const tx = floor(add(gx, float(0.5)));
  gx = sub(gx, tx);

  const g00 = vec2(gx.x, gy.x);
  const g10 = vec2(gx.y, gy.y);
  const g01 = vec2(gx.z, gy.z);
  const g11 = vec2(gx.w, gy.w);

  const norm = sub(
    float(1.79284291400159),
    mul(float(0.85373472095314), vec4(
      dot(g00, g00),
      dot(g01, g01),
      dot(g10, g10),
      dot(g11, g11)
    ))
  );

  assign(g00, mul(g00, norm.x));
  assign(g01, mul(g01, norm.y));
  assign(g10, mul(g10, norm.z));
  assign(g11, mul(g11, norm.w));

  const n00 = dot(g00, vec2(fx.x, fy.x));
  const n10 = dot(g10, vec2(fx.y, fy.y));
  const n01 = dot(g01, vec2(fx.z, fy.z));
  const n11 = dot(g11, vec2(fx.w, fy.w));

  const fade_xy = fade({t:vec2(Pf.x, Pf.y)});
  const n_x = vec2(mix(n00, n10, fade_xy.x), mix(n01, n11, fade_xy.x));
  const n_xy = mix(n_x.x, n_x.y, fade_xy.y);

  return mul(float(2.3), n_xy);
});

// const stitchingPosition = Fn(({ position }: { position: ShaderNodeObject<Node> }) => {
//     const result = position.toVec3().toVar();
//     const neibLOD = neibLods.z;
//     const segmentCurrent = pow(2.0, float(5).sub(lod)).add(1.0);
//     const segmentNeighbor = pow(2.0, float(5).sub(neibLOD)).add(1.0);
//     const step = segmentCurrent.sub(1.0).div(segmentNeighbor.sub(1.0));
//     const spacing = float(100.0).div(segmentCurrent.sub(1.0)); // chunkSize = 100

//     If(neibLOD.lessThan(lod).and(row.equal(0)), () => {
//         const colF = col.toFloat();
//         const isShared = mod(colF, step).equal(0.0);

//         If(isShared, () => {
//             result.yAssign(getHeight({ pos: result.xz.add(center) }));
//         }).Else(() => {
//             const worldX = colF.mul(spacing).add(center.x);
//             const z = center.z;

//             const stepSize = step.mul(spacing);
//             const leftX = floor(colF.div(step)).mul(step).mul(spacing).add(center.x);
//             const rightX = leftX.add(stepSize);
//             const t = (worldX.sub(leftX)).div(stepSize);

//             const h1 = getHeight({ pos: vec2(leftX, z) });
//             const h2 = getHeight({ pos: vec2(rightX, z) });

//             result.yAssign(mix(h1, h2, t));
//         });
//     });

//     return result;
// });

