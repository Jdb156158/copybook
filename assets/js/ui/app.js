/* ============================================================
 * ui/app.js —— 应用装配：面板 / 预览 / 模板 / 素材 / 打印
 * ========================================================== */
(function () {
  'use strict';

  var S = window.CBStore, T = window.CBTemplates, R = window.CBRender,
    L = window.CBLayout, G = window.CBGrids, P = window.CBPinyin, C = window.CBControls;

  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* 受限制输入的模板模式：输入时自动过滤掉不适合的字符 */
  var RESTRICTED_MODES = { pinyin: 1, english: 1, number: 1 };
  var MODE_HINTS = {
    pinyin: '拼音模板已自动过滤汉字，仅保留拼音字母与声调。',
    english: '英文模板已自动过滤汉字，仅保留英文字母与空格。',
    number: '数字模板已自动过滤汉字与字母，仅保留数字与算式符号。'
  };
  function sanitizeText(value, mode) {
    if (!RESTRICTED_MODES[mode]) return value;
    var s = String(value || '');
    // 全角数字/字母转半角
    s = s.replace(/[\uFF10-\uFF19]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); });
    s = s.replace(/[\uFF21-\uFF3A\uFF41-\uFF5A]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); });
    // 过滤 CJK 汉字/扩展 A / CJK 标点 / 全角符号
    s = s.replace(/[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303F\uFF00-\uFFEF]+/g, ' ');
    if (mode === 'number') s = s.replace(/[a-zA-Z]/g, '');
    // 折叠多余空格，保留换行
    return s.replace(/[ \t]+/g, ' ').replace(/^[ \t]+|[ \t]+$/gm, '');
  }
  function updateInputHint() {
    var el = $('#inputHint');
    if (!el) return;
    var mode = S.get().mode;
    if (RESTRICTED_MODES[mode]) {
      el.textContent = MODE_HINTS[mode];
      el.hidden = false;
    } else {
      el.textContent = '';
      el.hidden = true;
    }
  }

  var ICONS = {
    hanzi: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M12 3.5v17M3.5 12h17"/>',
    pinyin: '<path d="M3 6.5h18M3 11h18M3 15.5h18"/><path d="M8.5 6.5v5M15 11v4.5"/>',
    abc: '<path d="M3 18l5-12 5 12M4.6 14.6h6.8"/><path d="M15 18v-4.5a2.6 2.6 0 0 1 5.2 0V18"/>',
    num: '<path d="M6 6v12M11 6v12M16 6v12"/><path d="M4 9h4M13 15h4"/>',
    poem: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M8 8.5h8M8 12h8M8 15.5h5"/>',
    write: '<path d="M4 20l3.2-.8L18.4 8 16 5.6 4.8 16.8z"/><path d="M14.4 4.4l3.6 3.6"/>',
    stroke: '<path d="M6 5c2.6 4 4.6 8 5.6 14M18 5c-2.6 4-4.6 8-5.6 14"/>',
    blank: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    book: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5A1.5 1.5 0 0 0 20 18.5z"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.hanzi) + '</svg>';
  }

  /* ---------------- 状态 ---------------- */
  var zoom = 1, lastSize = null, rafId = 0;
  var PANEL_REBUILD_KEYS = { trace: 1, showPinyin: 1, mode: 1, template: 1 };
  var PHONE = /[?&]phone=1/.test(location.search);

  /* ---------------- Toast ---------------- */
  function toast(msg, kind) {
    var wrap = $('#toasts');
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = (kind === 'ok'
      ? '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
      : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.2v.3"/></svg>') +
      '<span>' + esc(msg) + '</span>';
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 260);
    }, 2400);
  }

  /* ---------------- 迷你预览 ---------------- */
  function miniHTML(settings, chars, rows, cols) {
    var grid = settings.grid || 'tianzi';
    var svg = G.gridSVG(grid, { line: '#9a9386', guide: '#c8c2b6', width: 0.8, dash: true });
    var pySvg = G.gridSVG('sixiang', { line: '#c8c2b6', guide: '#c8c2b6', width: 0.7, dash: false });
    var showPy = !!settings.showPinyin && settings.mode === 'hanzi';
    var charsArr = String(chars || '天地人').split('');
    var html = '<div class="mini-sheet" style="--cols:' + cols + '">';
    var k = 0;
    for (var r = 0; r < rows; r++) {
      html += '<div class="mini-row">';
      for (var c = 0; c < cols; c++) {
        var ch = charsArr[k % charsArr.length]; k++;
        var isTrace = c % 3 !== 0 && !!settings.trace;
        html += '<div class="mini-cell' + (isTrace ? ' is-trace' : '') + '">' +
          (showPy ? '<div class="mini-py">' + pySvg + '<span>' +
            (isTrace ? '' : esc(P.pinyinOf(ch))) + '</span></div>' : '') +
          '<b style="top:' + (showPy ? '36%' : '0') + '">' +
          esc(ch) + '</b>' + svg + '</div>';
      }
      html += '</div>';
    }
    return html + '</div>';
  }

  /* 模板演示文本（缩略图 / Hero 轮播共用） */
  var DEMO_TEXT = {
    'tianzi-pinyin': '天地人', 'mizi-trace': '春晓眠', 'mihui-pro': '结构美', 'hui-gongge': '内外收',
    'jiugong': '比例匀', 'pinyin-4line': 'aoei', 'english-4line': 'AaBb',
    'number': '1234', 'gushi-vertical': '床前明月光疑是地上霜', 'gushi-square': '床前明月光疑是地上霜',
    'composition': '春天来了小草发芽', 'name-practice': '李小明', 'basic-strokes': '横竖撇',
    'pen-control': '', 'zuoye-blank': '', 'calligraphy-work': '静夜思'
  };

  /**
   * 按可用宽高反推能填满的行数（保持格子正方形）
   * @return {number} 行数
   */
  function calcRows(s, cols, w, h) {
    var cellW = w / cols;
    /* 迷你预览中拼音画在格内，行高即格高（四线三格略高） */
    var rowH = s.grid === 'sixiang' ? cellW * 1.15 : cellW;
    if (!rowH) return 4;
    return Math.max(2, Math.min(18, Math.floor(h / rowH)));
  }

  /** 生成某模板的迷你预览（mini-sheet HTML）
   * @param {object} t   模板对象
   * @param {number} rows 固定行数（未传尺寸时使用）
   * @param {object} opts { w, h } 可用宽高（px），传入则自动填满
   */
  function tplPreview(t, rows, opts) {
    var s = t.settings || {};
    var chars = DEMO_TEXT[t.id] || '天地人';
    var cols = Math.min(parseInt(s.cols, 10) || 6, 7);
    opts = opts || {};
    var fill = opts.h > 0 && opts.w > 0;
    var w = opts.w || 0, h = opts.h || 0;

    if (t.id === 'pen-control') {
      var pats = ['wave', 'dots_h', 'loops', 'zigzag', 'spring'];
      var pRows = fill ? Math.max(3, Math.round(h / 48)) : rows + 1;
      var lines = '';
      for (var pi = 0; pi < pRows; pi++) {
        lines += '<div style="' + (fill ? 'flex:1;min-height:14px;' : 'height:16px;') + 'color:#9a9386">' +
          G.patternSVG(pats[pi % pats.length], 100, 24).replace('<svg ', '<svg style="width:100%;height:100%" ') +
          '</div>';
      }
      return '<div class="mini-sheet" style="--cols:6;padding:10px' + (fill ? ';height:100%' : '') + '">' +
        '<div style="display:flex;flex-direction:column;gap:6px' + (fill ? ';height:100%' : '') + '">' +
        lines + '</div></div>';
    }
    if (t.id === 'basic-strokes') {
      var bcols = 4;
      var brows = fill ? Math.max(2, Math.floor(h / (w / bcols))) : rows;
      var rowsHtml = '';
      for (var ri = 0; ri < brows; ri++) {
        rowsHtml += '<div class="mini-row">' +
          G.BASIC_STROKES.map(function (b, bi) { return b; })
            .slice(ri * bcols, ri * bcols + bcols)
            .concat(G.BASIC_STROKES.slice(0, Math.max(0, ri * bcols + bcols - G.BASIC_STROKES.length)))
            .map(function (b) {
              return '<div class="mini-cell">' + G.strokeSVG(b.p) + '</div>';
            }).join('') + '</div>';
      }
      return '<div class="mini-sheet" style="--cols:' + bcols + '">' + rowsHtml + '</div>';
    }
    if (s.mode === 'vertical') {
      var cell = fill ? Math.max(16, Math.min(w / 4, h / 9)) : 16;
      var colCount = Math.max(2, Math.floor((w + 4) / (cell + 4)));
      var perCol = Math.max(3, Math.floor(h / cell));
      var src = (chars || '天地人').split('');
      var colsHtml = '', k2 = 0;
      for (var ci = 0; ci < colCount; ci++) {
        var colItems = '';
        for (var vj = 0; vj < perCol; vj++) {
          colItems += '<div class="mini-cell" style="width:' + cell + 'px">' +
            '<b style="font-size:' + (cell * 0.55) + 'px">' + src[k2++ % src.length] + '</b>' +
            G.gridSVG('fang', { line: '#9a9386', guide: '#c8c2b6', width: 0.8 }) + '</div>';
        }
        colsHtml += '<div style="display:flex;flex-direction:column">' + colItems + '</div>';
      }
      return '<div class="mini-sheet" style="--cols:' + colCount + '">' +
        '<div style="display:flex;flex-direction:row-reverse;gap:4px;justify-content:center">' +
        colsHtml + '</div></div>';
    }
    return miniHTML(s, chars, fill ? calcRows(s, cols, w, h) : rows, cols);
  }

  /* ---------------- Hero 轮播 ---------------- */
  var heroIdx = 0, heroTimer = null;
  var HERO_INTERVAL = 2800;

  /** 取纸卡内部可用尺寸（mini-sheet 自身还有 6px 内边距） */
  function sheetInner(sheet) {
    var cs = getComputedStyle(sheet);
    var w = sheet.offsetWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 12;
    var h = sheet.offsetHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 12;
    return { w: Math.max(60, w), h: Math.max(60, h) };
  }

  function heroShow(i, animate) {
    var sheet = document.querySelector('.hero-visual .sheet-1');
    var badge = document.getElementById('heroBadgeText');
    if (!sheet) return;
    var t = T.TEMPLATES[i % T.TEMPLATES.length];
    /* 按纸卡实际尺寸算行数，让内容铺满整张纸 */
    sheet.innerHTML = '<div class="hero-mini">' + tplPreview(t, 5, sheetInner(sheet)) + '</div>';
    if (animate) {
      var m = sheet.querySelector('.hero-mini');
      if (m) { m.style.animation = 'none'; void m.offsetWidth; m.style.animation = ''; }
    }
    if (badge) badge.textContent = t.name + ' · ' + (i + 1) + ' / ' + T.TEMPLATES.length;
  }

  function heroPlay() {
    stopHero();
    heroTimer = setInterval(function () {
      heroIdx = (heroIdx + 1) % T.TEMPLATES.length;
      heroShow(heroIdx, true);
    }, HERO_INTERVAL);
  }
  function stopHero() { if (heroTimer) { clearInterval(heroTimer); heroTimer = null; } }

  function buildHero() {
    var vis = document.querySelector('.hero-visual');
    if (!vis) return;
    /* 衬纸（静态装饰，同样铺满） */
    var s2 = vis.querySelector('.sheet-2');
    var s3 = vis.querySelector('.sheet-3');
    if (s2) {
      s2.innerHTML = tplPreview(T.get('gushi-square'), 5, sheetInner(s2));
    }
    if (s3) {
      s3.innerHTML = tplPreview(T.get('pinyin-4line'), 5, sheetInner(s3));
    }

    heroShow(0, false);
    heroPlay();

    vis.addEventListener('mouseenter', stopHero);
    vis.addEventListener('mouseleave', heroPlay);
    vis.addEventListener('click', function () {
      heroIdx = (heroIdx + 1) % T.TEMPLATES.length;
      heroShow(heroIdx, true);
      heroPlay();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopHero(); else heroPlay();
    });
    /* 断点变化后按新尺寸重排 */
    var rzTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(rzTimer);
      rzTimer = setTimeout(function () {
        if (s2) s2.innerHTML = tplPreview(T.get('gushi-square'), 5, sheetInner(s2));
        if (s3) s3.innerHTML = tplPreview(T.get('pinyin-4line'), 5, sheetInner(s3));
        heroShow(heroIdx, false);
      }, 220);
    });
  }

  /* ---------------- 模板库 ---------------- */
  function buildGallery() {
    var wrap = $('#tplGrid');
    wrap.innerHTML = T.TEMPLATES.map(function (t) {
      var preview = tplPreview(t, 3);
      return '<button type="button" class="tpl-card" data-tpl="' + t.id + '">' +
        '<span class="tpl-preview">' + preview + '</span>' +
        '<span class="tpl-card-body">' +
        '<span class="tpl-card-top"><span class="tpl-card-name">' + esc(t.name) + '</span>' +
        (t.tag ? '<span class="tpl-tag">' + esc(t.tag) + '</span>' : '') + '</span>' +
        '<span class="tpl-card-desc">' + esc(t.desc) + '</span></span></button>';
    }).join('');

    wrap.addEventListener('click', function (e) {
      var card = e.target.closest('.tpl-card');
      if (!card) return;
      applyTemplate(card.getAttribute('data-tpl'));
      document.getElementById('studio').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    /* 卡片光标跟随高光 */
    wrap.addEventListener('pointermove', function (e) {
      var card = e.target.closest('.tpl-card');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  function applyTemplate(id) {
    var tpl = S.applyTemplate(id);
    buildPanel(true);
    var clean = sanitizeText(S.get().text, S.get().mode);
    if (clean !== S.get().text) S.set('text', clean, true);
    $('#textInput').value = S.get().text || '';
    updateInputHint();
    updateTplCurrent();
    renderPyCheck();
    schedulePreview();
    markActiveTemplate();
    toast('已套用「' + tpl.name + '」', 'ok');
  }

  function markActiveTemplate() {
    $$('.tpl-card').forEach(function (c) {
      c.classList.toggle('is-active', c.getAttribute('data-tpl') === S.get().template);
    });
  }

  function updateTplCurrent() {
    var t = T.get(S.get().template);
    $('#tplCurrentName').textContent = t.name;
    $('#tplCurrentDesc').textContent = t.desc;
    $('#tplCurrentIco').innerHTML = icon(t.icon);
  }

  /* ---------------- 素材 ---------------- */
  function buildMaterials() {
    var wrap = $('#matGrid');
    wrap.innerHTML = T.MATERIALS.map(function (g) {
      return '<div class="mat-card"><div class="mat-head">' + icon(g.icon) +
        '<b>' + esc(g.name) + '</b><span>' + g.items.length + ' 篇</span></div>' +
        '<div class="mat-list">' + g.items.map(function (it, i) {
          return '<button type="button" class="mat-item" data-g="' + g.id + '" data-i="' + i + '">' +
            esc(it.name) + '</button>';
        }).join('') + '</div></div>';
    }).join('');

    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.mat-item');
      if (!btn) return;
      var g = null;
      for (var i = 0; i < T.MATERIALS.length; i++) {
        if (T.MATERIALS[i].id === btn.getAttribute('data-g')) g = T.MATERIALS[i];
      }
      if (!g) return;
      applyMaterial(g.items[parseInt(btn.getAttribute('data-i'), 10)]);
    });
  }

  function applyMaterial(item) {
    if (item.mode) S.set('mode', item.mode);
    var mode = item.mode || S.get().mode;
    var clean = sanitizeText(item.text, mode);
    S.set('text', clean);
    $('#textInput').value = clean;
    updateInputHint();
    buildPanel(true);
    renderPyCheck();
    schedulePreview();
    toast('已载入「' + item.name + '」', 'ok');
    if ($('#modal').hasAttribute('hidden') === false) closeModal();
  }

  function openMaterialModal() {
    var body = $('#modalBody');
    body.innerHTML = T.MATERIALS.map(function (g) {
      return '<div class="modal-mat-group"><div class="modal-mat-title">' + esc(g.name) + '</div>' +
        '<div class="modal-mat-items">' + g.items.map(function (it, i) {
          return '<button type="button" class="chip" data-g="' + g.id + '" data-i="' + i + '">' +
            esc(it.name) + '</button>';
        }).join('') + '</div></div>';
    }).join('');
    $('#modal').removeAttribute('hidden');
  }
  function closeModal() { $('#modal').setAttribute('hidden', ''); }

  /* ---------------- 控制面板 ---------------- */
  function buildPanel(keepScroll) {
    var wrap = $('#panelSettings');
    var openState = {};
    $$('.pgroup').forEach(function (g) { openState[g.getAttribute('data-group')] = g.classList.contains('is-open'); });
    var scroll = keepScroll ? $('.panel-scroll').scrollTop : null;

    wrap.innerHTML = C.renderPanel(S.get());
    $$('.pgroup').forEach(function (g) {
      var id = g.getAttribute('data-group');
      var open = openState[id] !== undefined ? openState[id] : g.classList.contains('is-open');
      g.classList.toggle('is-open', open);
    });
    syncVisibility();
    if (scroll !== null) $('.panel-scroll').scrollTop = scroll;
  }

  /** 按 visible() 显隐每一行 */
  function syncVisibility() {
    var state = S.get();
    C.SCHEMA.forEach(function (g) {
      g.items.forEach(function (item) {
        var row = document.querySelector('[data-row="' + item.key + '"]');
        if (!row) return;
        var show = !item.visible || item.visible(state);
        row.hidden = !show;
      });
    });
  }

  function setPath(obj, path, value) {
    var parts = path.split('.'), o = obj, i;
    for (i = 0; i < parts.length - 1; i++) {
      if (!o[parts[i]]) o[parts[i]] = {};
      o = o[parts[i]];
    }
    o[parts[parts.length - 1]] = value;
  }

  function handleBind(key, rawValue, type) {
    var value = rawValue;
    if (type === 'number') value = parseFloat(rawValue);
    if (type === 'bool') value = !!rawValue;

    if (key === 'palette') {
      var pal = null;
      T.PALETTES.forEach(function (p) { if (p.id === value) pal = p; });
      if (pal) {
        S.set('lineColor', pal.line, true);
        S.set('guideColor', pal.guide, true);
        S.set('textColor', pal.text, true);
        buildPanel(true);
        schedulePreview();
      }
      return;
    }
    S.set(key, value);
    if (PANEL_REBUILD_KEYS[key]) buildPanel(true);
    else syncVisibility();
    schedulePreview();
  }

  function bindPanel() {
    var panel = $('#panelSettings');

    panel.addEventListener('click', function (e) {
      var seg = e.target.closest('.seg-btn');
      if (seg) {
        var box = seg.closest('[data-bind]');
        Array.prototype.forEach.call(box.querySelectorAll('.seg-btn'), function (b) { b.classList.remove('is-on'); });
        seg.classList.add('is-on');
        handleBind(box.getAttribute('data-bind'), seg.getAttribute('data-seg'), box.getAttribute('data-type'));
        return;
      }
      var chip = e.target.closest('.chip');
      if (chip) {
        var box2 = chip.closest('[data-bind]');
        var arr = (C.getPath(S.get(), box2.getAttribute('data-bind')) || []).slice();
        var v = chip.getAttribute('data-chip');
        var idx = arr.indexOf(v);
        if (idx >= 0) arr.splice(idx, 1); else arr.push(v);
        chip.classList.toggle('is-on', idx < 0);
        handleBind(box2.getAttribute('data-bind'), arr, 'array');
        return;
      }
      var sw = e.target.closest('.sw');
      if (sw) {
        var box3 = sw.closest('.ctl-color');
        var key = box3.querySelector('input[type=color]').getAttribute('data-bind');
        var color = sw.getAttribute('data-swatch');
        box3.querySelector('input[type=color]').value = color;
        box3.querySelector('.color-well span').style.background = color;
        $$('.sw', box3).forEach(function (s) { s.classList.toggle('is-on', s === sw); });
        handleBind(key, color, 'string');
        return;
      }
      var head = e.target.closest('.pgroup-head');
      if (head) {
        head.closest('.pgroup').classList.toggle('is-open');
      }
    });

    panel.addEventListener('input', function (e) {
      var t = e.target;
      var bind = t.getAttribute && t.getAttribute('data-bind');
      if (!bind) return;
      var type = t.getAttribute('data-type') || 'string';
      var v = type === 'bool' ? t.checked : t.value;
      if (t.type === 'range') {
        var out = t.closest('.ctl-range').querySelector('.ctl-out');
        var item = findItem(bind);
        out.textContent = v + ((item && item.unit) || '');
      }
      if (t.type === 'color') {
        t.closest('.ctl-color').querySelector('.color-well span').style.background = v;
      }
      if (t.type === 'text') {
        handleBind(bind, v, type);
        return;
      }
      handleBind(bind, v, type);
    });

    panel.addEventListener('change', function (e) {
      var t = e.target;
      if (t.tagName === 'SELECT' || (t.type === 'checkbox')) {
        var bind = t.getAttribute('data-bind');
        if (!bind) return;
        handleBind(bind, t.type === 'checkbox' ? t.checked : t.value, t.getAttribute('data-type') || 'string');
      }
    });
  }

  function findItem(key) {
    var f = null;
    C.SCHEMA.forEach(function (g) {
      g.items.forEach(function (i) { if (i.key === key) f = i; });
    });
    return f;
  }

  /* ---------------- 拼音校对 ---------------- */
  function renderPyCheck() {
    var box = $('#pyCheck');
    var s = S.get();
    if (s.mode !== 'hanzi') {
      $('#pyBlock').hidden = true;
      return;
    }
    $('#pyBlock').hidden = false;
    var tokens = L.parseContent(s.text || '', s);
    var seen = {}, list = [];
    tokens.forEach(function (t) {
      if (!t.c || seen[t.c] || !P.isHanzi(t.c)) return;
      seen[t.c] = 1;
      list.push(t);
    });
    box.innerHTML = list.slice(0, 120).map(function (t) {
      var cands = P.candidates(t.c);
      var multi = cands.length > 1;
      var cur = S.getPinyinOverride(t.c) || t.py || cands[0] || '';
      return '<button type="button" class="py-item' + (multi ? ' is-multi' : '') +
        '" data-ch="' + esc(t.c) + '" data-i="' + (cands.indexOf(cur) >= 0 ? cands.indexOf(cur) : 0) + '">' +
        '<span class="py-c">' + esc(t.c) + '</span>' +
        '<span class="py-p">' + esc(cur || '—') + '</span></button>';
    }).join('');
    var n = list.filter(function (t) { return P.candidates(t.c).length > 1; }).length;
    $('#pyNote').textContent = n ? n + ' 个多音字待确认' : '点击拼音可切换多音字';
  }

  function bindPyCheck() {
    $('#pyCheck').addEventListener('click', function (e) {
      var item = e.target.closest('.py-item');
      if (!item) return;
      var ch = item.getAttribute('data-ch');
      var cands = P.candidates(ch);
      if (cands.length <= 1) { toast('「' + ch + '」只有一种读音'); return; }
      var i = (parseInt(item.getAttribute('data-i'), 10) + 1) % cands.length;
      S.setPinyinOverride(ch, cands[i]);
      item.setAttribute('data-i', i);
      item.querySelector('.py-p').textContent = cands[i];
      schedulePreview();
    });
  }

  /* ---------------- 预览 ---------------- */
  function renderPreview() {
    var s = S.get();
    var res = R.render(s);
    $('#pages').innerHTML = res.html;
    lastSize = res.size;
    $('#stageInfo').textContent = res.pageCount + ' 页 · ' + res.cellCount + ' 格';
    $('#studioMeta').textContent = T.get(s.template).name + ' · ' + res.pageCount + ' 页 · ' +
      res.cellCount + ' 格 · ' + s.pageSize;
    updatePrintRule(res.size);
    applyZoom();
    if (PHONE) phoneFit();
  }

  /** 手机版：预览宽度自适应（不裁剪） */
  function phoneFit() {
    if (!lastSize) return;
    var cw = ($('#canvas').clientWidth || 360) - 24;
    zoom = Math.max(0.25, Math.min(1.5, cw / lastSize.w));
    applyZoom();
  }

  function schedulePreview() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(function () { rafId = 0; renderPreview(); });
  }

  function applyZoom() {
    $('#pages').style.transform = 'scale(' + zoom + ')';
    $('#zoomVal').textContent = Math.round(zoom * 100) + '%';
  }
  function fitZoom() {
    if (!lastSize) return;
    var cw = $('#canvas').clientWidth - 60;
    zoom = Math.max(0.3, Math.min(1.4, cw / lastSize.w));
    applyZoom();
  }

  function updatePrintRule(size) {
    var el = document.getElementById('printPageRule');
    if (!el) {
      el = document.createElement('style');
      el.id = 'printPageRule';
      document.head.appendChild(el);
    }
    el.textContent = '@media print{@page{size:' + size.mmW + 'mm ' + size.mmH + 'mm;margin:0}}';
  }

  /* ---------------- 打印 / 导出 ---------------- */
  function doPrint() {
    renderPreview();
    toast('已唤起打印，PDF 请选择「另存为 PDF」');
    setTimeout(function () { window.print(); }, 260);
  }

  function exportConfig() {
    var s = S.get();
    var data = JSON.stringify(s, null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'copybook-preset-' + (s.template || 'custom') + '.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1200);
    toast('配置已导出', 'ok');
  }

  /* ---------------- 主题 ---------------- */
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('cb.theme'); } catch (e) { }
    var dark = saved ? saved === 'dark'
      : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    $('#themeToggle').addEventListener('click', function () {
      var now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', now);
      try { localStorage.setItem('cb.theme', now); } catch (e) { }
    });
  }

  /* ---------------- 杂项 ---------------- */
  function initScroll() {
    var bar = $('#topbar');
    function onScroll() { bar.classList.toggle('is-scrolled', window.scrollY > 8); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var links = $$('.topnav a');
    var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    function spy() {
      var y = window.scrollY + 140, idx = 0;
      secs.forEach(function (sec, i) { if (sec && sec.offsetTop <= y) idx = i; });
      links.forEach(function (a, i) { a.classList.toggle('is-active', i === idx); });
    }
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }

  function bindGlobal() {
    /* 内容输入 */
    var ta = $('#textInput');
    ta.addEventListener('input', function () {
      var mode = S.get().mode;
      var clean = sanitizeText(ta.value, mode);
      if (clean !== ta.value) {
        var start = ta.selectionStart;
        var oldLen = ta.value.length;
        ta.value = clean;
        // 尽量保留光标位置：移除的字符在光标前则回退；否则保持
        var diff = oldLen - clean.length;
        if (diff > 0 && start > 0) start = Math.max(0, start - diff);
        ta.setSelectionRange(start, start);
      }
      S.set('text', ta.value);
      renderPyCheck();
      schedulePreview();
    });

    /* 快捷 */
    $$('.quick').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-quick');
        if (k === 'clear') { ta.value = ''; S.set('text', ''); renderPyCheck(); schedulePreview(); return; }
        if (k === 'poem') {
          var p = T.POEMS[0];
          var txt = p.t + '\n' + p.a + '\n' + p.c.replace(/[，。、？！]/g, '');
          ta.value = txt; S.set('text', txt); renderPyCheck(); schedulePreview();
          toast('已载入《' + p.t + '》', 'ok');
          return;
        }
        if (k === 'name') { applyTemplate('name-practice'); ta.focus(); return; }
      });
    });

    /* 缩放 */
    $('#zoomIn').addEventListener('click', function () { zoom = Math.min(2, zoom + 0.1); applyZoom(); });
    $('#zoomOut').addEventListener('click', function () { zoom = Math.max(0.25, zoom - 0.1); applyZoom(); });
    $('#zoomFit').addEventListener('click', fitZoom);
    window.addEventListener('resize', function () { if (zoom <= 1) fitZoom(); });

    /* 打印 / 导出 */
    $('#btnPrint').addEventListener('click', doPrint);
    $('#btnPrintTop').addEventListener('click', doPrint);
    $('#btnSavePreset').addEventListener('click', exportConfig);
    $('#btnResetTop').addEventListener('click', function () {
      S.reset(); buildPanel(); ta.value = S.get().text; updateTplCurrent();
      renderPyCheck(); schedulePreview(); markActiveTemplate(); toast('已恢复默认设置', 'ok');
    });

    /* 素材弹层 */
    $('#btnMaterial').addEventListener('click', openMaterialModal);
    $('#modal').addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeModal();
      var chip = e.target.closest('.chip[data-g]');
      if (chip) {
        var g = null;
        T.MATERIALS.forEach(function (x) { if (x.id === chip.getAttribute('data-g')) g = x; });
        if (g) applyMaterial(g.items[parseInt(chip.getAttribute('data-i'), 10)]);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    /* 当前模板按钮 */
    $('#tplCurrent').addEventListener('click', function () {
      document.getElementById('gallery').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------------- 手机版（iPhone 外壳内） ---------------- */
  function initPhone() {
    document.body.classList.add('phone');

    /* 状态栏 + 灵动岛 */
    var status = document.createElement('div');
    status.className = 'phone-status';
    var now = new Date();
    var hh = now.getHours(), mm = ('0' + now.getMinutes()).slice(-2);
    status.innerHTML = '<span class="ps-time">' + hh + ':' + mm + '</span>' +
      '<span class="island" aria-hidden="true"></span>' +
      '<span class="ps-right" aria-hidden="true">●‌‌ ●‌ ●‌ 5G ▮</span>';

    /* 预览主区：把桌面 .stage 移入 */
    var main = document.createElement('div');
    main.className = 'phone-main';
    var stage = document.querySelector('.stage');
    if (stage) main.appendChild(stage);

    /* 底部工具栏 */
    var TABS = [
      { tab: 'tpl', label: '模板', html: icon('book') },
      { tab: 'content', label: '内容', html: icon('write') },
      { tab: 'py', label: '拼音', html: icon('pinyin') },
      { tab: 'set', label: '设置', html: icon('hanzi') },
      { tab: 'print', label: '打印', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 9V3.5h11V9M6.5 18H5a1.5 1.5 0 0 1-1.5-1.5V12A1.5 1.5 0 0 1 5 10.5h14A1.5 1.5 0 0 1 20.5 12v4.5A1.5 1.5 0 0 1 19 18h-1.5M6.5 14h11v6.5h-11z"/></svg>' },
      { tab: 'theme', label: '主题', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/></svg>' }
    ];
    var tabbar = document.createElement('div');
    tabbar.className = 'phone-tabbar';
    tabbar.innerHTML = TABS.map(function (t) {
      return '<button type="button" class="ptab" data-tab="' + t.tab + '">' + t.html +
        '<span>' + t.label + '</span></button>';
    }).join('');

    /* 底部抽屉 */
    var sheet = document.createElement('div');
    sheet.className = 'phone-sheet';
    sheet.innerHTML = '<div class="sheet-grab"><span></span></div>' +
      '<div class="sheet-head"><h2 class="sheet-title">设置</h2><button type="button" class="sheet-done">完成</button></div>' +
      '<div class="sheet-content"></div>';
    var sheetContent = sheet.querySelector('.sheet-content');

    document.body.appendChild(status);
    document.body.appendChild(main);
    document.body.appendChild(tabbar);
    document.body.appendChild(sheet);

    /* 重排控件：把桌面面板里的各区块移入对应面板容器 */
    var pans = {};
    ['tpl', 'content', 'py', 'set'].forEach(function (k) {
      var d = document.createElement('div');
      d.className = 'phone-pan';
      d.setAttribute('data-pan', k);
      d.hidden = true;
      sheetContent.appendChild(d);
      pans[k] = d;
    });
    var gallery = document.getElementById('gallery');
    if (gallery) pans.tpl.appendChild(gallery);
    var contentBlock = document.querySelector('#panel .block');
    if (contentBlock) pans.content.appendChild(contentBlock);
    var pyBlock = document.getElementById('pyBlock');
    if (pyBlock) pans.py.appendChild(pyBlock);
    var panelSettings = document.getElementById('panelSettings');
    if (panelSettings) pans.set.appendChild(panelSettings);
    var panelFoot = document.querySelector('.panel-foot');
    if (panelFoot) panelFoot.style.display = 'none';

    var TITLES = { tpl: '模板库', content: '练习内容', py: '拼音校对', set: '字格与样式' };

    function openSheet(k) {
      ['tpl', 'content', 'py', 'set'].forEach(function (x) { pans[x].hidden = x !== k; });
      sheet.querySelector('.sheet-title').textContent = TITLES[k] || '设置';
      sheet.classList.add('open');
      tabbar.querySelectorAll('.ptab').forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-tab') === k);
      });
    }
    function closeSheet() {
      sheet.classList.remove('open');
      tabbar.querySelectorAll('.ptab').forEach(function (b) { b.classList.remove('is-active'); });
    }

    tabbar.addEventListener('click', function (e) {
      var b = e.target.closest('.ptab');
      if (!b) return;
      var k = b.getAttribute('data-tab');
      if (k === 'print') { closeSheet(); doPrint(); return; }
      if (k === 'theme') { var t = document.getElementById('themeToggle'); if (t) t.click(); return; }
      if (sheet.classList.contains('open') && sheet.querySelector('.sheet-title').textContent === (TITLES[k] || '设置')) {
        closeSheet();
      } else {
        openSheet(k);
      }
    });

    sheet.querySelector('.sheet-done').addEventListener('click', closeSheet);
    sheet.querySelector('.sheet-grab').addEventListener('click', closeSheet);

    /* 模板选中后关闭抽屉（预览已实时更新） */
    var tplGrid = document.getElementById('tplGrid');
    if (tplGrid) tplGrid.addEventListener('click', function (e) {
      if (e.target.closest('.tpl-card')) setTimeout(closeSheet, 0);
    });

    /* 初始自适应 + 尺寸变化重排 */
    phoneFit();
    window.addEventListener('resize', function () { if (PHONE) phoneFit(); });
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    var loaded = S.load();
    if (!loaded) S.applyTemplate('tianzi-pinyin');
    initTheme();
    buildHero();
    buildGallery();
    buildMaterials();
    buildPanel();
    bindPanel();
    bindPyCheck();
    bindGlobal();
    initScroll();
    updateTplCurrent();
    markActiveTemplate();
    var ta = $('#textInput');
    var clean = sanitizeText(S.get().text, S.get().mode);
    if (clean !== S.get().text) S.set('text', clean, true);
    ta.value = S.get().text || '';
    updateInputHint();
    renderPyCheck();
    renderPreview();
    fitZoom();
    var tplN = T.TEMPLATES.length;
    $('#statTpl').textContent = tplN;
    var heroBtn = $('#heroTplBtn'); if (heroBtn) heroBtn.textContent = '浏览 ' + tplN + ' 种模板';
    var gDesc = $('#galleryDesc'); if (gDesc) gDesc.textContent = tplN + ' 种常用字帖版式，点一下即可套用，再微调成自己的。';
    if (PHONE) initPhone();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
