/* =============================================
   CRT 屏幕 Shader — 片段着色器
   效果：
     1. 桶形畸变（barrel distortion）模拟 CRT 屏幕弯曲
     2. 扫描线（scanlines）模拟 LCD/CRT 行间距
     3. RGB 通道偏移（chromatic aberration）模拟失真色散
     4. 屏幕发光暗角（vignette）增强边缘暗部
   ============================================= */

precision mediump float;

uniform sampler2D uTexture;  /* 视频/图片纹理 */
uniform float uTime;         /* 时间，用于动态扫描线滚动 */
uniform float uScanlineIntensity; /* 扫描线强度 0~1 */
uniform float uDistortion;   /* 桶形畸变强度 */
uniform float uBrightness;   /* 整体亮度（关机时为 0） */

varying vec2 vUv;

/* 桶形畸变函数：将 UV 从 [0,1] 映射到畸变后的坐标 */
vec2 barrelDistort(vec2 uv, float strength) {
  vec2 center = uv - 0.5;
  float r2 = dot(center, center);
  /* 二次多项式桶形畸变 */
  float distort = 1.0 + strength * r2;
  return center * distort + 0.5;
}

void main() {
  /* 1. 桶形畸变 */
  vec2 distortedUv = barrelDistort(vUv, uDistortion);

  /* 畸变后超出 [0,1] 范围的区域变黑（屏幕边框区域） */
  if (distortedUv.x < 0.0 || distortedUv.x > 1.0 ||
      distortedUv.y < 0.0 || distortedUv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  /* 2. RGB 通道偏移（横向微小偏移量） */
  float aberration = 0.003;
  float r = texture2D(uTexture, distortedUv + vec2(aberration, 0.0)).r;
  float g = texture2D(uTexture, distortedUv).g;
  float b = texture2D(uTexture, distortedUv - vec2(aberration, 0.0)).b;
  vec3 color = vec3(r, g, b);

  /* 3. 扫描线：每隔 N 像素添加一条暗纹 */
  float scanlineFreq = 200.0; /* 扫描线频率（值越大线越密） */
  float scanScroll = uTime * 0.3; /* 扫描线缓慢向下滚动 */
  float scanline = sin((distortedUv.y + scanScroll) * scanlineFreq * 3.14159) * 0.5 + 0.5;
  /* 扫描线越深，颜色越暗 */
  scanline = 1.0 - uScanlineIntensity * (1.0 - scanline) * 0.4;
  color *= scanline;

  /* 4. 暗角（vignette）：四角变暗，中心明亮 */
  vec2 vigUv = distortedUv * (1.0 - distortedUv.yx);
  float vignette = vigUv.x * vigUv.y * 15.0;
  vignette = pow(vignette, 0.35);
  color *= vignette;

  /* 5. 整体亮度控制（开关机效果） */
  color *= uBrightness;

  gl_FragColor = vec4(color, 1.0);
}
