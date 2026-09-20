/* ============================================================
 * core/store.js —— 状态管理（默认配置 / 模板切换 / 持久化）
 * ========================================================== */
(function (global) {
  'use strict';

  var KEY = 'cb.copybook.settings.v1';
  var T = global.CBTemplates;

  var DEFAULTS = {
    template: 'tianzi-pinyin',
    mode: 'hanzi',
    text: '天地人你我他一二三四五六七八九十',
    grid: 'tianzi',
    cols: 9,
    repeat: 3,
    spacing: 0,
    cellRatio: 1,
    rowGap: 3,
    fontScale: 0.74,
    font: 'kaiti',
    showPinyin: true,
    pinyinStyle: 'tone',
    tracePinyin: true,
    trace: true,
    traceOpacity: 0.25,
    lineColor: '#2b2b2b',
    guideColor: '#c9c3b7',
    textColor: '#1a1a1a',
    dash: true,
    lineWidth: 1,
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 12,
    showPageNumber: true,
    fillLastPage: true,
    showSignature: false,
    keepPunct: false,
    pattern: 'wave',
    header: { title: '每日练字', fields: ['姓名', '班级', '日期'], score: true },
    pinyinOverrides: {}
  };

  function deepMerge(base, patch) {
    var out = {}, k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    if (!patch) return out;
    for (k in patch) {
      if (!Object.prototype.hasOwnProperty.call(patch, k)) continue;
      var v = patch[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) {
        out[k] = deepMerge(out[k], v);
      } else if (v !== undefined) {
        out[k] = v;
      }
    }
    return out;
  }

  var state = deepMerge(DEFAULTS, null);
  var listeners = [];
  var pinyinOverrides = {};

  function get() { return state; }
  function set(key, value, silent) {
    if (key.indexOf('.') > 0) {
      var parts = key.split('.');
      var o = state, i;
      for (i = 0; i < parts.length - 1; i++) o = o[parts[i]];
      o[parts[parts.length - 1]] = value;
    } else {
      state[key] = value;
    }
    if (!silent) emit(key);
  }
  function update(patch, silent) {
    state = deepMerge(state, patch);
    if (!silent) emit('*');
  }
  function emit(key) {
    for (var i = 0; i < listeners.length; i++) listeners[i](state, key);
    save();
  }
  function subscribe(fn) { listeners.push(fn); }

  function applyTemplate(id) {
    var tpl = T.get(id);
    var prevText = state.text || '';

    /* 以默认值为底 + 模板覆盖：避免上一个模板的参数残留 */
    state = deepMerge(DEFAULTS, tpl.settings);
    state.template = id;
    state.pinyinOverrides = pinyinOverrides;

    /* 内容智能填充：文本为空、或与模板的内容类型不匹配时，套用示例 */
    if (tpl.sample !== undefined) {
      var mode = state.mode;
      var needAscii = (mode === 'pinyin' || mode === 'english' || mode === 'number');
      var hasAscii = /[A-Za-z0-9]/.test(prevText);
      var hasHanzi = /[\u4e00-\u9fff]/.test(prevText);
      var noText = !prevText.trim() || mode === 'pattern' || mode === 'stroke';
      var mismatch = needAscii ? !hasAscii : !hasHanzi;
      state.text = (noText || mismatch) ? tpl.sample : prevText;
    } else {
      state.text = prevText;
    }

    emit('template');
    return tpl;
  }

  function reset() {
    state = deepMerge(DEFAULTS, null);
    pinyinOverrides = {};
    emit('*');
  }

  function save() {
    try {
      var copy = deepMerge(state, { pinyinOverrides: pinyinOverrides });
      localStorage.setItem(KEY, JSON.stringify(copy));
    } catch (e) { /* 隐私模式忽略 */ }
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return false;
      var obj = JSON.parse(raw);
      state = deepMerge(DEFAULTS, obj);
      pinyinOverrides = obj.pinyinOverrides || {};
      state.pinyinOverrides = pinyinOverrides;
      return true;
    } catch (e) { return false; }
  }

  function setPinyinOverride(ch, py) {
    if (py) pinyinOverrides[ch] = py; else delete pinyinOverrides[ch];
    state.pinyinOverrides = pinyinOverrides;
    emit('pinyin');
  }
  function getPinyinOverride(ch) { return pinyinOverrides[ch]; }
  function allOverrides() { return pinyinOverrides; }

  global.CBStore = {
    DEFAULTS: DEFAULTS,
    get: get, set: set, update: update, subscribe: subscribe,
    applyTemplate: applyTemplate, reset: reset,
    save: save, load: load,
    setPinyinOverride: setPinyinOverride,
    getPinyinOverride: getPinyinOverride,
    allOverrides: allOverrides
  };
})(typeof window !== 'undefined' ? window : globalThis);
