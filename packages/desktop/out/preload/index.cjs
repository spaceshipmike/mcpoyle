"use strict";
const electron = require("electron");
const T = "electron-trpc";
function Y(n) {
  const r = /* @__PURE__ */ Object.create(null);
  for (const e in n) {
    const i = n[e];
    r[i] = e;
  }
  return r;
}
const K = {
  /**
  * Invalid JSON was received by the server.
  * An error occurred on the server while parsing the JSON text.
  */
  PARSE_ERROR: -32700,
  /**
  * The JSON sent is not a valid Request object.
  */
  BAD_REQUEST: -32600,
  // Internal JSON-RPC error
  INTERNAL_SERVER_ERROR: -32603,
  NOT_IMPLEMENTED: -32603,
  // Implementation specific errors
  UNAUTHORIZED: -32001,
  FORBIDDEN: -32003,
  NOT_FOUND: -32004,
  METHOD_NOT_SUPPORTED: -32005,
  TIMEOUT: -32008,
  CONFLICT: -32009,
  PRECONDITION_FAILED: -32012,
  PAYLOAD_TOO_LARGE: -32013,
  UNPROCESSABLE_CONTENT: -32022,
  TOO_MANY_REQUESTS: -32029,
  CLIENT_CLOSED_REQUEST: -32099
};
Y(K);
Y(K);
var H, z, x, B, V, J;
typeof window > "u" || "Deno" in window || ((z = (H = globalThis.process) == null ? void 0 : H.env) == null ? void 0 : z.NODE_ENV) === "test" || (B = (x = globalThis.process) == null ? void 0 : x.env) != null && B.JEST_WORKER_ID || (J = (V = globalThis.process) == null ? void 0 : V.env) != null && J.VITEST_WORKER_ID;
function ue(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
var D = { exports: {} }, P, W;
function de() {
  if (W)
    return P;
  W = 1;
  var n = 1e3, r = n * 60, e = r * 60, i = e * 24, a = i * 7, C = i * 365.25;
  P = function(t, o) {
    o = o || {};
    var s = typeof t;
    if (s === "string" && t.length > 0)
      return p(t);
    if (s === "number" && isFinite(t))
      return o.long ? c(t) : g(t);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(t)
    );
  };
  function p(t) {
    if (t = String(t), !(t.length > 100)) {
      var o = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        t
      );
      if (o) {
        var s = parseFloat(o[1]), d = (o[2] || "ms").toLowerCase();
        switch (d) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return s * C;
          case "weeks":
          case "week":
          case "w":
            return s * a;
          case "days":
          case "day":
          case "d":
            return s * i;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return s * e;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return s * r;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return s * n;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return s;
          default:
            return;
        }
      }
    }
  }
  function g(t) {
    var o = Math.abs(t);
    return o >= i ? Math.round(t / i) + "d" : o >= e ? Math.round(t / e) + "h" : o >= r ? Math.round(t / r) + "m" : o >= n ? Math.round(t / n) + "s" : t + "ms";
  }
  function c(t) {
    var o = Math.abs(t);
    return o >= i ? u(t, o, i, "day") : o >= e ? u(t, o, e, "hour") : o >= r ? u(t, o, r, "minute") : o >= n ? u(t, o, n, "second") : t + " ms";
  }
  function u(t, o, s, d) {
    var h = o >= s * 1.5;
    return Math.round(t / s) + " " + d + (h ? "s" : "");
  }
  return P;
}
function le(n) {
  e.debug = e, e.default = e, e.coerce = c, e.disable = C, e.enable = a, e.enabled = p, e.humanize = de(), e.destroy = u, Object.keys(n).forEach((t) => {
    e[t] = n[t];
  }), e.names = [], e.skips = [], e.formatters = {};
  function r(t) {
    let o = 0;
    for (let s = 0; s < t.length; s++)
      o = (o << 5) - o + t.charCodeAt(s), o |= 0;
    return e.colors[Math.abs(o) % e.colors.length];
  }
  e.selectColor = r;
  function e(t) {
    let o, s = null, d, h;
    function l(...f) {
      if (!l.enabled)
        return;
      const b = l, O = Number(/* @__PURE__ */ new Date()), G = O - (o || O);
      b.diff = G, b.prev = o, b.curr = O, o = O, f[0] = e.coerce(f[0]), typeof f[0] != "string" && f.unshift("%O");
      let _ = 0;
      f[0] = f[0].replace(/%([a-zA-Z%])/g, (A, q) => {
        if (A === "%%")
          return "%";
        _++;
        const k = e.formatters[q];
        if (typeof k == "function") {
          const X = f[_];
          A = k.call(b, X), f.splice(_, 1), _--;
        }
        return A;
      }), e.formatArgs.call(b, f), (b.log || e.log).apply(b, f);
    }
    return l.namespace = t, l.useColors = e.useColors(), l.color = e.selectColor(t), l.extend = i, l.destroy = e.destroy, Object.defineProperty(l, "enabled", {
      enumerable: true,
      configurable: false,
      get: () => s !== null ? s : (d !== e.namespaces && (d = e.namespaces, h = e.enabled(t)), h),
      set: (f) => {
        s = f;
      }
    }), typeof e.init == "function" && e.init(l), l;
  }
  function i(t, o) {
    const s = e(this.namespace + (typeof o > "u" ? ":" : o) + t);
    return s.log = this.log, s;
  }
  function a(t) {
    e.save(t), e.namespaces = t, e.names = [], e.skips = [];
    let o;
    const s = (typeof t == "string" ? t : "").split(/[\s,]+/), d = s.length;
    for (o = 0; o < d; o++)
      s[o] && (t = s[o].replace(/\*/g, ".*?"), t[0] === "-" ? e.skips.push(new RegExp("^" + t.slice(1) + "$")) : e.names.push(new RegExp("^" + t + "$")));
  }
  function C() {
    const t = [
      ...e.names.map(g),
      ...e.skips.map(g).map((o) => "-" + o)
    ].join(",");
    return e.enable(""), t;
  }
  function p(t) {
    if (t[t.length - 1] === "*")
      return true;
    let o, s;
    for (o = 0, s = e.skips.length; o < s; o++)
      if (e.skips[o].test(t))
        return false;
    for (o = 0, s = e.names.length; o < s; o++)
      if (e.names[o].test(t))
        return true;
    return false;
  }
  function g(t) {
    return t.toString().substring(2, t.toString().length - 2).replace(/\.\*\?$/, "*");
  }
  function c(t) {
    return t instanceof Error ? t.stack || t.message : t;
  }
  function u() {
    console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
  }
  return e.enable(e.load()), e;
}
var fe = le;
(function(n, r) {
  r.formatArgs = i, r.save = a, r.load = C, r.useColors = e, r.storage = p(), r.destroy = /* @__PURE__ */ (() => {
    let c = false;
    return () => {
      c || (c = true, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
    };
  })(), r.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  function e() {
    return typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs) ? true : typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/) ? false : typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
    typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
    typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  function i(c) {
    if (c[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + c[0] + (this.useColors ? "%c " : " ") + "+" + n.exports.humanize(this.diff), !this.useColors)
      return;
    const u = "color: " + this.color;
    c.splice(1, 0, u, "color: inherit");
    let t = 0, o = 0;
    c[0].replace(/%[a-zA-Z%]/g, (s) => {
      s !== "%%" && (t++, s === "%c" && (o = t));
    }), c.splice(o, 0, u);
  }
  r.log = console.debug || console.log || (() => {
  });
  function a(c) {
    try {
      c ? r.storage.setItem("debug", c) : r.storage.removeItem("debug");
    } catch {
    }
  }
  function C() {
    let c;
    try {
      c = r.storage.getItem("debug");
    } catch {
    }
    return !c && typeof process < "u" && "env" in process && (c = process.env.DEBUG), c;
  }
  function p() {
    try {
      return localStorage;
    } catch {
    }
  }
  n.exports = fe(r);
  const { formatters: g } = n.exports;
  g.j = function(c) {
    try {
      return JSON.stringify(c);
    } catch (u) {
      return "[UnexpectedJSONParseError]: " + u.message;
    }
  };
})(D, D.exports);
var Ce = D.exports;
const Q = /* @__PURE__ */ ue(Ce);
Q("electron-trpc:main:handleIPCMessage");
Q("electron-trpc:main:IPCHandler");
const me = () => {
  const n = {
    sendMessage: (r) => electron.ipcRenderer.send(T, r),
    onMessage: (r) => electron.ipcRenderer.on(T, (e, i) => r(i))
  };
  electron.contextBridge.exposeInMainWorld("electronTRPC", n);
};
process.once("loaded", () => {
  me();
});
//# sourceMappingURL=index.cjs.map
