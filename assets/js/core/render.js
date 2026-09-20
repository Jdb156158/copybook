/* ============================================================
 * core/render.js —— 把分页结果渲染为可打印 DOM（矢量 SVG 格线）
 * 输出 HTML 字符串，Web / WebView 通用
 * ========================================================== */
(function (global) {
  'use strict';

  var T = global.CBTemplates;
  var G = global.CBGrids;
  var L = global.CBLayout;
  var P = global.CBPinyin;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fontStack(id) {
    for (var i = 0; i < T.FONTS.length; i++) if (T.FONTS[i].id === id) return T.FONTS[i];
    return T.FONTS[0];
  }
  function pyText(py, style) {
    if (!py) return '';
    if (style === 'plain') return P.stripTone(py);
    if (style === 'number') return P.toneNumber(py);
    return py;
  }

  /* ---------------- 页眉 ---------------- */
  function renderHeader(settings) {
    var h = settings.header || {};
    var title = (h.title || '').trim();
    var fields = h.fields || [];
    if (!title && !fields.length && !h.score) return '<div class="cb-head cb-head-empty"></div>';
    var s = '<div class="cb-head">';
    if (title) s += '<div class="cb-title">' + esc(title) + '</div>';
    if (fields.length || h.score) {
      s += '<div class="cb-fields">';
      s += '<span class="cb-meta">' + fields.map(function (f) {
        return '<span class="cb-field"><i>' + esc(f) + '</i><u></u></span>';
      }).join('') + '</span>';
      if (h.score) s += '<span class="cb-score"><b>评分</b>' +
        '<span class="cb-stars">' + new Array(6).join('<s>☆</s>') + '</span></span>';
      s += '</div>';
    }
    s += '</div>';
    return s;
  }

  function renderFooter(settings, idx, total) {
    var sign = settings.showSignature;
    var s = '<div class="cb-foot">';
    if (sign) s += '<span class="cb-sign"><i>书写者</i><u class="long"></u><i>日期</i><u></u></span>';
    if (settings.showPageNumber !== false && total > 0) {
      s += '<span class="cb-pagenum">第 ' + (idx + 1) + ' / ' + total + ' 页</span>';
    }
    s += '</div>';
    return s;
  }

  /* ---------------- 单个格 ---------------- */
  function renderCell(cell, settings, m, gridSVGStr, pySVGStr) {
    var fs = fontStack(settings.font);
    var isFour = m.four;
    var fourMode = settings.grid === 'sixiang';
    var cls = 'cb-cell cb-role-' + (cell.role || 'blank');
    var style = 'width:' + m.cellW + 'px;height:' + m.cellH + 'px;' +
      'font-family:' + fs.stack + ';' + (fs.weight ? 'font-weight:' + fs.weight + ';' : '');

    var inner = '';

    /* 拼音行 */
    if (m.pyH > 0) {
      var pyShow = '';
      if (cell.role === 'demo' || (cell.role === 'trace' && settings.tracePinyin !== false && settings.trace)) {
        pyShow = pyText(cell.py, settings.pinyinStyle);
      }
      var pyOpacity = cell.role === 'trace' ? (parseFloat(settings.traceOpacity) || 0.25) : 1;
      inner += '<div class="cb-py" style="height:' + m.pyH + 'px;font-size:' +
        (m.pyH * 0.56) + 'px">' + pySVGStr +
        '<span class="cb-py-t" style="opacity:' + pyOpacity + '">' + esc(pyShow) + '</span></div>';
    }

    /* 主体 */
    if (cell.pattern || settings.mode === 'pattern') {
      inner += '<div class="cb-glyph cb-pattern">' +
        G.patternSVG(cell.pattern || settings.pattern || 'wave', 100, 100) + '</div>';
    } else if (cell.path || settings.mode === 'stroke') {
      inner += '<div class="cb-glyph cb-stroke">' + G.strokeSVG(cell.path) + '</div>';
    } else {
      var showChar = cell.role === 'demo' || (cell.role === 'trace' && settings.trace);
      var op = cell.role === 'trace' ? (parseFloat(settings.traceOpacity) || 0.25) : 1;
      var size = isFour ? m.cellH * 0.6 : m.cellW * (parseFloat(settings.fontScale) || 0.74);
      var txt = showChar ? cell.c : '';
      inner += '<div class="cb-glyph' + (fourMode ? ' cb-glyph-four' : '') + '" style="font-size:' +
        size + 'px;opacity:' + op + ';color:' + (cell.role === 'trace' ? settings.textColor : settings.textColor) +
        '">' + esc(txt) + '</div>';
    }

    inner += gridSVGStr;
    return '<div class="' + cls + '" style="' + style + '">' + inner + '</div>';
  }

  /* ---------------- 横排页 ---------------- */
  function renderPageHorizontal(pageCells, settings, m, idx, total) {
    var gridStr = settings.grid === 'none' ? '' :
      G.gridSVG(settings.grid, {
        line: settings.lineColor, guide: settings.guideColor,
        width: parseFloat(settings.lineWidth) || 1, dash: settings.dash !== false
      });
    var pyStr = m.pyH > 0 ? G.gridSVG('sixiang', {
      line: settings.guideColor, guide: settings.guideColor,
      width: 0.8, dash: false
    }) : '';

    var html = '<div class="cb-body">';
    var rows = Math.ceil(pageCells.length / m.cols);
    var r, c, i = 0;
    for (r = 0; r < rows; r++) {
      html += '<div class="cb-row" style="height:' + (m.cellH + m.pyH) + 'px;margin-bottom:' + m.rowGap + 'px">';
      for (c = 0; c < m.cols; c++) {
        var cell = pageCells[i++];
        if (!cell) {
          html += '<div class="cb-cell cb-role-empty" style="width:' + m.cellW + 'px;height:' +
            (m.cellH + m.pyH) + 'px"></div>';
        } else {
          html += renderCell(cell, settings, m, gridStr, pyStr);
        }
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  /* ---------------- 竖排页 ---------------- */
  function renderPageVertical(pageCells, settings, m, idx, total) {
    var gridStr = G.gridSVG(settings.grid || 'fang', {
      line: settings.lineColor, guide: settings.guideColor,
      width: parseFloat(settings.lineWidth) || 1, dash: settings.dash !== false
    });
    var fs = fontStack(settings.font);
    var html = '<div class="cb-body cb-body-v" style="gap:' + m.colGap + 'px">';
    var cols = m.colCount;
    var per = m.perCol;
    var totalCols = Math.ceil(pageCells.length / per);
    for (var ci = 0; ci < totalCols; ci++) {
      html += '<div class="cb-col" style="width:' + m.cellW + 'px;gap:0">';
      for (var ri = 0; ri < per; ri++) {
        var cell = pageCells[ci * per + ri];
        var ch = cell ? cell.c : '';
        var op = cell && cell.role === 'trace' ? (parseFloat(settings.traceOpacity) || 0.22) : 1;
        html += '<div class="cb-cell cb-cell-v cb-role-' + (cell ? cell.role : 'blank') +
          '" style="width:' + m.cellW + 'px;height:' + m.cellH + 'px;font-family:' + fs.stack + '">' +
          '<div class="cb-glyph" style="font-size:' + (m.cellW * 0.7) + 'px;opacity:' + op + '">' +
          esc(ch) + '</div>' + gridStr + '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  /* ---------------- 主入口 ---------------- */
  function render(settings) {
    var size = pageSize(settings);
    var res = L.paginate(settings, size);
    var m = res.metrics;
    var fs = fontStack(settings.font);

    var pagesHtml = '';
    for (var i = 0; i < res.pages.length; i++) {
      var body = res.vertical
        ? renderPageVertical(res.pages[i], settings, m, i, res.pages.length)
        : renderPageHorizontal(res.pages[i], settings, m, i, res.pages.length);
      pagesHtml += '<section class="cb-page" data-page="' + i + '" style="width:' + size.w +
        'px;height:' + size.h + 'px;padding:' + m.margin + 'px;font-family:' + fs.stack + '">' +
        renderHeader(settings) + body + renderFooter(settings, i, res.pages.length) +
        '</section>';
    }

    return {
      html: pagesHtml,
      pageCount: res.pages.length,
      cellCount: res.total,
      metrics: m,
      size: size,
      vertical: res.vertical
    };
  }

  function pageSize(settings) {
    var id = settings.pageSize || 'A4';
    var found = null;
    for (var i = 0; i < T.PAGE_SIZES.length; i++) if (T.PAGE_SIZES[i].id === id) found = T.PAGE_SIZES[i];
    if (!found) found = T.PAGE_SIZES[0];
    var landscape = settings.orientation === 'landscape' && !settings.vertical;
    return landscape
      ? { w: found.h * L.PX, h: found.w * L.PX, mmW: found.h, mmH: found.w, id: found.id }
      : { w: found.w * L.PX, h: found.h * L.PX, mmW: found.w, mmH: found.h, id: found.id };
  }

  global.CBRender = {
    render: render,
    pageSize: pageSize,
    fontStack: fontStack,
    pyText: pyText
  };
})(typeof window !== 'undefined' ? window : globalThis);
