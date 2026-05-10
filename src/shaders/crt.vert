/* =============================================
   CRT 屏幕 Shader — 顶点着色器
   负责：将顶点坐标和 UV 传递给片段着色器，
         同时传递时间 uniform 用于动态扫描线
   ============================================= */

varying vec2 vUv;
uniform float uTime;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
