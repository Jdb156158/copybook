/* ============================================================
 * core/pinyin.js —— 汉字拼音引擎（离线数据，无网络依赖）
 * 数据来自 window.CB_PINYIN（assets/data/pinyin-data.js）
 * 纯逻辑层，不依赖 DOM，可被 Web / iOS / Android 复用
 * ========================================================== */
(function (global) {
  'use strict';

  var DICT = global.CB_PINYIN || {};

  /* 带声调字母 → [基础字母, 调号] */
  var TONE_CHARS = {
    'ā': ['a', 1], 'á': ['a', 2], 'ǎ': ['a', 3], 'à': ['a', 4],
    'ē': ['e', 1], 'é': ['e', 2], 'ě': ['e', 3], 'è': ['e', 4],
    'ī': ['i', 1], 'í': ['i', 2], 'ǐ': ['i', 3], 'ì': ['i', 4],
    'ō': ['o', 1], 'ó': ['o', 2], 'ǒ': ['o', 3], 'ò': ['o', 4],
    'ū': ['u', 1], 'ú': ['u', 2], 'ǔ': ['u', 3], 'ù': ['u', 4],
    'ǖ': ['ü', 1], 'ǘ': ['ü', 2], 'ǚ': ['ü', 3], 'ǜ': ['ü', 4],
    'ü': ['ü', 5], 'ń': ['n', 2], 'ň': ['n', 3], 'ǹ': ['n', 4],
    'ḿ': ['m', 2], 'ê': ['ê', 5]
  };
  /* 无声调 → 各调号带调字母 */
  var TONE_TABLE = {
    'a': ['ā', 'á', 'ǎ', 'à'], 'o': ['ō', 'ó', 'ǒ', 'ò'],
    'e': ['ē', 'é', 'ě', 'è'], 'i': ['ī', 'í', 'ǐ', 'ì'],
    'u': ['ū', 'ú', 'ǔ', 'ù'], 'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ']
  };

  /* 声调标注规则：a>o>e>i>u>ü，iu 标 u，ui 标 i */
  var TONE_ORDER = ['a', 'o', 'e', 'i', 'u', 'ü'];

  function markTone(plain, tone) {
    if (!plain || tone < 1 || tone > 4) return plain;
    var low = plain.toLowerCase();
    var idx = -1;
    if (low.indexOf('iu') >= 0) idx = low.indexOf('u');
    else if (low.indexOf('ui') >= 0) idx = low.indexOf('i');
    else {
      for (var i = 0; i < TONE_ORDER.length; i++) {
        var p = low.indexOf(TONE_ORDER[i]);
        if (p >= 0) { idx = p; break; }
      }
    }
    if (idx < 0) return plain;
    var base = low.charAt(idx);
    var tbl = TONE_TABLE[base];
    if (!tbl) return plain;
    return plain.substring(0, idx) + tbl[tone - 1] + plain.substring(idx + 1);
  }

  /* 带调拼音 → [无声调拼音(v→ü 保持可读), 调号] */
  function splitTone(py) {
    var tone = 5, plain = '', i, ch, m;
    for (i = 0; i < py.length; i++) {
      ch = py.charAt(i);
      m = TONE_CHARS[ch];
      if (m) { plain += m[0]; if (m[1] !== 5) tone = m[1]; }
      else plain += ch;
    }
    return [plain, tone];
  }

  /** 取某字的候选拼音数组（首项为最常用音） */
  function candidates(ch) {
    if (!ch) return [];
    var v = DICT[ch];
    if (!v) return [];
    return Array.isArray(v) ? v.slice() : [v];
  }

  /** 取某字默认拼音（无数据返回空串） */
  function pinyinOf(ch) {
    var c = candidates(ch);
    return c.length ? c[0] : '';
  }

  function isHanzi(ch) {
    return !!ch && /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(ch);
  }

  /** 把任意文本转成带声调拼音序列（非汉字原样保留） */
  function toPinyin(text) {
    var out = [], i, ch;
    for (i = 0; i < text.length; i++) {
      ch = text.charAt(i);
      out.push(isHanzi(ch) ? pinyinOf(ch) : ch);
    }
    return out;
  }

  /** 去掉声调（用于「无声调」展示模式） */
  function stripTone(py) { return splitTone(py)[0]; }

  /** 转成数字调（如 hao3） */
  function toneNumber(py) {
    var s = splitTone(py);
    return s[0] + (s[1] === 5 ? '' : s[1]);
  }

  global.CBPinyin = {
    dict: DICT,
    candidates: candidates,
    pinyinOf: pinyinOf,
    isHanzi: isHanzi,
    toPinyin: toPinyin,
    splitTone: splitTone,
    stripTone: stripTone,
    toneNumber: toneNumber,
    markTone: markTone
  };
})(typeof window !== 'undefined' ? window : globalThis);
