/* ============================================================
 * core/layout.js —— 内容解析 + 排版分页引擎
 * 纯计算，无 DOM 依赖：输入 settings，输出分页后的 cell 矩阵
 * ========================================================== */
(function (global) {
  'use strict';

  var P = global.CBPinyin;
  var G = global.CBGrids;
  var PX = 96 / 25.4; // 1mm = ?px @96dpi

  var PUNCT = /[，。、；：？！“”‘’（）《》,.;:?!()"'·—…\-–]/;

  /** 将原始文本解析为 token 序列 */
  function parseContent(text, settings) {
    var mode = settings.mode || 'hanzi';
    var out = [];
    if (!text) return out;
    var raw = String(text).replace(/\r/g, '');
    var ov = settings.pinyinOverrides || {};
    var blocks = raw.split(/\n+/);
    var i, j;

    for (i = 0; i < blocks.length; i++) {
      var block = blocks[i].trim();
      if (!block) continue;
      if (out.length) out.push({ c: '', br: true });

      if (mode === 'hanzi' || mode === 'composition' || mode === 'vertical') {
        var keepPunct = settings.keepPunct || mode === 'composition' || mode === 'vertical';
        for (j = 0; j < block.length; j++) {
          var ch = block.charAt(j);
          if (/\s/.test(ch)) continue;
          if (!keepPunct && PUNCT.test(ch)) continue;
          if (!P.isHanzi(ch) && !PUNCT.test(ch) && !/[A-Za-z0-9]/.test(ch)) continue;
          out.push({ c: ch, py: P.isHanzi(ch) ? (ov[ch] || P.pinyinOf(ch)) : '' });
        }
      } else {
        /* pinyin / english / number：按空白或逗号切分 */
        var parts = block.split(/[\s,，]+/).filter(function (x) { return x; });
        if (parts.length === 1 && parts[0].length > 1 && /^[A-Za-z0-9+\-=×÷.]+$/.test(parts[0])) {
          /* 无分隔的连续字母/数字串：逐字符拆 */
          parts = parts[0].split('');
        }
        for (j = 0; j < parts.length; j++) {
          var p = parts[j];
          // 安全网：如果混入了汉字等不适配字符，整段跳过，避免撑乱版式
          if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(p)) continue;
          if (mode === 'number' && /[A-Za-z]/.test(p)) continue;
          out.push({ c: p, py: '' });
        }
      }
    }
    return out;
  }

  /** 生成「格」序列：每 token 展开为 repeat 个格 */
  function buildCells(tokens, settings) {
    var mode = settings.mode;
    var repeat = Math.max(1, parseInt(settings.repeat, 10) || 1);
    var trace = !!settings.trace;
    var cells = [];

    if (mode === 'pattern' || mode === 'stroke') {
      var src = mode === 'stroke'
        ? G.BASIC_STROKES.map(function (s) { return { c: s.n, path: s.p, py: '' }; })
        : null;
      var list = src || [];
      if (mode === 'pattern') {
        var pats = ['dots_h', 'wave', 'zigzag', 'loops', 'spring'];
        for (var k = 0; k < 5; k++) list.push({ c: '', pattern: pats[k] });
      }
      for (var m = 0; m < list.length; m++) {
        for (var r = 0; r < repeat; r++) {
          cells.push({
            c: list[m].c, path: list[m].path, pattern: list[m].pattern, py: list[m].py || '',
            role: r === 0 ? 'demo' : (trace ? 'trace' : 'blank')
          });
        }
      }
      return cells;
    }

    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.br) { cells.push({ br: true }); continue; }
      for (var r2 = 0; r2 < repeat; r2++) {
        cells.push({
          c: t.c, py: t.py || '',
          role: r2 === 0 ? 'demo' : (trace ? 'trace' : 'blank')
        });
      }
    }
    return cells;
  }

  /** 页面度量：算出格宽、行高、每页行数等（单位 px） */
  function measure(settings, size) {
    var margin = (parseFloat(settings.margin) || 12) * PX;
    var cols = Math.max(1, parseInt(settings.cols, 10) || 8);
    var four = settings.grid === 'sixiang';
    var showPinyin = !!settings.showPinyin && settings.mode !== 'pattern' && settings.mode !== 'stroke';
    var headerH = headerHeight(settings) * PX;
    var availW = size.w - margin * 2;
    var spacing = (parseFloat(settings.spacing) || 0) * PX;

    var cellW = (availW - spacing * (cols - 1)) / cols;
    var cellH = four ? cellW * 1.15 : cellW * (parseFloat(settings.cellRatio) || 1);
    var pyH = showPinyin ? Math.min(cellW * 0.34, cellH * 0.34) : 0;
    var pyGap = 2 * PX;
    var rowGap = (parseFloat(settings.rowGap) || 3) * PX;
    /* 拼音独立成行：每行 = 拼音行(pyH) + 小间距(pyGap) + 汉字行(cellH) + 行距(rowGap) */
    var rowH = showPinyin ? (pyH + pyGap + cellH + rowGap) : (cellH + rowGap);
    var availH = size.h - margin * 2 - headerH - (settings.showPageNumber ? 8 * PX : 0);

    var rowsPerPage = Math.max(1, Math.floor((availH + rowGap) / (rowH + rowGap)));

    return {
      margin: margin, cols: cols, cellW: cellW, cellH: cellH, pyH: pyH,
      rowGap: rowGap, rowH: rowH, availW: availW, availH: availH,
      rowsPerPage: rowsPerPage, perPage: cols * rowsPerPage,
      headerH: headerH, four: four, showPinyin: showPinyin
    };
  }

  function headerHeight(settings) {
    var h = settings.header || {};
    var t = (h.title || '').trim();
    var fields = h.fields || [];
    if (!t && !fields.length && !h.score && !settings.showSignature) return 6;
    return (t ? 12 : 2) + (fields.length || h.score ? 8 : 0);
  }

  /** 竖排页面度量 */
  function measureVertical(settings, size) {
    var margin = (parseFloat(settings.margin) || 12) * PX;
    var cellW = (parseFloat(settings.cellSizeV) || 20) * PX;
    var cellH = cellW;
    var colGap = (parseFloat(settings.rowGap) || 2) * PX * 0.4;
    var headerH = headerHeight(settings) * PX;
    var availW = size.w - margin * 2;
    var availH = size.h - margin * 2 - headerH;
    var colCount = Math.max(1, Math.floor((availW + colGap) / (cellW + colGap)));
    var perCol = Math.max(1, Math.floor(availH / cellH));
    return {
      margin: margin, cellW: cellW, cellH: cellH, colGap: colGap,
      colCount: colCount, perCol: perCol, perPage: colCount * perCol, headerH: headerH
    };
  }

  /** 主入口：返回分页结果 */
  function paginate(settings, size) {
    var tokens = parseContent(settings.text || '', settings);
    var cells = buildCells(tokens, settings);
    var vertical = settings.mode === 'vertical';

    if (vertical) {
      var vm = measureVertical(settings, size);
      var vpages = [];
      var per = vm.perPage;
      for (var s = 0; s < cells.length || s === 0; s += per) {
        var slice = cells.slice(s, s + per);
        if (settings.fillLastPage !== false && slice.length < per) {
          /* 竖排尾页不需要填满 */
        }
        vpages.push(slice);
        if (s >= cells.length) break;
      }
      return { pages: vpages, metrics: vm, vertical: true, total: cells.length };
    }

    var m = measure(settings, size);
    var per2 = m.perPage;
    var pages = [];
    if (!cells.length) cells = [];
    var idx = 0;
    if (cells.length === 0) {
      pages.push([]);
    } else {
      while (idx < cells.length) {
        var pageCells = cells.slice(idx, idx + per2);
        idx += per2;
        if (settings.fillLastPage !== false && pageCells.length < per2) {
          var lastRole = 'blank';
          while (pageCells.length < per2) pageCells.push({ c: '', py: '', role: lastRole });
        }
        pages.push(pageCells);
      }
    }
    /* 空内容时也至少给一页满格 */
    if (pages.length === 1 && pages[0].length === 0 && settings.fillLastPage !== false) {
      for (var z = 0; z < per2; z++) pages[0].push({ c: '', py: '', role: 'blank' });
    }
    return { pages: pages, metrics: m, vertical: false, total: cells.length };
  }

  global.CBLayout = {
    PX: PX,
    parseContent: parseContent,
    buildCells: buildCells,
    measure: measure,
    measureVertical: measureVertical,
    paginate: paginate,
    headerHeight: headerHeight
  };
})(typeof window !== 'undefined' ? window : globalThis);
