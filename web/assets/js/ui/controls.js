/* ============================================================
 * ui/controls.js —— 控件工厂与设置面板 schema
 * 以 data-bind 统一驱动，事件委托回写 Store
 * ========================================================== */
(function (global) {
  'use strict';

  var G = global.CBGrids;
  var T = global.CBTemplates;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------------- 控件渲染 ---------------- */
  function select(item, val) {
    var opts = item.options.map(function (o) {
      return '<option value="' + esc(o.value) + '"' + (String(o.value) === String(val) ? ' selected' : '') +
        (o.hint ? ' data-hint="' + esc(o.hint) + '"' : '') + '>' + esc(o.label) + '</option>';
    }).join('');
    return '<div class="ctl ctl-select"><select data-bind="' + item.key + '" data-type="' +
      (item.type2 || 'string') + '">' + opts + '</select>' +
      '<svg class="ctl-caret" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5 8 10.5 12 6.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
  }

  function segmented(item, val) {
    var btns = item.options.map(function (o) {
      return '<button type="button" class="seg-btn' + (String(o.value) === String(val) ? ' is-on' : '') +
        '" data-seg="' + esc(o.value) + '">' + esc(o.label) + '</button>';
    }).join('');
    return '<div class="ctl ctl-seg" data-bind="' + item.key + '" data-type="' + (item.type2 || 'string') +
      '">' + btns + '</div>';
  }

  function range(item, val) {
    return '<div class="ctl ctl-range">' +
      '<input type="range" data-bind="' + item.key + '" data-type="number" min="' + item.min +
      '" max="' + item.max + '" step="' + (item.step || 1) + '" value="' + val + '">' +
      '<output class="ctl-out">' + val + (item.unit || '') + '</output></div>';
  }

  function colorCtl(item, val) {
    var presets = item.presets || [];
    var sw = presets.map(function (p) {
      return '<button type="button" class="sw' + (String(p).toLowerCase() === String(val).toLowerCase() ? ' is-on' : '') +
        '" data-swatch="' + esc(p) + '" style="background:' + p + '"></button>';
    }).join('');
    return '<div class="ctl ctl-color">' +
      '<label class="color-well"><input type="color" data-bind="' + item.key + '" value="' + val + '"><span style="background:' + val + '"></span></label>' +
      (sw ? '<div class="sw-row">' + sw + '</div>' : '') + '</div>';
  }

  function switchCtl(item, val) {
    return '<label class="ctl ctl-switch"><input type="checkbox" data-bind="' + item.key +
      '" data-type="bool"' + (val ? ' checked' : '') + '><span class="track"><span class="knob"></span></span></label>';
  }

  function chips(item, val) {
    var arr = val || [];
    var btns = item.options.map(function (o) {
      var on = arr.indexOf(o) >= 0;
      return '<button type="button" class="chip' + (on ? ' is-on' : '') + '" data-chip="' + esc(o) + '">' +
        esc(o) + '</button>';
    }).join('');
    return '<div class="ctl ctl-chips" data-bind="' + item.key + '" data-type="array">' + btns + '</div>';
  }

  function textCtl(item, val) {
    return '<div class="ctl ctl-text"><input type="text" data-bind="' + item.key + '" value="' +
      esc(val) + '" placeholder="' + esc(item.placeholder || '') + '"></div>';
  }

  function buildControl(item, state) {
    var val = item.get ? item.get(state) : getPath(state, item.key);
    switch (item.type) {
      case 'select': return select(item, val);
      case 'segmented': return segmented(item, val);
      case 'range': return range(item, val);
      case 'color': return colorCtl(item, val);
      case 'switch': return switchCtl(item, val);
      case 'chips': return chips(item, val);
      case 'text': return textCtl(item, val);
      default: return '';
    }
  }

  function getPath(o, path) {
    var parts = path.split('.'), i, cur = o;
    for (i = 0; i < parts.length; i++) { cur = cur ? cur[parts[i]] : undefined; }
    return cur;
  }

  function row(item, state) {
    if (item.visible && !item.visible(state)) return '';
    var hint = item.hint ? '<p class="row-hint">' + esc(item.hint) + '</p>' : '';
    var layout = item.type === 'switch' || item.type === 'select' || item.type === 'color' || item.type === 'text'
      ? 'row-inline' : 'row-stack';
    return '<div class="prow ' + layout + '" data-row="' + item.key + '">' +
      '<div class="row-label"><span>' + esc(item.label) + '</span>' +
      (item.type === 'switch' ? buildControl(item, state) : '') + '</div>' +
      (item.type === 'switch' ? '' : '<div class="row-ctl">' + buildControl(item, state) + '</div>') +
      hint + '</div>';
  }

  /* ---------------- 面板 schema ---------------- */
  var GRID_OPTS = G.GRID_TYPES.map(function (g) { return { value: g.id, label: g.name, hint: g.desc }; });
  var FONT_OPTS = T.FONTS.map(function (f) { return { value: f.id, label: f.name }; });
  var PAGE_OPTS = T.PAGE_SIZES.map(function (p) { return { value: p.id, label: p.name }; });
  var FIELD_OPTS = ['姓名', '班级', '学校', '日期', '家长签字', '用时'];

  var SCHEMA = [
    {
      id: 'grid', title: '字格与排版', open: true, items: [
        { key: 'grid', label: '字格类型', type: 'select', options: GRID_OPTS, type2: 'string' },
        { key: 'cols', label: '每行列数', type: 'range', min: 4, max: 20, step: 1, visible: function (s) { return s.mode !== 'vertical'; } },
        { key: 'repeat', label: '每字占格数', type: 'range', min: 1, max: 8, step: 1, hint: '1 个示范格 + N 个练习格', visible: function (s) { return s.mode !== 'composition' && s.mode !== 'vertical'; } },
        { key: 'rowGap', label: '行间距', type: 'range', min: 0, max: 12, step: 0.5, unit: ' mm' },
        { key: 'spacing', label: '格间距', type: 'range', min: 0, max: 6, step: 0.5, unit: ' mm', visible: function (s) { return s.mode !== 'vertical'; } },
        { key: 'cellSizeV', label: '字格大小', type: 'range', min: 14, max: 32, step: 1, unit: ' mm', visible: function (s) { return s.mode === 'vertical'; } },
        { key: 'fontScale', label: '字身大小', type: 'range', min: 0.5, max: 1, step: 0.02, hint: '相对格子边长的比例' },
        {
          key: 'pattern', label: '控笔图案', type: 'select', visible: function (s) { return s.mode === 'pattern'; },
          options: [{ value: 'wave', label: '波浪线' }, { value: 'dots_h', label: '点连线' },
          { value: 'zigzag', label: '锯齿折线' }, { value: 'loops', label: '连续圆圈' },
          { value: 'spiral', label: '螺旋线' }, { value: 'spring', label: '弹簧线' },
          { value: 'maze', label: '迷宫通道' }, { value: 'dots_v', label: '点阵列' }]
        }
      ]
    },
    {
      id: 'style', title: '笔墨样式', open: true, items: [
        { key: 'font', label: '字体', type: 'select', options: FONT_OPTS },
        {
          key: 'palette', label: '配色', type: 'segmented',
          options: T.PALETTES.map(function (p) { return { value: p.id, label: p.name }; })
        },
        { key: 'lineColor', label: '格线颜色', type: 'color', presets: ['#2b2b2b', '#3f7a52', '#b1392c', '#2b4f7a', '#6b6b6b'] },
        { key: 'guideColor', label: '辅助线颜色', type: 'color', presets: ['#c9c3b7', '#9dc3a8', '#e0aaa0', '#a8bcd4', '#c4c4c4'] },
        { key: 'textColor', label: '字体颜色', type: 'color', presets: ['#1a1a1a', '#2f6b45', '#8f2c22', '#1f3f66', '#4a4a4a'] },
        { key: 'dash', label: '辅助线虚线', type: 'switch' },
        { key: 'lineWidth', label: '格线粗细', type: 'range', min: 0.5, max: 2, step: 0.1 }
      ]
    },
    {
      id: 'trace', title: '描红与临摹', open: true, items: [
        { key: 'trace', label: '练习格描红', type: 'switch', hint: '关闭后练习格完全留白' },
        { key: 'traceOpacity', label: '描红深浅', type: 'range', min: 0.05, max: 0.6, step: 0.01, visible: function (s) { return !!s.trace; } },
        { key: 'showPinyin', label: '显示拼音', type: 'switch', visible: function (s) { return s.mode === 'hanzi'; } },
        {
          key: 'pinyinStyle', label: '拼音标注', type: 'segmented',
          options: [{ value: 'tone', label: '带声调' }, { value: 'plain', label: '无声调' }, { value: 'number', label: '数字调' }],
          visible: function (s) { return s.showPinyin && s.mode === 'hanzi'; }
        },
        { key: 'tracePinyin', label: '拼音也描红', type: 'switch', visible: function (s) { return s.showPinyin && s.trace && s.mode === 'hanzi'; } }
      ]
    },
    {
      id: 'page', title: '纸张与页眉', open: true, items: [
        {
          key: 'pageSize', label: '纸张', type: 'segmented',
          options: [{ value: 'A4', label: 'A4' }, { value: 'A5', label: 'A5' }, { value: 'B5', label: 'B5' }, { value: '16K', label: '16K' }, { value: 'Letter', label: 'Letter' }]
        },
        {
          key: 'orientation', label: '方向', type: 'segmented',
          options: [{ value: 'portrait', label: '竖版' }, { value: 'landscape', label: '横版' }],
          visible: function (s) { return s.mode !== 'vertical'; }
        },
        { key: 'margin', label: '页边距', type: 'range', min: 5, max: 25, step: 1, unit: ' mm' },
        { key: 'header.title', label: '页眉标题', type: 'text', placeholder: '如：每日练字' },
        { key: 'header.fields', label: '信息栏', type: 'chips', options: FIELD_OPTS },
        { key: 'header.score', label: '评分栏', type: 'switch' },
        { key: 'showSignature', label: '落款签名行', type: 'switch' },
        { key: 'showPageNumber', label: '页码', type: 'switch' },
        { key: 'fillLastPage', label: '尾页补满空格', type: 'switch' }
      ]
    }
  ];

  function renderPanel(state) {
    var html = '';
    for (var i = 0; i < SCHEMA.length; i++) {
      var g = SCHEMA[i];
      var body = '';
      for (var j = 0; j < g.items.length; j++) body += row(g.items[j], state);
      html += '<section class="pgroup' + (g.open ? ' is-open' : '') + '" data-group="' + g.id + '">' +
        '<button type="button" class="pgroup-head">' +
        '<span class="pgroup-dot"></span><span class="pgroup-title">' + esc(g.title) + '</span>' +
        '<svg class="pgroup-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5 8 10.5 12 6.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button><div class="pgroup-body"><div class="pgroup-body-inner">' + body + '</div></div></section>';
    }
    return html;
  }

  global.CBControls = {
    SCHEMA: SCHEMA,
    renderPanel: renderPanel,
    row: row,
    getPath: getPath,
    esc: esc
  };
})(typeof window !== 'undefined' ? window : globalThis);
