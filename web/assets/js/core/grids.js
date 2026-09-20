/* ============================================================
 * core/grids.js —— 字格 / 线格 / 控笔图案 的 SVG 生成
 * 输出纯字符串，Web 与原生 WebView 均可直接注入
 * ========================================================== */
(function (global) {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function svg(inner, w, h) {
    return '<svg class="cb-grid-svg" viewBox="0 0 ' + (w || 100) + ' ' + (h || 100) +
      '" preserveAspectRatio="none" xmlns="' + SVG_NS + '">' + inner + '</svg>';
  }
  function line(x1, y1, x2, y2, color, sw, dash) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
      '" stroke="' + color + '" stroke-width="' + (sw || 1) + '"' +
      (dash ? ' stroke-dasharray="' + dash + '"' : '') +
      ' vector-effect="non-scaling-stroke" stroke-linecap="round"/>';
  }
  function rect(x, y, w, h, color, sw, dash) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" fill="none" stroke="' + color + '" stroke-width="' + (sw || 1) + '"' +
      (dash ? ' stroke-dasharray="' + dash + '"' : '') +
      ' vector-effect="non-scaling-stroke"/>';
  }
  function ellipse(cx, cy, rx, ry, color, sw, dash) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry +
      '" fill="none" stroke="' + color + '" stroke-width="' + (sw || 1) + '"' +
      (dash ? ' stroke-dasharray="' + dash + '"' : '') +
      ' vector-effect="non-scaling-stroke"/>';
  }

  /**
   * 生成字格 SVG
   * @param {string} type  格型 id
   * @param {object} o     { line, guide, width, dash }
   */
  function gridSVG(type, o) {
    o = o || {};
    var main = o.line || '#1a1a1a';       // 外框色
    var guide = o.guide || main;           // 辅助线色
    var sw = o.width || 1;                 // 外框线宽(px)
    var gw = Math.max(0.6, sw * 0.75);     // 辅助线宽
    var dash = o.dash === false ? null : (o.dash || '4 3');
    var g = '';

    switch (type) {
      case 'fang': // 方格
        g = rect(0, 0, 100, 100, main, sw);
        break;
      case 'tianzi': // 田字格
        g = rect(0, 0, 100, 100, main, sw) +
          line(50, 0, 50, 100, guide, gw, dash) +
          line(0, 50, 100, 50, guide, gw, dash);
        break;
      case 'mizi': // 米字格
        g = rect(0, 0, 100, 100, main, sw) +
          line(50, 0, 50, 100, guide, gw, dash) +
          line(0, 50, 100, 50, guide, gw, dash) +
          line(0, 0, 100, 100, guide, gw, dash) +
          line(100, 0, 0, 100, guide, gw, dash);
        break;
      case 'hui': // 回宫格
        g = rect(0, 0, 100, 100, main, sw) +
          rect(22, 22, 56, 56, guide, gw, null) +
          line(50, 0, 50, 22, guide, gw, dash) +
          line(50, 78, 50, 100, guide, gw, dash) +
          line(0, 50, 22, 50, guide, gw, dash) +
          line(78, 50, 100, 50, guide, gw, dash);
        break;
      case 'mihui': // 米字回宫格
        g = rect(0, 0, 100, 100, main, sw) +
          rect(22, 22, 56, 56, guide, gw, null) +
          line(50, 0, 50, 100, guide, gw, dash) +
          line(0, 50, 100, 50, guide, gw, dash) +
          line(0, 0, 100, 100, guide, gw, dash) +
          line(100, 0, 0, 100, guide, gw, dash);
        break;
      case 'jiugong': // 九宫格
        g = rect(0, 0, 100, 100, main, sw) +
          line(33.33, 0, 33.33, 100, guide, gw, dash) +
          line(66.67, 0, 66.67, 100, guide, gw, dash) +
          line(0, 33.33, 100, 33.33, guide, gw, dash) +
          line(0, 66.67, 100, 66.67, guide, gw, dash);
        break;
      case 'zhongdan': // 中蛋田字格
        g = rect(0, 0, 100, 100, main, sw) +
          line(50, 0, 50, 100, guide, gw, dash) +
          line(0, 50, 100, 50, guide, gw, dash) +
          ellipse(50, 50, 33, 40, guide, gw, dash);
        break;
      case 'dan': // 蛋格
        g = rect(0, 0, 100, 100, main, sw) +
          ellipse(50, 50, 40, 46, guide, gw, dash);
        break;
      case 'zhongxin': // 中心格
        g = rect(0, 0, 100, 100, main, sw) +
          line(42, 50, 58, 50, guide, gw) +
          line(50, 42, 50, 58, guide, gw);
        break;
      case 'sixiang': // 四线三格（拼音 / 英文）
        g = line(0, 4, 100, 4, main, sw) +
          line(0, 38, 100, 38, main, sw) +
          line(0, 72, 100, 72, guide, gw, dash) +
          line(0, 96, 100, 96, main, sw);
        break;
      case 'hengxian': // 单行横线
        g = line(0, 96, 100, 96, main, sw);
        break;
      case 'shuxian': // 竖线格（中竖辅助线，竖写对齐）
        g = line(50, 0, 50, 100, main, sw, dash);
        break;
      case 'none': // 无格
        g = '';
        break;
      default:
        g = rect(0, 0, 100, 100, main, sw);
    }
    return svg(g, 100, 100);
  }

  /* ---------------- 控笔训练图案 ---------------- */
  var STROKE_PATTERNS = {
    /* 横向点连线 */
    dots_h: function (w, h) {
      var s = '', i, n = 10;
      for (i = 0; i <= n; i++) {
        s += '<circle cx="' + (6 + (w - 12) * i / n) + '" cy="' + h / 2 + '" r="1.6" fill="currentColor"/>';
      }
      return s;
    },
    /* 波浪线 */
    wave: function (w, h) {
      var d = 'M 6 ' + h / 2, i, steps = 4;
      for (i = 0; i < steps; i++) {
        var x0 = 6 + (w - 12) * i / steps, x1 = 6 + (w - 12) * (i + 0.5) / steps,
          x2 = 6 + (w - 12) * (i + 1) / steps;
        d += ' Q ' + x1 + ' ' + (h / 2 - h * 0.3) + ' ' + ((x0 + x2) / 2) + ' ' + h / 2;
        d += ' Q ' + (x1 + (x2 - x0) / 4) + ' ' + (h / 2 + h * 0.3) + ' ' + x2 + ' ' + h / 2;
      }
      return '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1" ' +
        'vector-effect="non-scaling-stroke" stroke-linecap="round"/>';
    },
    /* 锯齿折线 */
    zigzag: function (w, h) {
      var d = 'M 6 ' + h * 0.7, i, n = 8;
      for (i = 1; i <= n; i++) {
        d += ' L ' + (6 + (w - 12) * i / n) + ' ' + (i % 2 ? h * 0.3 : h * 0.7);
      }
      return '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1" ' +
        'vector-effect="non-scaling-stroke" stroke-linejoin="round"/>';
    },
    /* 连续圆圈 */
    loops: function (w, h) {
      var s = '', i, n = Math.max(2, Math.floor(w / (h * 0.9))), r = h * 0.32;
      for (i = 0; i < n; i++) {
        s += '<circle cx="' + (r + 4 + i * (w - 8) / n) + '" cy="' + h / 2 + '" r="' + r +
          '" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke" opacity="0.55"/>';
      }
      return s;
    },
    /* 螺旋 */
    spiral: function (w, h) {
      var d = '', i, turns = 3, steps = 90, cx = w / 2, cy = h / 2, rMax = Math.min(w, h) * 0.42;
      for (i = 0; i <= steps; i++) {
        var t = i / steps, a = t * turns * Math.PI * 2, r = rMax * t;
        d += (i ? ' L ' : 'M ') + (cx + Math.cos(a) * r) + ' ' + (cy + Math.sin(a) * r * 0.8);
      }
      return '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1" ' +
        'vector-effect="non-scaling-stroke" opacity="0.6"/>';
    },
    /* 弹簧（连续弧） */
    spring: function (w, h) {
      var d = 'M 6 ' + h / 2, i, n = 6;
      for (i = 0; i < n; i++) {
        var x0 = 6 + (w - 12) * i / n, x1 = 6 + (w - 12) * (i + 1) / n;
        d += ' A ' + ((x1 - x0) / 2) + ' ' + (h * 0.28) + ' 0 0 1 ' + x1 + ' ' + h / 2;
      }
      return '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1" ' +
        'vector-effect="non-scaling-stroke" opacity="0.6"/>';
    },
    /* 迷宫通道（回形） */
    maze: function (w, h) {
      var pad = 6, i, n = 5, s = '';
      for (i = 0; i < n; i++) {
        var k = pad + i * ((h - pad * 2) / n);
        s += '<line x1="' + pad + '" y1="' + k + '" x2="' + (w - pad) + '" y2="' + k +
          '" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke" opacity="0.35"/>';
      }
      var d = 'M ' + pad + ' ' + (pad + 2), i2, seg = 6;
      for (i2 = 1; i2 <= seg; i2++) {
        d += ' L ' + (pad + (w - pad * 2) * i2 / seg) + ' ' +
          (pad + (i2 % 2 ? (h - pad * 2) * 0.9 : 2));
      }
      return s + '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1.6" ' +
        'vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>';
    },
    /* 竖线列 */
    dots_v: function (w, h) {
      var s = '', i, n = 8, cols = Math.max(1, Math.floor(w / (h * 0.5)));
      for (var c = 0; c < cols; c++) {
        for (i = 0; i <= n; i++) {
          s += '<circle cx="' + (h * 0.25 + c * (w / cols)) + '" cy="' + (8 + (h - 16) * i / n) +
            '" r="1.4" fill="currentColor" opacity="0.6"/>';
        }
      }
      return s;
    }
  };

  function patternSVG(type, w, h) {
    var f = STROKE_PATTERNS[type] || STROKE_PATTERNS.dots_h;
    return svg(f(w || 100, h || 100), w || 100, h || 100);
  }

  /* ---------------- 基本笔画（笔画练习模板） ---------------- */
  var BASIC_STROKES = [
    { n: '横', p: 'M 20 50 L 80 50' },
    { n: '竖', p: 'M 50 18 L 50 82' },
    { n: '撇', p: 'M 72 26 C 60 40 46 58 24 78' },
    { n: '捺', p: 'M 26 26 C 40 44 58 62 78 78' },
    { n: '点', p: 'M 44 40 C 52 48 60 58 62 72 C 54 68 44 58 40 48 Z' },
    { n: '提', p: 'M 24 72 C 40 62 58 50 78 32' },
    { n: '横折', p: 'M 22 38 L 66 38 L 66 78' },
    { n: '竖折', p: 'M 34 22 L 34 62 L 76 62' },
    { n: '撇折', p: 'M 68 28 C 56 44 42 58 34 66 L 74 66' },
    { n: '横钩', p: 'M 22 40 L 68 40 C 68 40 60 56 44 60' },
    { n: '竖钩', p: 'M 40 20 L 40 70 C 40 78 32 80 24 72' },
    { n: '弯钩', p: 'M 38 24 C 42 52 46 70 58 74 C 64 76 68 68 64 62' },
    { n: '斜钩', p: 'M 26 26 C 46 44 62 62 74 76 C 78 70 76 62 70 58' },
    { n: '卧钩', p: 'M 28 46 C 40 62 58 70 72 62 C 76 58 74 50 68 48' },
    { n: '竖弯', p: 'M 34 24 L 34 62 C 34 74 44 76 72 76' },
    { n: '竖弯钩', p: 'M 32 24 L 32 62 C 32 74 44 76 68 76 C 74 76 76 68 74 62' },
    { n: '横折钩', p: 'M 24 30 L 62 30 L 62 68 C 62 76 54 78 46 72' },
    { n: '横折弯钩', p: 'M 22 34 L 56 34 L 56 62 C 56 72 66 74 74 66' },
    { n: '竖折折钩', p: 'M 30 22 L 30 52 L 56 52 L 56 70 C 56 78 48 80 40 74' },
    { n: '撇点', p: 'M 66 30 C 54 44 42 58 34 68 C 42 72 54 70 64 60' },
    { n: '横撇', p: 'M 22 40 L 64 40 C 56 52 42 66 26 76' },
    { n: '横折折撇', p: 'M 22 34 L 58 34 L 44 52 C 36 62 28 70 22 76' },
    { n: '竖提', p: 'M 38 22 L 38 62 C 38 62 52 48 70 32' },
    { n: '横折提', p: 'M 24 36 L 52 36 L 52 56 C 52 56 62 44 76 30' }
  ];

  function strokeSVG(path) {
    return svg('<path d="' + path + '" fill="none" stroke="currentColor" stroke-width="4" ' +
      'stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>', 100, 100);
  }

  global.CBGrids = {
    gridSVG: gridSVG,
    patternSVG: patternSVG,
    strokeSVG: strokeSVG,
    BASIC_STROKES: BASIC_STROKES,
    STROKE_PATTERNS: STROKE_PATTERNS,
    GRID_TYPES: [
      { id: 'tianzi', name: '田字格', desc: '入门首选，看重心与结构' },
      { id: 'mizi', name: '米字格', desc: '带对角辅助线，看起收笔' },
      { id: 'mihui', name: '米字回宫格', desc: '内外结构 + 斜线' },
      { id: 'hui', name: '回宫格', desc: '练内外收放关系' },
      { id: 'jiugong', name: '九宫格', desc: '细分比例与中宫' },
      { id: 'fang', name: '方格', desc: '干净，适合抄写' },
      { id: 'zhongdan', name: '中蛋田字格', desc: '中心结构 + 外轮廓' },
      { id: 'dan', name: '蛋格', desc: '强调字形外轮廓' },
      { id: 'zhongxin', name: '中心格', desc: '仅中心定位点' },
      { id: 'sixiang', name: '四线三格', desc: '拼音 / 英文专用' },
      { id: 'hengxian', name: '单行横线', desc: '自由书写' },
      { id: 'shuxian', name: '竖线格', desc: '竖写对齐辅助' },
      { id: 'none', name: '无格线', desc: '纯空白练习' }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
