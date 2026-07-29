"use strict";
const node_path = require("node:path");
const utils = require("@electron-toolkit/utils");
const electron = require("electron");
const log = require("electron-log");
const main = require("electron-trpc/main");
const electronUpdater = require("electron-updater");
const node_events = require("node:events");
const node_fs = require("node:fs");
const node_crypto = require("node:crypto");
const node_os = require("node:os");
const require$$0$3 = require("path");
const require$$0$2 = require("fs");
const require$$0 = require("constants");
const require$$0$1 = require("stream");
const require$$4 = require("util");
const require$$5 = require("assert");
const require$$2 = require("events");
const zod = require("zod");
const node_child_process = require("node:child_process");
const server = require("@trpc/server");
const observable = require("@trpc/server/observable");
electronUpdater.autoUpdater.logger = log;
function initAutoUpdater(channel = "latest") {
  electronUpdater.autoUpdater.channel = channel;
  electronUpdater.autoUpdater.autoDownload = true;
  electronUpdater.autoUpdater.autoInstallOnAppQuit = true;
  electronUpdater.autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info.version);
  });
  electronUpdater.autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded:", info.version, "— will install on quit");
  });
  electronUpdater.autoUpdater.on("error", (err) => {
    log.error("Auto-update error:", err.message);
  });
  electronUpdater.autoUpdater.checkForUpdatesAndNotify();
  setInterval(() => electronUpdater.autoUpdater.checkForUpdatesAndNotify(), 4 * 60 * 60 * 1e3);
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var properLockfile = { exports: {} };
var lockfile$2 = {};
var constants = require$$0;
var origCwd = process.cwd;
var cwd = null;
var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process);
  return cwd;
};
try {
  process.cwd();
} catch (er) {
}
if (typeof process.chdir === "function") {
  var chdir = process.chdir;
  process.chdir = function(d) {
    cwd = null;
    chdir.call(process, d);
  };
  if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
}
var polyfills$1 = patch$1;
function patch$1(fs2) {
  if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs2);
  }
  if (!fs2.lutimes) {
    patchLutimes(fs2);
  }
  fs2.chown = chownFix(fs2.chown);
  fs2.fchown = chownFix(fs2.fchown);
  fs2.lchown = chownFix(fs2.lchown);
  fs2.chmod = chmodFix(fs2.chmod);
  fs2.fchmod = chmodFix(fs2.fchmod);
  fs2.lchmod = chmodFix(fs2.lchmod);
  fs2.chownSync = chownFixSync(fs2.chownSync);
  fs2.fchownSync = chownFixSync(fs2.fchownSync);
  fs2.lchownSync = chownFixSync(fs2.lchownSync);
  fs2.chmodSync = chmodFixSync(fs2.chmodSync);
  fs2.fchmodSync = chmodFixSync(fs2.fchmodSync);
  fs2.lchmodSync = chmodFixSync(fs2.lchmodSync);
  fs2.stat = statFix(fs2.stat);
  fs2.fstat = statFix(fs2.fstat);
  fs2.lstat = statFix(fs2.lstat);
  fs2.statSync = statFixSync(fs2.statSync);
  fs2.fstatSync = statFixSync(fs2.fstatSync);
  fs2.lstatSync = statFixSync(fs2.lstatSync);
  if (fs2.chmod && !fs2.lchmod) {
    fs2.lchmod = function(path2, mode, cb) {
      if (cb) process.nextTick(cb);
    };
    fs2.lchmodSync = function() {
    };
  }
  if (fs2.chown && !fs2.lchown) {
    fs2.lchown = function(path2, uid, gid, cb) {
      if (cb) process.nextTick(cb);
    };
    fs2.lchownSync = function() {
    };
  }
  if (platform === "win32") {
    fs2.rename = typeof fs2.rename !== "function" ? fs2.rename : function(fs$rename) {
      function rename(from, to, cb) {
        var start = Date.now();
        var backoff = 0;
        fs$rename(from, to, function CB(er) {
          if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
            setTimeout(function() {
              fs2.stat(to, function(stater, st) {
                if (stater && stater.code === "ENOENT")
                  fs$rename(from, to, CB);
                else
                  cb(er);
              });
            }, backoff);
            if (backoff < 100)
              backoff += 10;
            return;
          }
          if (cb) cb(er);
        });
      }
      if (Object.setPrototypeOf) Object.setPrototypeOf(rename, fs$rename);
      return rename;
    }(fs2.rename);
  }
  fs2.read = typeof fs2.read !== "function" ? fs2.read : function(fs$read) {
    function read(fd, buffer, offset, length, position, callback_) {
      var callback;
      if (callback_ && typeof callback_ === "function") {
        var eagCounter = 0;
        callback = function(er, _, __) {
          if (er && er.code === "EAGAIN" && eagCounter < 10) {
            eagCounter++;
            return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
          }
          callback_.apply(this, arguments);
        };
      }
      return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
    }
    if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
    return read;
  }(fs2.read);
  fs2.readSync = typeof fs2.readSync !== "function" ? fs2.readSync : /* @__PURE__ */ function(fs$readSync) {
    return function(fd, buffer, offset, length, position) {
      var eagCounter = 0;
      while (true) {
        try {
          return fs$readSync.call(fs2, fd, buffer, offset, length, position);
        } catch (er) {
          if (er.code === "EAGAIN" && eagCounter < 10) {
            eagCounter++;
            continue;
          }
          throw er;
        }
      }
    };
  }(fs2.readSync);
  function patchLchmod(fs22) {
    fs22.lchmod = function(path2, mode, callback) {
      fs22.open(
        path2,
        constants.O_WRONLY | constants.O_SYMLINK,
        mode,
        function(err, fd) {
          if (err) {
            if (callback) callback(err);
            return;
          }
          fs22.fchmod(fd, mode, function(err2) {
            fs22.close(fd, function(err22) {
              if (callback) callback(err2 || err22);
            });
          });
        }
      );
    };
    fs22.lchmodSync = function(path2, mode) {
      var fd = fs22.openSync(path2, constants.O_WRONLY | constants.O_SYMLINK, mode);
      var threw = true;
      var ret;
      try {
        ret = fs22.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs22.closeSync(fd);
          } catch (er) {
          }
        } else {
          fs22.closeSync(fd);
        }
      }
      return ret;
    };
  }
  function patchLutimes(fs22) {
    if (constants.hasOwnProperty("O_SYMLINK") && fs22.futimes) {
      fs22.lutimes = function(path2, at, mt, cb) {
        fs22.open(path2, constants.O_SYMLINK, function(er, fd) {
          if (er) {
            if (cb) cb(er);
            return;
          }
          fs22.futimes(fd, at, mt, function(er2) {
            fs22.close(fd, function(er22) {
              if (cb) cb(er2 || er22);
            });
          });
        });
      };
      fs22.lutimesSync = function(path2, at, mt) {
        var fd = fs22.openSync(path2, constants.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs22.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs22.closeSync(fd);
            } catch (er) {
            }
          } else {
            fs22.closeSync(fd);
          }
        }
        return ret;
      };
    } else if (fs22.futimes) {
      fs22.lutimes = function(_a, _b, _c, cb) {
        if (cb) process.nextTick(cb);
      };
      fs22.lutimesSync = function() {
      };
    }
  }
  function chmodFix(orig) {
    if (!orig) return orig;
    return function(target, mode, cb) {
      return orig.call(fs2, target, mode, function(er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      });
    };
  }
  function chmodFixSync(orig) {
    if (!orig) return orig;
    return function(target, mode) {
      try {
        return orig.call(fs2, target, mode);
      } catch (er) {
        if (!chownErOk(er)) throw er;
      }
    };
  }
  function chownFix(orig) {
    if (!orig) return orig;
    return function(target, uid, gid, cb) {
      return orig.call(fs2, target, uid, gid, function(er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      });
    };
  }
  function chownFixSync(orig) {
    if (!orig) return orig;
    return function(target, uid, gid) {
      try {
        return orig.call(fs2, target, uid, gid);
      } catch (er) {
        if (!chownErOk(er)) throw er;
      }
    };
  }
  function statFix(orig) {
    if (!orig) return orig;
    return function(target, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = null;
      }
      function callback(er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 4294967296;
          if (stats.gid < 0) stats.gid += 4294967296;
        }
        if (cb) cb.apply(this, arguments);
      }
      return options ? orig.call(fs2, target, options, callback) : orig.call(fs2, target, callback);
    };
  }
  function statFixSync(orig) {
    if (!orig) return orig;
    return function(target, options) {
      var stats = options ? orig.call(fs2, target, options) : orig.call(fs2, target);
      if (stats) {
        if (stats.uid < 0) stats.uid += 4294967296;
        if (stats.gid < 0) stats.gid += 4294967296;
      }
      return stats;
    };
  }
  function chownErOk(er) {
    if (!er)
      return true;
    if (er.code === "ENOSYS")
      return true;
    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true;
    }
    return false;
  }
}
var Stream = require$$0$1.Stream;
var legacyStreams = legacy$1;
function legacy$1(fs2) {
  return {
    ReadStream,
    WriteStream
  };
  function ReadStream(path2, options) {
    if (!(this instanceof ReadStream)) return new ReadStream(path2, options);
    Stream.call(this);
    var self2 = this;
    this.path = path2;
    this.fd = null;
    this.readable = true;
    this.paused = false;
    this.flags = "r";
    this.mode = 438;
    this.bufferSize = 64 * 1024;
    options = options || {};
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }
    if (this.encoding) this.setEncoding(this.encoding);
    if (this.start !== void 0) {
      if ("number" !== typeof this.start) {
        throw TypeError("start must be a Number");
      }
      if (this.end === void 0) {
        this.end = Infinity;
      } else if ("number" !== typeof this.end) {
        throw TypeError("end must be a Number");
      }
      if (this.start > this.end) {
        throw new Error("start must be <= end");
      }
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        self2._read();
      });
      return;
    }
    fs2.open(this.path, this.flags, this.mode, function(err, fd) {
      if (err) {
        self2.emit("error", err);
        self2.readable = false;
        return;
      }
      self2.fd = fd;
      self2.emit("open", fd);
      self2._read();
    });
  }
  function WriteStream(path2, options) {
    if (!(this instanceof WriteStream)) return new WriteStream(path2, options);
    Stream.call(this);
    this.path = path2;
    this.fd = null;
    this.writable = true;
    this.flags = "w";
    this.encoding = "binary";
    this.mode = 438;
    this.bytesWritten = 0;
    options = options || {};
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }
    if (this.start !== void 0) {
      if ("number" !== typeof this.start) {
        throw TypeError("start must be a Number");
      }
      if (this.start < 0) {
        throw new Error("start must be >= zero");
      }
      this.pos = this.start;
    }
    this.busy = false;
    this._queue = [];
    if (this.fd === null) {
      this._open = fs2.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
      this.flush();
    }
  }
}
var clone_1 = clone$1;
var getPrototypeOf = Object.getPrototypeOf || function(obj) {
  return obj.__proto__;
};
function clone$1(obj) {
  if (obj === null || typeof obj !== "object")
    return obj;
  if (obj instanceof Object)
    var copy2 = { __proto__: getPrototypeOf(obj) };
  else
    var copy2 = /* @__PURE__ */ Object.create(null);
  Object.getOwnPropertyNames(obj).forEach(function(key) {
    Object.defineProperty(copy2, key, Object.getOwnPropertyDescriptor(obj, key));
  });
  return copy2;
}
var fs$2 = require$$0$2;
var polyfills = polyfills$1;
var legacy = legacyStreams;
var clone = clone_1;
var util = require$$4;
var gracefulQueue;
var previousSymbol;
if (typeof Symbol === "function" && typeof Symbol.for === "function") {
  gracefulQueue = Symbol.for("graceful-fs.queue");
  previousSymbol = Symbol.for("graceful-fs.previous");
} else {
  gracefulQueue = "___graceful-fs.queue";
  previousSymbol = "___graceful-fs.previous";
}
function noop() {
}
function publishQueue(context, queue2) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue2;
    }
  });
}
var debug = noop;
if (util.debuglog)
  debug = util.debuglog("gfs4");
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
  debug = function() {
    var m = util.format.apply(util, arguments);
    m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
    console.error(m);
  };
if (!fs$2[gracefulQueue]) {
  var queue = commonjsGlobal[gracefulQueue] || [];
  publishQueue(fs$2, queue);
  fs$2.close = function(fs$close) {
    function close(fd, cb) {
      return fs$close.call(fs$2, fd, function(err) {
        if (!err) {
          resetQueue();
        }
        if (typeof cb === "function")
          cb.apply(this, arguments);
      });
    }
    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close;
  }(fs$2.close);
  fs$2.closeSync = function(fs$closeSync) {
    function closeSync(fd) {
      fs$closeSync.apply(fs$2, arguments);
      resetQueue();
    }
    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
    return closeSync;
  }(fs$2.closeSync);
  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
    process.on("exit", function() {
      debug(fs$2[gracefulQueue]);
      require$$5.equal(fs$2[gracefulQueue].length, 0);
    });
  }
}
if (!commonjsGlobal[gracefulQueue]) {
  publishQueue(commonjsGlobal, fs$2[gracefulQueue]);
}
var gracefulFs = patch(clone(fs$2));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$2.__patched) {
  gracefulFs = patch(fs$2);
  fs$2.__patched = true;
}
function patch(fs2) {
  polyfills(fs2);
  fs2.gracefulify = patch;
  fs2.createReadStream = createReadStream;
  fs2.createWriteStream = createWriteStream;
  var fs$readFile = fs2.readFile;
  fs2.readFile = readFile;
  function readFile(path2, options, cb) {
    if (typeof options === "function")
      cb = options, options = null;
    return go$readFile(path2, options, cb);
    function go$readFile(path22, options2, cb2, startTime) {
      return fs$readFile(path22, options2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$readFile, [path22, options2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$writeFile = fs2.writeFile;
  fs2.writeFile = writeFile;
  function writeFile(path2, data, options, cb) {
    if (typeof options === "function")
      cb = options, options = null;
    return go$writeFile(path2, data, options, cb);
    function go$writeFile(path22, data2, options2, cb2, startTime) {
      return fs$writeFile(path22, data2, options2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$writeFile, [path22, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$appendFile = fs2.appendFile;
  if (fs$appendFile)
    fs2.appendFile = appendFile;
  function appendFile(path2, data, options, cb) {
    if (typeof options === "function")
      cb = options, options = null;
    return go$appendFile(path2, data, options, cb);
    function go$appendFile(path22, data2, options2, cb2, startTime) {
      return fs$appendFile(path22, data2, options2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$appendFile, [path22, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$copyFile = fs2.copyFile;
  if (fs$copyFile)
    fs2.copyFile = copyFile;
  function copyFile(src, dest, flags, cb) {
    if (typeof flags === "function") {
      cb = flags;
      flags = 0;
    }
    return go$copyFile(src, dest, flags, cb);
    function go$copyFile(src2, dest2, flags2, cb2, startTime) {
      return fs$copyFile(src2, dest2, flags2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$readdir = fs2.readdir;
  fs2.readdir = readdir;
  var noReaddirOptionVersions = /^v[0-5]\./;
  function readdir(path2, options, cb) {
    if (typeof options === "function")
      cb = options, options = null;
    var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path22, options2, cb2, startTime) {
      return fs$readdir(path22, fs$readdirCallback(
        path22,
        options2,
        cb2,
        startTime
      ));
    } : function go$readdir2(path22, options2, cb2, startTime) {
      return fs$readdir(path22, options2, fs$readdirCallback(
        path22,
        options2,
        cb2,
        startTime
      ));
    };
    return go$readdir(path2, options, cb);
    function fs$readdirCallback(path22, options2, cb2, startTime) {
      return function(err, files) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([
            go$readdir,
            [path22, options2, cb2],
            err,
            startTime || Date.now(),
            Date.now()
          ]);
        else {
          if (files && files.sort)
            files.sort();
          if (typeof cb2 === "function")
            cb2.call(this, err, files);
        }
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var legStreams = legacy(fs2);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }
  var fs$ReadStream = fs2.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }
  var fs$WriteStream = fs2.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }
  Object.defineProperty(fs2, "ReadStream", {
    get: function() {
      return ReadStream;
    },
    set: function(val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(fs2, "WriteStream", {
    get: function() {
      return WriteStream;
    },
    set: function(val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileReadStream = ReadStream;
  Object.defineProperty(fs2, "FileReadStream", {
    get: function() {
      return FileReadStream;
    },
    set: function(val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileWriteStream = WriteStream;
  Object.defineProperty(fs2, "FileWriteStream", {
    get: function() {
      return FileWriteStream;
    },
    set: function(val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });
  function ReadStream(path2, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this;
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
  }
  function ReadStream$open() {
    var that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();
        that.emit("error", err);
      } else {
        that.fd = fd;
        that.emit("open", fd);
        that.read();
      }
    });
  }
  function WriteStream(path2, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this;
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
  }
  function WriteStream$open() {
    var that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
      if (err) {
        that.destroy();
        that.emit("error", err);
      } else {
        that.fd = fd;
        that.emit("open", fd);
      }
    });
  }
  function createReadStream(path2, options) {
    return new fs2.ReadStream(path2, options);
  }
  function createWriteStream(path2, options) {
    return new fs2.WriteStream(path2, options);
  }
  var fs$open = fs2.open;
  fs2.open = open;
  function open(path2, flags, mode, cb) {
    if (typeof mode === "function")
      cb = mode, mode = null;
    return go$open(path2, flags, mode, cb);
    function go$open(path22, flags2, mode2, cb2, startTime) {
      return fs$open(path22, flags2, mode2, function(err, fd) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$open, [path22, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  return fs2;
}
function enqueue(elem) {
  debug("ENQUEUE", elem[0].name, elem[1]);
  fs$2[gracefulQueue].push(elem);
  retry$3();
}
var retryTimer;
function resetQueue() {
  var now = Date.now();
  for (var i = 0; i < fs$2[gracefulQueue].length; ++i) {
    if (fs$2[gracefulQueue][i].length > 2) {
      fs$2[gracefulQueue][i][3] = now;
      fs$2[gracefulQueue][i][4] = now;
    }
  }
  retry$3();
}
function retry$3() {
  clearTimeout(retryTimer);
  retryTimer = void 0;
  if (fs$2[gracefulQueue].length === 0)
    return;
  var elem = fs$2[gracefulQueue].shift();
  var fn = elem[0];
  var args = elem[1];
  var err = elem[2];
  var startTime = elem[3];
  var lastTime = elem[4];
  if (startTime === void 0) {
    debug("RETRY", fn.name, args);
    fn.apply(null, args);
  } else if (Date.now() - startTime >= 6e4) {
    debug("TIMEOUT", fn.name, args);
    var cb = args.pop();
    if (typeof cb === "function")
      cb.call(null, err);
  } else {
    var sinceAttempt = Date.now() - lastTime;
    var sinceStart = Math.max(lastTime - startTime, 1);
    var desiredDelay = Math.min(sinceStart * 1.2, 100);
    if (sinceAttempt >= desiredDelay) {
      debug("RETRY", fn.name, args);
      fn.apply(null, args.concat([startTime]));
    } else {
      fs$2[gracefulQueue].push(elem);
    }
  }
  if (retryTimer === void 0) {
    retryTimer = setTimeout(retry$3, 0);
  }
}
var retry$2 = {};
function RetryOperation(timeouts, options) {
  if (typeof options === "boolean") {
    options = { forever: options };
  }
  this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
  this._timeouts = timeouts;
  this._options = options || {};
  this._maxRetryTime = options && options.maxRetryTime || Infinity;
  this._fn = null;
  this._errors = [];
  this._attempts = 1;
  this._operationTimeout = null;
  this._operationTimeoutCb = null;
  this._timeout = null;
  this._operationStart = null;
  if (this._options.forever) {
    this._cachedTimeouts = this._timeouts.slice(0);
  }
}
var retry_operation = RetryOperation;
RetryOperation.prototype.reset = function() {
  this._attempts = 1;
  this._timeouts = this._originalTimeouts;
};
RetryOperation.prototype.stop = function() {
  if (this._timeout) {
    clearTimeout(this._timeout);
  }
  this._timeouts = [];
  this._cachedTimeouts = null;
};
RetryOperation.prototype.retry = function(err) {
  if (this._timeout) {
    clearTimeout(this._timeout);
  }
  if (!err) {
    return false;
  }
  var currentTime = (/* @__PURE__ */ new Date()).getTime();
  if (err && currentTime - this._operationStart >= this._maxRetryTime) {
    this._errors.unshift(new Error("RetryOperation timeout occurred"));
    return false;
  }
  this._errors.push(err);
  var timeout = this._timeouts.shift();
  if (timeout === void 0) {
    if (this._cachedTimeouts) {
      this._errors.splice(this._errors.length - 1, this._errors.length);
      this._timeouts = this._cachedTimeouts.slice(0);
      timeout = this._timeouts.shift();
    } else {
      return false;
    }
  }
  var self2 = this;
  var timer = setTimeout(function() {
    self2._attempts++;
    if (self2._operationTimeoutCb) {
      self2._timeout = setTimeout(function() {
        self2._operationTimeoutCb(self2._attempts);
      }, self2._operationTimeout);
      if (self2._options.unref) {
        self2._timeout.unref();
      }
    }
    self2._fn(self2._attempts);
  }, timeout);
  if (this._options.unref) {
    timer.unref();
  }
  return true;
};
RetryOperation.prototype.attempt = function(fn, timeoutOps) {
  this._fn = fn;
  if (timeoutOps) {
    if (timeoutOps.timeout) {
      this._operationTimeout = timeoutOps.timeout;
    }
    if (timeoutOps.cb) {
      this._operationTimeoutCb = timeoutOps.cb;
    }
  }
  var self2 = this;
  if (this._operationTimeoutCb) {
    this._timeout = setTimeout(function() {
      self2._operationTimeoutCb();
    }, self2._operationTimeout);
  }
  this._operationStart = (/* @__PURE__ */ new Date()).getTime();
  this._fn(this._attempts);
};
RetryOperation.prototype.try = function(fn) {
  console.log("Using RetryOperation.try() is deprecated");
  this.attempt(fn);
};
RetryOperation.prototype.start = function(fn) {
  console.log("Using RetryOperation.start() is deprecated");
  this.attempt(fn);
};
RetryOperation.prototype.start = RetryOperation.prototype.try;
RetryOperation.prototype.errors = function() {
  return this._errors;
};
RetryOperation.prototype.attempts = function() {
  return this._attempts;
};
RetryOperation.prototype.mainError = function() {
  if (this._errors.length === 0) {
    return null;
  }
  var counts = {};
  var mainError = null;
  var mainErrorCount = 0;
  for (var i = 0; i < this._errors.length; i++) {
    var error = this._errors[i];
    var message = error.message;
    var count = (counts[message] || 0) + 1;
    counts[message] = count;
    if (count >= mainErrorCount) {
      mainError = error;
      mainErrorCount = count;
    }
  }
  return mainError;
};
(function(exports$1) {
  var RetryOperation2 = retry_operation;
  exports$1.operation = function(options) {
    var timeouts = exports$1.timeouts(options);
    return new RetryOperation2(timeouts, {
      forever: options && options.forever,
      unref: options && options.unref,
      maxRetryTime: options && options.maxRetryTime
    });
  };
  exports$1.timeouts = function(options) {
    if (options instanceof Array) {
      return [].concat(options);
    }
    var opts = {
      retries: 10,
      factor: 2,
      minTimeout: 1 * 1e3,
      maxTimeout: Infinity,
      randomize: false
    };
    for (var key in options) {
      opts[key] = options[key];
    }
    if (opts.minTimeout > opts.maxTimeout) {
      throw new Error("minTimeout is greater than maxTimeout");
    }
    var timeouts = [];
    for (var i = 0; i < opts.retries; i++) {
      timeouts.push(this.createTimeout(i, opts));
    }
    if (options && options.forever && !timeouts.length) {
      timeouts.push(this.createTimeout(i, opts));
    }
    timeouts.sort(function(a, b) {
      return a - b;
    });
    return timeouts;
  };
  exports$1.createTimeout = function(attempt, opts) {
    var random = opts.randomize ? Math.random() + 1 : 1;
    var timeout = Math.round(random * opts.minTimeout * Math.pow(opts.factor, attempt));
    timeout = Math.min(timeout, opts.maxTimeout);
    return timeout;
  };
  exports$1.wrap = function(obj, options, methods) {
    if (options instanceof Array) {
      methods = options;
      options = null;
    }
    if (!methods) {
      methods = [];
      for (var key in obj) {
        if (typeof obj[key] === "function") {
          methods.push(key);
        }
      }
    }
    for (var i = 0; i < methods.length; i++) {
      var method = methods[i];
      var original = obj[method];
      obj[method] = function retryWrapper(original2) {
        var op = exports$1.operation(options);
        var args = Array.prototype.slice.call(arguments, 1);
        var callback = args.pop();
        args.push(function(err) {
          if (op.retry(err)) {
            return;
          }
          if (err) {
            arguments[0] = op.mainError();
          }
          callback.apply(this, arguments);
        });
        op.attempt(function() {
          original2.apply(obj, args);
        });
      }.bind(obj, original);
      obj[method].options = options;
    }
  };
})(retry$2);
var retry$1 = retry$2;
var signalExit = { exports: {} };
var signals$1 = { exports: {} };
var hasRequiredSignals;
function requireSignals() {
  if (hasRequiredSignals) return signals$1.exports;
  hasRequiredSignals = 1;
  (function(module2) {
    module2.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module2.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module2.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  })(signals$1);
  return signals$1.exports;
}
var process$1 = commonjsGlobal.process;
const processOk = function(process2) {
  return process2 && typeof process2 === "object" && typeof process2.removeListener === "function" && typeof process2.emit === "function" && typeof process2.reallyExit === "function" && typeof process2.listeners === "function" && typeof process2.kill === "function" && typeof process2.pid === "number" && typeof process2.on === "function";
};
if (!processOk(process$1)) {
  signalExit.exports = function() {
    return function() {
    };
  };
} else {
  var assert = require$$5;
  var signals = requireSignals();
  var isWin = /^win/i.test(process$1.platform);
  var EE = require$$2;
  if (typeof EE !== "function") {
    EE = EE.EventEmitter;
  }
  var emitter;
  if (process$1.__signal_exit_emitter__) {
    emitter = process$1.__signal_exit_emitter__;
  } else {
    emitter = process$1.__signal_exit_emitter__ = new EE();
    emitter.count = 0;
    emitter.emitted = {};
  }
  if (!emitter.infinite) {
    emitter.setMaxListeners(Infinity);
    emitter.infinite = true;
  }
  signalExit.exports = function(cb, opts) {
    if (!processOk(commonjsGlobal.process)) {
      return function() {
      };
    }
    assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
    if (loaded === false) {
      load();
    }
    var ev = "exit";
    if (opts && opts.alwaysLast) {
      ev = "afterexit";
    }
    var remove = function() {
      emitter.removeListener(ev, cb);
      if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
        unload();
      }
    };
    emitter.on(ev, cb);
    return remove;
  };
  var unload = function unload2() {
    if (!loaded || !processOk(commonjsGlobal.process)) {
      return;
    }
    loaded = false;
    signals.forEach(function(sig) {
      try {
        process$1.removeListener(sig, sigListeners[sig]);
      } catch (er) {
      }
    });
    process$1.emit = originalProcessEmit;
    process$1.reallyExit = originalProcessReallyExit;
    emitter.count -= 1;
  };
  signalExit.exports.unload = unload;
  var emit = function emit2(event, code, signal) {
    if (emitter.emitted[event]) {
      return;
    }
    emitter.emitted[event] = true;
    emitter.emit(event, code, signal);
  };
  var sigListeners = {};
  signals.forEach(function(sig) {
    sigListeners[sig] = function listener() {
      if (!processOk(commonjsGlobal.process)) {
        return;
      }
      var listeners = process$1.listeners(sig);
      if (listeners.length === emitter.count) {
        unload();
        emit("exit", null, sig);
        emit("afterexit", null, sig);
        if (isWin && sig === "SIGHUP") {
          sig = "SIGINT";
        }
        process$1.kill(process$1.pid, sig);
      }
    };
  });
  signalExit.exports.signals = function() {
    return signals;
  };
  var loaded = false;
  var load = function load2() {
    if (loaded || !processOk(commonjsGlobal.process)) {
      return;
    }
    loaded = true;
    emitter.count += 1;
    signals = signals.filter(function(sig) {
      try {
        process$1.on(sig, sigListeners[sig]);
        return true;
      } catch (er) {
        return false;
      }
    });
    process$1.emit = processEmit;
    process$1.reallyExit = processReallyExit;
  };
  signalExit.exports.load = load;
  var originalProcessReallyExit = process$1.reallyExit;
  var processReallyExit = function processReallyExit2(code) {
    if (!processOk(commonjsGlobal.process)) {
      return;
    }
    process$1.exitCode = code || /* istanbul ignore next */
    0;
    emit("exit", process$1.exitCode, null);
    emit("afterexit", process$1.exitCode, null);
    originalProcessReallyExit.call(process$1, process$1.exitCode);
  };
  var originalProcessEmit = process$1.emit;
  var processEmit = function processEmit2(ev, arg) {
    if (ev === "exit" && processOk(commonjsGlobal.process)) {
      if (arg !== void 0) {
        process$1.exitCode = arg;
      }
      var ret = originalProcessEmit.apply(this, arguments);
      emit("exit", process$1.exitCode, null);
      emit("afterexit", process$1.exitCode, null);
      return ret;
    } else {
      return originalProcessEmit.apply(this, arguments);
    }
  };
}
var signalExitExports = signalExit.exports;
var mtimePrecision$1 = {};
const cacheSymbol = Symbol();
function probe(file, fs2, callback) {
  const cachedPrecision = fs2[cacheSymbol];
  if (cachedPrecision) {
    return fs2.stat(file, (err, stat) => {
      if (err) {
        return callback(err);
      }
      callback(null, stat.mtime, cachedPrecision);
    });
  }
  const mtime = new Date(Math.ceil(Date.now() / 1e3) * 1e3 + 5);
  fs2.utimes(file, mtime, mtime, (err) => {
    if (err) {
      return callback(err);
    }
    fs2.stat(file, (err2, stat) => {
      if (err2) {
        return callback(err2);
      }
      const precision = stat.mtime.getTime() % 1e3 === 0 ? "s" : "ms";
      Object.defineProperty(fs2, cacheSymbol, { value: precision });
      callback(null, stat.mtime, precision);
    });
  });
}
function getMtime(precision) {
  let now = Date.now();
  if (precision === "s") {
    now = Math.ceil(now / 1e3) * 1e3;
  }
  return new Date(now);
}
mtimePrecision$1.probe = probe;
mtimePrecision$1.getMtime = getMtime;
const path = require$$0$3;
const fs$1 = gracefulFs;
const retry = retry$1;
const onExit = signalExitExports;
const mtimePrecision = mtimePrecision$1;
const locks = {};
function getLockFile(file, options) {
  return options.lockfilePath || `${file}.lock`;
}
function resolveCanonicalPath(file, options, callback) {
  if (!options.realpath) {
    return callback(null, path.resolve(file));
  }
  options.fs.realpath(file, callback);
}
function acquireLock(file, options, callback) {
  const lockfilePath = getLockFile(file, options);
  options.fs.mkdir(lockfilePath, (err) => {
    if (!err) {
      return mtimePrecision.probe(lockfilePath, options.fs, (err2, mtime, mtimePrecision2) => {
        if (err2) {
          options.fs.rmdir(lockfilePath, () => {
          });
          return callback(err2);
        }
        callback(null, mtime, mtimePrecision2);
      });
    }
    if (err.code !== "EEXIST") {
      return callback(err);
    }
    if (options.stale <= 0) {
      return callback(Object.assign(new Error("Lock file is already being held"), { code: "ELOCKED", file }));
    }
    options.fs.stat(lockfilePath, (err2, stat) => {
      if (err2) {
        if (err2.code === "ENOENT") {
          return acquireLock(file, { ...options, stale: 0 }, callback);
        }
        return callback(err2);
      }
      if (!isLockStale(stat, options)) {
        return callback(Object.assign(new Error("Lock file is already being held"), { code: "ELOCKED", file }));
      }
      removeLock(file, options, (err3) => {
        if (err3) {
          return callback(err3);
        }
        acquireLock(file, { ...options, stale: 0 }, callback);
      });
    });
  });
}
function isLockStale(stat, options) {
  return stat.mtime.getTime() < Date.now() - options.stale;
}
function removeLock(file, options, callback) {
  options.fs.rmdir(getLockFile(file, options), (err) => {
    if (err && err.code !== "ENOENT") {
      return callback(err);
    }
    callback();
  });
}
function updateLock(file, options) {
  const lock2 = locks[file];
  if (lock2.updateTimeout) {
    return;
  }
  lock2.updateDelay = lock2.updateDelay || options.update;
  lock2.updateTimeout = setTimeout(() => {
    lock2.updateTimeout = null;
    options.fs.stat(lock2.lockfilePath, (err, stat) => {
      const isOverThreshold = lock2.lastUpdate + options.stale < Date.now();
      if (err) {
        if (err.code === "ENOENT" || isOverThreshold) {
          return setLockAsCompromised(file, lock2, Object.assign(err, { code: "ECOMPROMISED" }));
        }
        lock2.updateDelay = 1e3;
        return updateLock(file, options);
      }
      const isMtimeOurs = lock2.mtime.getTime() === stat.mtime.getTime();
      if (!isMtimeOurs) {
        return setLockAsCompromised(
          file,
          lock2,
          Object.assign(
            new Error("Unable to update lock within the stale threshold"),
            { code: "ECOMPROMISED" }
          )
        );
      }
      const mtime = mtimePrecision.getMtime(lock2.mtimePrecision);
      options.fs.utimes(lock2.lockfilePath, mtime, mtime, (err2) => {
        const isOverThreshold2 = lock2.lastUpdate + options.stale < Date.now();
        if (lock2.released) {
          return;
        }
        if (err2) {
          if (err2.code === "ENOENT" || isOverThreshold2) {
            return setLockAsCompromised(file, lock2, Object.assign(err2, { code: "ECOMPROMISED" }));
          }
          lock2.updateDelay = 1e3;
          return updateLock(file, options);
        }
        lock2.mtime = mtime;
        lock2.lastUpdate = Date.now();
        lock2.updateDelay = null;
        updateLock(file, options);
      });
    });
  }, lock2.updateDelay);
  if (lock2.updateTimeout.unref) {
    lock2.updateTimeout.unref();
  }
}
function setLockAsCompromised(file, lock2, err) {
  lock2.released = true;
  if (lock2.updateTimeout) {
    clearTimeout(lock2.updateTimeout);
  }
  if (locks[file] === lock2) {
    delete locks[file];
  }
  lock2.options.onCompromised(err);
}
function lock$1(file, options, callback) {
  options = {
    stale: 1e4,
    update: null,
    realpath: true,
    retries: 0,
    fs: fs$1,
    onCompromised: (err) => {
      throw err;
    },
    ...options
  };
  options.retries = options.retries || 0;
  options.retries = typeof options.retries === "number" ? { retries: options.retries } : options.retries;
  options.stale = Math.max(options.stale || 0, 2e3);
  options.update = options.update == null ? options.stale / 2 : options.update || 0;
  options.update = Math.max(Math.min(options.update, options.stale / 2), 1e3);
  resolveCanonicalPath(file, options, (err, file2) => {
    if (err) {
      return callback(err);
    }
    const operation = retry.operation(options.retries);
    operation.attempt(() => {
      acquireLock(file2, options, (err2, mtime, mtimePrecision2) => {
        if (operation.retry(err2)) {
          return;
        }
        if (err2) {
          return callback(operation.mainError());
        }
        const lock2 = locks[file2] = {
          lockfilePath: getLockFile(file2, options),
          mtime,
          mtimePrecision: mtimePrecision2,
          options,
          lastUpdate: Date.now()
        };
        updateLock(file2, options);
        callback(null, (releasedCallback) => {
          if (lock2.released) {
            return releasedCallback && releasedCallback(Object.assign(new Error("Lock is already released"), { code: "ERELEASED" }));
          }
          unlock$1(file2, { ...options, realpath: false }, releasedCallback);
        });
      });
    });
  });
}
function unlock$1(file, options, callback) {
  options = {
    fs: fs$1,
    realpath: true,
    ...options
  };
  resolveCanonicalPath(file, options, (err, file2) => {
    if (err) {
      return callback(err);
    }
    const lock2 = locks[file2];
    if (!lock2) {
      return callback(Object.assign(new Error("Lock is not acquired/owned by you"), { code: "ENOTACQUIRED" }));
    }
    lock2.updateTimeout && clearTimeout(lock2.updateTimeout);
    lock2.released = true;
    delete locks[file2];
    removeLock(file2, options, callback);
  });
}
function check$1(file, options, callback) {
  options = {
    stale: 1e4,
    realpath: true,
    fs: fs$1,
    ...options
  };
  options.stale = Math.max(options.stale || 0, 2e3);
  resolveCanonicalPath(file, options, (err, file2) => {
    if (err) {
      return callback(err);
    }
    options.fs.stat(getLockFile(file2, options), (err2, stat) => {
      if (err2) {
        return err2.code === "ENOENT" ? callback(null, false) : callback(err2);
      }
      return callback(null, !isLockStale(stat, options));
    });
  });
}
function getLocks() {
  return locks;
}
onExit(() => {
  for (const file in locks) {
    const options = locks[file].options;
    try {
      options.fs.rmdirSync(getLockFile(file, options));
    } catch (e) {
    }
  }
});
lockfile$2.lock = lock$1;
lockfile$2.unlock = unlock$1;
lockfile$2.check = check$1;
lockfile$2.getLocks = getLocks;
const fs = gracefulFs;
function createSyncFs(fs2) {
  const methods = ["mkdir", "realpath", "stat", "rmdir", "utimes"];
  const newFs = { ...fs2 };
  methods.forEach((method) => {
    newFs[method] = (...args) => {
      const callback = args.pop();
      let ret;
      try {
        ret = fs2[`${method}Sync`](...args);
      } catch (err) {
        return callback(err);
      }
      callback(null, ret);
    };
  });
  return newFs;
}
function toPromise$1(method) {
  return (...args) => new Promise((resolve, reject) => {
    args.push((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
    method(...args);
  });
}
function toSync$1(method) {
  return (...args) => {
    let err;
    let result;
    args.push((_err, _result) => {
      err = _err;
      result = _result;
    });
    method(...args);
    if (err) {
      throw err;
    }
    return result;
  };
}
function toSyncOptions$1(options) {
  options = { ...options };
  options.fs = createSyncFs(options.fs || fs);
  if (typeof options.retries === "number" && options.retries > 0 || options.retries && typeof options.retries.retries === "number" && options.retries.retries > 0) {
    throw Object.assign(new Error("Cannot use retries with the sync api"), { code: "ESYNC" });
  }
  return options;
}
var adapter = {
  toPromise: toPromise$1,
  toSync: toSync$1,
  toSyncOptions: toSyncOptions$1
};
const lockfile = lockfile$2;
const { toPromise, toSync, toSyncOptions } = adapter;
async function lock(file, options) {
  const release = await toPromise(lockfile.lock)(file, options);
  return toPromise(release);
}
function lockSync(file, options) {
  const release = toSync(lockfile.lock)(file, toSyncOptions(options));
  return toSync(release);
}
function unlock(file, options) {
  return toPromise(lockfile.unlock)(file, options);
}
function unlockSync(file, options) {
  return toSync(lockfile.unlock)(file, toSyncOptions(options));
}
function check(file, options) {
  return toPromise(lockfile.check)(file, options);
}
function checkSync(file, options) {
  return toSync(lockfile.check)(file, toSyncOptions(options));
}
properLockfile.exports = lock;
properLockfile.exports.lock = lock;
properLockfile.exports.unlock = unlock;
properLockfile.exports.lockSync = lockSync;
properLockfile.exports.unlockSync = unlockSync;
properLockfile.exports.check = check;
properLockfile.exports.checkSync = checkSync;
var properLockfileExports = properLockfile.exports;
const lockfile$1 = /* @__PURE__ */ getDefaultExportFromCjs(properLockfileExports);
const ServerOriginSchema = zod.z.object({
  source: zod.z.enum(["manual", "registry", "import", "builtin"]).default("manual"),
  client: zod.z.string().default(""),
  registry_id: zod.z.string().default(""),
  timestamp: zod.z.string().default(""),
  trust_tier: zod.z.enum(["official", "community", "local"]).default("local")
});
const ToolInfoSchema = zod.z.object({
  name: zod.z.string(),
  description: zod.z.string().default("")
});
const ServerSchema = zod.z.object({
  name: zod.z.string(),
  enabled: zod.z.boolean().default(true),
  transport: zod.z.enum(["stdio", "http", "sse", "streamable-http"]).default("stdio"),
  command: zod.z.string().default(""),
  args: zod.z.array(zod.z.string()).default([]),
  env: zod.z.record(zod.z.string()).default({}),
  // HTTP transport fields
  url: zod.z.string().default(""),
  auth_type: zod.z.enum(["", "bearer", "api-key", "header"]).default(""),
  auth_ref: zod.z.string().default(""),
  // Provenance
  origin: ServerOriginSchema.default({}),
  // Tool metadata
  tools: zod.z.array(ToolInfoSchema).default([]),
  // Notes & description (v2.0.3 #server-model-fields)
  // `description` is source-owned (auto-populated from upstream registry metadata,
  // refreshed on re-import). `userNotes` is user-owned freeform text that
  // re-import never touches. `lastDescriptionHash` lets doctor surface
  // "descriptions refreshed" findings on re-import.
  description: zod.z.string().optional(),
  userNotes: zod.z.string().optional(),
  lastDescriptionHash: zod.z.string().optional()
});
const PluginSchema = zod.z.object({
  name: zod.z.string(),
  marketplace: zod.z.string().default(""),
  enabled: zod.z.boolean().default(true),
  managed: zod.z.boolean().default(true),
  // Notes & description (v2.0.3 #plugin-model-fields)
  description: zod.z.string().optional(),
  userNotes: zod.z.string().optional(),
  lastDescriptionHash: zod.z.string().optional()
});
const MarketplaceSourceSchema = zod.z.object({
  source: zod.z.enum(["github", "directory", "git", "url"]),
  repo: zod.z.string().default(""),
  path: zod.z.string().default(""),
  url: zod.z.string().default("")
});
const MarketplaceSchema = zod.z.object({
  name: zod.z.string(),
  source: MarketplaceSourceSchema.default({ source: "directory" })
});
const SkillSchema = zod.z.object({
  name: zod.z.string(),
  enabled: zod.z.boolean().default(true),
  // Source-owned (v2.0.3 #skill-model-fields): description comes from SKILL.md
  // frontmatter and is overwritten on re-import.
  description: zod.z.string().default(""),
  path: zod.z.string().default(""),
  origin: zod.z.string().default(""),
  dependencies: zod.z.array(zod.z.string()).default([]),
  tags: zod.z.array(zod.z.string()).default([]),
  mode: zod.z.enum(["pin", "track"]).default("pin"),
  // Notes & description hash (v2.0.3)
  userNotes: zod.z.string().optional(),
  lastDescriptionHash: zod.z.string().optional()
});
const AgentSchema = zod.z.object({
  name: zod.z.string().min(1),
  enabled: zod.z.boolean().default(true),
  description: zod.z.string().default(""),
  /** Optional restriction on which tools the agent may call. Empty = all. */
  tools: zod.z.array(zod.z.string()).default([]),
  /** Optional model override for this agent. */
  model: zod.z.string().optional(),
  /** Filesystem path of the canonical library copy. */
  path: zod.z.string().default(""),
  /** Free-form operator-owned notes (never round-tripped to fan-out). */
  userNotes: zod.z.string().optional(),
  /** SHA-256 of the last imported description — powers re-import drift checks. */
  lastDescriptionHash: zod.z.string().optional()
});
const CommandSchema = zod.z.object({
  name: zod.z.string().min(1),
  enabled: zod.z.boolean().default(true),
  description: zod.z.string().default(""),
  /** Optional Claude Code tool allowlist. Empty array = inherit. */
  allowedTools: zod.z.array(zod.z.string()).default([]),
  /** Optional short argument hint rendered at completion time. */
  argumentHint: zod.z.string().optional(),
  /** Filesystem path of the canonical library copy. */
  path: zod.z.string().default(""),
  /** Free-form operator-owned notes (never round-tripped to fan-out). */
  userNotes: zod.z.string().optional(),
  /** SHA-256 of the last imported description — powers re-import drift checks. */
  lastDescriptionHash: zod.z.string().optional()
});
const GroupSchema = zod.z.object({
  name: zod.z.string(),
  description: zod.z.string().default(""),
  servers: zod.z.array(zod.z.string()).default([]),
  plugins: zod.z.array(zod.z.string()).default([]),
  skills: zod.z.array(zod.z.string()).default([])
});
const PathRuleSchema = zod.z.object({
  path: zod.z.string(),
  group: zod.z.string()
});
zod.z.object({
  path: zod.z.string(),
  group: zod.z.string().nullable().default(null),
  last_synced: zod.z.string().nullable().default(null)
});
const ClientAssignmentSchema = zod.z.object({
  id: zod.z.string(),
  group: zod.z.string().nullable().default(null),
  last_synced: zod.z.string().nullable().default(null),
  projects: zod.z.record(zod.z.object({
    group: zod.z.string().nullable().default(null),
    last_synced: zod.z.string().nullable().default(null)
  })).default({}),
  server_hashes: zod.z.record(zod.z.string()).default({})
});
const SettingsSchema = zod.z.object({
  adopt_unmanaged_plugins: zod.z.boolean().default(false),
  registry_cache_ttl: zod.z.number().default(3600),
  sync_cost_warning_threshold: zod.z.number().default(50),
  usage_tracking: zod.z.boolean().default(false),
  // v2.0.1 safe-apply: how many days of snapshots to keep before pruning.
  // 0 disables pruning.
  snapshot_retention_days: zod.z.number().int().min(0).default(30),
  // v2.0.1 doctor: the size (in MB) at which doctor warns that the snapshot
  // dir has grown unreasonably. Nudges the user toward a retention sweep.
  // Default 500 MB; 0 disables the check.
  snapshot_dir_size_warn_mb: zod.z.number().int().min(0).default(500)
});
const HookEventSchema = zod.z.enum([
  "PreToolUse",
  "PostToolUse",
  "SessionStart",
  "UserPromptSubmit",
  "PreCompact",
  "Stop",
  "Notification"
]);
const HookSchema = zod.z.object({
  name: zod.z.string().min(1),
  event: HookEventSchema,
  matcher: zod.z.string().min(1),
  command: zod.z.string().min(1),
  // description is auto-computed on serialize (not stored in the library JSON)
  description: zod.z.string().optional(),
  userNotes: zod.z.string().optional()
});
zod.z.object({
  keyPath: zod.z.string().min(1),
  value: zod.z.unknown(),
  userNotes: zod.z.string().optional()
});
const SnapshotFileEntrySchema = zod.z.object({
  /** Absolute path that was captured. */
  path: zod.z.string(),
  /** "existing" means the file had content pre-sync and preContentPath points to its snapshot copy.
   *  "new-file" means the file did not exist pre-sync and rollback must delete it. */
  state: zod.z.enum(["existing", "new-file"]),
  /** Path (relative to the snapshot dir) to the verbatim pre-write copy of this file.
   *  Only set when state === "existing". */
  preContentPath: zod.z.string().optional()
});
const SnapshotSchema = zod.z.object({
  /** Stable snapshot id: "<iso-timestamp>-<hash6>". Used as the directory name. */
  id: zod.z.string(),
  /** ISO-8601 timestamp when the snapshot was captured. */
  createdAt: zod.z.string(),
  /** Optional free-form label describing why the snapshot was taken
   *  (e.g., "sync claude-code", "hook add lint"). */
  syncContext: zod.z.string().optional(),
  /** One entry per captured file. */
  files: zod.z.array(SnapshotFileEntrySchema)
});
const ProfileSchema = zod.z.object({
  name: zod.z.string(),
  clients: zod.z.array(ClientAssignmentSchema).default([]),
  rules: zod.z.array(PathRuleSchema).default([]),
  settings: SettingsSchema.default({}),
  createdAt: zod.z.string().default("")
});
const EnsembleConfigSchema = zod.z.object({
  servers: zod.z.array(ServerSchema).default([]),
  groups: zod.z.array(GroupSchema).default([]),
  clients: zod.z.array(ClientAssignmentSchema).default([]),
  plugins: zod.z.array(PluginSchema).default([]),
  marketplaces: zod.z.array(MarketplaceSchema).default([]),
  rules: zod.z.array(PathRuleSchema).default([]),
  skills: zod.z.array(SkillSchema).default([]),
  /** Subagents (v2.0.1 #core-concepts). */
  agents: zod.z.array(AgentSchema).default([]),
  /** Slash commands (v2.0.1 #core-concepts). */
  commands: zod.z.array(CommandSchema).default([]),
  settings: SettingsSchema.default({}),
  profiles: zod.z.record(ProfileSchema).default({}),
  activeProfile: zod.z.string().nullable().default(null)
}).passthrough();
const RESERVED_MARKETPLACE_NAMES = /* @__PURE__ */ new Set([
  "claude-code-marketplace",
  "claude-code-plugins",
  "claude-plugins-official",
  "anthropic-marketplace",
  "anthropic-plugins",
  "agent-skills",
  "life-sciences"
]);
function qualifiedPluginName(plugin) {
  return plugin.marketplace ? `${plugin.name}@${plugin.marketplace}` : plugin.name;
}
const CONFIG_DIR = process.env.ENSEMBLE_CONFIG_DIR ?? node_path.join(node_os.homedir(), ".config", "ensemble");
const CONFIG_PATH = process.env.ENSEMBLE_CONFIG_PATH ?? node_path.join(CONFIG_DIR, "config.json");
const SKILLS_DIR = node_path.join(CONFIG_DIR, "skills");
const CACHE_DIR = node_path.join(CONFIG_DIR, "cache", "registry");
function createConfig() {
  return EnsembleConfigSchema.parse({});
}
function loadConfig(path2) {
  const configPath = CONFIG_PATH;
  if (!node_fs.existsSync(configPath)) {
    return createConfig();
  }
  const raw = node_fs.readFileSync(configPath, "utf-8");
  const data = JSON.parse(raw);
  return EnsembleConfigSchema.parse(data);
}
function saveConfig(config, path2) {
  const configPath = CONFIG_PATH;
  const dir = node_path.join(configPath, "..");
  node_fs.mkdirSync(dir, { recursive: true });
  const tmpPath = `${configPath}.tmp`;
  node_fs.writeFileSync(tmpPath, `${JSON.stringify(config, null, 2)}
`, "utf-8");
  let release;
  try {
    if (node_fs.existsSync(configPath)) {
      release = lockfile$1.lockSync(configPath);
    }
    node_fs.renameSync(tmpPath, configPath);
  } finally {
    release?.();
  }
}
function computeEntryHash(entry) {
  const filtered = {};
  for (const [k, v] of Object.entries(entry).sort()) {
    if (k !== "__ensemble" && k !== "__mcpoyle") {
      filtered[k] = v;
    }
  }
  return node_crypto.createHash("sha256").update(JSON.stringify(filtered, Object.keys(filtered).sort())).digest("hex");
}
function getServer(config, name) {
  return config.servers.find((s) => s.name === name);
}
function getGroup(config, name) {
  return config.groups.find((g) => g.name === name);
}
function getClient(config, clientId) {
  return config.clients.find((c) => c.id === clientId);
}
function getPlugin(config, name) {
  return config.plugins.find(
    (p) => p.name === name || (p.marketplace ? `${p.name}@${p.marketplace}` : p.name) === name
  );
}
function getSkill(config, name) {
  return config.skills.find((s) => s.name === name);
}
function getMarketplace(config, name) {
  return config.marketplaces.find((m) => m.name === name);
}
function matchRule(config, projectPath) {
  const resolved = projectPath.replace(/^~/, node_os.homedir());
  const matches = config.rules.filter((r) => {
    const prefix = r.path.replace(/^~/, node_os.homedir());
    const normalizedPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
    return resolved.startsWith(normalizedPrefix) || resolved === prefix;
  });
  if (matches.length === 0) return void 0;
  return matches.reduce(
    (best, r) => r.path.replace(/^~/, node_os.homedir()).length > best.path.replace(/^~/, node_os.homedir()).length ? r : best
  );
}
function resolveServers(config, clientId, groupName) {
  const effectiveGroup = groupName ?? config.clients.find((c) => c.id === clientId)?.group;
  if (effectiveGroup) {
    const group = config.groups.find((g) => g.name === effectiveGroup);
    if (!group) return [];
    return config.servers.filter((s) => s.enabled && group.servers.includes(s.name));
  }
  return config.servers.filter((s) => s.enabled);
}
function resolvePlugins(config, clientId, groupName) {
  const effectiveGroup = groupName ?? config.clients.find((c) => c.id === clientId)?.group;
  if (effectiveGroup) {
    const group = config.groups.find((g) => g.name === effectiveGroup);
    if (!group) return [];
    return config.plugins.filter((p) => p.enabled && group.plugins.includes(p.name));
  }
  return config.plugins.filter((p) => p.enabled);
}
function resolveSkills(config, clientId, groupName) {
  const effectiveGroup = config.clients.find((c) => c.id === clientId)?.group;
  if (effectiveGroup) {
    const group = config.groups.find((g) => g.name === effectiveGroup);
    if (!group) return [];
    return config.skills.filter((s) => s.enabled && group.skills.includes(s.name));
  }
  return config.skills.filter((s) => s.enabled);
}
function resolveAgents(config, _clientId) {
  return (config.agents ?? []).filter((a) => a.enabled);
}
function resolveCommands(config, _clientId) {
  return (config.commands ?? []).filter((c) => c.enabled);
}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
function getLineColFromPtr(string, ptr) {
  let lines = string.slice(0, ptr).split(/\r\n|\n|\r/g);
  return [lines.length, lines.pop().length + 1];
}
function makeCodeBlock(string, line, column) {
  let lines = string.split(/\r\n|\n|\r/g);
  let codeblock = "";
  let numberLen = (Math.log10(line + 1) | 0) + 1;
  for (let i = line - 1; i <= line + 1; i++) {
    let l = lines[i - 1];
    if (!l)
      continue;
    codeblock += i.toString().padEnd(numberLen, " ");
    codeblock += ":  ";
    codeblock += l;
    codeblock += "\n";
    if (i === line) {
      codeblock += " ".repeat(numberLen + column + 2);
      codeblock += "^\n";
    }
  }
  return codeblock;
}
class TomlError extends Error {
  line;
  column;
  codeblock;
  constructor(message, options) {
    const [line, column] = getLineColFromPtr(options.toml, options.ptr);
    const codeblock = makeCodeBlock(options.toml, line, column);
    super(`Invalid TOML document: ${message}

${codeblock}`, options);
    this.line = line;
    this.column = column;
    this.codeblock = codeblock;
  }
}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
function isEscaped(str, ptr) {
  let i = 0;
  while (str[ptr - ++i] === "\\")
    ;
  return --i && i % 2;
}
function indexOfNewline(str, start = 0, end = str.length) {
  let idx = str.indexOf("\n", start);
  if (str[idx - 1] === "\r")
    idx--;
  return idx <= end ? idx : -1;
}
function skipComment(str, ptr) {
  for (let i = ptr; i < str.length; i++) {
    let c = str[i];
    if (c === "\n")
      return i;
    if (c === "\r" && str[i + 1] === "\n")
      return i + 1;
    if (c < " " && c !== "	" || c === "") {
      throw new TomlError("control characters are not allowed in comments", {
        toml: str,
        ptr
      });
    }
  }
  return str.length;
}
function skipVoid(str, ptr, banNewLines, banComments) {
  let c;
  while (1) {
    while ((c = str[ptr]) === " " || c === "	" || !banNewLines && (c === "\n" || c === "\r" && str[ptr + 1] === "\n"))
      ptr++;
    if (banComments || c !== "#")
      break;
    ptr = skipComment(str, ptr);
  }
  return ptr;
}
function skipUntil(str, ptr, sep, end, banNewLines = false) {
  if (!end) {
    ptr = indexOfNewline(str, ptr);
    return ptr < 0 ? str.length : ptr;
  }
  for (let i = ptr; i < str.length; i++) {
    let c = str[i];
    if (c === "#") {
      i = indexOfNewline(str, i);
    } else if (c === sep) {
      return i + 1;
    } else if (c === end || banNewLines && (c === "\n" || c === "\r" && str[i + 1] === "\n")) {
      return i;
    }
  }
  throw new TomlError("cannot find end of structure", {
    toml: str,
    ptr
  });
}
function getStringEnd(str, seek) {
  let first = str[seek];
  let target = first === str[seek + 1] && str[seek + 1] === str[seek + 2] ? str.slice(seek, seek + 3) : first;
  seek += target.length - 1;
  do
    seek = str.indexOf(target, ++seek);
  while (seek > -1 && first !== "'" && isEscaped(str, seek));
  if (seek > -1) {
    seek += target.length;
    if (target.length > 1) {
      if (str[seek] === first)
        seek++;
      if (str[seek] === first)
        seek++;
    }
  }
  return seek;
}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
let DATE_TIME_RE = /^(\d{4}-\d{2}-\d{2})?[T ]?(?:(\d{2}):\d{2}(?::\d{2}(?:\.\d+)?)?)?(Z|[-+]\d{2}:\d{2})?$/i;
class TomlDate extends Date {
  #hasDate = false;
  #hasTime = false;
  #offset = null;
  constructor(date) {
    let hasDate = true;
    let hasTime = true;
    let offset = "Z";
    if (typeof date === "string") {
      let match = date.match(DATE_TIME_RE);
      if (match) {
        if (!match[1]) {
          hasDate = false;
          date = `0000-01-01T${date}`;
        }
        hasTime = !!match[2];
        hasTime && date[10] === " " && (date = date.replace(" ", "T"));
        if (match[2] && +match[2] > 23) {
          date = "";
        } else {
          offset = match[3] || null;
          date = date.toUpperCase();
          if (!offset && hasTime)
            date += "Z";
        }
      } else {
        date = "";
      }
    }
    super(date);
    if (!isNaN(this.getTime())) {
      this.#hasDate = hasDate;
      this.#hasTime = hasTime;
      this.#offset = offset;
    }
  }
  isDateTime() {
    return this.#hasDate && this.#hasTime;
  }
  isLocal() {
    return !this.#hasDate || !this.#hasTime || !this.#offset;
  }
  isDate() {
    return this.#hasDate && !this.#hasTime;
  }
  isTime() {
    return this.#hasTime && !this.#hasDate;
  }
  isValid() {
    return this.#hasDate || this.#hasTime;
  }
  toISOString() {
    let iso = super.toISOString();
    if (this.isDate())
      return iso.slice(0, 10);
    if (this.isTime())
      return iso.slice(11, 23);
    if (this.#offset === null)
      return iso.slice(0, -1);
    if (this.#offset === "Z")
      return iso;
    let offset = +this.#offset.slice(1, 3) * 60 + +this.#offset.slice(4, 6);
    offset = this.#offset[0] === "-" ? offset : -offset;
    let offsetDate = new Date(this.getTime() - offset * 6e4);
    return offsetDate.toISOString().slice(0, -1) + this.#offset;
  }
  static wrapAsOffsetDateTime(jsDate, offset = "Z") {
    let date = new TomlDate(jsDate);
    date.#offset = offset;
    return date;
  }
  static wrapAsLocalDateTime(jsDate) {
    let date = new TomlDate(jsDate);
    date.#offset = null;
    return date;
  }
  static wrapAsLocalDate(jsDate) {
    let date = new TomlDate(jsDate);
    date.#hasTime = false;
    date.#offset = null;
    return date;
  }
  static wrapAsLocalTime(jsDate) {
    let date = new TomlDate(jsDate);
    date.#hasDate = false;
    date.#offset = null;
    return date;
  }
}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
let INT_REGEX = /^((0x[0-9a-fA-F](_?[0-9a-fA-F])*)|(([+-]|0[ob])?\d(_?\d)*))$/;
let FLOAT_REGEX = /^[+-]?\d(_?\d)*(\.\d(_?\d)*)?([eE][+-]?\d(_?\d)*)?$/;
let LEADING_ZERO = /^[+-]?0[0-9_]/;
let ESCAPE_REGEX = /^[0-9a-f]{2,8}$/i;
let ESC_MAP = {
  b: "\b",
  t: "	",
  n: "\n",
  f: "\f",
  r: "\r",
  e: "\x1B",
  '"': '"',
  "\\": "\\"
};
function parseString(str, ptr = 0, endPtr = str.length) {
  let isLiteral = str[ptr] === "'";
  let isMultiline = str[ptr++] === str[ptr] && str[ptr] === str[ptr + 1];
  if (isMultiline) {
    endPtr -= 2;
    if (str[ptr += 2] === "\r")
      ptr++;
    if (str[ptr] === "\n")
      ptr++;
  }
  let tmp = 0;
  let isEscape;
  let parsed = "";
  let sliceStart = ptr;
  while (ptr < endPtr - 1) {
    let c = str[ptr++];
    if (c === "\n" || c === "\r" && str[ptr] === "\n") {
      if (!isMultiline) {
        throw new TomlError("newlines are not allowed in strings", {
          toml: str,
          ptr: ptr - 1
        });
      }
    } else if (c < " " && c !== "	" || c === "") {
      throw new TomlError("control characters are not allowed in strings", {
        toml: str,
        ptr: ptr - 1
      });
    }
    if (isEscape) {
      isEscape = false;
      if (c === "x" || c === "u" || c === "U") {
        let code = str.slice(ptr, ptr += c === "x" ? 2 : c === "u" ? 4 : 8);
        if (!ESCAPE_REGEX.test(code)) {
          throw new TomlError("invalid unicode escape", {
            toml: str,
            ptr: tmp
          });
        }
        try {
          parsed += String.fromCodePoint(parseInt(code, 16));
        } catch {
          throw new TomlError("invalid unicode escape", {
            toml: str,
            ptr: tmp
          });
        }
      } else if (isMultiline && (c === "\n" || c === " " || c === "	" || c === "\r")) {
        ptr = skipVoid(str, ptr - 1, true);
        if (str[ptr] !== "\n" && str[ptr] !== "\r") {
          throw new TomlError("invalid escape: only line-ending whitespace may be escaped", {
            toml: str,
            ptr: tmp
          });
        }
        ptr = skipVoid(str, ptr);
      } else if (c in ESC_MAP) {
        parsed += ESC_MAP[c];
      } else {
        throw new TomlError("unrecognized escape sequence", {
          toml: str,
          ptr: tmp
        });
      }
      sliceStart = ptr;
    } else if (!isLiteral && c === "\\") {
      tmp = ptr - 1;
      isEscape = true;
      parsed += str.slice(sliceStart, tmp);
    }
  }
  return parsed + str.slice(sliceStart, endPtr - 1);
}
function parseValue(value, toml, ptr, integersAsBigInt) {
  if (value === "true")
    return true;
  if (value === "false")
    return false;
  if (value === "-inf")
    return -Infinity;
  if (value === "inf" || value === "+inf")
    return Infinity;
  if (value === "nan" || value === "+nan" || value === "-nan")
    return NaN;
  if (value === "-0")
    return integersAsBigInt ? 0n : 0;
  let isInt = INT_REGEX.test(value);
  if (isInt || FLOAT_REGEX.test(value)) {
    if (LEADING_ZERO.test(value)) {
      throw new TomlError("leading zeroes are not allowed", {
        toml,
        ptr
      });
    }
    value = value.replace(/_/g, "");
    let numeric = +value;
    if (isNaN(numeric)) {
      throw new TomlError("invalid number", {
        toml,
        ptr
      });
    }
    if (isInt) {
      if ((isInt = !Number.isSafeInteger(numeric)) && !integersAsBigInt) {
        throw new TomlError("integer value cannot be represented losslessly", {
          toml,
          ptr
        });
      }
      if (isInt || integersAsBigInt === true)
        numeric = BigInt(value);
    }
    return numeric;
  }
  const date = new TomlDate(value);
  if (!date.isValid()) {
    throw new TomlError("invalid value", {
      toml,
      ptr
    });
  }
  return date;
}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
function sliceAndTrimEndOf(str, startPtr, endPtr) {
  let value = str.slice(startPtr, endPtr);
  let commentIdx = value.indexOf("#");
  if (commentIdx > -1) {
    skipComment(str, commentIdx);
    value = value.slice(0, commentIdx);
  }
  return [value.trimEnd(), commentIdx];
}
function extractValue(str, ptr, end, depth, integersAsBigInt) {
  if (depth === 0) {
    throw new TomlError("document contains excessively nested structures. aborting.", {
      toml: str,
      ptr
    });
  }
  let c = str[ptr];
  if (c === "[" || c === "{") {
    let [value, endPtr2] = c === "[" ? parseArray(str, ptr, depth, integersAsBigInt) : parseInlineTable(str, ptr, depth, integersAsBigInt);
    if (end) {
      endPtr2 = skipVoid(str, endPtr2);
      if (str[endPtr2] === ",")
        endPtr2++;
      else if (str[endPtr2] !== end) {
        throw new TomlError("expected comma or end of structure", {
          toml: str,
          ptr: endPtr2
        });
      }
    }
    return [value, endPtr2];
  }
  let endPtr;
  if (c === '"' || c === "'") {
    endPtr = getStringEnd(str, ptr);
    let parsed = parseString(str, ptr, endPtr);
    if (end) {
      endPtr = skipVoid(str, endPtr);
      if (str[endPtr] && str[endPtr] !== "," && str[endPtr] !== end && str[endPtr] !== "\n" && str[endPtr] !== "\r") {
        throw new TomlError("unexpected character encountered", {
          toml: str,
          ptr: endPtr
        });
      }
      endPtr += +(str[endPtr] === ",");
    }
    return [parsed, endPtr];
  }
  endPtr = skipUntil(str, ptr, ",", end);
  let slice = sliceAndTrimEndOf(str, ptr, endPtr - +(str[endPtr - 1] === ","));
  if (!slice[0]) {
    throw new TomlError("incomplete key-value declaration: no value specified", {
      toml: str,
      ptr
    });
  }
  if (end && slice[1] > -1) {
    endPtr = skipVoid(str, ptr + slice[1]);
    endPtr += +(str[endPtr] === ",");
  }
  return [
    parseValue(slice[0], str, ptr, integersAsBigInt),
    endPtr
  ];
}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
let KEY_PART_RE = /^[a-zA-Z0-9-_]+[ \t]*$/;
function parseKey(str, ptr, end = "=") {
  let dot = ptr - 1;
  let parsed = [];
  let endPtr = str.indexOf(end, ptr);
  if (endPtr < 0) {
    throw new TomlError("incomplete key-value: cannot find end of key", {
      toml: str,
      ptr
    });
  }
  do {
    let c = str[ptr = ++dot];
    if (c !== " " && c !== "	") {
      if (c === '"' || c === "'") {
        if (c === str[ptr + 1] && c === str[ptr + 2]) {
          throw new TomlError("multiline strings are not allowed in keys", {
            toml: str,
            ptr
          });
        }
        let eos = getStringEnd(str, ptr);
        if (eos < 0) {
          throw new TomlError("unfinished string encountered", {
            toml: str,
            ptr
          });
        }
        dot = str.indexOf(".", eos);
        let strEnd = str.slice(eos, dot < 0 || dot > endPtr ? endPtr : dot);
        let newLine = indexOfNewline(strEnd);
        if (newLine > -1) {
          throw new TomlError("newlines are not allowed in keys", {
            toml: str,
            ptr: ptr + dot + newLine
          });
        }
        if (strEnd.trimStart()) {
          throw new TomlError("found extra tokens after the string part", {
            toml: str,
            ptr: eos
          });
        }
        if (endPtr < eos) {
          endPtr = str.indexOf(end, eos);
          if (endPtr < 0) {
            throw new TomlError("incomplete key-value: cannot find end of key", {
              toml: str,
              ptr
            });
          }
        }
        parsed.push(parseString(str, ptr, eos));
      } else {
        dot = str.indexOf(".", ptr);
        let part = str.slice(ptr, dot < 0 || dot > endPtr ? endPtr : dot);
        if (!KEY_PART_RE.test(part)) {
          throw new TomlError("only letter, numbers, dashes and underscores are allowed in keys", {
            toml: str,
            ptr
          });
        }
        parsed.push(part.trimEnd());
      }
    }
  } while (dot + 1 && dot < endPtr);
  return [parsed, skipVoid(str, endPtr + 1, true, true)];
}
function parseInlineTable(str, ptr, depth, integersAsBigInt) {
  let res = {};
  let seen = /* @__PURE__ */ new Set();
  let c;
  ptr++;
  while ((c = str[ptr++]) !== "}" && c) {
    if (c === ",") {
      throw new TomlError("expected value, found comma", {
        toml: str,
        ptr: ptr - 1
      });
    } else if (c === "#")
      ptr = skipComment(str, ptr);
    else if (c !== " " && c !== "	" && c !== "\n" && c !== "\r") {
      let k;
      let t2 = res;
      let hasOwn = false;
      let [key, keyEndPtr] = parseKey(str, ptr - 1);
      for (let i = 0; i < key.length; i++) {
        if (i)
          t2 = hasOwn ? t2[k] : t2[k] = {};
        k = key[i];
        if ((hasOwn = Object.hasOwn(t2, k)) && (typeof t2[k] !== "object" || seen.has(t2[k]))) {
          throw new TomlError("trying to redefine an already defined value", {
            toml: str,
            ptr
          });
        }
        if (!hasOwn && k === "__proto__") {
          Object.defineProperty(t2, k, { enumerable: true, configurable: true, writable: true });
        }
      }
      if (hasOwn) {
        throw new TomlError("trying to redefine an already defined value", {
          toml: str,
          ptr
        });
      }
      let [value, valueEndPtr] = extractValue(str, keyEndPtr, "}", depth - 1, integersAsBigInt);
      seen.add(value);
      t2[k] = value;
      ptr = valueEndPtr;
    }
  }
  if (!c) {
    throw new TomlError("unfinished table encountered", {
      toml: str,
      ptr
    });
  }
  return [res, ptr];
}
function parseArray(str, ptr, depth, integersAsBigInt) {
  let res = [];
  let c;
  ptr++;
  while ((c = str[ptr++]) !== "]" && c) {
    if (c === ",") {
      throw new TomlError("expected value, found comma", {
        toml: str,
        ptr: ptr - 1
      });
    } else if (c === "#")
      ptr = skipComment(str, ptr);
    else if (c !== " " && c !== "	" && c !== "\n" && c !== "\r") {
      let e = extractValue(str, ptr - 1, "]", depth - 1, integersAsBigInt);
      res.push(e[0]);
      ptr = e[1];
    }
  }
  if (!c) {
    throw new TomlError("unfinished array encountered", {
      toml: str,
      ptr
    });
  }
  return [res, ptr];
}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
function peekTable(key, table, meta, type) {
  let t2 = table;
  let m = meta;
  let k;
  let hasOwn = false;
  let state;
  for (let i = 0; i < key.length; i++) {
    if (i) {
      t2 = hasOwn ? t2[k] : t2[k] = {};
      m = (state = m[k]).c;
      if (type === 0 && (state.t === 1 || state.t === 2)) {
        return null;
      }
      if (state.t === 2) {
        let l = t2.length - 1;
        t2 = t2[l];
        m = m[l].c;
      }
    }
    k = key[i];
    if ((hasOwn = Object.hasOwn(t2, k)) && m[k]?.t === 0 && m[k]?.d) {
      return null;
    }
    if (!hasOwn) {
      if (k === "__proto__") {
        Object.defineProperty(t2, k, { enumerable: true, configurable: true, writable: true });
        Object.defineProperty(m, k, { enumerable: true, configurable: true, writable: true });
      }
      m[k] = {
        t: i < key.length - 1 && type === 2 ? 3 : type,
        d: false,
        i: 0,
        c: {}
      };
    }
  }
  state = m[k];
  if (state.t !== type && !(type === 1 && state.t === 3)) {
    return null;
  }
  if (type === 2) {
    if (!state.d) {
      state.d = true;
      t2[k] = [];
    }
    t2[k].push(t2 = {});
    state.c[state.i++] = state = { t: 1, d: false, i: 0, c: {} };
  }
  if (state.d) {
    return null;
  }
  state.d = true;
  if (type === 1) {
    t2 = hasOwn ? t2[k] : t2[k] = {};
  } else if (type === 0 && hasOwn) {
    return null;
  }
  return [k, t2, state.c];
}
function parse(toml, { maxDepth = 1e3, integersAsBigInt } = {}) {
  let res = {};
  let meta = {};
  let tbl = res;
  let m = meta;
  for (let ptr = skipVoid(toml, 0); ptr < toml.length; ) {
    if (toml[ptr] === "[") {
      let isTableArray = toml[++ptr] === "[";
      let k = parseKey(toml, ptr += +isTableArray, "]");
      if (isTableArray) {
        if (toml[k[1] - 1] !== "]") {
          throw new TomlError("expected end of table declaration", {
            toml,
            ptr: k[1] - 1
          });
        }
        k[1]++;
      }
      let p = peekTable(
        k[0],
        res,
        meta,
        isTableArray ? 2 : 1
        /* Type.EXPLICIT */
      );
      if (!p) {
        throw new TomlError("trying to redefine an already defined table or value", {
          toml,
          ptr
        });
      }
      m = p[2];
      tbl = p[1];
      ptr = k[1];
    } else {
      let k = parseKey(toml, ptr);
      let p = peekTable(
        k[0],
        tbl,
        m,
        0
        /* Type.DOTTED */
      );
      if (!p) {
        throw new TomlError("trying to redefine an already defined table or value", {
          toml,
          ptr
        });
      }
      let v = extractValue(toml, k[1], void 0, maxDepth, integersAsBigInt);
      p[1][p[0]] = v[0];
      ptr = v[1];
    }
    ptr = skipVoid(toml, ptr, true);
    if (toml[ptr] && toml[ptr] !== "\n" && toml[ptr] !== "\r") {
      throw new TomlError("each key-value declaration must be followed by an end-of-line", {
        toml,
        ptr
      });
    }
    ptr = skipVoid(toml, ptr);
  }
  return res;
}
const ENSEMBLE_MARKER = "__ensemble";
const LEGACY_MARKER = "__mcpoyle";
const BACKUP_SUFFIX = ".ensemble-backup";
const CLIENTS = {};
const clientDefs = [
  {
    id: "claude-desktop",
    name: "Claude Desktop",
    configPath: "~/Library/Application Support/Claude/claude_desktop_config.json",
    serversKey: "mcpServers",
    requireApp: "/Applications/Claude.app",
    configFormat: "json",
    contextWindow: 2e5
  },
  {
    id: "claude-code",
    name: "Claude Code",
    configPath: "~/.claude.json",
    serversKey: "mcpServers",
    requireBin: "claude",
    configFormat: "json",
    skillsDir: "~/.claude/skills",
    agentsDir: "~/.claude/agents",
    commandsDir: "~/.claude/commands",
    supportsPlugins: true,
    contextWindow: 2e5
  },
  {
    id: "cursor",
    name: "Cursor",
    configPath: "~/.cursor/mcp.json",
    serversKey: "mcpServers",
    requireApp: "/Applications/Cursor.app",
    configFormat: "json",
    skillsDir: "~/.cursor/skills",
    contextWindow: 128e3
  },
  {
    id: "vscode",
    name: "VS Code (Copilot)",
    configPath: "~/Library/Application Support/Code/User/settings.json",
    serversKey: "mcp.servers",
    requireApp: "/Applications/Visual Studio Code.app",
    configFormat: "json"
  },
  {
    id: "windsurf",
    name: "Windsurf",
    configPath: "~/.windsurf/mcp.json",
    serversKey: "mcpServers",
    requireApp: "/Applications/Windsurf.app",
    configFormat: "json",
    skillsDir: "~/.windsurf/skills"
  },
  {
    id: "zed",
    name: "Zed",
    configPath: "~/.config/zed/settings.json",
    serversKey: "context_servers",
    requireApp: "/Applications/Zed.app",
    configFormat: "json"
  },
  {
    id: "jetbrains",
    name: "JetBrains",
    configPath: "~/.config/JetBrains/*/mcp.json",
    serversKey: "mcpServers",
    configFormat: "json",
    globPattern: true
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    configPath: "~/.gemini/settings.json",
    serversKey: "mcpServers",
    requireBin: "gemini",
    configFormat: "json",
    skillsDir: "~/.gemini/skills"
  },
  {
    // CLI and desktop app share ~/.codex/config.toml — one config, two
    // surfaces. Installed if either the `codex` binary or the Codex.app
    // bundle is present.
    id: "codex-cli",
    name: "Codex",
    configPath: "~/.codex/config.toml",
    serversKey: "mcp_servers",
    requireBin: "codex",
    requireApp: "/Applications/Codex.app",
    configFormat: "toml",
    skillsDir: "~/.codex/skills"
  },
  {
    id: "mcpx",
    name: "mcpx",
    configPath: "~/.config/mcpx/config.toml",
    serversKey: "servers",
    requireBin: "mcpx",
    configFormat: "toml"
  },
  {
    id: "copilot-cli",
    name: "Copilot CLI",
    configPath: "~/.copilot/mcp-config.json",
    serversKey: "mcpServers",
    // `gh` alone isn't sufficient — require the gh-copilot extension directory
    // to be present so users with plain `gh` aren't falsely flagged.
    requireBin: "gh-copilot",
    configFormat: "json"
  },
  {
    id: "copilot-jetbrains",
    name: "Copilot JetBrains",
    configPath: "~/.config/github-copilot/mcp.json",
    serversKey: "mcpServers",
    requireApp: [
      "/Applications/IntelliJ IDEA.app",
      "/Applications/IntelliJ IDEA Community Edition.app",
      "/Applications/PyCharm.app",
      "/Applications/PyCharm Community Edition.app",
      "/Applications/WebStorm.app",
      "/Applications/RubyMine.app",
      "/Applications/GoLand.app",
      "/Applications/PhpStorm.app",
      "/Applications/CLion.app",
      "/Applications/DataGrip.app",
      "/Applications/Rider.app",
      "/Applications/AppCode.app",
      "/Applications/Android Studio.app"
    ],
    configFormat: "json"
  },
  {
    id: "amazon-q",
    name: "Amazon Q",
    configPath: "~/.aws/amazonq/mcp.json",
    serversKey: "mcpServers",
    requireApp: "/Applications/Amazon Q.app",
    configFormat: "json"
  },
  {
    id: "cline",
    name: "Cline",
    configPath: "~/.vscode/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
    serversKey: "mcpServers",
    requireVscodeExtension: "saoudrizwan.claude-dev",
    configFormat: "json"
  },
  {
    id: "roo-code",
    name: "Roo Code",
    configPath: "~/.vscode/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json",
    serversKey: "mcpServers",
    requireVscodeExtension: "rooveterinaryinc.roo-cline",
    configFormat: "json"
  },
  {
    id: "opencode",
    name: "OpenCode",
    configPath: "~/.opencode/config.json",
    serversKey: "mcpServers",
    requireBin: "opencode",
    configFormat: "json",
    skillsDir: "~/.opencode/skills"
  },
  {
    id: "amp",
    name: "Amp",
    configPath: "~/.ampcode/mcp.json",
    serversKey: "mcpServers",
    requireBin: "amp",
    configFormat: "json",
    skillsDir: "~/.ampcode/skills"
  }
];
for (const c of clientDefs) {
  CLIENTS[c.id] = c;
}
function expandPath(p) {
  return p.replace(/^~/, node_os.homedir());
}
function isBinOnPath(name) {
  const pathEnv = process.env.PATH;
  if (!pathEnv) return false;
  for (const dir of pathEnv.split(":")) {
    if (!dir) continue;
    if (node_fs.existsSync(node_path.join(dir, name))) return true;
  }
  return false;
}
function hasVscodeExtension(prefix) {
  if (!node_fs.existsSync("/Applications/Visual Studio Code.app")) return false;
  const extDir = expandPath("~/.vscode/extensions");
  if (!node_fs.existsSync(extDir)) return false;
  try {
    const { readdirSync } = require("node:fs");
    const entries = readdirSync(extDir);
    return entries.some((e) => e.startsWith(`${prefix}-`) || e === prefix);
  } catch {
    return false;
  }
}
function isInstalled(client) {
  const hasStrict = client.requireApp !== void 0 || client.requireBin !== void 0 || client.requireVscodeExtension !== void 0;
  if (hasStrict) {
    if (client.requireApp !== void 0) {
      const apps = Array.isArray(client.requireApp) ? client.requireApp : [client.requireApp];
      if (apps.some((p) => node_fs.existsSync(expandPath(p)))) return true;
    }
    if (client.requireBin !== void 0 && isBinOnPath(client.requireBin)) {
      return true;
    }
    if (client.requireVscodeExtension !== void 0 && hasVscodeExtension(client.requireVscodeExtension)) {
      return true;
    }
    return false;
  }
  if (client.globPattern) {
    return resolvedPaths(client).length > 0;
  }
  if (client.detectPaths) {
    return client.detectPaths.some((p) => node_fs.existsSync(expandPath(p)));
  }
  return node_fs.existsSync(expandPath(client.configPath));
}
function resolvedPaths(client) {
  if (!client.globPattern) {
    return [expandPath(client.configPath)];
  }
  const expanded = expandPath(client.configPath);
  const parts = expanded.split("*");
  if (parts.length !== 2) return [expanded];
  const parentDir = parts[0].slice(0, -1);
  const suffix = parts[1];
  if (!node_fs.existsSync(parentDir)) return [];
  const { readdirSync } = require("node:fs");
  const entries = readdirSync(parentDir, { withFileTypes: true });
  const matches = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const candidate = node_path.join(parentDir, entry.name, suffix.slice(1));
      if (node_fs.existsSync(candidate)) {
        matches.push(candidate);
      }
    }
  }
  return matches.sort();
}
function detectClients() {
  return Object.values(CLIENTS).filter(isInstalled);
}
function readClientConfig(path2) {
  if (!node_fs.existsSync(path2)) return {};
  const raw = node_fs.readFileSync(path2, "utf-8");
  if (path2.endsWith(".toml")) {
    return parse(raw);
  }
  return JSON.parse(raw);
}
function backupConfig(path2) {
  if (!node_fs.existsSync(path2)) return;
  const backupPath = `${path2}${BACKUP_SUFFIX}`;
  if (!node_fs.existsSync(backupPath)) {
    node_fs.copyFileSync(path2, backupPath);
  }
}
function getNested(obj, key) {
  const parts = key.split(".");
  let current = obj;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return void 0;
    current = current[part];
  }
  return current;
}
function setNested(obj, key, value) {
  const parts = key.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof current[part] !== "object" || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}
function getNestedPath(obj, parts) {
  let current = obj;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return void 0;
    current = current[part];
  }
  return current;
}
function setNestedPath(obj, parts, value) {
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof current[part] !== "object" || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}
function serverToClientEntry(server2) {
  const entry = { [ENSEMBLE_MARKER]: true };
  if (["sse", "http", "streamable-http"].includes(server2.transport) && server2.url) {
    entry["url"] = server2.url;
    entry["transport"] = server2.transport;
    if (server2.auth_type && server2.auth_ref) {
      entry["auth"] = { type: server2.auth_type, ref: server2.auth_ref };
    }
    if (Object.keys(server2.env).length > 0) {
      entry["env"] = server2.env;
    }
  } else {
    if (server2.command) entry["command"] = server2.command;
    if (server2.args.length > 0) entry["args"] = server2.args;
    if (Object.keys(server2.env).length > 0) entry["env"] = server2.env;
    if (server2.transport && server2.transport !== "stdio") {
      entry["transport"] = server2.transport;
    }
  }
  return entry;
}
function isManaged(entry) {
  if (typeof entry !== "object" || entry === null) return false;
  const e = entry;
  return e[ENSEMBLE_MARKER] === true || e[LEGACY_MARKER] === true;
}
function getManagedServers(config, serversKey) {
  const servers = getNested(config, serversKey);
  if (typeof servers !== "object" || servers === null) return {};
  const result = {};
  for (const [k, v] of Object.entries(servers)) {
    if (isManaged(v)) result[k] = v;
  }
  return result;
}
function getUnmanagedServers(config, serversKey) {
  const servers = getNested(config, serversKey);
  if (typeof servers !== "object" || servers === null) return {};
  const result = {};
  for (const [k, v] of Object.entries(servers)) {
    if (!isManaged(v)) result[k] = v;
  }
  return result;
}
function writeClientConfig(path2, serversKey, newServers) {
  backupConfig(path2);
  const existing = node_fs.existsSync(path2) ? readClientConfig(path2) : {};
  const unmanaged = getUnmanagedServers(existing, serversKey);
  const merged = { ...unmanaged, ...newServers };
  setNested(existing, serversKey, merged);
  node_fs.mkdirSync(node_path.dirname(path2), { recursive: true });
  if (path2.endsWith(".toml")) {
    node_fs.writeFileSync(path2, dictToToml(existing), "utf-8");
  } else {
    node_fs.writeFileSync(path2, `${JSON.stringify(existing, null, 2)}
`, "utf-8");
  }
}
function getManagedServersNested(config, keyPath) {
  const servers = getNestedPath(config, keyPath);
  if (typeof servers !== "object" || servers === null) return {};
  const result = {};
  for (const [k, v] of Object.entries(servers)) {
    if (isManaged(v)) result[k] = v;
  }
  return result;
}
function writeServersNested(path2, keyPath, newServers) {
  backupConfig(path2);
  const existing = node_fs.existsSync(path2) ? readClientConfig(path2) : {};
  const currentServers = getNestedPath(existing, keyPath);
  const unmanaged = {};
  if (typeof currentServers === "object" && currentServers !== null) {
    for (const [k, v] of Object.entries(currentServers)) {
      if (!isManaged(v)) unmanaged[k] = v;
    }
  }
  setNestedPath(existing, keyPath, { ...unmanaged, ...newServers });
  node_fs.mkdirSync(node_path.dirname(path2), { recursive: true });
  node_fs.writeFileSync(path2, `${JSON.stringify(existing, null, 2)}
`, "utf-8");
}
function projectServersKey(projectPath) {
  const absPath = node_path.resolve(expandPath(projectPath));
  return ["projects", absPath, "mcpServers"];
}
node_path.join(node_os.homedir(), ".claude", "settings.json");
function ccSettingsPath() {
  return node_path.join(node_os.homedir(), ".claude", "settings.json");
}
function readCCSettings(path2) {
  const p = ccSettingsPath();
  if (!node_fs.existsSync(p)) return {};
  return JSON.parse(node_fs.readFileSync(p, "utf-8"));
}
function writeCCSettings(settings, path2) {
  const p = ccSettingsPath();
  backupConfig(p);
  node_fs.mkdirSync(node_path.dirname(p), { recursive: true });
  node_fs.writeFileSync(p, `${JSON.stringify(settings, null, 2)}
`, "utf-8");
}
function getEnabledPlugins(settings) {
  return settings["enabledPlugins"] ?? {};
}
function getExtraMarketplaces(settings) {
  return settings["extraKnownMarketplaces"] ?? {};
}
function tomlKey(k) {
  return /^[A-Za-z0-9_-]+$/.test(k) ? k : `"${k.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function tomlValue(v) {
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(v);
  if (typeof v === "string") return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  if (Array.isArray(v)) return `[${v.map(tomlValue).join(", ")}]`;
  if (typeof v === "object" && v !== null) {
    const items = Object.entries(v).map(
      ([k, val]) => `${tomlKey(k)} = ${tomlValue(val)}`
    );
    return `{${items.join(", ")}}`;
  }
  return `"${v}"`;
}
function dictToToml(data, prefix = "") {
  const lines = [];
  const tables = [];
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      tables.push([key, val]);
    } else {
      lines.push(`${tomlKey(key)} = ${tomlValue(val)}`);
    }
  }
  for (const [tableKey, tableVal] of tables) {
    const fullKey = prefix ? `${prefix}.${tomlKey(tableKey)}` : tomlKey(tableKey);
    lines.push("");
    lines.push(`[${fullKey}]`);
    const subTables = [];
    for (const [k, v] of Object.entries(tableVal)) {
      if (typeof v === "object" && v !== null && !Array.isArray(v)) {
        subTables.push([k, v]);
      } else {
        lines.push(`${tomlKey(k)} = ${tomlValue(v)}`);
      }
    }
    for (const [subKey, subVal] of subTables) {
      const subFull = `${fullKey}.${tomlKey(subKey)}`;
      lines.push("");
      lines.push(`[${subFull}]`);
      for (const [k, v] of Object.entries(subVal)) {
        if (typeof v === "object" && v !== null && !Array.isArray(v)) {
          lines.push("");
          lines.push(`[${subFull}.${tomlKey(k)}]`);
          for (const [k2, v2] of Object.entries(v)) {
            lines.push(`${tomlKey(k2)} = ${tomlValue(v2)}`);
          }
        } else {
          lines.push(`${tomlKey(k)} = ${tomlValue(v)}`);
        }
      }
    }
  }
  return `${lines.join("\n")}
`;
}
function ok(messages) {
  return { ok: true, error: "", messages };
}
function fail(error) {
  return { ok: false, error, messages: [] };
}
function addServer(config, params) {
  if (getServer(config, params.name)) {
    return { config, result: { ...fail(`Server '${params.name}' already exists.`), server: null } };
  }
  const server2 = {
    name: params.name,
    enabled: true,
    transport: params.transport ?? "stdio",
    command: params.command ?? "",
    args: params.args ?? [],
    env: params.env ?? {},
    url: params.url ?? "",
    auth_type: params.authType ?? "",
    auth_ref: params.authRef ?? "",
    origin: {
      source: params.origin?.source ?? "manual",
      client: params.origin?.client ?? "",
      registry_id: params.origin?.registry_id ?? "",
      timestamp: params.origin?.timestamp ?? "",
      trust_tier: params.origin?.trust_tier ?? "local"
    },
    tools: params.tools ?? []
  };
  return {
    config: { ...config, servers: [...config.servers, server2] },
    result: { ...ok([`Added server '${params.name}'.`]), server: server2 }
  };
}
function removeServer(config, name) {
  const server2 = getServer(config, name);
  if (!server2) {
    return { config, result: { ...fail(`Server '${name}' not found.`), server: null } };
  }
  return {
    config: {
      ...config,
      servers: config.servers.filter((s) => s.name !== name),
      groups: config.groups.map((g) => ({
        ...g,
        servers: g.servers.filter((s) => s !== name)
      }))
    },
    result: { ...ok([`Removed server '${name}'.`]), server: server2 }
  };
}
function enableServer(config, name) {
  const server2 = getServer(config, name);
  if (!server2) {
    return { config, result: { ...fail(`Server '${name}' not found.`), server: null } };
  }
  const updated = { ...server2, enabled: true };
  return {
    config: { ...config, servers: config.servers.map((s) => s.name === name ? updated : s) },
    result: { ...ok([`Enabled server '${name}'.`]), server: updated }
  };
}
function disableServer(config, name) {
  const server2 = getServer(config, name);
  if (!server2) {
    return { config, result: { ...fail(`Server '${name}' not found.`), server: null } };
  }
  const updated = { ...server2, enabled: false };
  return {
    config: { ...config, servers: config.servers.map((s) => s.name === name ? updated : s) },
    result: { ...ok([`Disabled server '${name}'.`]), server: updated }
  };
}
function createGroup(config, name, description = "") {
  if (getGroup(config, name)) {
    return { config, result: { ...fail(`Group '${name}' already exists.`), group: null } };
  }
  const group = { name, description, servers: [], plugins: [], skills: [] };
  return {
    config: { ...config, groups: [...config.groups, group] },
    result: { ...ok([`Created group '${name}'.`]), group }
  };
}
function deleteGroup(config, name) {
  const group = getGroup(config, name);
  if (!group) {
    return { config, result: { ...fail(`Group '${name}' not found.`), group: null } };
  }
  return {
    config: {
      ...config,
      groups: config.groups.filter((g) => g.name !== name),
      clients: config.clients.map((c) => c.group === name ? { ...c, group: null } : c)
    },
    result: { ...ok([`Deleted group '${name}'.`]), group }
  };
}
function addServerToGroup(config, groupName, serverName) {
  const group = getGroup(config, groupName);
  if (!group) return { config, result: fail(`Group '${groupName}' not found.`) };
  if (!getServer(config, serverName))
    return { config, result: fail(`Server '${serverName}' not found.`) };
  if (group.servers.includes(serverName))
    return { config, result: ok([`Server '${serverName}' already in group '${groupName}'.`]) };
  return {
    config: {
      ...config,
      groups: config.groups.map(
        (g) => g.name === groupName ? { ...g, servers: [...g.servers, serverName] } : g
      )
    },
    result: ok([`Added '${serverName}' to group '${groupName}'.`])
  };
}
function removeServerFromGroup(config, groupName, serverName) {
  const group = getGroup(config, groupName);
  if (!group) return { config, result: fail(`Group '${groupName}' not found.`) };
  if (!group.servers.includes(serverName))
    return { config, result: fail(`Server '${serverName}' not in group '${groupName}'.`) };
  return {
    config: {
      ...config,
      groups: config.groups.map(
        (g) => g.name === groupName ? { ...g, servers: g.servers.filter((s) => s !== serverName) } : g
      )
    },
    result: ok([`Removed '${serverName}' from group '${groupName}'.`])
  };
}
function addPluginToGroup(config, groupName, pluginName) {
  const group = getGroup(config, groupName);
  if (!group) return { config, result: fail(`Group '${groupName}' not found.`) };
  if (!getPlugin(config, pluginName))
    return { config, result: fail(`Plugin '${pluginName}' not found.`) };
  if (group.plugins.includes(pluginName))
    return { config, result: ok([`Plugin '${pluginName}' already in group '${groupName}'.`]) };
  return {
    config: {
      ...config,
      groups: config.groups.map(
        (g) => g.name === groupName ? { ...g, plugins: [...g.plugins, pluginName] } : g
      )
    },
    result: ok([`Added '${pluginName}' to group '${groupName}'.`])
  };
}
function removePluginFromGroup(config, groupName, pluginName) {
  const group = getGroup(config, groupName);
  if (!group) return { config, result: fail(`Group '${groupName}' not found.`) };
  if (!group.plugins.includes(pluginName))
    return { config, result: fail(`Plugin '${pluginName}' not in group '${groupName}'.`) };
  return {
    config: {
      ...config,
      groups: config.groups.map(
        (g) => g.name === groupName ? { ...g, plugins: g.plugins.filter((p) => p !== pluginName) } : g
      )
    },
    result: ok([`Removed '${pluginName}' from group '${groupName}'.`])
  };
}
function addSkillToGroup(config, groupName, skillName) {
  const group = getGroup(config, groupName);
  if (!group) return { config, result: fail(`Group '${groupName}' not found.`) };
  if (!getSkill(config, skillName))
    return { config, result: fail(`Skill '${skillName}' not found.`) };
  if (group.skills.includes(skillName))
    return { config, result: ok([`Skill '${skillName}' already in group '${groupName}'.`]) };
  return {
    config: {
      ...config,
      groups: config.groups.map(
        (g) => g.name === groupName ? { ...g, skills: [...g.skills, skillName] } : g
      )
    },
    result: ok([`Added '${skillName}' to group '${groupName}'.`])
  };
}
function removeSkillFromGroup(config, groupName, skillName) {
  const group = getGroup(config, groupName);
  if (!group) return { config, result: fail(`Group '${groupName}' not found.`) };
  if (!group.skills.includes(skillName))
    return { config, result: fail(`Skill '${skillName}' not in group '${groupName}'.`) };
  return {
    config: {
      ...config,
      groups: config.groups.map(
        (g) => g.name === groupName ? { ...g, skills: g.skills.filter((s) => s !== skillName) } : g
      )
    },
    result: ok([`Removed '${skillName}' from group '${groupName}'.`])
  };
}
function assignClient(config, clientId, group, options) {
  const client = CLIENTS[clientId];
  if (!client) {
    return {
      config,
      result: {
        ...fail(`Unknown client: ${clientId}`),
        clientId,
        group: null,
        projectPath: null
      }
    };
  }
  const effectiveGroup = options?.assignAll ? null : group;
  if (!group) {
    return {
      config,
      result: {
        ...fail("Specify a group name or use --all."),
        clientId,
        group: null,
        projectPath: null
      }
    };
  }
  if (effectiveGroup && !getGroup(config, effectiveGroup)) {
    return {
      config,
      result: {
        ...fail(`Group '${effectiveGroup}' not found.`),
        clientId,
        group: null,
        projectPath: null
      }
    };
  }
  let newConfig = { ...config };
  const existing = getClient(config, clientId);
  const clientAssignment = existing ? { ...existing, group: effectiveGroup } : {
    id: clientId,
    group: effectiveGroup,
    last_synced: null,
    projects: {},
    server_hashes: {}
  };
  newConfig = {
    ...newConfig,
    clients: existing ? newConfig.clients.map((c) => c.id === clientId ? clientAssignment : c) : [...newConfig.clients, clientAssignment]
  };
  const msg = effectiveGroup ? `Assigned group '${effectiveGroup}' to ${client.name}.` : `Assigned all enabled servers to ${client.name}.`;
  return {
    config: newConfig,
    result: { ...ok([msg]), clientId, group: effectiveGroup, projectPath: null }
  };
}
function unassignClient(config, clientId, projectPath) {
  const client = CLIENTS[clientId];
  if (!client) {
    return {
      config,
      result: { ...fail(`Unknown client: ${clientId}`), clientId, group: null, projectPath: null }
    };
  }
  const existing = getClient(config, clientId);
  if (!existing) {
    return {
      config,
      result: { ...ok([`No assignment for ${client.name}.`]), clientId, group: null, projectPath: null }
    };
  }
  return {
    config: {
      ...config,
      clients: config.clients.map((c) => c.id === clientId ? { ...c, group: null } : c)
    },
    result: {
      ...ok([`Unassigned ${client.name} — will receive all enabled servers.`]),
      clientId,
      group: null,
      projectPath: null
    }
  };
}
function installPlugin(config, name, marketplaceName) {
  if (getPlugin(config, name)) {
    return { config, result: { ...fail(`Plugin '${name}' is already installed.`), plugin: null } };
  }
  let resolvedMarketplace = marketplaceName;
  if (!resolvedMarketplace) {
    if (config.marketplaces.length === 1) {
      resolvedMarketplace = config.marketplaces[0].name;
    } else if (config.marketplaces.length > 1) {
      return {
        config,
        result: {
          ...fail("Multiple marketplaces available. Specify --marketplace."),
          plugin: null
        }
      };
    } else {
      resolvedMarketplace = "claude-plugins-official";
    }
  }
  const plugin = { name, marketplace: resolvedMarketplace, enabled: true, managed: true };
  return {
    config: { ...config, plugins: [...config.plugins, plugin] },
    result: { ...ok([`Installed plugin '${name}' from ${resolvedMarketplace}.`]), plugin }
  };
}
function uninstallPlugin(config, name) {
  const plugin = getPlugin(config, name);
  if (!plugin) {
    return { config, result: { ...fail(`Plugin '${name}' not found.`), plugin: null } };
  }
  return {
    config: {
      ...config,
      plugins: config.plugins.filter((p) => p.name !== name),
      groups: config.groups.map((g) => ({
        ...g,
        plugins: g.plugins.filter((p) => p !== name)
      }))
    },
    result: { ...ok([`Uninstalled plugin '${name}'.`]), plugin }
  };
}
function enablePlugin(config, name) {
  const plugin = getPlugin(config, name);
  if (!plugin) {
    return { config, result: { ...fail(`Plugin '${name}' not found.`), plugin: null } };
  }
  const updated = { ...plugin, enabled: true };
  return {
    config: {
      ...config,
      plugins: config.plugins.map((p) => p.name === name ? updated : p)
    },
    result: { ...ok([`Enabled plugin '${name}'.`]), plugin: updated }
  };
}
function disablePlugin(config, name) {
  const plugin = getPlugin(config, name);
  if (!plugin) {
    return { config, result: { ...fail(`Plugin '${name}' not found.`), plugin: null } };
  }
  const updated = { ...plugin, enabled: false };
  return {
    config: {
      ...config,
      plugins: config.plugins.map((p) => p.name === name ? updated : p)
    },
    result: { ...ok([`Disabled plugin '${name}'.`]), plugin: updated }
  };
}
function addMarketplace(config, name, source) {
  if (RESERVED_MARKETPLACE_NAMES.has(name)) {
    return { config, result: { ...fail(`'${name}' is a reserved marketplace name.`), marketplace: null } };
  }
  if (getMarketplace(config, name)) {
    return { config, result: { ...fail(`Marketplace '${name}' already exists.`), marketplace: null } };
  }
  const marketplace = { name, source };
  return {
    config: { ...config, marketplaces: [...config.marketplaces, marketplace] },
    result: { ...ok([`Added marketplace '${name}'.`]), marketplace }
  };
}
function removeMarketplace(config, name) {
  const marketplace = getMarketplace(config, name);
  if (!marketplace) {
    return { config, result: { ...fail(`Marketplace '${name}' not found.`), marketplace: null } };
  }
  return {
    config: { ...config, marketplaces: config.marketplaces.filter((m) => m.name !== name) },
    result: { ...ok([`Removed marketplace '${name}'.`]), marketplace }
  };
}
function installSkill(config, params) {
  if (getSkill(config, params.name)) {
    return { config, result: { ...fail(`Skill '${params.name}' already exists.`), skill: null } };
  }
  const skill = {
    name: params.name,
    enabled: true,
    description: params.description ?? "",
    path: params.path ?? "",
    origin: params.origin ?? "manual",
    dependencies: params.dependencies ?? [],
    tags: params.tags ?? [],
    mode: params.mode ?? "pin"
  };
  return {
    config: { ...config, skills: [...config.skills, skill] },
    result: { ...ok([`Installed skill '${params.name}'.`]), skill }
  };
}
function uninstallSkill(config, name) {
  const skill = getSkill(config, name);
  if (!skill) {
    return { config, result: { ...fail(`Skill '${name}' not found.`), skill: null } };
  }
  return {
    config: {
      ...config,
      skills: config.skills.filter((s) => s.name !== name),
      groups: config.groups.map((g) => ({
        ...g,
        skills: g.skills.filter((s) => s !== name)
      }))
    },
    result: { ...ok([`Removed skill '${name}'.`]), skill }
  };
}
function enableSkill(config, name) {
  const skill = getSkill(config, name);
  if (!skill) {
    return { config, result: { ...fail(`Skill '${name}' not found.`), skill: null } };
  }
  const updated = { ...skill, enabled: true };
  return {
    config: { ...config, skills: config.skills.map((s) => s.name === name ? updated : s) },
    result: { ...ok([`Enabled skill '${name}'.`]), skill: updated }
  };
}
function disableSkill(config, name) {
  const skill = getSkill(config, name);
  if (!skill) {
    return { config, result: { ...fail(`Skill '${name}' not found.`), skill: null } };
  }
  const updated = { ...skill, enabled: false };
  return {
    config: { ...config, skills: config.skills.map((s) => s.name === name ? updated : s) },
    result: { ...ok([`Disabled skill '${name}'.`]), skill: updated }
  };
}
function descriptionHash(text) {
  if (!text) return "";
  const { createHash } = require("node:crypto");
  return createHash("sha256").update(text).digest("hex");
}
function parseNoteRef(ref) {
  const trimmed = (ref ?? "").trim();
  if (!trimmed) return { type: null, name: "" };
  const colonIdx = trimmed.indexOf(":");
  if (colonIdx > 0) {
    const head = trimmed.slice(0, colonIdx).toLowerCase();
    const tail = trimmed.slice(colonIdx + 1);
    if (head === "server" || head === "skill" || head === "plugin") {
      if (head === "plugin") {
        const atIdx = tail.lastIndexOf("@");
        if (atIdx > 0) {
          return { type: "plugin", name: tail.slice(0, atIdx), marketplace: tail.slice(atIdx + 1) };
        }
      }
      return { type: head, name: tail };
    }
  }
  if (trimmed.includes("@") && !trimmed.startsWith("@")) {
    const atIdx = trimmed.lastIndexOf("@");
    return { type: "plugin", name: trimmed.slice(0, atIdx), marketplace: trimmed.slice(atIdx + 1) };
  }
  return { type: null, name: trimmed };
}
function findNotedItem(config, parsed) {
  const { type, name, marketplace } = parsed;
  if (type === "server") {
    const s2 = getServer(config, name);
    return s2 ? { type: "server", item: s2 } : null;
  }
  if (type === "skill") {
    const s2 = getSkill(config, name);
    return s2 ? { type: "skill", item: s2 } : null;
  }
  if (type === "plugin") {
    const p = config.plugins.find(
      (p2) => p2.name === name && (marketplace ? p2.marketplace === marketplace : true)
    );
    return p ? { type: "plugin", item: p } : null;
  }
  const s = getServer(config, name);
  if (s) return { type: "server", item: s };
  const sk = getSkill(config, name);
  if (sk) return { type: "skill", item: sk };
  const pl = config.plugins.find((p) => p.name === name);
  if (pl) return { type: "plugin", item: pl };
  return null;
}
function setUserNotes(config, params) {
  const parsed = parseNoteRef(params.ref);
  if (!parsed.name) {
    return {
      config,
      result: { ...fail("Ref must be a non-empty name."), type: null, name: "", userNotes: null }
    };
  }
  const found = findNotedItem(config, parsed);
  if (!found) {
    const label = parsed.type ? `${parsed.type} '${parsed.name}'` : `item '${parsed.name}'`;
    return {
      config,
      result: { ...fail(`${label} not found.`), type: parsed.type, name: parsed.name, userNotes: null }
    };
  }
  const text = params.text ?? "";
  const empty = text === "";
  let nextConfig = config;
  if (found.type === "server") {
    const cur = found.item;
    const { userNotes: _omit, ...rest } = cur;
    const updated = empty ? rest : { ...cur, userNotes: text };
    nextConfig = {
      ...config,
      servers: config.servers.map((s) => s.name === cur.name ? updated : s)
    };
  } else if (found.type === "skill") {
    const cur = found.item;
    const { userNotes: _omit, ...rest } = cur;
    const updated = empty ? rest : { ...cur, userNotes: text };
    nextConfig = {
      ...config,
      skills: config.skills.map((s) => s.name === cur.name ? updated : s)
    };
  } else {
    const cur = found.item;
    const { userNotes: _omit, ...rest } = cur;
    const updated = empty ? rest : { ...cur, userNotes: text };
    nextConfig = {
      ...config,
      plugins: config.plugins.map(
        (p) => p.name === cur.name && p.marketplace === cur.marketplace ? updated : p
      )
    };
  }
  const verb = empty ? "Cleared notes on" : "Updated notes on";
  return {
    config: nextConfig,
    result: {
      ...ok([`${verb} ${found.type} '${parsed.name}'.`]),
      type: found.type,
      name: parsed.name,
      userNotes: empty ? null : text
    }
  };
}
function getUserNotes(config, ref) {
  const parsed = parseNoteRef(ref);
  const found = findNotedItem(config, parsed);
  if (!found) return null;
  const item = found.item;
  return {
    type: found.type,
    name: found.item.name,
    userNotes: typeof item.userNotes === "string" && item.userNotes !== "" ? item.userNotes : null
  };
}
function addRule(config, path2, group) {
  if (!getGroup(config, group)) {
    return { config, result: fail(`Group '${group}' not found.`) };
  }
  const absPath = node_path.resolve(expandPath(path2));
  const existing = config.rules.find((r) => node_path.resolve(expandPath(r.path)) === absPath);
  if (existing) {
    return { config, result: fail(`Rule for '${absPath}' already exists (→ ${existing.group}).`) };
  }
  return {
    config: { ...config, rules: [...config.rules, { path: path2, group }] },
    result: ok([`Added rule: ${path2} → ${group}`, "Projects under this path will get this group on next sync."])
  };
}
function removeRule(config, path2) {
  const absPath = node_path.resolve(expandPath(path2));
  const rule = config.rules.find((r) => node_path.resolve(expandPath(r.path)) === absPath);
  if (!rule) {
    return { config, result: fail(`No rule for '${path2}'.`) };
  }
  return {
    config: { ...config, rules: config.rules.filter((r) => r !== rule) },
    result: ok([`Removed rule for '${path2}'.`])
  };
}
function detectCollisions(config, clientId = "claude-code") {
  const assignment = getClient(config, clientId);
  if (!assignment?.group) return [];
  const globalGroup = getGroup(config, assignment.group);
  if (!globalGroup) return [];
  const collisions = [];
  for (const [projPath, projData] of Object.entries(assignment.projects)) {
    if (!projData.group) continue;
    const projGroup = getGroup(config, projData.group);
    if (!projGroup) continue;
    for (const name of projGroup.servers) {
      if (globalGroup.servers.includes(name)) {
        collisions.push({
          itemName: name,
          itemType: "server",
          globalGroup: assignment.group,
          projectGroup: projData.group,
          projectPath: projPath
        });
      }
    }
    for (const name of projGroup.plugins) {
      if (globalGroup.plugins.includes(name)) {
        collisions.push({
          itemName: name,
          itemType: "plugin",
          globalGroup: assignment.group,
          projectGroup: projData.group,
          projectPath: projPath
        });
      }
    }
    for (const name of projGroup.skills) {
      if (globalGroup.skills.includes(name)) {
        collisions.push({
          itemName: name,
          itemType: "skill",
          globalGroup: assignment.group,
          projectGroup: projData.group,
          projectPath: projPath
        });
      }
    }
  }
  return collisions;
}
function saveProfile(config, name) {
  const profile = {
    name,
    clients: [...config.clients],
    rules: [...config.rules],
    settings: { ...config.settings },
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const newProfiles = { ...config.profiles, [name]: profile };
  return {
    config: { ...config, profiles: newProfiles },
    result: { ...ok([`Saved profile '${name}'.`]), profile }
  };
}
function activateProfile(config, name) {
  const profile = config.profiles[name];
  if (!profile) {
    return { config, result: { ...fail(`Profile '${name}' not found.`), profile: null } };
  }
  return {
    config: {
      ...config,
      clients: [...profile.clients],
      rules: [...profile.rules],
      settings: { ...profile.settings },
      activeProfile: name
    },
    result: { ...ok([`Activated profile '${name}'.`]), profile }
  };
}
function listProfiles(config) {
  const names = Object.keys(config.profiles);
  if (names.length === 0) {
    return { config, result: { ...ok(["No profiles saved."]), profile: null } };
  }
  const messages = names.map((n) => {
    const active = config.activeProfile === n ? " (active)" : "";
    return `${n}${active}`;
  });
  return { config, result: { ...ok(messages), profile: null } };
}
function deleteProfile(config, name) {
  const profile = config.profiles[name];
  if (!profile) {
    return { config, result: { ...fail(`Profile '${name}' not found.`), profile: null } };
  }
  const newProfiles = { ...config.profiles };
  delete newProfiles[name];
  const newActive = config.activeProfile === name ? null : config.activeProfile;
  return {
    config: { ...config, profiles: newProfiles, activeProfile: newActive },
    result: { ...ok([`Deleted profile '${name}'.`]), profile }
  };
}
function checkSkillDependencies(config) {
  return config.skills.filter((s) => s.dependencies.length > 0).map((skill) => {
    const satisfied = [];
    const missing = [];
    const disabled = [];
    for (const dep of skill.dependencies) {
      const server2 = getServer(config, dep);
      if (!server2) missing.push(dep);
      else if (!server2.enabled) disabled.push(dep);
      else satisfied.push(dep);
    }
    return {
      skillName: skill.name,
      dependencies: skill.dependencies,
      satisfied,
      missing,
      disabled
    };
  });
}
function scanClientsForProjects() {
  const hits = [];
  hits.push(...scanClaudeCode());
  hits.push(...scanCursor());
  hits.push(...scanWindsurf());
  hits.push(...scanVSCode());
  const byPath = /* @__PURE__ */ new Map();
  for (const hit of hits) {
    if (!hit.path) continue;
    const existing = byPath.get(hit.path);
    if (existing) {
      existing.clientIds.add(hit.clientId);
      if (hit.lastSeenAt > existing.lastSeenAt) existing.lastSeenAt = hit.lastSeenAt;
    } else {
      byPath.set(hit.path, {
        clientIds: /* @__PURE__ */ new Set([hit.clientId]),
        lastSeenAt: hit.lastSeenAt
      });
    }
  }
  const projects = [];
  for (const [path2, { clientIds, lastSeenAt }] of byPath) {
    const exists = safeExists$1(path2);
    projects.push({
      path: path2,
      name: basename(path2),
      seenIn: Array.from(clientIds).sort(),
      lastSeenAt,
      exists,
      isGitRepo: exists && safeExists$1(node_path.join(path2, ".git"))
    });
  }
  projects.sort((a, b) => b.lastSeenAt - a.lastSeenAt);
  return projects;
}
function scanClaudeCode() {
  const dir = node_path.join(node_os.homedir(), ".claude", "projects");
  if (!safeExists$1(dir)) return [];
  const hits = [];
  for (const name of safeReaddir$1(dir)) {
    const full = node_path.join(dir, name);
    if (!safeIsDir$1(full)) continue;
    if (name.startsWith(".")) continue;
    const trimmed = name.replace(/^-+/, "");
    if (!trimmed) continue;
    const segments = trimmed.split("-");
    const decoded = decodeClaudeCodePath(segments);
    if (!decoded) continue;
    hits.push({
      path: decoded,
      clientId: "claude-code",
      lastSeenAt: safeMtime(full)
    });
  }
  return hits;
}
function safeIsDir$1(path2) {
  try {
    return node_fs.statSync(path2).isDirectory();
  } catch {
    return false;
  }
}
function decodeClaudeCodePath(segments) {
  const naive = `/${segments.join("/")}`;
  if (safeExists$1(naive)) return naive;
  for (let i = segments.length - 1; i > 0; i--) {
    const collapsed = [...segments];
    collapsed[i - 1] = `${collapsed[i - 1]}-${collapsed[i]}`;
    collapsed.splice(i, 1);
    const candidate = `/${collapsed.join("/")}`;
    if (safeExists$1(candidate)) return candidate;
  }
  return naive;
}
function scanCursor() {
  return scanWorkspaceStorage(
    node_path.join(node_os.homedir(), "Library", "Application Support", "Cursor", "User", "workspaceStorage"),
    "cursor"
  );
}
function scanWindsurf() {
  return scanWorkspaceStorage(
    node_path.join(node_os.homedir(), "Library", "Application Support", "Windsurf", "User", "workspaceStorage"),
    "windsurf"
  );
}
function scanVSCode() {
  return scanWorkspaceStorage(
    node_path.join(node_os.homedir(), "Library", "Application Support", "Code", "User", "workspaceStorage"),
    "vscode"
  );
}
function scanWorkspaceStorage(dir, clientId) {
  if (!safeExists$1(dir)) return [];
  const hits = [];
  for (const entry of safeReaddir$1(dir)) {
    const workspaceFile = node_path.join(dir, entry, "workspace.json");
    if (!safeExists$1(workspaceFile)) continue;
    try {
      const { readFileSync } = require("node:fs");
      const raw = readFileSync(workspaceFile, "utf-8");
      const data = JSON.parse(raw);
      if (!data.folder) continue;
      const match = /^file:\/\/(.+)$/.exec(data.folder);
      if (!match?.[1]) continue;
      const path2 = node_path.resolve(decodeURIComponent(match[1]));
      hits.push({
        path: path2,
        clientId,
        lastSeenAt: safeMtime(workspaceFile)
      });
    } catch {
      continue;
    }
  }
  return hits;
}
function safeExists$1(path2) {
  try {
    return node_fs.existsSync(path2);
  } catch {
    return false;
  }
}
function safeReaddir$1(path2) {
  try {
    return node_fs.readdirSync(path2);
  } catch {
    return [];
  }
}
function safeMtime(path2) {
  try {
    return node_fs.statSync(path2).mtimeMs;
  } catch {
    return 0;
  }
}
function basename(path2) {
  const trimmed = path2.replace(/\/+$/, "");
  const idx = trimmed.lastIndexOf("/");
  return idx >= 0 ? trimmed.slice(idx + 1) : trimmed;
}
function skillDir(name) {
  return node_path.join(SKILLS_DIR, name);
}
function skillMdPath(name) {
  return node_path.join(skillDir(name), "SKILL.md");
}
function parseFrontmatter(text) {
  const lines = text.split("\n");
  if (!lines[0] || lines[0].trim() !== "---") {
    return { meta: {}, body: text };
  }
  let endIdx;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIdx = i;
      break;
    }
  }
  if (endIdx === void 0) {
    return { meta: {}, body: text };
  }
  const meta = {};
  for (let i = 1; i < endIdx; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      const inner = val.slice(1, -1);
      meta[key] = inner.split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
    } else {
      if (val.startsWith('"') && val.endsWith('"') || val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      meta[key] = val;
    }
  }
  const body = lines.slice(endIdx + 1).join("\n").trim();
  return { meta, body };
}
function formatFrontmatter(meta, body) {
  const lines = ["---"];
  for (const [key, val] of Object.entries(meta)) {
    if (Array.isArray(val)) {
      lines.push(`${key}: [${val.join(", ")}]`);
    } else {
      lines.push(`${key}: ${val}`);
    }
  }
  lines.push("---");
  lines.push("");
  if (body) lines.push(body);
  return `${lines.join("\n")}
`;
}
function frontmatterToSkill(text, nameOverride = "") {
  const { meta, body } = parseFrontmatter(text);
  const name = nameOverride || String(meta["name"] ?? "");
  const enabledVal = String(meta["enabled"] ?? "true").toLowerCase();
  let deps = meta["dependencies"] ?? [];
  if (typeof deps === "string") {
    deps = deps.split(",").map((d) => d.trim()).filter(Boolean);
  }
  let tags = meta["tags"] ?? [];
  if (typeof tags === "string") {
    tags = tags.split(",").map((t2) => t2.trim()).filter(Boolean);
  }
  const skill = {
    name,
    enabled: !["false", "0", "no"].includes(enabledVal),
    description: String(meta["description"] ?? ""),
    path: "",
    origin: String(meta["origin"] ?? ""),
    dependencies: deps,
    tags,
    mode: String(meta["mode"] ?? "pin")
  };
  return { skill, body };
}
function readSkillMd(name) {
  const path2 = skillMdPath(name);
  if (!node_fs.existsSync(path2)) return null;
  const text = node_fs.readFileSync(path2, "utf-8");
  const result = frontmatterToSkill(text, name);
  result.skill.path = path2;
  return result;
}
function listSkillDirs() {
  if (!node_fs.existsSync(SKILLS_DIR)) return [];
  return node_fs.readdirSync(SKILLS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory() && node_fs.existsSync(node_path.join(SKILLS_DIR, d.name, "SKILL.md"))).map((d) => d.name).sort();
}
function scanLibraryGlobal() {
  const tools = [];
  const home = node_os.homedir();
  const claudeDir = node_path.join(home, ".claude");
  const settingsPath2 = node_path.join(claudeDir, "settings.json");
  const userJsonPath = node_path.join(home, ".claude.json");
  const installedPluginsPath = node_path.join(claudeDir, "plugins", "installed_plugins.json");
  tools.push(...scanMcpServers(userJsonPath, { kind: "global" }));
  tools.push(...scanFileTools(node_path.join(claudeDir, "skills"), "skill", { kind: "global" }, true));
  tools.push(...scanFileTools(node_path.join(claudeDir, "agents"), "agent", { kind: "global" }, false));
  tools.push(...scanFileTools(node_path.join(claudeDir, "commands"), "command", { kind: "global" }, false));
  tools.push(...scanFileTools(node_path.join(claudeDir, "output-styles"), "style", { kind: "global" }, false));
  tools.push(...scanInstalledPlugins(installedPluginsPath, settingsPath2));
  if (safeExists(settingsPath2)) {
    const settings = safeParseJson(settingsPath2);
    if (settings) {
      tools.push(...scanHooks(settings, { kind: "global" }));
    }
  }
  return tools;
}
function scanLibraryProject(projectPath) {
  if (!safeExists(projectPath)) return [];
  const tools = [];
  const dotClaude = node_path.join(projectPath, ".claude");
  const scope = { kind: "project", path: projectPath };
  const mcpPath = node_path.join(projectPath, ".mcp.json");
  if (safeExists(mcpPath)) {
    const data = safeParseJson(mcpPath);
    if (data?.mcpServers && typeof data.mcpServers === "object") {
      for (const [name, def] of Object.entries(data.mcpServers)) {
        if (!name || typeof def !== "object" || def === null) continue;
        tools.push({
          id: `server:${name}`,
          type: "server",
          name,
          description: "",
          scope,
          origin: isManagedJson(def) ? "managed" : "discovered",
          filePath: mcpPath,
          detail: mcpDetail(def)
        });
      }
    }
  }
  if (safeExists(dotClaude)) {
    tools.push(...scanFileTools(node_path.join(dotClaude, "skills"), "skill", scope, true));
    tools.push(...scanFileTools(node_path.join(dotClaude, "agents"), "agent", scope, false));
    tools.push(...scanFileTools(node_path.join(dotClaude, "commands"), "command", scope, false));
    tools.push(...scanFileTools(node_path.join(dotClaude, "output-styles"), "style", scope, false));
    const settingsPath2 = node_path.join(dotClaude, "settings.json");
    if (safeExists(settingsPath2)) {
      const settings = safeParseJson(settingsPath2);
      if (settings) {
        tools.push(...scanProjectEnabledPlugins(settings, scope));
        tools.push(...scanHooks(settings, scope));
      }
    }
  }
  return tools;
}
function scanProjectEnabledPlugins(settings, scope) {
  const enabled = settings.enabledPlugins;
  if (!enabled || typeof enabled !== "object") return [];
  const out = [];
  for (const [key, value] of Object.entries(enabled)) {
    if (!key || value !== true) continue;
    const atIdx = key.lastIndexOf("@");
    const pluginName = atIdx > 0 ? key.slice(0, atIdx) : key;
    const marketplace = atIdx > 0 ? key.slice(atIdx + 1) : "";
    out.push({
      id: `plugin:${key}`,
      type: "plugin",
      name: pluginName,
      description: "",
      scope,
      origin: "discovered",
      detail: marketplace || "no marketplace",
      pluginEnabled: true,
      pluginMarketplace: marketplace
    });
  }
  return out;
}
function scanMcpServers(userJsonPath, scope) {
  if (!safeExists(userJsonPath)) return [];
  const data = safeParseJson(userJsonPath);
  if (!data?.mcpServers || typeof data.mcpServers !== "object") return [];
  const out = [];
  for (const [name, def] of Object.entries(data.mcpServers)) {
    if (!name || typeof def !== "object" || def === null) continue;
    out.push({
      id: `server:${name}`,
      type: "server",
      name,
      description: "",
      scope,
      origin: isManagedJson(def) ? "managed" : "discovered",
      filePath: userJsonPath,
      detail: mcpDetail(def)
    });
  }
  return out;
}
function scanFileTools(dir, type, scope, nested) {
  if (!safeExists(dir)) return [];
  const out = [];
  if (nested) {
    for (const entry of safeReaddir(dir)) {
      const subdir = node_path.join(dir, entry);
      if (!safeIsDir(subdir)) continue;
      const mdPath = node_path.join(subdir, "SKILL.md");
      if (!safeExists(mdPath)) continue;
      const tool = readMdTool(mdPath, type, scope, entry);
      if (tool) out.push(tool);
    }
  } else {
    for (const entry of safeReaddir(dir)) {
      if (!entry.endsWith(".md")) continue;
      const path2 = node_path.join(dir, entry);
      if (!safeIsFile(path2)) continue;
      const baseName = entry.replace(/\.md$/, "");
      const tool = readMdTool(path2, type, scope, baseName);
      if (tool) out.push(tool);
    }
  }
  return out;
}
function readMdTool(path2, type, scope, fallbackName) {
  try {
    const text = node_fs.readFileSync(path2, "utf-8");
    const { meta } = parseFrontmatter(text);
    const name = String(meta["name"] ?? fallbackName);
    const description = String(meta["description"] ?? "");
    const managed = String(meta["ensemble"] ?? "").toLowerCase() === "managed";
    return {
      id: `${type}:${name}`,
      type,
      name,
      description,
      scope,
      origin: managed ? "managed" : "discovered",
      filePath: path2,
      detail: description || shortPath(path2)
    };
  } catch {
    return null;
  }
}
function scanInstalledPlugins(installedPath, userSettingsPath) {
  if (!safeExists(installedPath)) return [];
  const data = safeParseJson(installedPath);
  if (!data) return [];
  const plugins = data.plugins;
  if (!plugins || typeof plugins !== "object") return [];
  const userSettings = safeExists(userSettingsPath) ? safeParseJson(userSettingsPath) : null;
  const enabledMap = userSettings?.enabledPlugins ?? {};
  const out = [];
  for (const [key, installsRaw] of Object.entries(plugins)) {
    if (!key) continue;
    const installs = Array.isArray(installsRaw) ? installsRaw : [];
    const atIdx = key.lastIndexOf("@");
    const pluginName = atIdx > 0 ? key.slice(0, atIdx) : key;
    const marketplace = atIdx > 0 ? key.slice(atIdx + 1) : "";
    const versions = /* @__PURE__ */ new Set();
    const scopes = /* @__PURE__ */ new Set();
    for (const install of installs) {
      if (typeof install.version === "string") versions.add(install.version);
      if (typeof install.scope === "string") scopes.add(install.scope);
    }
    const globallyEnabled = enabledMap[key] === true;
    const versionStr = Array.from(versions).join(", ") || "?";
    const detailBits = [marketplace || "no marketplace", `v${versionStr}`];
    if (globallyEnabled) detailBits.push("ENABLED");
    else if (enabledMap[key] === false) detailBits.push("DISABLED");
    out.push({
      id: `plugin:${key}`,
      type: "plugin",
      name: pluginName,
      description: "",
      scope: { kind: "global" },
      origin: "discovered",
      detail: detailBits.join(" · "),
      pluginEnabled: globallyEnabled,
      pluginMarketplace: marketplace
    });
  }
  return out;
}
function scanHooks(settings, scope) {
  const hooks = settings.hooks;
  if (!hooks || typeof hooks !== "object") return [];
  const out = [];
  for (const [event, entries] of Object.entries(hooks)) {
    if (!Array.isArray(entries)) continue;
    entries.forEach((entry, i) => {
      if (!entry || typeof entry !== "object") return;
      const matcher = entry.matcher ?? "";
      const hookSteps = entry.hooks;
      const stepCount = Array.isArray(hookSteps) ? hookSteps.length : 0;
      out.push({
        id: `hook:${event}:${i}`,
        type: "hook",
        name: `${event}${matcher ? ` · ${matcher}` : ""}`,
        description: `${stepCount} step${stepCount === 1 ? "" : "s"}`,
        scope,
        origin: "discovered",
        detail: matcher || event
      });
    });
  }
  return out;
}
function isManagedJson(value) {
  return typeof value === "object" && value !== null && "__ensemble" in value && value.__ensemble === true;
}
function mcpDetail(def) {
  const command = def.command;
  const url = def.url;
  const args = Array.isArray(def.args) ? def.args : [];
  if (command) return args.length ? `${command} ${args.join(" ")}` : command;
  if (url) return url;
  return "";
}
function safeExists(path2) {
  try {
    return node_fs.existsSync(path2);
  } catch {
    return false;
  }
}
function safeIsDir(path2) {
  try {
    return node_fs.statSync(path2).isDirectory();
  } catch {
    return false;
  }
}
function safeIsFile(path2) {
  try {
    return node_fs.statSync(path2).isFile();
  } catch {
    return false;
  }
}
function safeReaddir(path2) {
  try {
    return node_fs.readdirSync(path2);
  } catch {
    return [];
  }
}
function safeParseJson(path2) {
  try {
    const raw = node_fs.readFileSync(path2, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
    return null;
  } catch {
    return null;
  }
}
function shortPath(path2) {
  return path2.replace(node_os.homedir(), "~");
}
function libraryRoot() {
  const override = process.env.ENSEMBLE_LIBRARY_ROOT;
  if (override) return override;
  return node_path.join(node_os.homedir(), ".config", "ensemble", "library");
}
function manifestPath() {
  return node_path.join(libraryRoot(), "library.json");
}
function subdirForType(type) {
  switch (type) {
    case "skill":
      return "skills";
    case "agent":
      return "agents";
    case "command":
      return "commands";
    case "style":
      return "styles";
  }
}
function canonicalPath(type, name) {
  const sub = subdirForType(type);
  if (type === "skill") {
    return node_path.join(libraryRoot(), sub, name, "SKILL.md");
  }
  return node_path.join(libraryRoot(), sub, `${name}.md`);
}
function isFileToolType(type) {
  return type === "skill" || type === "agent" || type === "command" || type === "style";
}
function libraryStoreExists() {
  return node_fs.existsSync(manifestPath());
}
function readManifest() {
  const path2 = manifestPath();
  if (!node_fs.existsSync(path2)) return null;
  try {
    const raw = node_fs.readFileSync(path2, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1 || typeof parsed.entries !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}
function writeManifest(manifest) {
  const path2 = manifestPath();
  node_fs.mkdirSync(node_path.dirname(path2), { recursive: true });
  const next = { ...manifest, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  node_fs.writeFileSync(path2, `${JSON.stringify(next, null, 2)}
`, "utf-8");
}
function emptyManifest() {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    entries: {},
    ignored: []
  };
}
function hashFile(path2) {
  const bytes = node_fs.readFileSync(path2);
  return node_crypto.createHash("sha256").update(bytes).digest("hex");
}
function readServerDefFromJson(jsonPath, serverName) {
  try {
    const data = JSON.parse(node_fs.readFileSync(jsonPath, "utf-8"));
    const servers = data.mcpServers ?? {};
    const def = servers[serverName];
    if (typeof def !== "object" || def === null) return null;
    return def;
  } catch {
    return null;
  }
}
function buildFileEntry(tool, createdAt) {
  if (!isFileToolType(tool.type)) return null;
  if (!tool.filePath || !node_fs.existsSync(tool.filePath)) return null;
  const canonicalDest = canonicalPath(tool.type, tool.name);
  node_fs.mkdirSync(node_path.dirname(canonicalDest), { recursive: true });
  if (tool.type === "skill") {
    node_fs.cpSync(node_path.dirname(tool.filePath), node_path.dirname(canonicalDest), { recursive: true });
  } else {
    node_fs.cpSync(tool.filePath, canonicalDest);
  }
  const hash = hashFile(canonicalDest);
  const relPath = node_path.relative(libraryRoot(), canonicalDest);
  return {
    id: `${tool.name}@discovered`,
    type: tool.type,
    name: tool.name,
    source: "@discovered",
    filePath: relPath,
    contentHash: hash,
    createdAt
  };
}
function buildServerEntry(tool, createdAt) {
  if (tool.type !== "server") return null;
  if (!tool.filePath || !node_fs.existsSync(tool.filePath)) return null;
  const def = readServerDefFromJson(tool.filePath, tool.name);
  if (!def) return null;
  const { __ensemble, ...cleanDef } = def;
  return {
    id: `${tool.name}@discovered`,
    type: "server",
    name: tool.name,
    source: "@discovered",
    serverDef: cleanDef,
    createdAt
  };
}
function buildPluginEntry(tool, createdAt) {
  if (tool.type !== "plugin") return null;
  const marketplace = tool.pluginMarketplace || "";
  const source = marketplace || "@discovered";
  return {
    id: `${tool.name}@${source}`,
    type: "plugin",
    name: tool.name,
    source,
    pluginMarketplace: marketplace || void 0,
    createdAt
  };
}
function buildEntry(tool, createdAt) {
  if (tool.type === "hook") return null;
  if (tool.type === "server") return buildServerEntry(tool, createdAt);
  if (tool.type === "plugin") return buildPluginEntry(tool, createdAt);
  return buildFileEntry(tool, createdAt);
}
function bootstrapLibrary(projectPaths = []) {
  const start = Date.now();
  if (libraryStoreExists()) {
    const existing = readManifest();
    return {
      created: false,
      entriesTotal: existing ? Object.keys(existing.entries).length : 0,
      entriesAdded: 0,
      byType: {},
      adoptedFrom: {},
      durationMs: Date.now() - start
    };
  }
  const manifest = emptyManifest();
  const byType = {};
  const adoptedFrom = {};
  const seen = /* @__PURE__ */ new Set();
  const dedupKey = (tool) => tool.type === "plugin" ? `plugin:${tool.name}@${tool.pluginMarketplace || ""}` : `${tool.type}:${tool.name}`;
  const processTool = (tool, origin) => {
    const key = dedupKey(tool);
    if (seen.has(key)) return;
    seen.add(key);
    const entry = buildEntry(tool, manifest.createdAt);
    if (!entry) return;
    manifest.entries[entry.id] = entry;
    byType[tool.type] = (byType[tool.type] ?? 0) + 1;
    adoptedFrom[entry.id] = origin;
  };
  try {
    for (const tool of scanLibraryGlobal()) processTool(tool, "global");
  } catch {
  }
  for (const projectPath of projectPaths) {
    try {
      for (const tool of scanLibraryProject(projectPath)) processTool(tool, projectPath);
    } catch {
    }
  }
  writeManifest(manifest);
  return {
    created: true,
    entriesTotal: Object.keys(manifest.entries).length,
    entriesAdded: Object.keys(manifest.entries).length,
    byType,
    adoptedFrom,
    durationMs: Date.now() - start
  };
}
function listEntries(manifest) {
  return Object.values(manifest.entries).sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.name.localeCompare(b.name);
  });
}
function adoptOrphan(tool) {
  const manifest = readManifest();
  if (!manifest) return { ok: false, reason: "library store does not exist" };
  const entry = buildEntry(tool, (/* @__PURE__ */ new Date()).toISOString());
  if (!entry) return { ok: false, reason: `cannot adopt tool of type ${tool.type}` };
  if (manifest.entries[entry.id]) {
    return { ok: true, id: entry.id, reason: "already present" };
  }
  manifest.entries[entry.id] = entry;
  const ignoredIdx = manifest.ignored.indexOf(entry.id);
  if (ignoredIdx >= 0) manifest.ignored.splice(ignoredIdx, 1);
  writeManifest(manifest);
  return { ok: true, id: entry.id };
}
function promoteDrift(tool) {
  const manifest = readManifest();
  if (!manifest) return { ok: false, reason: "library store does not exist" };
  const id = proposedId(tool);
  const existing = manifest.entries[id];
  if (!existing) return { ok: false, reason: `no entry ${id} to promote` };
  const rebuilt = buildEntry(tool, existing.createdAt);
  if (!rebuilt) return { ok: false, reason: "cannot rebuild entry" };
  manifest.entries[id] = rebuilt;
  writeManifest(manifest);
  return { ok: true, id };
}
function ignoreEntry(id) {
  const manifest = readManifest();
  if (!manifest) return { ok: false, reason: "library store does not exist" };
  if (!manifest.ignored.includes(id)) manifest.ignored.push(id);
  writeManifest(manifest);
  return { ok: true, id };
}
function unignoreEntry(id) {
  const manifest = readManifest();
  if (!manifest) return { ok: false, reason: "library store does not exist" };
  const idx = manifest.ignored.indexOf(id);
  if (idx >= 0) manifest.ignored.splice(idx, 1);
  writeManifest(manifest);
  return { ok: true, id };
}
function relinkEntrySource(id, newSource) {
  if (!newSource || newSource.trim().length === 0) {
    return { ok: false, reason: "new source must be non-empty" };
  }
  const manifest = readManifest();
  if (!manifest) return { ok: false, reason: "library store does not exist" };
  const entry = manifest.entries[id];
  if (!entry) return { ok: false, reason: `no entry ${id}` };
  const newId = `${entry.name}@${newSource}`;
  if (newId === id) return { ok: true, id };
  if (manifest.entries[newId]) {
    return { ok: false, reason: `entry ${newId} already exists` };
  }
  manifest.entries[newId] = {
    ...entry,
    id: newId,
    source: newSource,
    pluginMarketplace: entry.type === "plugin" ? newSource : entry.pluginMarketplace
  };
  delete manifest.entries[id];
  writeManifest(manifest);
  return { ok: true, id: newId };
}
function removeEntry(id) {
  const manifest = readManifest();
  if (!manifest) return { ok: false, reason: "library store does not exist" };
  const entry = manifest.entries[id];
  if (!entry) return { ok: false, reason: `no entry ${id}` };
  if (isFileToolType(entry.type) && entry.filePath) {
    const absPath = node_path.join(libraryRoot(), entry.filePath);
    try {
      if (entry.type === "skill") {
        node_fs.rmSync(node_path.dirname(absPath), { recursive: true, force: true });
      } else if (node_fs.existsSync(absPath)) {
        node_fs.rmSync(absPath, { force: true });
      }
    } catch {
    }
  }
  delete manifest.entries[id];
  if (!manifest.ignored.includes(id)) manifest.ignored.push(id);
  writeManifest(manifest);
  return { ok: true, id };
}
function proposedId(tool) {
  if (tool.type === "plugin") {
    const marketplace = tool.pluginMarketplace || "@discovered";
    return `${tool.name}@${marketplace}`;
  }
  return `${tool.name}@discovered`;
}
function reconcile(manifest, scan) {
  const result = { matches: [], drifts: [], orphans: [], ignored: [] };
  const ignoredSet = new Set(manifest.ignored);
  for (const tool of scan) {
    if (tool.type === "hook") continue;
    const id = proposedId(tool);
    const entry = manifest.entries[id];
    if (!entry) {
      if (ignoredSet.has(id)) result.ignored.push({ tool, id });
      else result.orphans.push({ tool, proposedId: id });
      continue;
    }
    const drift = checkDrift$1(tool, entry);
    if (drift) result.drifts.push({ tool, entry, reason: drift });
    else result.matches.push({ tool, entry });
  }
  return result;
}
function checkDrift$1(tool, entry) {
  if (isFileToolType(tool.type)) {
    if (!tool.filePath || !node_fs.existsSync(tool.filePath)) return null;
    if (!entry.contentHash) return null;
    try {
      const diskHash = hashFile(tool.filePath);
      return diskHash === entry.contentHash ? null : "content-hash-mismatch";
    } catch {
      return "unknown";
    }
  }
  if (tool.type === "server") {
    if (!tool.filePath || !node_fs.existsSync(tool.filePath)) return null;
    if (!entry.serverDef) return null;
    const diskDef = readServerDefFromJson(tool.filePath, tool.name);
    if (!diskDef) return null;
    const { __ensemble, ...cleanDisk } = diskDef;
    return shallowDefEqual(cleanDisk, entry.serverDef) ? null : "server-def-mismatch";
  }
  return null;
}
function shallowDefEqual(a, b) {
  const ak = Object.keys(a).sort();
  const bk = Object.keys(b).sort();
  if (ak.length !== bk.length) return false;
  for (let i = 0; i < ak.length; i++) {
    if (ak[i] !== bk[i]) return false;
  }
  return JSON.stringify(sortedStringify(a)) === JSON.stringify(sortedStringify(b));
}
function sortedStringify(value) {
  if (Array.isArray(value)) return value.map(sortedStringify);
  if (value && typeof value === "object") {
    const obj = value;
    const out = {};
    for (const key of Object.keys(obj).sort()) out[key] = sortedStringify(obj[key]);
    return out;
  }
  return value;
}
function scopeBase(scope) {
  if (scope.kind === "global") return node_path.join(node_os.homedir(), ".claude");
  if (scope.kind === "library") {
    throw new Error("scopeBase() not valid for library scope");
  }
  return node_path.join(scope.path, ".claude");
}
function mdPathForTool(scope, type, name) {
  const base = scopeBase(scope);
  switch (type) {
    case "skill":
      return node_path.join(base, "skills", name, "SKILL.md");
    case "agent":
      return node_path.join(base, "agents", `${name}.md`);
    case "command":
      return node_path.join(base, "commands", `${name}.md`);
    case "style":
      return node_path.join(base, "output-styles", `${name}.md`);
    default:
      return null;
  }
}
function mcpFilePath(scope) {
  if (scope.kind === "global") return node_path.join(node_os.homedir(), ".claude.json");
  if (scope.kind === "library") {
    throw new Error("mcpFilePath() not valid for library scope");
  }
  return node_path.join(scope.path, ".mcp.json");
}
function settingsPath(scope) {
  return node_path.join(scopeBase(scope), "settings.json");
}
function wireTool(req) {
  try {
    if (req.type === "hook") {
      return { ok: false, action: "skipped", reason: "hooks are read-only in v1" };
    }
    if (req.target.kind === "library") {
      return { ok: false, action: "skipped", reason: "library is not a valid wire target" };
    }
    if (scopesEqual(req.source, req.target)) {
      return { ok: true, action: "skipped", reason: "same-scope" };
    }
    const wireResult = wireByType(req);
    if (!wireResult.ok) return wireResult;
    const mode = req.mode ?? "move";
    if (mode === "copy") {
      return { ...wireResult, sourceUnwired: false };
    }
    if (req.source.kind === "library") {
      return { ...wireResult, sourceUnwired: false };
    }
    const unwire = unwireTool({
      type: req.type,
      name: req.name,
      scope: req.source
    });
    return {
      ...wireResult,
      sourceUnwired: unwire.ok && unwire.action === "unwired",
      reason: unwire.ok && unwire.action === "unwired" ? wireResult.reason : `moved to target; source left in place (${unwire.reason ?? "not ensemble-managed"})`
    };
  } catch (e) {
    return { ok: false, action: "failed", reason: e instanceof Error ? e.message : String(e) };
  }
}
function wireByType(req) {
  if (["skill", "agent", "command", "style"].includes(req.type)) {
    return wireMdTool(req);
  }
  if (req.type === "server") {
    return wireMcpServer(req);
  }
  if (req.type === "plugin") {
    return wirePlugin(req);
  }
  return { ok: false, action: "skipped", reason: `unknown type: ${req.type}` };
}
function scopesEqual(a, b) {
  if (a.kind === "global" && b.kind === "global") return true;
  if (a.kind === "project" && b.kind === "project") return a.path === b.path;
  return false;
}
function unwireTool(req) {
  try {
    if (req.type === "hook") {
      return { ok: false, action: "skipped", reason: "hooks are read-only in v1" };
    }
    if (["skill", "agent", "command", "style"].includes(req.type)) {
      return unwireMdTool(req);
    }
    if (req.type === "server") {
      return unwireMcpServer(req);
    }
    if (req.type === "plugin") {
      return unwirePlugin(req);
    }
    return { ok: false, action: "skipped", reason: `unknown type: ${req.type}` };
  } catch (e) {
    return { ok: false, action: "failed", reason: e instanceof Error ? e.message : String(e) };
  }
}
function wireMdTool(req) {
  const targetPath = mdPathForTool(req.target, req.type, req.name);
  if (!targetPath) return { ok: false, action: "failed", reason: "bad tool type" };
  const sourcePath = req.source.kind === "library" ? canonicalPath(req.type, req.name) : mdPathForTool(req.source, req.type, req.name);
  if (!sourcePath) return { ok: false, action: "failed", reason: "bad tool type" };
  if (!node_fs.existsSync(sourcePath)) {
    return { ok: false, action: "failed", reason: `source not found: ${sourcePath}` };
  }
  if (req.type === "skill" && req.source.kind === "library") {
    const targetDir = node_path.dirname(targetPath);
    node_fs.mkdirSync(node_path.dirname(targetDir), { recursive: true });
    node_fs.cpSync(node_path.dirname(sourcePath), targetDir, { recursive: true });
    try {
      const text2 = node_fs.readFileSync(targetPath, "utf-8");
      const { meta: meta2, body: body2 } = parseFrontmatter(text2);
      meta2["ensemble"] = "managed";
      node_fs.writeFileSync(targetPath, formatFrontmatter(meta2, body2), "utf-8");
    } catch {
    }
    return { ok: true, action: "wired" };
  }
  const text = node_fs.readFileSync(sourcePath, "utf-8");
  const { meta, body } = parseFrontmatter(text);
  meta["ensemble"] = "managed";
  const marked = formatFrontmatter(meta, body);
  node_fs.mkdirSync(node_path.dirname(targetPath), { recursive: true });
  node_fs.writeFileSync(targetPath, marked, "utf-8");
  return { ok: true, action: "wired" };
}
function unwireMdTool(req) {
  const path2 = mdPathForTool(req.scope, req.type, req.name);
  if (!path2) return { ok: false, action: "failed", reason: "bad tool type" };
  if (!node_fs.existsSync(path2)) {
    return { ok: true, action: "skipped", reason: "not present" };
  }
  try {
    const text = node_fs.readFileSync(path2, "utf-8");
    const { meta } = parseFrontmatter(text);
    if (String(meta["ensemble"] ?? "").toLowerCase() !== "managed") {
      return { ok: false, action: "skipped", reason: "not ensemble-managed; refusing to delete" };
    }
  } catch (e) {
    return { ok: false, action: "failed", reason: `read failed: ${e instanceof Error ? e.message : e}` };
  }
  if (req.type === "skill") {
    node_fs.rmSync(node_path.dirname(path2), { recursive: true, force: true });
  } else {
    node_fs.unlinkSync(path2);
  }
  return { ok: true, action: "unwired" };
}
function wireMcpServer(req) {
  let sourceDef;
  if (req.source.kind === "library") {
    const manifest = readManifest();
    const entry = manifest?.entries[`${req.name}@discovered`];
    sourceDef = entry?.serverDef ?? null;
  } else {
    sourceDef = readMcpServerDef(req.source, req.name);
  }
  if (!sourceDef) {
    return { ok: false, action: "failed", reason: `source server not found: ${req.name}` };
  }
  const marked = { ...sourceDef, __ensemble: true };
  writeMcpServerDef(req.target, req.name, marked);
  return { ok: true, action: "wired" };
}
function unwireMcpServer(req) {
  const def = readMcpServerDef(req.scope, req.name);
  if (!def) return { ok: true, action: "skipped", reason: "not present" };
  if (def.__ensemble !== true) {
    return {
      ok: false,
      action: "skipped",
      reason: "not ensemble-managed; refusing to remove"
    };
  }
  removeMcpServerDef(req.scope, req.name);
  return { ok: true, action: "unwired" };
}
function readMcpServerDef(scope, name) {
  const path2 = mcpFilePath(scope);
  if (!node_fs.existsSync(path2)) return null;
  try {
    const data = JSON.parse(node_fs.readFileSync(path2, "utf-8"));
    const servers = data.mcpServers ?? {};
    const def = servers[name];
    if (typeof def !== "object" || def === null) return null;
    return def;
  } catch {
    return null;
  }
}
function writeMcpServerDef(scope, name, def) {
  const path2 = mcpFilePath(scope);
  node_fs.mkdirSync(node_path.dirname(path2), { recursive: true });
  let data = {};
  if (node_fs.existsSync(path2)) {
    try {
      data = JSON.parse(node_fs.readFileSync(path2, "utf-8"));
    } catch {
      data = {};
    }
  }
  const servers = data.mcpServers ?? {};
  servers[name] = def;
  data.mcpServers = servers;
  node_fs.writeFileSync(path2, `${JSON.stringify(data, null, 2)}
`, "utf-8");
}
function removeMcpServerDef(scope, name) {
  const path2 = mcpFilePath(scope);
  if (!node_fs.existsSync(path2)) return;
  let data = {};
  try {
    data = JSON.parse(node_fs.readFileSync(path2, "utf-8"));
  } catch {
    return;
  }
  const servers = data.mcpServers ?? {};
  delete servers[name];
  data.mcpServers = servers;
  node_fs.writeFileSync(path2, `${JSON.stringify(data, null, 2)}
`, "utf-8");
}
function wirePlugin(req) {
  const key = req.name;
  const path2 = settingsPath(req.target);
  const settings = readSettings(path2);
  const enabled = settings.enabledPlugins ?? {};
  const managed = settings.__ensemble_plugins ?? [];
  enabled[key] = true;
  if (!managed.includes(key)) managed.push(key);
  settings.enabledPlugins = enabled;
  settings.__ensemble_plugins = managed;
  writeSettings(path2, settings);
  return { ok: true, action: "wired" };
}
function unwirePlugin(req) {
  const key = req.name;
  const path2 = settingsPath(req.scope);
  if (!node_fs.existsSync(path2)) return { ok: true, action: "skipped", reason: "no settings.json" };
  const settings = readSettings(path2);
  const enabled = settings.enabledPlugins ?? {};
  const managed = settings.__ensemble_plugins ?? [];
  if (!managed.includes(key)) {
    return {
      ok: false,
      action: "skipped",
      reason: "not ensemble-managed; refusing to remove"
    };
  }
  delete enabled[key];
  settings.enabledPlugins = enabled;
  settings.__ensemble_plugins = managed.filter((k) => k !== key);
  writeSettings(path2, settings);
  return { ok: true, action: "unwired" };
}
function readSettings(path2) {
  if (!node_fs.existsSync(path2)) return {};
  try {
    return JSON.parse(node_fs.readFileSync(path2, "utf-8"));
  } catch {
    return {};
  }
}
function writeSettings(path2, settings) {
  node_fs.mkdirSync(node_path.dirname(path2), { recursive: true });
  node_fs.writeFileSync(path2, `${JSON.stringify(settings, null, 2)}
`, "utf-8");
}
const SECRET_PATTERNS = [
  { name: "OpenAI API Key", regex: /sk-[a-zA-Z0-9]{20,}/ },
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "GitHub PAT", regex: /ghp_[a-zA-Z0-9]{36}/ },
  { name: "GitHub User Token", regex: /ghu_[a-zA-Z0-9]{36}/ },
  { name: "GitHub Server Token", regex: /ghs_[a-zA-Z0-9]{36}/ },
  { name: "Slack Token", regex: /xox[bpas]-[a-zA-Z0-9-]+/ },
  { name: "Private Key", regex: /-----BEGIN.*PRIVATE KEY-----/ },
  { name: "GitLab PAT", regex: /glpat-[a-zA-Z0-9-]{20}/ }
];
function scanSecrets(env, serverName) {
  const violations = [];
  for (const [key, value] of Object.entries(env)) {
    if (!value || value.startsWith("op://")) continue;
    for (const { name, regex } of SECRET_PATTERNS) {
      if (regex.test(value)) {
        violations.push({
          pattern: name,
          field: key,
          serverName,
          snippet: `${value.slice(0, 8)}...`
        });
      }
    }
  }
  return violations;
}
function agentsRoot() {
  if (process.env.ENSEMBLE_AGENTS_DIR) return process.env.ENSEMBLE_AGENTS_DIR;
  return node_path.join(node_os.homedir(), ".config", "ensemble", "agents");
}
function agentPath(name) {
  return node_path.join(agentsRoot(), `${name}.md`);
}
function frontmatterToAgent(text, nameOverride = "") {
  const { meta, body } = parseFrontmatter(text);
  const name = nameOverride || String(meta.name ?? "");
  const enabledVal = String(meta.enabled ?? "true").toLowerCase();
  let tools = meta.tools ?? [];
  if (typeof tools === "string") {
    tools = tools.split(",").map((t2) => t2.trim()).filter(Boolean);
  }
  const modelValue = meta.model;
  const userNotesValue = meta.userNotes;
  const hashValue = meta.lastDescriptionHash;
  const agent = {
    name,
    enabled: !["false", "0", "no"].includes(enabledVal),
    description: String(meta.description ?? ""),
    tools,
    ...typeof modelValue === "string" && modelValue ? { model: modelValue } : {},
    path: "",
    ...typeof userNotesValue === "string" && userNotesValue ? { userNotes: userNotesValue } : {},
    ...typeof hashValue === "string" && hashValue ? { lastDescriptionHash: hashValue } : {}
  };
  return { agent, body };
}
function toFanoutContent$1(agent, body = "") {
  const meta = {
    __ensemble: "true",
    name: agent.name
  };
  if (agent.description) meta.description = agent.description;
  if (agent.tools.length > 0) meta.tools = agent.tools;
  if (agent.model) meta.model = agent.model;
  return formatFrontmatter(meta, body);
}
function readAgentMd(name) {
  const path2 = agentPath(name);
  if (!node_fs.existsSync(path2)) return null;
  const text = node_fs.readFileSync(path2, "utf-8");
  const result = frontmatterToAgent(text, name);
  result.agent.path = path2;
  return result;
}
function commandsRoot() {
  if (process.env.ENSEMBLE_COMMANDS_DIR) return process.env.ENSEMBLE_COMMANDS_DIR;
  return node_path.join(node_os.homedir(), ".config", "ensemble", "commands");
}
function commandPath(name) {
  return node_path.join(commandsRoot(), `${name}.md`);
}
function frontmatterToCommand(text, nameOverride = "") {
  const { meta, body } = parseFrontmatter(text);
  const name = nameOverride || String(meta.name ?? "");
  const enabledVal = String(meta.enabled ?? "true").toLowerCase();
  let allowedTools = meta["allowed-tools"] ?? [];
  if (typeof allowedTools === "string") {
    allowedTools = allowedTools.split(",").map((t2) => t2.trim()).filter(Boolean);
  }
  const argHintValue = meta["argument-hint"];
  const userNotesValue = meta.userNotes;
  const hashValue = meta.lastDescriptionHash;
  const command = {
    name,
    enabled: !["false", "0", "no"].includes(enabledVal),
    description: String(meta.description ?? ""),
    allowedTools,
    ...typeof argHintValue === "string" && argHintValue ? { argumentHint: argHintValue } : {},
    path: "",
    ...typeof userNotesValue === "string" && userNotesValue ? { userNotes: userNotesValue } : {},
    ...typeof hashValue === "string" && hashValue ? { lastDescriptionHash: hashValue } : {}
  };
  return { command, body };
}
function toFanoutContent(command, body = "") {
  const meta = {
    __ensemble: "true",
    name: command.name
  };
  if (command.description) meta.description = command.description;
  if (command.allowedTools.length > 0) meta["allowed-tools"] = command.allowedTools;
  if (command.argumentHint) meta["argument-hint"] = command.argumentHint;
  return formatFrontmatter(meta, body);
}
function readCommandMd(name) {
  const path2 = commandPath(name);
  if (!node_fs.existsSync(path2)) return null;
  const text = node_fs.readFileSync(path2, "utf-8");
  const result = frontmatterToCommand(text, name);
  result.command.path = path2;
  return result;
}
function snapshotsRoot() {
  if (process.env.ENSEMBLE_SNAPSHOTS_DIR) return process.env.ENSEMBLE_SNAPSHOTS_DIR;
  return node_path.join(node_os.homedir(), ".config", "ensemble", "snapshots");
}
function snapshotDir(id) {
  return node_path.join(snapshotsRoot(), id);
}
function encodePath(absPath) {
  const hash = node_crypto.createHash("sha1").update(absPath).digest("hex").slice(0, 8);
  const sanitized = absPath.split(node_path.sep).filter(Boolean).join("__").replace(/[^A-Za-z0-9._-]/g, "_");
  return `${hash}__${sanitized}`;
}
function shortHash(input) {
  return node_crypto.createHash("sha256").update(input).digest("hex").slice(0, 6);
}
function generateId(files, now = /* @__PURE__ */ new Date()) {
  const stamp = now.toISOString().replace(/[:]/g, "-");
  const seed = `${files.slice().sort().join("|")}|${node_crypto.randomBytes(4).toString("hex")}`;
  return `${stamp}-${shortHash(seed)}`;
}
function capture(files, options = {}) {
  const absUnique = Array.from(
    new Set(files.filter((f) => typeof f === "string" && f.length > 0).map((f) => node_path.resolve(f)))
  );
  const id = options.idOverride ?? generateId(absUnique);
  const dir = snapshotDir(id);
  node_fs.mkdirSync(dir, { recursive: true });
  const filesDir = node_path.join(dir, "files");
  node_fs.mkdirSync(filesDir, { recursive: true });
  const entries = [];
  for (const absPath of absUnique) {
    if (node_fs.existsSync(absPath)) {
      const encoded = encodePath(absPath);
      const dest = node_path.join(filesDir, encoded);
      node_fs.copyFileSync(absPath, dest);
      entries.push({
        path: absPath,
        state: "existing",
        preContentPath: node_path.join("files", encoded)
      });
    } else {
      entries.push({ path: absPath, state: "new-file" });
    }
  }
  const snapshot = {
    id,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    syncContext: options.syncContext,
    files: entries
  };
  node_fs.writeFileSync(node_path.join(dir, "manifest.json"), `${JSON.stringify(snapshot, null, 2)}
`, "utf-8");
  return snapshot;
}
function list() {
  const root = snapshotsRoot();
  if (!node_fs.existsSync(root)) return [];
  const dirs = node_fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());
  const snapshots = [];
  for (const d of dirs) {
    const manifestPath2 = node_path.join(root, d.name, "manifest.json");
    if (!node_fs.existsSync(manifestPath2)) continue;
    try {
      const raw = node_fs.readFileSync(manifestPath2, "utf-8");
      const parsed = SnapshotSchema.parse(JSON.parse(raw));
      snapshots.push(parsed);
    } catch {
    }
  }
  return snapshots.sort(
    (a, b) => a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  );
}
function get(id) {
  const manifestPath2 = node_path.join(snapshotDir(id), "manifest.json");
  if (!node_fs.existsSync(manifestPath2)) {
    throw new Error(`Snapshot '${id}' not found`);
  }
  const raw = node_fs.readFileSync(manifestPath2, "utf-8");
  return SnapshotSchema.parse(JSON.parse(raw));
}
function restore(snapshotId) {
  const snapshot = get(snapshotId);
  const dir = snapshotDir(snapshotId);
  const restored = [];
  const deleted = [];
  const missing = [];
  for (const entry of snapshot.files) {
    if (entry.state === "existing") {
      if (!entry.preContentPath) {
        missing.push(entry.path);
        continue;
      }
      const src = node_path.join(dir, entry.preContentPath);
      if (!node_fs.existsSync(src)) {
        missing.push(entry.path);
        continue;
      }
      node_fs.mkdirSync(node_path.dirname(entry.path), { recursive: true });
      node_fs.copyFileSync(src, entry.path);
      restored.push(entry.path);
    } else {
      if (node_fs.existsSync(entry.path)) {
        node_fs.rmSync(entry.path, { force: true });
      }
      deleted.push(entry.path);
    }
  }
  return { snapshotId, restored, deleted, missing };
}
function prune(options = {}) {
  const retentionDays = options.retentionDays ?? 30;
  if (retentionDays <= 0) return [];
  const now = options.now ?? /* @__PURE__ */ new Date();
  const cutoffMs = now.getTime() - retentionDays * 24 * 60 * 60 * 1e3;
  const root = snapshotsRoot();
  if (!node_fs.existsSync(root)) return [];
  const pruned = [];
  for (const d of node_fs.readdirSync(root, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const dir = node_path.join(root, d.name);
    const manifestPath2 = node_path.join(dir, "manifest.json");
    let createdMs;
    if (node_fs.existsSync(manifestPath2)) {
      try {
        const raw = node_fs.readFileSync(manifestPath2, "utf-8");
        const parsed = SnapshotSchema.parse(JSON.parse(raw));
        createdMs = Date.parse(parsed.createdAt);
        if (Number.isNaN(createdMs)) {
          createdMs = node_fs.statSync(dir).mtimeMs;
        }
      } catch {
        createdMs = node_fs.statSync(dir).mtimeMs;
      }
    } else {
      createdMs = node_fs.statSync(dir).mtimeMs;
    }
    if (createdMs < cutoffMs) {
      node_fs.rmSync(dir, { recursive: true, force: true });
      pruned.push(node_path.basename(dir));
    }
  }
  return pruned;
}
const MANAGED_KEYS_FIELD = "__ensemble_managed";
function splitPath(keyPath) {
  if (!keyPath) return [];
  return keyPath.split(".").filter((p) => p.length > 0);
}
function getByPath(obj, parts) {
  let cur = obj;
  for (const p of parts) {
    if (typeof cur !== "object" || cur === null) return void 0;
    cur = cur[p];
  }
  return cur;
}
function setByPath(target, parts, value) {
  if (parts.length === 0) return;
  let cur = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (p === void 0) return;
    const existing = cur[p];
    if (typeof existing !== "object" || existing === null || Array.isArray(existing)) {
      cur[p] = {};
    }
    cur = cur[p];
  }
  const leaf = parts[parts.length - 1];
  if (leaf === void 0) return;
  cur[leaf] = value;
}
function deleteByPath(target, parts) {
  if (parts.length === 0) return;
  let cur = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (p === void 0) return;
    const next = cur?.[p];
    if (typeof next !== "object" || next === null || Array.isArray(next)) return;
    cur = next;
  }
  const leaf = parts[parts.length - 1];
  if (cur && leaf !== void 0 && leaf in cur) {
    Reflect.deleteProperty(cur, leaf);
  }
}
function deepClone(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => deepClone(v));
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = deepClone(v);
  }
  return out;
}
function mergeSettings(existing, managed, ownedKeys, options = {}) {
  const releasePreviouslyOwned = options.releasePreviouslyOwned ?? true;
  const merged = deepClone(existing);
  const previouslyOwned = readOwnedKeys(merged);
  if (releasePreviouslyOwned) {
    const nowOwnedSet = new Set(ownedKeys);
    for (const prevPath of previouslyOwned) {
      if (!nowOwnedSet.has(prevPath)) {
        deleteByPath(merged, splitPath(prevPath));
      }
    }
  }
  const normalisedPaths = [];
  for (const keyPath of ownedKeys) {
    const parts = splitPath(keyPath);
    if (parts.length === 0) continue;
    const value = getByPath(managed, parts);
    if (value === void 0) continue;
    setByPath(merged, parts, deepClone(value));
    normalisedPaths.push(parts.join("."));
  }
  const sortedOwned = Array.from(new Set(normalisedPaths)).sort();
  if (sortedOwned.length > 0) {
    merged[MANAGED_KEYS_FIELD] = sortedOwned;
  } else {
    Reflect.deleteProperty(merged, MANAGED_KEYS_FIELD);
  }
  return { merged, ownedKeys: sortedOwned };
}
function readOwnedKeys(settings) {
  const raw = settings[MANAGED_KEYS_FIELD];
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const entry of raw) {
    if (typeof entry === "string" && entry.length > 0) out.push(entry);
  }
  return out;
}
function hooksRoot() {
  if (process.env.ENSEMBLE_HOOKS_DIR) return process.env.ENSEMBLE_HOOKS_DIR;
  return node_path.join(node_os.homedir(), ".config", "ensemble", "hooks");
}
function describeHook(hook) {
  return `${hook.event} → ${hook.matcher}`;
}
function withDescription(hook) {
  return { ...hook, description: describeHook(hook) };
}
function listHooks() {
  const dir = hooksRoot();
  if (!node_fs.existsSync(dir)) return [];
  const entries = node_fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile() && e.name.endsWith(".json")).sort((a, b) => a.name.localeCompare(b.name));
  const hooks = [];
  for (const entry of entries) {
    const raw = node_fs.readFileSync(node_path.join(dir, entry.name), "utf-8");
    try {
      const parsed = HookSchema.safeParse(JSON.parse(raw));
      if (parsed.success) hooks.push(withDescription(parsed.data));
    } catch {
    }
  }
  return hooks;
}
function toSettingsEntry(hook) {
  return {
    __ensemble: true,
    matcher: hook.matcher,
    hooks: [{ type: "command", command: hook.command }]
  };
}
function buildHooksSettings(libraryHooks, existingHooks) {
  const managedByEvent = /* @__PURE__ */ new Map();
  for (const h of libraryHooks) {
    const bucket = managedByEvent.get(h.event) ?? [];
    bucket.push(toSettingsEntry(h));
    managedByEvent.set(h.event, bucket);
  }
  const result = {};
  const events = /* @__PURE__ */ new Set([
    ...Object.keys(existingHooks ?? {}),
    ...Array.from(managedByEvent.keys())
  ]);
  for (const event of events) {
    const existing = existingHooks?.[event];
    const userAuthored = [];
    if (Array.isArray(existing)) {
      for (const entry of existing) {
        if (entry && typeof entry === "object" && entry.__ensemble !== true) {
          userAuthored.push(entry);
        }
      }
    }
    const managed = managedByEvent.get(event) ?? [];
    const combined = [...userAuthored, ...managed];
    if (combined.length > 0) {
      result[event] = combined;
    }
  }
  return result;
}
function detectDrift(managed, storedHashes) {
  const drifted = [];
  for (const [name, entry] of Object.entries(managed)) {
    const stored = storedHashes[name];
    if (stored) {
      const current = computeEntryHash(entry);
      if (current !== stored) {
        drifted.push({ name, currentHash: current, storedHash: stored });
      }
    }
  }
  return drifted;
}
function syncClient(config, clientId, options) {
  const clientDef = CLIENTS[clientId];
  if (!clientDef) {
    return {
      config,
      result: {
        clientId,
        clientName: clientId,
        actions: [],
        messages: [`Unknown client: ${clientId}`],
        hasChanges: false,
        drifted: [],
        newHashes: {}
      }
    };
  }
  const dryRun = options?.dryRun ?? false;
  const force = options?.force ?? false;
  const adopt = options?.adopt ?? false;
  const assignment = getClient(config, clientId);
  const servers = resolveServers(config, clientId);
  const newEntries = {};
  for (const s of servers) {
    newEntries[s.name] = serverToClientEntry(s);
  }
  const storedHashes = assignment?.server_hashes ?? {};
  const paths = resolvedPaths(clientDef);
  if (paths.length === 0) {
    return {
      config,
      result: {
        clientId,
        clientName: clientDef.name,
        actions: [],
        messages: [`${clientDef.name}: no config files found`],
        hasChanges: false,
        drifted: [],
        newHashes: {}
      }
    };
  }
  const allActions = [];
  const allDrifted = [];
  const newHashes = {};
  let snapshotId;
  let snapshotFiles;
  const prewriteCapture = () => {
    if (dryRun || snapshotId) return;
    const toCapture = /* @__PURE__ */ new Set();
    for (const p of paths) toCapture.add(p);
    if (clientId === "claude-code") {
      toCapture.add(ccSettingsPath());
      const ccAssignment = getClient(config, clientId);
      if (ccAssignment) {
        for (const projPath of Object.keys(ccAssignment.projects)) {
          const absProj = node_path.resolve(expandPath(projPath));
          toCapture.add(node_path.join(absProj, ".claude", "settings.json"));
          toCapture.add(node_path.join(absProj, ".claude", "settings.local.json"));
        }
      }
    }
    if (clientDef.agentsDir) {
      const agentsOutDir = expandPath(clientDef.agentsDir);
      for (const a of resolveAgents(config)) {
        toCapture.add(node_path.join(agentsOutDir, `${a.name}.md`));
      }
    }
    if (clientDef.commandsDir) {
      const commandsOutDir = expandPath(clientDef.commandsDir);
      for (const c of resolveCommands(config)) {
        toCapture.add(node_path.join(commandsOutDir, `${c.name}.md`));
      }
    }
    const files = Array.from(toCapture);
    const snap = capture(files, { syncContext: `sync ${clientId}` });
    snapshotId = snap.id;
    snapshotFiles = files;
  };
  for (const path2 of paths) {
    const existing = readClientConfig(path2);
    const managed = getManagedServers(existing, clientDef.serversKey);
    const drifted = detectDrift(managed, storedHashes);
    allDrifted.push(...drifted);
    const driftedNames = new Set(drifted.map((d) => d.name));
    const toAdd = Object.keys(newEntries).filter((k) => !(k in managed));
    const toRemove = Object.keys(managed).filter((k) => !(k in newEntries));
    const toUpdate = Object.keys(newEntries).filter((k) => {
      if (!(k in managed)) return false;
      return computeEntryHash(newEntries[k]) !== computeEntryHash(managed[k]);
    });
    const skipped = /* @__PURE__ */ new Set();
    for (const d of drifted) {
      if (toUpdate.includes(d.name)) {
        if (!force && !adopt) {
          toUpdate.splice(toUpdate.indexOf(d.name), 1);
          skipped.add(d.name);
        } else if (adopt) {
          toUpdate.splice(toUpdate.indexOf(d.name), 1);
        }
      }
    }
    for (const name of skipped) {
      allActions.push({ type: "skip-drift", name, detail: "modified outside ensemble" });
    }
    for (const name of toAdd) allActions.push({ type: "add", name });
    for (const name of toRemove) allActions.push({ type: "remove", name });
    for (const name of toUpdate) {
      allActions.push({
        type: "update",
        name,
        detail: driftedNames.has(name) && force ? "overwriting manual edit" : void 0
      });
    }
    if (!force) {
      const secretViolations = [];
      for (const s of servers) {
        if (Object.keys(s.env).length > 0) {
          const violations = scanSecrets(s.env, s.name);
          if (violations.length > 0) {
            secretViolations.push({ name: s.name, violations });
          }
        }
      }
      if (secretViolations.length > 0) {
        const affected = new Set(secretViolations.map((v) => v.name));
        for (const { name, violations } of secretViolations) {
          for (const v of violations) {
            allActions.push({ type: "skip-drift", name, detail: `secret detected: ${v.pattern} in ${v.field}` });
          }
        }
        for (const name of affected) {
          delete newEntries[name];
        }
      }
    }
    if (!dryRun && (toAdd.length > 0 || toRemove.length > 0 || toUpdate.length > 0)) {
      prewriteCapture();
      writeClientConfig(path2, clientDef.serversKey, newEntries);
    }
  }
  for (const [name, entry] of Object.entries(newEntries)) {
    newHashes[name] = computeEntryHash(entry);
  }
  const hasChanges = allActions.some((a) => a.type !== "skip-drift");
  const messages = [];
  if (!hasChanges && allActions.length === 0) {
    messages.push(`${clientDef.name}: already in sync`);
  } else if (dryRun) {
    messages.push(`${clientDef.name}: would sync`);
  } else {
    messages.push(`${clientDef.name}: synced`);
  }
  if (adopt && allDrifted.length > 0 && !dryRun) {
    for (const d of allDrifted) {
      for (const path2 of paths) {
        const existing = readClientConfig(path2);
        const managed = getManagedServers(existing, clientDef.serversKey);
        if (d.name in managed) {
          const entry = managed[d.name];
          const serverIdx = config.servers.findIndex((s) => s.name === d.name);
          if (serverIdx >= 0) {
            const s = config.servers[serverIdx];
            config = {
              ...config,
              servers: config.servers.map(
                (srv, i) => i === serverIdx ? {
                  ...srv,
                  command: entry["command"] ?? s.command,
                  args: entry["args"] ?? s.args,
                  env: entry["env"] ?? s.env,
                  transport: entry["transport"] ?? s.transport,
                  url: entry["url"] ?? s.url
                } : srv
              )
            };
          }
        }
      }
    }
  }
  if (clientId === "claude-code") {
    const ccAssignment = getClient(config, clientId);
    if (ccAssignment) {
      for (const [projPath, projData] of Object.entries(ccAssignment.projects)) {
        if (projData.group) {
          const projActions = syncProject(config, projPath, projData.group, dryRun, prewriteCapture);
          allActions.push(...projActions.map((msg) => ({ type: "add", name: msg, detail: "project" })));
        }
      }
      if (config.rules.length > 0) {
        const ruleResult = applyPathRules(config, clientId, dryRun, prewriteCapture);
        config = ruleResult.config;
        allActions.push(...ruleResult.actions.map((msg) => ({ type: "add", name: msg, detail: "path-rule" })));
      }
    }
    const pluginActions = syncCCPlugins(config, clientId, dryRun, prewriteCapture);
    allActions.push(...pluginActions.map((msg) => ({ type: "add", name: msg, detail: "plugin" })));
  }
  if (clientDef.agentsDir) {
    const agentResult = syncAgents(config, clientId, { dryRun, prewriteCapture });
    for (const action of agentResult.actions) {
      allActions.push({
        type: action.type === "remove" ? "remove" : "add",
        name: action.agentName,
        detail: `agent: ${action.type}`
      });
    }
  }
  if (clientDef.commandsDir) {
    const commandResult = syncCommands(config, clientId, { dryRun, prewriteCapture });
    for (const action of commandResult.actions) {
      allActions.push({
        type: action.type === "remove" ? "remove" : "add",
        name: action.commandName,
        detail: `command: ${action.type}`
      });
    }
  }
  let newConfig = config;
  if (!dryRun && hasChanges) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (assignment) {
      newConfig = {
        ...config,
        clients: config.clients.map(
          (c) => c.id === clientId ? { ...c, last_synced: now, server_hashes: newHashes } : c
        )
      };
    }
  }
  if (!dryRun) {
    try {
      prune({ retentionDays: config.settings.snapshot_retention_days });
    } catch {
    }
  }
  return {
    config: newConfig,
    result: {
      clientId,
      clientName: clientDef.name,
      actions: allActions,
      messages,
      hasChanges,
      drifted: allDrifted,
      newHashes,
      ...snapshotId ? { snapshotId, snapshotFiles } : {}
    }
  };
}
function syncProject(config, projectPath, groupName, dryRun, prewriteCapture) {
  const servers = resolveServers(config, "claude-code", groupName);
  const newEntries = {};
  for (const s of servers) {
    newEntries[s.name] = serverToClientEntry(s);
  }
  const clientDef = CLIENTS["claude-code"];
  const paths = resolvedPaths(clientDef);
  if (paths.length === 0) return [];
  const absPath = node_path.resolve(expandPath(projectPath));
  const keyPath = projectServersKey(absPath);
  const existing = readClientConfig(paths[0]);
  const managed = getManagedServersNested(existing, keyPath);
  const messages = [];
  const toAdd = Object.keys(newEntries).filter((k) => !(k in managed));
  const toRemove = Object.keys(managed).filter((k) => !(k in newEntries));
  if (toAdd.length === 0 && toRemove.length === 0) return [];
  if (dryRun) {
    messages.push(`Claude Code project (${absPath}): would sync`);
  } else {
    prewriteCapture?.();
    writeServersNested(paths[0], keyPath, newEntries);
    messages.push(`Claude Code project (${absPath}): synced`);
  }
  const plugins = resolvePlugins(config, "claude-code", groupName);
  if (plugins.length > 0) {
    const pluginMessages = syncProjectPlugins(plugins, absPath, dryRun, prewriteCapture);
    messages.push(...pluginMessages);
  }
  return messages;
}
function syncProjectPlugins(plugins, projectPath, dryRun, prewriteCapture) {
  const messages = [];
  const newEnabled = {};
  for (const p of plugins) {
    newEnabled[qualifiedPluginName(p)] = p.enabled;
  }
  const localPath = node_path.join(projectPath, ".claude", "settings.local.json");
  let localSettings = {};
  if (node_fs.existsSync(localPath)) {
    try {
      localSettings = JSON.parse(node_fs.readFileSync(localPath, "utf-8"));
    } catch {
      localSettings = {};
    }
  }
  const currentEnabled = localSettings["enabledPlugins"] ?? {};
  let hasChanges = false;
  for (const [qname, state] of Object.entries(newEnabled)) {
    if (currentEnabled[qname] !== state) hasChanges = true;
  }
  if (!hasChanges) return [];
  if (dryRun) {
    messages.push(`  project plugins (${projectPath}): would sync to .claude/settings.local.json`);
  } else {
    prewriteCapture?.();
    const settingsPath2 = node_path.join(projectPath, ".claude", "settings.json");
    if (node_fs.existsSync(settingsPath2)) {
      try {
        const settings = JSON.parse(node_fs.readFileSync(settingsPath2, "utf-8"));
        if (!("enabledPlugins" in settings)) {
          settings["enabledPlugins"] = {};
          node_fs.mkdirSync(node_path.dirname(settingsPath2), { recursive: true });
          node_fs.writeFileSync(settingsPath2, `${JSON.stringify(settings, null, 2)}
`, "utf-8");
        }
      } catch {
      }
    }
    Object.assign(currentEnabled, newEnabled);
    localSettings["enabledPlugins"] = currentEnabled;
    node_fs.mkdirSync(node_path.dirname(localPath), { recursive: true });
    node_fs.writeFileSync(localPath, `${JSON.stringify(localSettings, null, 2)}
`, "utf-8");
    messages.push(`  project plugins (${projectPath}): synced`);
  }
  return messages;
}
function applyPathRules(config, clientId, dryRun, prewriteCapture) {
  const actions = [];
  let newConfig = { ...config };
  const assignment = getClient(newConfig, clientId);
  if (!assignment) return { config: newConfig, actions };
  const explicitlyAssigned = new Set(Object.keys(assignment.projects));
  const clientDef = CLIENTS[clientId];
  const paths = resolvedPaths(clientDef);
  for (const configPath of paths) {
    const ccData = readClientConfig(configPath);
    const projects = ccData["projects"];
    if (typeof projects !== "object" || projects === null) continue;
    for (const projPath of Object.keys(projects)) {
      if (explicitlyAssigned.has(projPath)) continue;
      const rule = matchRule(newConfig, projPath);
      if (!rule) continue;
      explicitlyAssigned.add(projPath);
      newConfig = {
        ...newConfig,
        clients: newConfig.clients.map(
          (c) => c.id === clientId ? { ...c, projects: { ...c.projects, [projPath]: { group: rule.group, last_synced: null } } } : c
        )
      };
      const projActions = syncProject(newConfig, projPath, rule.group, dryRun, prewriteCapture);
      if (projActions.length > 0) {
        actions.push(`  (matched rule: ${rule.path} → ${rule.group})`);
        actions.push(...projActions);
      }
    }
  }
  return { config: newConfig, actions };
}
function syncCCPlugins(config, clientId, dryRun, prewriteCapture) {
  const actions = [];
  const settings = readCCSettings();
  const plugins = resolvePlugins(config, clientId);
  const newEnabled = {};
  for (const p of plugins) {
    newEnabled[qualifiedPluginName(p)] = p.enabled;
  }
  const currentEnabled = getEnabledPlugins(settings);
  let pluginChanges = false;
  for (const [qname, state] of Object.entries(newEnabled)) {
    if (currentEnabled[qname] !== state) {
      pluginChanges = true;
    }
  }
  for (const qname of Object.keys(currentEnabled)) {
    const pname = qname.includes("@") ? qname.slice(0, qname.lastIndexOf("@")) : qname;
    const plugin = config.plugins.find((p) => p.name === pname);
    if (plugin?.managed && !(qname in newEnabled)) {
      pluginChanges = true;
    }
  }
  const currentMkts = getExtraMarketplaces(settings);
  const newMkts = {};
  for (const m of config.marketplaces) {
    if (!RESERVED_MARKETPLACE_NAMES.has(m.name)) {
      const sourceDict = { source: m.source.source };
      if (m.source.repo) sourceDict["repo"] = m.source.repo;
      else if (m.source.path) sourceDict["path"] = m.source.path;
      newMkts[m.name] = { source: sourceDict };
    }
  }
  const mktChanges = JSON.stringify(newMkts) !== JSON.stringify(currentMkts);
  const libraryHooks = listHooks();
  const existingHooks = settings["hooks"] && typeof settings["hooks"] === "object" ? settings["hooks"] : void 0;
  const nextHooks = buildHooksSettings(libraryHooks, existingHooks);
  const hookChanges = JSON.stringify(nextHooks) !== JSON.stringify(existingHooks ?? {});
  if ((pluginChanges || mktChanges || hookChanges) && !dryRun) {
    const managedNames = new Set(config.plugins.filter((p) => p.managed).map((p) => qualifiedPluginName(p)));
    const nextEnabled = { ...currentEnabled };
    for (const qname of Object.keys(nextEnabled)) {
      if (managedNames.has(qname) && !(qname in newEnabled)) {
        delete nextEnabled[qname];
      }
    }
    Object.assign(nextEnabled, newEnabled);
    const { merged } = mergeSettings(
      settings,
      {
        enabledPlugins: nextEnabled,
        extraKnownMarketplaces: newMkts,
        hooks: nextHooks
      },
      ["enabledPlugins", "extraKnownMarketplaces", "hooks"],
      { releasePreviouslyOwned: false }
    );
    prewriteCapture?.();
    writeCCSettings(merged);
  }
  if (pluginChanges) {
    actions.push(dryRun ? "Claude Code plugins: would sync" : "Claude Code plugins: synced");
  }
  if (mktChanges) {
    actions.push(dryRun ? "Claude Code marketplaces: would sync" : "Claude Code marketplaces: synced");
  }
  if (hookChanges) {
    actions.push(dryRun ? "Claude Code hooks: would sync" : "Claude Code hooks: synced");
  }
  return actions;
}
function syncSkills(config, clientId, options) {
  const clientDef = CLIENTS[clientId];
  if (!clientDef?.skillsDir) {
    return { clientId, actions: [], messages: [`${clientId}: no skills directory configured`], conflicts: [] };
  }
  const skillsDir = expandPath(clientDef.skillsDir);
  const skills = resolveSkills(config, clientId);
  const actions = [];
  const conflicts = [];
  const desiredNames = new Set(skills.map((s) => s.name));
  const existingManaged = /* @__PURE__ */ new Set();
  if (node_fs.existsSync(skillsDir)) {
    for (const entry of node_fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const markerPath = node_path.join(skillsDir, entry.name, ".ensemble-managed");
        const legacyMarker = node_path.join(skillsDir, entry.name, ".mcpoyle-managed");
        if (node_fs.existsSync(markerPath) || node_fs.existsSync(legacyMarker)) {
          existingManaged.add(entry.name);
        }
      }
      if (entry.isSymbolicLink?.()) {
        existingManaged.add(entry.name);
      }
    }
    for (const entry of node_fs.readdirSync(skillsDir, { withFileTypes: false })) {
      try {
        const fullPath = node_path.join(skillsDir, entry);
        if (node_fs.lstatSync(fullPath).isSymbolicLink()) {
          existingManaged.add(entry);
        }
      } catch {
      }
    }
  }
  for (const otherClient of Object.values(CLIENTS)) {
    if (otherClient.id === clientId || !otherClient.skillsDir) continue;
    const otherDir = expandPath(otherClient.skillsDir);
    if (!node_fs.existsSync(otherDir)) continue;
    for (const name of desiredNames) {
      const otherPath = node_path.join(otherDir, name);
      if (node_fs.existsSync(otherPath)) {
        conflicts.push({
          type: "shadow",
          skillName: name,
          detail: `Also exists in ${otherClient.name} (${otherDir})`
        });
      }
    }
  }
  if (node_fs.existsSync(skillsDir)) {
    for (const entry of node_fs.readdirSync(skillsDir, { withFileTypes: false })) {
      const fullPath = node_path.join(skillsDir, entry);
      try {
        const stat = node_fs.lstatSync(fullPath);
        if (stat.isSymbolicLink()) {
          const linkTarget = node_fs.readlinkSync(fullPath);
          if (!node_fs.existsSync(linkTarget)) {
            conflicts.push({
              type: "broken-symlink",
              skillName: entry,
              detail: `Symlink target missing: ${linkTarget}`
            });
          }
        }
      } catch {
      }
    }
  }
  if (node_fs.existsSync(skillsDir)) {
    for (const skill of skills) {
      const target = node_path.join(skillsDir, skill.name);
      if (!node_fs.existsSync(target)) continue;
      try {
        const stat = node_fs.lstatSync(target);
        if (!stat.isSymbolicLink() && stat.isDirectory()) {
          const canonicalDir = skillDir(skill.name);
          if (node_fs.existsSync(canonicalDir)) {
            const canonHash = hashDir(canonicalDir);
            const copyHash = hashDir(target);
            if (canonHash !== copyHash) {
              conflicts.push({
                type: "copy-drift",
                skillName: skill.name,
                detail: "Copy differs from canonical store"
              });
            }
          }
        }
      } catch {
      }
    }
  }
  const toAdd = [...desiredNames].filter((n) => !existingManaged.has(n));
  const toRemove = [...existingManaged].filter((n) => !desiredNames.has(n));
  if (toAdd.length === 0 && toRemove.length === 0) {
    let allCorrect = true;
    for (const skill of skills) {
      const target = node_path.join(skillsDir, skill.name);
      const sourceDir = skillDir(skill.name);
      try {
        if (node_fs.lstatSync(target).isSymbolicLink()) {
          if (node_fs.readlinkSync(target) !== sourceDir) allCorrect = false;
        }
      } catch {
      }
    }
    if (allCorrect) {
      return { clientId, actions: [], messages: [`${clientDef.name} skills: already in sync`], conflicts };
    }
  }
  for (const name of toAdd.sort()) {
    actions.push({ type: "symlink", skillName: name, targetPath: node_path.join(skillsDir, name) });
  }
  for (const name of toRemove.sort()) {
    actions.push({ type: "remove", skillName: name, targetPath: node_path.join(skillsDir, name) });
  }
  if (options?.dryRun) {
    return {
      clientId,
      actions,
      messages: [`${clientDef.name} skills: would sync ${desiredNames.size} skill(s)`],
      conflicts
    };
  }
  node_fs.mkdirSync(skillsDir, { recursive: true });
  for (const name of toRemove) {
    const target = node_path.join(skillsDir, name);
    try {
      if (node_fs.lstatSync(target).isSymbolicLink()) {
        node_fs.rmSync(target);
      } else {
        node_fs.rmSync(target, { recursive: true });
      }
    } catch {
    }
  }
  for (const skill of skills) {
    const sourceDir = skillDir(skill.name);
    const target = node_path.join(skillsDir, skill.name);
    if (!node_fs.existsSync(sourceDir)) continue;
    if (node_fs.existsSync(target) || node_fs.lstatSync(target).isSymbolicLink?.()) {
      try {
        if (node_fs.lstatSync(target).isSymbolicLink() && node_fs.readlinkSync(target) === sourceDir) {
          continue;
        }
        if (node_fs.lstatSync(target).isSymbolicLink()) {
          node_fs.rmSync(target);
        } else {
          node_fs.rmSync(target, { recursive: true });
        }
      } catch {
      }
    }
    try {
      node_fs.symlinkSync(sourceDir, target);
    } catch {
      copyDirRecursive(sourceDir, target);
      node_fs.writeFileSync(node_path.join(target, ".ensemble-managed"), "managed by ensemble\n", "utf-8");
    }
  }
  return {
    clientId,
    actions,
    messages: [`${clientDef.name} skills: synced ${desiredNames.size} skill(s)`],
    conflicts
  };
}
function syncAgents(config, clientId, options) {
  const clientDef = CLIENTS[clientId];
  if (!clientDef?.agentsDir) {
    return { clientId, actions: [], messages: [`${clientId}: no agents directory configured`] };
  }
  const agentsDir = expandPath(clientDef.agentsDir);
  const agents = resolveAgents(config);
  const actions = [];
  const desiredNames = new Set(agents.map((a) => a.name));
  const dryRun = options?.dryRun ?? false;
  const existingManaged = /* @__PURE__ */ new Set();
  if (node_fs.existsSync(agentsDir)) {
    for (const entry of node_fs.readdirSync(agentsDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const full = node_path.join(agentsDir, entry.name);
      try {
        const text = node_fs.readFileSync(full, "utf-8");
        if (/^---[\s\S]*?__ensemble:\s*true[\s\S]*?---/m.test(text)) {
          existingManaged.add(entry.name.slice(0, -3));
        }
      } catch {
      }
    }
  }
  const toRemove = [...existingManaged].filter((n) => !desiredNames.has(n));
  const toWrite = [];
  for (const a of agents) {
    const target = node_path.join(agentsDir, `${a.name}.md`);
    const canonical = readAgentMd(a.name);
    const body = canonical?.body ?? "";
    const expected = toFanoutContent$1(a, body);
    let current = "";
    if (node_fs.existsSync(target)) {
      try {
        current = node_fs.readFileSync(target, "utf-8");
      } catch {
        current = "";
      }
      if (!/^---[\s\S]*?__ensemble:\s*true[\s\S]*?---/m.test(current) && current !== "") {
        actions.push({
          type: "skip",
          agentName: a.name,
          targetPath: target,
          detail: "user-authored file, not overwritten"
        });
        continue;
      }
    }
    if (current !== expected) {
      toWrite.push(a);
    }
  }
  for (const a of toWrite) {
    actions.push({ type: "write", agentName: a.name, targetPath: node_path.join(agentsDir, `${a.name}.md`) });
  }
  for (const name of toRemove) {
    actions.push({ type: "remove", agentName: name, targetPath: node_path.join(agentsDir, `${name}.md`) });
  }
  if (actions.length === 0) {
    return { clientId, actions, messages: [`${clientDef.name} agents: already in sync`] };
  }
  if (dryRun) {
    return { clientId, actions, messages: [`${clientDef.name} agents: would sync ${desiredNames.size} agent(s)`] };
  }
  if (toWrite.length > 0 || toRemove.length > 0) {
    options?.prewriteCapture?.();
  }
  node_fs.mkdirSync(agentsDir, { recursive: true });
  for (const name of toRemove) {
    const target = node_path.join(agentsDir, `${name}.md`);
    try {
      node_fs.rmSync(target, { force: true });
    } catch {
    }
  }
  for (const a of toWrite) {
    const target = node_path.join(agentsDir, `${a.name}.md`);
    const canonical = readAgentMd(a.name);
    const body = canonical?.body ?? "";
    node_fs.writeFileSync(target, toFanoutContent$1(a, body), "utf-8");
  }
  return { clientId, actions, messages: [`${clientDef.name} agents: synced ${desiredNames.size} agent(s)`] };
}
function syncCommands(config, clientId, options) {
  const clientDef = CLIENTS[clientId];
  if (!clientDef?.commandsDir) {
    return { clientId, actions: [], messages: [`${clientId}: no commands directory configured`] };
  }
  const commandsDir = expandPath(clientDef.commandsDir);
  const commands = resolveCommands(config);
  const actions = [];
  const desiredNames = new Set(commands.map((c) => c.name));
  const dryRun = options?.dryRun ?? false;
  const existingManaged = /* @__PURE__ */ new Set();
  if (node_fs.existsSync(commandsDir)) {
    for (const entry of node_fs.readdirSync(commandsDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const full = node_path.join(commandsDir, entry.name);
      try {
        const text = node_fs.readFileSync(full, "utf-8");
        if (/^---[\s\S]*?__ensemble:\s*true[\s\S]*?---/m.test(text)) {
          existingManaged.add(entry.name.slice(0, -3));
        }
      } catch {
      }
    }
  }
  const toRemove = [...existingManaged].filter((n) => !desiredNames.has(n));
  const toWrite = [];
  for (const c of commands) {
    const target = node_path.join(commandsDir, `${c.name}.md`);
    const canonical = readCommandMd(c.name);
    const body = canonical?.body ?? "";
    const expected = toFanoutContent(c, body);
    let current = "";
    if (node_fs.existsSync(target)) {
      try {
        current = node_fs.readFileSync(target, "utf-8");
      } catch {
        current = "";
      }
      if (!/^---[\s\S]*?__ensemble:\s*true[\s\S]*?---/m.test(current) && current !== "") {
        actions.push({
          type: "skip",
          commandName: c.name,
          targetPath: target,
          detail: "user-authored file, not overwritten"
        });
        continue;
      }
    }
    if (current !== expected) {
      toWrite.push(c);
    }
  }
  for (const c of toWrite) {
    actions.push({
      type: "write",
      commandName: c.name,
      targetPath: node_path.join(commandsDir, `${c.name}.md`)
    });
  }
  for (const name of toRemove) {
    actions.push({
      type: "remove",
      commandName: name,
      targetPath: node_path.join(commandsDir, `${name}.md`)
    });
  }
  if (actions.length === 0) {
    return { clientId, actions, messages: [`${clientDef.name} commands: already in sync`] };
  }
  if (dryRun) {
    return {
      clientId,
      actions,
      messages: [`${clientDef.name} commands: would sync ${desiredNames.size} command(s)`]
    };
  }
  if (toWrite.length > 0 || toRemove.length > 0) {
    options?.prewriteCapture?.();
  }
  node_fs.mkdirSync(commandsDir, { recursive: true });
  for (const name of toRemove) {
    const target = node_path.join(commandsDir, `${name}.md`);
    try {
      node_fs.rmSync(target, { force: true });
    } catch {
    }
  }
  for (const c of toWrite) {
    const target = node_path.join(commandsDir, `${c.name}.md`);
    const canonical = readCommandMd(c.name);
    const body = canonical?.body ?? "";
    node_fs.writeFileSync(target, toFanoutContent(c, body), "utf-8");
  }
  return {
    clientId,
    actions,
    messages: [`${clientDef.name} commands: synced ${desiredNames.size} command(s)`]
  };
}
function hashDir(dirPath) {
  const hash = node_crypto.createHash("sha256");
  const entries = node_fs.readdirSync(dirPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const fullPath = node_path.join(dirPath, entry.name);
    if (entry.name === ".ensemble-managed" || entry.name === ".mcpoyle-managed") continue;
    if (entry.isFile()) {
      hash.update(entry.name);
      hash.update(node_fs.readFileSync(fullPath));
    } else if (entry.isDirectory()) {
      hash.update(entry.name);
      hash.update(hashDir(fullPath));
    }
  }
  return hash.digest("hex");
}
function copyDirRecursive(src, dest) {
  node_fs.mkdirSync(dest, { recursive: true });
  for (const entry of node_fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = node_path.join(src, entry.name);
    const destPath = node_path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      node_fs.copyFileSync(srcPath, destPath);
    }
  }
}
const TOOL_CATEGORIES = {
  "data": ["database", "sql", "query", "postgres", "mysql", "sqlite", "mongo", "redis"],
  "code": ["git", "github", "gitlab", "code", "repo", "commit", "branch"],
  "web": ["http", "api", "rest", "graphql", "fetch", "request", "url"],
  "file": ["file", "filesystem", "directory", "path", "read", "write"],
  "cloud": ["aws", "gcp", "azure", "s3", "lambda", "cloud"],
  "ai": ["llm", "embedding", "vector", "model", "inference", "openai"]
};
function suggestGroupSplits(_config, servers) {
  if (servers.length < 5) return [];
  const categorized = /* @__PURE__ */ new Map();
  for (const server2 of servers) {
    const text = [
      server2.name,
      ...server2.tools.map((t2) => t2.name),
      ...server2.tools.map((t2) => t2.description)
    ].join(" ").toLowerCase();
    for (const [category, keywords] of Object.entries(TOOL_CATEGORIES)) {
      if (keywords.some((kw) => text.includes(kw))) {
        const existing = categorized.get(category) ?? [];
        if (!existing.includes(server2.name)) {
          existing.push(server2.name);
          categorized.set(category, existing);
        }
      }
    }
  }
  const suggestions = [];
  for (const [category, names] of categorized) {
    if (names.length >= 2) {
      suggestions.push({
        groupName: `${category}-servers`,
        serverNames: names,
        reason: `${names.length} servers related to ${category}`
      });
    }
  }
  return suggestions;
}
function computeContextCost(config, clientId) {
  const clientDef = CLIENTS[clientId];
  const servers = resolveServers(config, clientId);
  const toolCount = servers.reduce((sum, s) => sum + s.tools.length, 0);
  const estimatedTokens = toolCount * 200;
  const threshold = config.settings.sync_cost_warning_threshold;
  const contextWindow = clientDef?.contextWindow ?? 128e3;
  const budgetPercent = contextWindow > 0 ? Math.round(estimatedTokens / contextWindow * 100) : 0;
  const suggestions = suggestGroupSplits(config, servers);
  return {
    serverCount: servers.length,
    toolCount,
    estimatedTokens,
    warningThreshold: threshold,
    exceedsThreshold: toolCount > threshold,
    budgetPercent,
    contextWindow,
    suggestions
  };
}
function syncAllClients(config, options) {
  let currentConfig = config;
  const results = [];
  for (const clientDef of Object.values(CLIENTS)) {
    if (!isInstalled(clientDef)) continue;
    const { config: newConfig, result } = syncClient(currentConfig, clientDef.id, options);
    currentConfig = newConfig;
    results.push(result);
  }
  return { config: currentConfig, results };
}
let registryModule = null;
let registryInstance = null;
let loadAttempted = false;
function getRegistry() {
  if (loadAttempted) return registryInstance;
  loadAttempted = true;
  try {
    registryModule = require("@setlist/core");
    registryInstance = new registryModule.Registry();
    return registryInstance;
  } catch {
    return null;
  }
}
function queryCapabilities(opts) {
  const registry = getRegistry();
  if (!registry) return [];
  try {
    const rows = registry.queryCapabilities(opts);
    return rows.map(toCapability);
  } catch {
    return [];
  }
}
function getMcpCapabilities() {
  return queryCapabilities().filter((c) => c.invocation_model === "MCP");
}
function toCapability(row) {
  const cap = {
    project: row.project,
    name: row.name,
    type: row.type,
    description: row.description ?? ""
  };
  if (row.inputs) cap.inputs = row.inputs;
  if (row.outputs) cap.outputs = row.outputs;
  if (row.requires_auth != null) cap.requires_auth = row.requires_auth;
  if (row.invocation_model) cap.invocation_model = row.invocation_model;
  if (row.audience) cap.audience = row.audience;
  return cap;
}
node_path.join(CONFIG_DIR, "usage.json");
const QUERY_ALIASES = {
  k8s: ["kubernetes"],
  mcp: ["model context protocol", "model-context-protocol"],
  cli: ["command line", "terminal"],
  fs: ["filesystem", "file system"],
  db: ["database"],
  auth: ["authentication", "authorization"],
  js: ["javascript"],
  ts: ["typescript"],
  py: ["python"],
  ml: ["machine learning"],
  ai: ["artificial intelligence"],
  api: ["application programming interface"],
  ci: ["continuous integration"],
  cd: ["continuous deployment", "continuous delivery"],
  vcs: ["version control"],
  git: ["version control", "repository"],
  sql: ["database", "query"],
  nosql: ["mongodb", "redis", "dynamodb"],
  aws: ["amazon web services"],
  gcp: ["google cloud platform"],
  oss: ["open source"],
  devops: ["deployment", "infrastructure"],
  infra: ["infrastructure"],
  deps: ["dependencies"],
  pkg: ["package"],
  env: ["environment"],
  config: ["configuration"],
  msg: ["message", "messaging"],
  ws: ["websocket"],
  http: ["web", "request"]
};
function expandAliases(query) {
  const words = query.toLowerCase().split(/\s+/);
  const expanded = [];
  for (const word of words) {
    expanded.push(word);
    const aliases = QUERY_ALIASES[word];
    if (aliases) {
      expanded.push(...aliases);
    }
  }
  return expanded.join(" ");
}
function computeServerQualityScore(server2, _config) {
  let score = 0;
  let signals = 0;
  signals++;
  if (server2.tools.length > 0) score += 1;
  signals++;
  if (server2.origin.timestamp) {
    const age = Date.now() - new Date(server2.origin.timestamp).getTime();
    const dayMs = 864e5;
    score += Math.max(0, 1 - age / (90 * dayMs));
  }
  signals++;
  if (server2.origin.trust_tier === "official") score += 1;
  else if (server2.origin.trust_tier === "community") score += 0.5;
  else score += 0.25;
  signals++;
  if (server2.enabled) score += 1;
  return signals > 0 ? score / signals : 0.5;
}
function computeSkillQualityScore(skill, _config) {
  let score = 0;
  let signals = 0;
  signals++;
  let completeness = 0;
  if (skill.name) completeness += 0.3;
  if (skill.description) completeness += 0.4;
  if (skill.tags.length > 0) completeness += 0.3;
  score += completeness;
  signals++;
  score += skill.dependencies.length > 0 ? 0.7 : 0.3;
  signals++;
  if (skill.enabled) score += 1;
  return signals > 0 ? score / signals : 0.5;
}
function tokenize(text) {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}
function termFrequency(tokens, term) {
  return tokens.filter((t2) => t2 === term || t2.includes(term)).length;
}
function bm25Score(tf, docLen, avgDocLen, df, nDocs, k1 = 1.5, b = 0.75) {
  if (df === 0 || nDocs === 0) return 0;
  const idf = Math.log((nDocs - df + 0.5) / (df + 0.5) + 1);
  const tfNorm = tf * (k1 + 1) / (tf + k1 * (1 - b + b * docLen / Math.max(avgDocLen, 1)));
  return idf * tfNorm;
}
function searchServers(config, query, limit = 20, options) {
  const expandedQuery = expandAliases(query);
  const queryTerms = tokenize(expandedQuery);
  if (queryTerms.length === 0 || config.servers.length === 0) return [];
  const docs = config.servers.map((s) => {
    const tokens = [];
    tokens.push(...Array(3).fill(tokenize(s.name)).flat());
    for (const tool of s.tools) {
      tokens.push(...Array(2).fill(tokenize(tool.name)).flat());
      if (tool.description) tokens.push(...tokenize(tool.description));
    }
    if (s.userNotes) tokens.push(...Array(2).fill(tokenize(s.userNotes)).flat());
    if (s.description) tokens.push(...tokenize(s.description));
    return { server: s, tokens, len: tokens.length };
  });
  const nDocs = docs.length;
  const avgDocLen = docs.reduce((sum, d) => sum + d.len, 0) / Math.max(nDocs, 1);
  const df = {};
  for (const term of queryTerms) {
    df[term] = docs.filter((d) => d.tokens.some((t2) => t2.includes(term))).length;
  }
  const results = [];
  for (const { server: server2, tokens, len: docLen } of docs) {
    let bm25Total = 0;
    for (const term of queryTerms) {
      const tf = termFrequency(tokens, term);
      if (tf > 0) bm25Total += bm25Score(tf, docLen, avgDocLen, df[term], nDocs);
    }
    if (bm25Total > 0) {
      const matchedFields = [];
      const matchedTools = [];
      const nameTokens = tokenize(server2.name);
      if (queryTerms.some((term) => nameTokens.some((t2) => t2.includes(term)))) {
        matchedFields.push("name");
      }
      for (const tool of server2.tools) {
        const toolTokens = [...tokenize(tool.name), ...tokenize(tool.description)];
        if (queryTerms.some((term) => toolTokens.some((t2) => t2.includes(term)))) {
          matchedTools.push(tool.name);
        }
      }
      if (matchedTools.length > 0) matchedFields.push("tools");
      if (server2.userNotes && queryTerms.some((term) => tokenize(server2.userNotes ?? "").some((t2) => t2.includes(term)))) {
        matchedFields.push("notes");
      }
      if (server2.description && queryTerms.some((term) => tokenize(server2.description ?? "").some((t2) => t2.includes(term)))) {
        matchedFields.push("description");
      }
      const staticQuality = computeServerQualityScore(server2);
      let qualityScore;
      {
        qualityScore = staticQuality;
      }
      const maxBm25 = Math.max(bm25Total, 1);
      const normalizedBm25 = bm25Total / maxBm25;
      const finalScore = 0.6 * normalizedBm25 + 0.4 * qualityScore;
      results.push({
        name: server2.name,
        score: finalScore * bm25Total,
        // scale back to BM25 magnitude for sorting
        matchedFields,
        matchedTools: matchedTools.slice(0, 5),
        resultType: "server"
      });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
function searchSkills(config, query, limit = 20, options) {
  const expandedQuery = expandAliases(query);
  const queryTerms = tokenize(expandedQuery);
  if (queryTerms.length === 0 || config.skills.length === 0) return [];
  const docs = config.skills.map((s) => {
    const tokens = [];
    tokens.push(...Array(3).fill(tokenize(s.name)).flat());
    for (const tag of s.tags) {
      tokens.push(...Array(2).fill(tokenize(tag)).flat());
    }
    if (s.userNotes) tokens.push(...Array(2).fill(tokenize(s.userNotes)).flat());
    if (s.description) tokens.push(...tokenize(s.description));
    return { skill: s, tokens, len: tokens.length };
  });
  const nDocs = docs.length;
  const avgDocLen = docs.reduce((sum, d) => sum + d.len, 0) / Math.max(nDocs, 1);
  const df = {};
  for (const term of queryTerms) {
    df[term] = docs.filter((d) => d.tokens.some((t2) => t2.includes(term))).length;
  }
  const results = [];
  for (const { skill, tokens, len: docLen } of docs) {
    let bm25Total = 0;
    for (const term of queryTerms) {
      const tf = termFrequency(tokens, term);
      if (tf > 0) bm25Total += bm25Score(tf, docLen, avgDocLen, df[term], nDocs);
    }
    if (bm25Total > 0) {
      const matchedFields = [];
      if (queryTerms.some((term) => tokenize(skill.name).some((t2) => t2.includes(term)))) {
        matchedFields.push("name");
      }
      if (skill.tags.some((tag) => queryTerms.some((term) => tokenize(tag).some((t2) => t2.includes(term))))) {
        matchedFields.push("tags");
      }
      if (skill.userNotes && queryTerms.some((term) => tokenize(skill.userNotes ?? "").some((t2) => t2.includes(term)))) {
        matchedFields.push("notes");
      }
      if (skill.description && queryTerms.some((term) => tokenize(skill.description).some((t2) => t2.includes(term)))) {
        matchedFields.push("description");
      }
      const staticQuality = computeSkillQualityScore(skill);
      let qualityScore;
      {
        qualityScore = staticQuality;
      }
      const maxBm25 = Math.max(bm25Total, 1);
      const normalizedBm25 = bm25Total / maxBm25;
      const finalScore = 0.6 * normalizedBm25 + 0.4 * qualityScore;
      results.push({
        name: skill.name,
        score: finalScore * bm25Total,
        matchedFields,
        matchedTools: [],
        resultType: "skill"
      });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
function searchPlugins(config, query, limit = 20) {
  const expandedQuery = expandAliases(query);
  const queryTerms = tokenize(expandedQuery);
  if (queryTerms.length === 0 || config.plugins.length === 0) return [];
  const docs = config.plugins.map((p) => {
    const tokens = [];
    tokens.push(...Array(3).fill(tokenize(p.name)).flat());
    if (p.marketplace) tokens.push(...tokenize(p.marketplace));
    if (p.userNotes) tokens.push(...Array(2).fill(tokenize(p.userNotes)).flat());
    if (p.description) tokens.push(...tokenize(p.description));
    return { plugin: p, tokens, len: tokens.length };
  });
  const nDocs = docs.length;
  const avgDocLen = docs.reduce((sum, d) => sum + d.len, 0) / Math.max(nDocs, 1);
  const df = {};
  for (const term of queryTerms) {
    df[term] = docs.filter((d) => d.tokens.some((t2) => t2.includes(term))).length;
  }
  const results = [];
  for (const { plugin, tokens, len: docLen } of docs) {
    let bm25Total = 0;
    for (const term of queryTerms) {
      const tf = termFrequency(tokens, term);
      if (tf > 0) bm25Total += bm25Score(tf, docLen, avgDocLen, df[term], nDocs);
    }
    if (bm25Total > 0) {
      const matchedFields = [];
      if (queryTerms.some((term) => tokenize(plugin.name).some((t2) => t2.includes(term)))) {
        matchedFields.push("name");
      }
      if (plugin.userNotes && queryTerms.some((term) => tokenize(plugin.userNotes ?? "").some((t2) => t2.includes(term)))) {
        matchedFields.push("notes");
      }
      if (plugin.description && queryTerms.some((term) => tokenize(plugin.description ?? "").some((t2) => t2.includes(term)))) {
        matchedFields.push("description");
      }
      results.push({
        name: plugin.marketplace ? `${plugin.name}@${plugin.marketplace}` : plugin.name,
        score: bm25Total,
        matchedFields,
        matchedTools: [],
        resultType: "plugin"
      });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
function searchCapabilities(config, query, limit = 20) {
  const capabilities = queryCapabilities({ keyword: query });
  if (capabilities.length === 0) return [];
  const expandedQuery = expandAliases(query);
  const queryTerms = tokenize(expandedQuery);
  if (queryTerms.length === 0) return [];
  const enabledServerNames = new Set(config.servers.filter((s) => s.enabled).map((s) => s.name));
  const results = [];
  for (const cap of capabilities) {
    const tokens = [
      ...Array(3).fill(tokenize(cap.name)).flat(),
      ...tokenize(cap.description),
      ...tokenize(cap.type)
    ];
    let score = 0;
    for (const term of queryTerms) {
      const tf = termFrequency(tokens, term);
      if (tf > 0) score += tf;
    }
    if (score > 0) {
      const matchedFields = [];
      if (queryTerms.some((term) => tokenize(cap.name).some((t2) => t2.includes(term)))) {
        matchedFields.push("name");
      }
      if (queryTerms.some((term) => tokenize(cap.description).some((t2) => t2.includes(term)))) {
        matchedFields.push("description");
      }
      let serverEnabled;
      if (cap.invocation_model === "MCP" && cap.inputs) {
        const serverName = cap.inputs;
        serverEnabled = enabledServerNames.has(serverName);
      }
      results.push({
        name: `${cap.project}/${cap.name}`,
        score,
        matchedFields,
        matchedTools: [],
        resultType: "capability",
        project: cap.project,
        serverEnabled,
        invocationModel: cap.invocation_model
      });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
function searchAll(config, query, limit = 20, options) {
  const local = [
    ...searchServers(config, query, limit),
    ...searchSkills(config, query, limit),
    ...searchPlugins(config, query, limit)
  ];
  local.sort((a, b) => b.score - a.score);
  {
    const caps = searchCapabilities(config, query, limit);
    return [...local.slice(0, limit), ...caps.slice(0, limit)];
  }
}
const OFFICIAL_BASE = "https://registry.modelcontextprotocol.io/v0";
const GLAMA_BASE = "https://glama.ai/api/mcp/v1";
const TIMEOUT_MS = 1e4;
function cacheKey(prefix, query) {
  const h = node_crypto.createHash("sha256").update(`${prefix}:${query}`).digest("hex").slice(0, 16);
  return `${prefix}_${h}.json`;
}
function readCache(key, ttl) {
  const path2 = node_path.join(CACHE_DIR, key);
  if (!node_fs.existsSync(path2)) return null;
  try {
    const data = JSON.parse(node_fs.readFileSync(path2, "utf-8"));
    if (Date.now() / 1e3 - data.timestamp > ttl) {
      node_fs.unlinkSync(path2);
      return null;
    }
    return data.payload;
  } catch {
    return null;
  }
}
function writeCache(key, payload) {
  node_fs.mkdirSync(CACHE_DIR, { recursive: true });
  try {
    node_fs.writeFileSync(
      node_path.join(CACHE_DIR, key),
      JSON.stringify({ timestamp: Date.now() / 1e3, payload }),
      "utf-8"
    );
  } catch {
  }
}
const officialAdapter = {
  name: "official",
  baseUrl: OFFICIAL_BASE,
  async search(query, limit = 20, useCache = true, cacheTtl = 3600) {
    const key = cacheKey("official_search", `${query}:${limit}`);
    if (useCache) {
      const cached = readCache(key, cacheTtl);
      if (cached) return cached;
    }
    try {
      const url = `${OFFICIAL_BASE}/servers?${new URLSearchParams({ search: query, limit: String(limit) })}`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!resp.ok) return [];
      const data = await resp.json();
      const servers = Array.isArray(data) ? data : data["servers"] ?? [];
      const results = servers.map((s) => {
        const name = s["name"] || s["qualifiedName"] || "";
        const desc = (s["description"] || "").slice(0, 120);
        const packages = s["packages"] || [];
        let transport = "stdio";
        if (packages[0]) {
          const t2 = packages[0]["transport"];
          if (typeof t2 === "object" && t2 !== null) transport = t2["type"] || "stdio";
        }
        return {
          name,
          description: desc,
          source: "official",
          transport,
          qualifiedId: name,
          stars: 0,
          lastUpdated: "",
          hasReadme: false,
          installs: 0
        };
      });
      if (useCache && results.length > 0) writeCache(key, results);
      return results;
    } catch {
      return [];
    }
  },
  async show(serverId, useCache = true, cacheTtl = 3600) {
    const key = cacheKey("official_show", serverId);
    if (useCache) {
      const cached = readCache(key, cacheTtl);
      if (cached) return cached;
    }
    try {
      const url = `${OFFICIAL_BASE}/servers?${new URLSearchParams({ search: serverId, limit: "5" })}`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!resp.ok) return null;
      const data = await resp.json();
      const servers = Array.isArray(data) ? data : data["servers"] ?? [];
      const match = servers.find((s) => {
        const n = s["name"] || s["qualifiedName"] || "";
        return n === serverId || n.endsWith(`/${serverId}`);
      }) || servers[0];
      if (!match) return null;
      const detail = parseOfficialDetail(match);
      if (useCache) writeCache(key, detail);
      return detail;
    } catch {
      return null;
    }
  }
};
function parseOfficialDetail(s) {
  const name = s["name"] || s["qualifiedName"] || "";
  const packages = s["packages"] || [];
  const pkg = packages[0] || {};
  const envVars = (pkg["environmentVariables"] || []).map((ev) => ({
    name: ev["name"] || "",
    description: ev["description"] || "",
    required: ev["required"] === true
  }));
  const transportInfo = pkg["transport"];
  const transport = typeof transportInfo === "object" && transportInfo !== null ? transportInfo["type"] || "stdio" : "stdio";
  return {
    name,
    description: s["description"] || "",
    source: "official",
    transport,
    homepage: typeof s["repository"] === "object" && s["repository"] !== null ? s["repository"]["url"] || "" : "",
    envVars,
    tools: (s["tools"] || []).map((t2) => t2["name"] || ""),
    toolsRawChars: 0,
    registryType: pkg["registryType"] || "",
    packageIdentifier: pkg["identifier"] || pkg["name"] || "",
    packageArgs: (pkg["packageArguments"] || []).map((a) => a["name"] || ""),
    stars: 0,
    lastUpdated: "",
    hasReadme: false,
    installs: 0
  };
}
const glamaAdapter = {
  name: "glama",
  baseUrl: GLAMA_BASE,
  async search(query, limit = 20, useCache = true, cacheTtl = 3600) {
    const key = cacheKey("glama_search", `${query}:${limit}`);
    if (useCache) {
      const cached = readCache(key, cacheTtl);
      if (cached) return cached;
    }
    try {
      const url = `${GLAMA_BASE}/servers?${new URLSearchParams({ query, first: String(limit) })}`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!resp.ok) return [];
      const data = await resp.json();
      let serversRaw = [];
      if (data["data"]) {
        const edges = data["data"]["servers"]?.["edges"] ?? [];
        serversRaw = edges.map((e) => e["node"] ?? e);
      } else if (data["servers"]) {
        serversRaw = data["servers"];
      } else if (data["edges"]) {
        serversRaw = data["edges"].map((e) => e["node"] ?? e);
      } else if (Array.isArray(data)) {
        serversRaw = data;
      }
      const results = serversRaw.map((s) => {
        const name = s["name"] || s["slug"] || "";
        const namespace = s["namespace"] || "";
        const qualified = namespace ? `${namespace}/${name}` : name;
        let transport = "stdio";
        const attrs = s["attributes"];
        if (Array.isArray(attrs) && attrs.some((a) => typeof a === "string" && a.toLowerCase().includes("remote"))) {
          transport = "http";
        }
        return {
          name: qualified || name,
          description: (s["description"] || "").slice(0, 120),
          source: "glama",
          transport,
          qualifiedId: qualified || name,
          stars: 0,
          lastUpdated: "",
          hasReadme: false,
          installs: 0
        };
      });
      if (useCache && results.length > 0) writeCache(key, results);
      return results;
    } catch {
      return [];
    }
  },
  async show(serverId, useCache = true, cacheTtl = 3600) {
    const key = cacheKey("glama_show", serverId);
    if (useCache) {
      const cached = readCache(key, cacheTtl);
      if (cached) return cached;
    }
    try {
      const url = `${GLAMA_BASE}/servers/${encodeURIComponent(serverId)}`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!resp.ok) return null;
      const s = await resp.json();
      const name = s["name"] || s["slug"] || "";
      const namespace = s["namespace"] || "";
      const qualified = namespace ? `${namespace}/${name}` : name;
      const envVars = [];
      const envSchema = s["environmentVariablesJsonSchema"];
      if (envSchema && typeof envSchema === "object") {
        const props = envSchema["properties"] ?? {};
        const requiredKeys = envSchema["required"] ?? [];
        for (const [key2, val] of Object.entries(props)) {
          envVars.push({
            name: key2,
            description: val["description"] || "",
            required: requiredKeys.includes(key2)
          });
        }
      }
      const tools = [];
      let toolsRawChars = 0;
      for (const tool of s["tools"] ?? []) {
        if (typeof tool === "object" && tool !== null) {
          tools.push(tool["name"] || "");
          toolsRawChars += JSON.stringify(tool).length;
        }
      }
      const homepage = s["url"] || (typeof s["repository"] === "object" && s["repository"] !== null ? s["repository"]["url"] || "" : "");
      const detail = {
        name: qualified,
        description: s["description"] || "",
        source: "glama",
        transport: "stdio",
        homepage,
        envVars,
        tools,
        toolsRawChars,
        registryType: "",
        packageIdentifier: "",
        packageArgs: [],
        stars: 0,
        lastUpdated: "",
        hasReadme: false,
        installs: 0
      };
      if (useCache) writeCache(key, detail);
      return detail;
    } catch {
      return null;
    }
  }
};
const defaultAdapters = [officialAdapter, glamaAdapter];
async function searchRegistries(query, options) {
  const adapters = defaultAdapters;
  const results = await Promise.allSettled(
    adapters.map((a) => a.search(query, 20, true, 3600))
  );
  const merged = [];
  const seen = /* @__PURE__ */ new Set();
  for (const r of results) {
    if (r.status === "fulfilled") {
      for (const server2 of r.value) {
        if (!seen.has(server2.name)) {
          seen.add(server2.name);
          merged.push(server2);
        }
      }
    }
  }
  return merged.slice(0, 20);
}
async function showRegistry(serverId, options) {
  const adapters = defaultAdapters;
  for (const adapter2 of adapters) {
    const detail = await adapter2.show(serverId, true, 3600);
    if (detail) return detail;
  }
  return null;
}
function listBackends(adapters) {
  return (adapters ?? defaultAdapters).map((a) => ({ name: a.name, baseUrl: a.baseUrl }));
}
function checkMissingEnvVars(config) {
  const checks = [];
  for (const server2 of config.servers) {
    if (!server2.enabled) continue;
    if (Object.keys(server2.env).length === 0) continue;
    let missing = false;
    for (const [key, val] of Object.entries(server2.env)) {
      if (!val || val === "") {
        missing = true;
        checks.push({
          id: "env-vars",
          category: "existence",
          maxPoints: 10,
          earnedPoints: 0,
          severity: "error",
          message: `Server '${server2.name}' missing env var ${key}`,
          fix: { command: `ensemble show ${server2.name}`, description: "Review required environment variables" }
        });
      }
    }
    if (!missing) {
      checks.push({
        id: "env-vars",
        category: "existence",
        maxPoints: 10,
        earnedPoints: 10,
        severity: "info",
        message: `Server '${server2.name}' env vars all set`
      });
    }
  }
  return checks;
}
function checkUnreachableBinaries(config) {
  const checks = [];
  for (const server2 of config.servers) {
    if (!server2.enabled || !server2.command || server2.transport !== "stdio") continue;
    try {
      node_child_process.execSync(`which ${server2.command}`, { stdio: "pipe" });
      checks.push({
        id: "unreachable-binary",
        category: "grounding",
        maxPoints: 5,
        earnedPoints: 5,
        severity: "info",
        message: `Server '${server2.name}': command '${server2.command}' found`
      });
    } catch {
      checks.push({
        id: "unreachable-binary",
        category: "grounding",
        maxPoints: 5,
        earnedPoints: 0,
        severity: "warning",
        message: `Server '${server2.name}': command '${server2.command}' not found on PATH`
      });
    }
  }
  return checks;
}
function checkStaleConfigs(config) {
  const checks = [];
  for (const clientAssignment of config.clients) {
    const clientDef = CLIENTS[clientAssignment.id];
    const label = clientDef?.name ?? clientAssignment.id;
    if (!clientAssignment.last_synced) {
      checks.push({
        id: "stale-config",
        category: "freshness",
        maxPoints: 5,
        earnedPoints: 0,
        severity: "warning",
        message: `${label}: never synced`,
        fix: { command: `ensemble sync ${clientAssignment.id}`, description: "Run initial sync" }
      });
    } else {
      checks.push({
        id: "stale-config",
        category: "freshness",
        maxPoints: 5,
        earnedPoints: 5,
        severity: "info",
        message: `${label}: synced`
      });
    }
  }
  return checks;
}
function checkOrphanedEntries(config) {
  const checks = [];
  let scannedCount = 0;
  let orphanCount = 0;
  for (const [clientId, clientDef] of Object.entries(CLIENTS)) {
    for (const path2 of resolvedPaths(clientDef)) {
      if (!node_fs.existsSync(path2)) continue;
      try {
        const clientConfig = readClientConfig(path2);
        const managed = getManagedServers(clientConfig, clientDef.serversKey);
        for (const name of Object.keys(managed)) {
          scannedCount++;
          const inRegistry = config.servers.some((s) => s.name === name);
          if (!inRegistry) {
            orphanCount++;
            checks.push({
              id: "orphaned-entry",
              category: "grounding",
              maxPoints: 5,
              earnedPoints: 0,
              severity: "warning",
              message: `${clientDef.name}: orphaned entry '${name}' (in client config but not in ensemble registry)`,
              fix: { command: `ensemble import ${clientId}`, description: "Import or remove orphaned entries" }
            });
          }
        }
      } catch {
      }
    }
  }
  if (scannedCount > 0 && orphanCount === 0) {
    checks.push({
      id: "orphaned-entry",
      category: "grounding",
      maxPoints: 5,
      earnedPoints: 5,
      severity: "info",
      message: `No orphaned entries across ${scannedCount} managed server(s)`
    });
  }
  return checks;
}
function checkConfigParseErrors() {
  const checks = [];
  let parsedCount = 0;
  for (const [_clientId, clientDef] of Object.entries(CLIENTS)) {
    for (const path2 of resolvedPaths(clientDef)) {
      if (!node_fs.existsSync(path2)) continue;
      try {
        readClientConfig(path2);
        parsedCount++;
      } catch {
        checks.push({
          id: "config-parse-error",
          category: "existence",
          maxPoints: 10,
          earnedPoints: 0,
          severity: "error",
          message: `${clientDef.name}: config file contains invalid JSON/TOML (${path2})`
        });
      }
    }
  }
  if (parsedCount > 0 && checks.length === 0) {
    checks.push({
      id: "config-parse-error",
      category: "existence",
      maxPoints: 10,
      earnedPoints: 10,
      severity: "info",
      message: `${parsedCount} client config(s) parsed successfully`
    });
  }
  return checks;
}
function checkDrift(config) {
  const checks = [];
  let checkedCount = 0;
  let driftCount = 0;
  for (const clientAssignment of config.clients) {
    const clientDef = CLIENTS[clientAssignment.id];
    if (!clientDef || !clientAssignment.server_hashes) continue;
    for (const path2 of resolvedPaths(clientDef)) {
      if (!node_fs.existsSync(path2)) continue;
      try {
        const clientConfig = readClientConfig(path2);
        const managed = getManagedServers(clientConfig, clientDef.serversKey);
        for (const [name, entry] of Object.entries(managed)) {
          const storedHash = clientAssignment.server_hashes[name];
          if (storedHash) {
            checkedCount++;
            const currentHash = computeEntryHash(entry);
            if (currentHash !== storedHash) {
              driftCount++;
              checks.push({
                id: "drift-detected",
                category: "freshness",
                maxPoints: 5,
                earnedPoints: 0,
                severity: "warning",
                message: `${clientDef.name}: server '${name}' was modified outside ensemble`,
                fix: {
                  command: `ensemble sync ${clientAssignment.id} --force`,
                  description: "Overwrite with ensemble's version, or --adopt to keep"
                }
              });
            }
          }
        }
      } catch {
      }
    }
  }
  if (checkedCount > 0 && driftCount === 0) {
    checks.push({
      id: "drift-detected",
      category: "freshness",
      maxPoints: 5,
      earnedPoints: 5,
      severity: "info",
      message: `No drift detected across ${checkedCount} managed server(s)`
    });
  }
  return checks;
}
function checkBrokenSkillSymlinks(_config) {
  const checks = [];
  let symlinkCount = 0;
  let brokenCount = 0;
  for (const clientDef of Object.values(CLIENTS)) {
    if (!clientDef.skillsDir) continue;
    const skillsDir = expandPath(clientDef.skillsDir);
    if (!node_fs.existsSync(skillsDir)) continue;
    try {
      for (const entry of node_fs.readdirSync(skillsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const skillPath = node_path.join(skillsDir, entry.name, "SKILL.md");
        try {
          const stat = node_fs.lstatSync(skillPath);
          if (stat.isSymbolicLink()) {
            symlinkCount++;
            const target = node_fs.readlinkSync(skillPath);
            if (!node_fs.existsSync(target)) {
              brokenCount++;
              checks.push({
                id: "broken-skill-symlink",
                category: "skills-health",
                maxPoints: 5,
                earnedPoints: 0,
                severity: "warning",
                message: `${clientDef.name}: broken skill symlink '${entry.name}' → ${target}`
              });
            }
          }
        } catch {
        }
      }
    } catch {
    }
  }
  if (symlinkCount > 0 && brokenCount === 0) {
    checks.push({
      id: "broken-skill-symlink",
      category: "skills-health",
      maxPoints: 5,
      earnedPoints: 5,
      severity: "info",
      message: `${symlinkCount} skill symlink(s) intact`
    });
  }
  return checks;
}
function checkMissingToolMetadata(config) {
  const checks = [];
  let registryCount = 0;
  let missingCount = 0;
  for (const server2 of config.servers) {
    if (!server2.enabled) continue;
    if (server2.origin.source === "registry") {
      registryCount++;
      if (server2.tools.length === 0) {
        missingCount++;
        checks.push({
          id: "missing-tool-metadata",
          category: "grounding",
          maxPoints: 3,
          earnedPoints: 0,
          severity: "info",
          message: `Server '${server2.name}' (from registry) has no cached tool metadata`,
          fix: { command: `ensemble registry show ${server2.name}`, description: "Refresh tool metadata" }
        });
      }
    }
  }
  if (registryCount > 0 && missingCount === 0) {
    checks.push({
      id: "missing-tool-metadata",
      category: "grounding",
      maxPoints: 3,
      earnedPoints: 3,
      severity: "info",
      message: `${registryCount} registry server(s) have tool metadata`
    });
  }
  return checks;
}
function checkCrossClientParity(config) {
  const checks = [];
  const groupClients = /* @__PURE__ */ new Map();
  for (const assignment of config.clients) {
    if (assignment.group) {
      const existing = groupClients.get(assignment.group) ?? [];
      existing.push(assignment.id);
      groupClients.set(assignment.group, existing);
    }
  }
  let multiGroupCount = 0;
  let parityIssues = 0;
  for (const [groupName, clientIds] of groupClients) {
    if (clientIds.length < 2) continue;
    multiGroupCount++;
    const hashSets = clientIds.map((id) => {
      const a = config.clients.find((c) => c.id === id);
      return JSON.stringify(Object.keys(a?.server_hashes ?? {}).sort());
    });
    const unique = new Set(hashSets);
    if (unique.size > 1) {
      parityIssues++;
      checks.push({
        id: "cross-client-parity",
        category: "parity",
        maxPoints: 5,
        earnedPoints: 0,
        severity: "warning",
        message: `Clients with group '${groupName}' have different effective server sets: ${clientIds.join(", ")}`,
        fix: { command: `ensemble sync`, description: "Re-sync all clients to resolve" }
      });
    }
  }
  if (multiGroupCount > 0 && parityIssues === 0) {
    checks.push({
      id: "cross-client-parity",
      category: "parity",
      maxPoints: 5,
      earnedPoints: 5,
      severity: "info",
      message: `${multiGroupCount} multi-client group(s) in parity`
    });
  }
  return checks;
}
function check1PasswordCli(config) {
  const checks = [];
  const hasOpRefs = config.servers.some(
    (s) => Object.values(s.env).some((v) => v.startsWith("op://"))
  );
  if (hasOpRefs) {
    try {
      const { execSync: exec } = require("node:child_process");
      exec("which op", { stdio: "pipe" });
      checks.push({
        id: "1password-cli-missing",
        category: "existence",
        maxPoints: 5,
        earnedPoints: 5,
        severity: "info",
        message: "1Password CLI (op) available for op:// references"
      });
    } catch {
      checks.push({
        id: "1password-cli-missing",
        category: "existence",
        maxPoints: 5,
        earnedPoints: 0,
        severity: "warning",
        message: "Servers reference op:// env vars but 1Password CLI (op) not found on PATH"
      });
    }
  }
  return checks;
}
function checkUnresolvedDeps(config) {
  const checks = [];
  for (const skill of config.skills) {
    for (const dep of skill.dependencies) {
      if (!config.servers.some((s) => s.name === dep)) {
        checks.push({
          id: "unresolved-skill-dep",
          category: "skills-health",
          maxPoints: 3,
          earnedPoints: 0,
          severity: "info",
          message: `Skill '${skill.name}' depends on missing server '${dep}'`
        });
      }
    }
  }
  return checks;
}
function checkFrontmatterCompleteness(config) {
  const checks = [];
  for (const skill of config.skills) {
    if (!skill.name) {
      checks.push({
        id: "skill-frontmatter-completeness",
        category: "skills-health",
        maxPoints: 3,
        earnedPoints: 0,
        severity: "error",
        message: `Skill missing name`
      });
    }
    if (!skill.description) {
      checks.push({
        id: "skill-frontmatter-completeness",
        category: "skills-health",
        maxPoints: 3,
        earnedPoints: 0,
        severity: "warning",
        message: `Skill '${skill.name}' has no description`
      });
    }
    if (skill.tags.length === 0) {
      checks.push({
        id: "skill-frontmatter-completeness",
        category: "skills-health",
        maxPoints: 1,
        earnedPoints: 0,
        severity: "info",
        message: `Skill '${skill.name}' has no tags (recommended for search)`
      });
    }
  }
  return checks;
}
function checkDescriptionFormat(config) {
  const checks = [];
  for (const skill of config.skills) {
    if (!skill.description) continue;
    if (skill.description.includes("\n")) {
      checks.push({
        id: "skill-description-format",
        category: "skills-health",
        maxPoints: 2,
        earnedPoints: 0,
        severity: "warning",
        message: `Skill '${skill.name}' has multiline description (should be single line)`
      });
    } else if (skill.description.length > 120) {
      checks.push({
        id: "skill-description-format",
        category: "skills-health",
        maxPoints: 2,
        earnedPoints: 0,
        severity: "warning",
        message: `Skill '${skill.name}' description exceeds 120 chars (${skill.description.length})`
      });
    }
  }
  return checks;
}
function checkBodySize(config) {
  const checks = [];
  for (const skill of config.skills) {
    const skillMdPath2 = node_path.join(SKILLS_DIR, skill.name, "SKILL.md");
    if (!node_fs.existsSync(skillMdPath2)) continue;
    try {
      const { readFileSync: readFileSync2 } = require("node:fs");
      const content = readFileSync2(skillMdPath2, "utf-8");
      const lineCount = content.split("\n").length;
      if (lineCount > 500) {
        checks.push({
          id: "skill-body-size",
          category: "skills-health",
          maxPoints: 2,
          earnedPoints: 0,
          severity: "warning",
          message: `Skill '${skill.name}' SKILL.md is ${lineCount} lines (recommended: <500)`
        });
      }
    } catch {
    }
  }
  return checks;
}
function checkDirectoryNaming(config) {
  const checks = [];
  const kebabCase = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  for (const skill of config.skills) {
    if (!kebabCase.test(skill.name)) {
      checks.push({
        id: "skill-directory-naming",
        category: "skills-health",
        maxPoints: 1,
        earnedPoints: 0,
        severity: "info",
        message: `Skill '${skill.name}' name is not kebab-case`
      });
    }
  }
  return checks;
}
function checkBrokenDependency(config) {
  const checks = [];
  for (const skill of config.skills) {
    for (const dep of skill.dependencies) {
      const server2 = config.servers.find((s) => s.name === dep);
      if (!server2) {
        continue;
      }
      if (!server2.enabled) {
        checks.push({
          id: "skill-broken-dependency",
          category: "skills-health",
          maxPoints: 3,
          earnedPoints: 0,
          severity: "warning",
          message: `Skill '${skill.name}' depends on disabled server '${dep}'`
        });
      }
    }
  }
  return checks;
}
function checkSecretInEnv(config) {
  const checks = [];
  let scannedCount = 0;
  let violationCount = 0;
  for (const server2 of config.servers) {
    if (Object.keys(server2.env).length === 0) continue;
    scannedCount++;
    const violations = scanSecrets(server2.env, server2.name);
    for (const v of violations) {
      violationCount++;
      checks.push({
        id: "secret-in-env",
        category: "existence",
        maxPoints: 5,
        earnedPoints: 0,
        severity: "error",
        message: `Server '${server2.name}' env var '${v.field}' contains ${v.pattern}`,
        fix: { command: `ensemble show ${server2.name}`, description: "Replace with op:// reference" }
      });
    }
  }
  if (scannedCount > 0 && violationCount === 0) {
    checks.push({
      id: "secret-in-env",
      category: "existence",
      maxPoints: 5,
      earnedPoints: 5,
      severity: "info",
      message: `No plaintext secrets detected in ${scannedCount} server(s)`
    });
  }
  return checks;
}
function checkCapabilityGaps(config) {
  const checks = [];
  const mcpCaps = getMcpCapabilities();
  if (mcpCaps.length === 0) return checks;
  const enabledServerNames = new Set(config.servers.filter((s) => s.enabled).map((s) => s.name));
  let gapCount = 0;
  let checkedCount = 0;
  for (const cap of mcpCaps) {
    if (!cap.inputs) continue;
    const serverName = cap.inputs;
    if (config.servers.some((s) => s.name === serverName)) {
      checkedCount++;
      if (!enabledServerNames.has(serverName)) {
        gapCount++;
        checks.push({
          id: "capability-server-gap",
          category: "capability",
          maxPoints: 3,
          earnedPoints: 0,
          severity: "warning",
          message: `${cap.project}: capability '${cap.name}' references server '${serverName}' but it is not enabled`
        });
      }
    }
  }
  if (checkedCount > 0 && gapCount === 0) {
    checks.push({
      id: "capability-server-gap",
      category: "capability",
      maxPoints: 3,
      earnedPoints: 3,
      severity: "info",
      message: `${checkedCount} capability reference(s) satisfied`
    });
  }
  return checks;
}
function checkSkillsSummary(config) {
  if (config.skills.length === 0) {
    return [{
      id: "skills-summary",
      category: "skills-health",
      maxPoints: 5,
      earnedPoints: 5,
      severity: "info",
      message: "No skills registered (add with `ensemble skills add`)"
    }];
  }
  return [{
    id: "skills-summary",
    category: "skills-health",
    maxPoints: 5,
    earnedPoints: 5,
    severity: "info",
    message: `${config.skills.length} skill(s) registered`
  }];
}
function findStaleDescriptionHashes(config) {
  const out = [];
  const consider = (type, name, description, storedHash) => {
    const desc = description ?? "";
    if (!desc) return;
    const cur = descriptionHash(desc);
    const stored = storedHash ?? "";
    if (stored !== cur) out.push({ type, name, description: desc, storedHash: stored, currentHash: cur });
  };
  for (const s of config.servers) consider("server", s.name, s.description, s.lastDescriptionHash);
  for (const s of config.skills) consider("skill", s.name, s.description, s.lastDescriptionHash);
  for (const p of config.plugins) consider("plugin", p.name, p.description, p.lastDescriptionHash);
  return out;
}
function checkDescriptionsRefreshed(config) {
  const stale = findStaleDescriptionHashes(config);
  if (stale.length === 0) {
    return [
      {
        id: "descriptions-refreshed",
        category: "freshness",
        maxPoints: 5,
        earnedPoints: 5,
        severity: "info",
        message: "All description hashes are up to date."
      }
    ];
  }
  return stale.map((entry) => ({
    id: "descriptions-refreshed",
    category: "freshness",
    maxPoints: 5,
    earnedPoints: 4,
    severity: "info",
    message: `${entry.type} '${entry.name}' description hash is stale (run a refresh to acknowledge).`,
    fix: { command: `ensemble doctor --show descriptions-refreshed`, description: "Show full refreshed-descriptions list" }
  }));
}
function checkOrphanSnapshots(config) {
  const checks = [];
  let all;
  try {
    all = list();
  } catch {
    return checks;
  }
  if (all.length === 0) return checks;
  const liveAgentNames = new Set((config.agents ?? []).map((a) => a.name));
  const liveCommandNames = new Set((config.commands ?? []).map((c) => c.name));
  const liveSkillNames = new Set(config.skills.map((s) => s.name));
  function isOrphanPath(path2) {
    if (node_fs.existsSync(path2)) return false;
    const segments = path2.split("/");
    const fileName = segments[segments.length - 1] ?? "";
    const baseName = fileName.endsWith(".md") ? fileName.slice(0, -3) : fileName;
    if (path2.includes("/.claude/agents/") && liveAgentNames.has(baseName)) return false;
    if (path2.includes("/.claude/commands/") && liveCommandNames.has(baseName)) return false;
    if (path2.includes("/skills/") && liveSkillNames.has(baseName)) return false;
    return true;
  }
  let orphanCount = 0;
  for (const snap of all) {
    if (snap.files.length === 0) continue;
    const allOrphan = snap.files.every((f) => isOrphanPath(f.path));
    if (allOrphan) {
      orphanCount++;
      checks.push({
        id: "orphan-snapshot",
        category: "freshness",
        maxPoints: 2,
        earnedPoints: 1,
        severity: "info",
        message: `Snapshot '${snap.id}' captures only paths whose library entries are gone (candidate for pruning).`,
        fix: { command: `ensemble rollback --prune`, description: "Prune orphan snapshots" }
      });
    }
  }
  if (orphanCount === 0 && all.length > 0) {
    checks.push({
      id: "orphan-snapshot",
      category: "freshness",
      maxPoints: 2,
      earnedPoints: 2,
      severity: "info",
      message: `No orphan snapshots detected (${all.length} snapshot${all.length === 1 ? "" : "s"} on disk).`
    });
  }
  return checks;
}
function checkSnapshotDirSize(config) {
  const thresholdMb = config.settings.snapshot_dir_size_warn_mb ?? 500;
  if (thresholdMb <= 0) return [];
  const root = snapshotsRoot();
  if (!node_fs.existsSync(root)) return [];
  function dirSize(dir) {
    let total = 0;
    try {
      for (const entry of node_fs.readdirSync(dir, { withFileTypes: true })) {
        const full = node_path.join(dir, entry.name);
        try {
          if (entry.isDirectory()) {
            total += dirSize(full);
          } else if (entry.isFile()) {
            total += node_fs.statSync(full).size;
          }
        } catch {
        }
      }
    } catch {
    }
    return total;
  }
  const totalBytes = dirSize(root);
  const totalMb = Math.round(totalBytes / (1024 * 1024));
  if (totalMb >= thresholdMb) {
    return [
      {
        id: "snapshot-dir-size",
        category: "freshness",
        maxPoints: 3,
        earnedPoints: 1,
        severity: "warning",
        message: `Snapshot directory is ${totalMb} MB (threshold ${thresholdMb} MB). Consider shortening snapshot_retention_days or running 'ensemble rollback --prune'.`
      }
    ];
  }
  return [
    {
      id: "snapshot-dir-size",
      category: "freshness",
      maxPoints: 3,
      earnedPoints: 3,
      severity: "info",
      message: `Snapshot directory ${totalMb} MB / ${thresholdMb} MB warn threshold.`
    }
  ];
}
function hashString(s) {
  return node_crypto.createHash("sha256").update(s).digest("hex");
}
function checkAgentsCommandsDrift(config) {
  const checks = [];
  const managedMarker = /^---[\s\S]*?__ensemble:\s*true[\s\S]*?---/m;
  let agentsChecked = 0;
  let commandsChecked = 0;
  let driftCount = 0;
  for (const client of Object.values(CLIENTS)) {
    if (client.agentsDir) {
      const dir = expandPath(client.agentsDir);
      for (const a of resolveAgents(config, client.id)) {
        const target = node_path.join(dir, `${a.name}.md`);
        if (!node_fs.existsSync(target)) continue;
        let current;
        try {
          current = node_fs.readFileSync(target, "utf-8");
        } catch {
          continue;
        }
        if (!managedMarker.test(current)) continue;
        agentsChecked++;
        const canonical = readAgentMd(a.name);
        const body = canonical?.body ?? "";
        const expected = toFanoutContent$1(a, body);
        if (hashString(current) !== hashString(expected)) {
          driftCount++;
          checks.push({
            id: "agent-drift",
            category: "parity",
            maxPoints: 3,
            earnedPoints: 0,
            severity: "warning",
            message: `Agent '${a.name}' fan-out in ${client.name} drifted from library. Run 'ensemble sync ${client.id}' to re-fan-out.`
          });
        }
      }
    }
    if (client.commandsDir) {
      const dir = expandPath(client.commandsDir);
      for (const c of resolveCommands(config, client.id)) {
        const target = node_path.join(dir, `${c.name}.md`);
        if (!node_fs.existsSync(target)) continue;
        let current;
        try {
          current = node_fs.readFileSync(target, "utf-8");
        } catch {
          continue;
        }
        if (!managedMarker.test(current)) continue;
        commandsChecked++;
        const canonical = readCommandMd(c.name);
        const body = canonical?.body ?? "";
        const expected = toFanoutContent(c, body);
        if (hashString(current) !== hashString(expected)) {
          driftCount++;
          checks.push({
            id: "command-drift",
            category: "parity",
            maxPoints: 3,
            earnedPoints: 0,
            severity: "warning",
            message: `Command '${c.name}' fan-out in ${client.name} drifted from library. Run 'ensemble sync ${client.id}' to re-fan-out.`
          });
        }
      }
    }
  }
  if (driftCount === 0 && agentsChecked + commandsChecked > 0) {
    checks.push({
      id: "agents-commands-drift",
      category: "parity",
      maxPoints: 3,
      earnedPoints: 3,
      severity: "info",
      message: `${agentsChecked} agent fan-out(s) and ${commandsChecked} command fan-out(s) match the library.`
    });
  }
  return checks;
}
function checkRetentionConfigVisibility(config) {
  const days = config.settings.snapshot_retention_days;
  const mb = config.settings.snapshot_dir_size_warn_mb ?? 500;
  const daysLabel = days === 0 ? "pruning disabled" : `${days} day${days === 1 ? "" : "s"}`;
  const mbLabel = mb === 0 ? "size warn disabled" : `warn at ${mb} MB`;
  return [
    {
      id: "snapshot-retention-config",
      category: "freshness",
      maxPoints: 1,
      earnedPoints: 1,
      severity: "info",
      message: `Snapshot retention: ${daysLabel}; ${mbLabel}.`
    }
  ];
}
function runDoctor(config) {
  const allChecks = [
    ...checkMissingEnvVars(config),
    ...check1PasswordCli(config),
    ...checkUnreachableBinaries(config),
    ...checkStaleConfigs(config),
    ...checkOrphanedEntries(config),
    ...checkConfigParseErrors(),
    ...checkDrift(config),
    ...checkMissingToolMetadata(config),
    ...checkCrossClientParity(config),
    ...checkBrokenSkillSymlinks(),
    ...checkUnresolvedDeps(config),
    ...checkFrontmatterCompleteness(config),
    ...checkDescriptionFormat(config),
    ...checkBodySize(config),
    ...checkDirectoryNaming(config),
    ...checkBrokenDependency(config),
    ...checkSecretInEnv(config),
    ...checkCapabilityGaps(config),
    ...checkSkillsSummary(config),
    ...checkDescriptionsRefreshed(config),
    // v2.0.1 additive checks
    ...checkOrphanSnapshots(config),
    ...checkSnapshotDirSize(config),
    ...checkAgentsCommandsDrift(config),
    ...checkRetentionConfigVisibility(config)
  ];
  const totalPoints = allChecks.reduce((sum, c) => sum + c.maxPoints, 0) || 100;
  const earnedPoints = allChecks.reduce((sum, c) => sum + c.earnedPoints, 0);
  const categories = ["existence", "freshness", "grounding", "parity", "skills-health", "capability"];
  const categoryScores = {};
  for (const cat of categories) {
    const catChecks = allChecks.filter((c) => c.category === cat);
    const max = catChecks.reduce((sum, c) => sum + c.maxPoints, 0);
    if (max > 0) {
      categoryScores[cat] = {
        earned: catChecks.reduce((sum, c) => sum + c.earnedPoints, 0),
        max
      };
    }
  }
  return {
    checks: allChecks,
    totalPoints,
    earnedPoints,
    scorePercent: totalPoints > 0 ? Math.round(earnedPoints / totalPoints * 100) : 100,
    errors: allChecks.filter((c) => c.severity === "error").length,
    warnings: allChecks.filter((c) => c.severity === "warning").length,
    infos: allChecks.filter((c) => c.severity === "info").length,
    categoryScores,
    serverCount: config.servers.length,
    groupCount: config.groups.length,
    pluginCount: config.plugins.length,
    skillCount: config.skills.length
  };
}
node_path.join(node_os.homedir(), ".claude", "skills");
node_path.join(node_os.homedir(), ".claude", "plugins", "installed_plugins.json");
let dbModule = null;
function getDb() {
  if (dbModule === null) {
    try {
      dbModule = require("better-sqlite3");
    } catch {
      return null;
    }
  }
  const { existsSync } = require("node:fs");
  const { homedir } = require("node:os");
  const { join } = require("node:path");
  const dbPath = join(homedir(), ".local", "share", "project-registry", "registry.db");
  if (!existsSync(dbPath)) return null;
  try {
    return new dbModule(dbPath, { readonly: true });
  } catch {
    return null;
  }
}
function listProjects(statusFilter) {
  const db = getDb();
  if (!db) return [];
  try {
    const query = statusFilter ? "SELECT id, name, display_name, type, status FROM projects WHERE status = ?" : "SELECT id, name, display_name, type, status FROM projects";
    const rows = statusFilter ? db.prepare(query).all(statusFilter) : db.prepare(query).all();
    return rows.map((row) => ({
      name: row.name,
      displayName: row.display_name || row.name,
      type: row.type,
      status: row.status,
      paths: getProjectPaths(db, row.id),
      fields: getProjectFields(db, row.id)
    }));
  } catch {
    return [];
  } finally {
    db.close();
  }
}
function getProjectPaths(db, projectId) {
  try {
    const rows = db.prepare("SELECT path FROM project_paths WHERE project_id = ?").all(projectId);
    return rows.map((r) => r.path);
  } catch {
    return [];
  }
}
function getProjectFields(db, projectId) {
  try {
    const rows = db.prepare("SELECT field_name, field_value FROM project_fields WHERE project_id = ?").all(projectId);
    const fields = {};
    for (const row of rows) {
      fields[row.field_name] = row.field_value;
    }
    return fields;
  } catch {
    return {};
  }
}
let watcher = null;
let debounceTimer = null;
const DEBOUNCE_MS = 250;
const configEvents = new node_events.EventEmitter();
function startConfigWatcher() {
  if (watcher) return;
  try {
    watcher = node_fs.watch(CONFIG_PATH, (eventType) => {
      if (eventType !== "change") return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        configEvents.emit("change");
      }, DEBOUNCE_MS);
    });
  } catch {
  }
}
function stopConfigWatcher() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (watcher) {
    watcher.close();
    watcher = null;
  }
}
class DoubleIndexedKV {
  constructor() {
    this.keyToValue = /* @__PURE__ */ new Map();
    this.valueToKey = /* @__PURE__ */ new Map();
  }
  set(key, value) {
    this.keyToValue.set(key, value);
    this.valueToKey.set(value, key);
  }
  getByKey(key) {
    return this.keyToValue.get(key);
  }
  getByValue(value) {
    return this.valueToKey.get(value);
  }
  clear() {
    this.keyToValue.clear();
    this.valueToKey.clear();
  }
}
class Registry {
  constructor(generateIdentifier) {
    this.generateIdentifier = generateIdentifier;
    this.kv = new DoubleIndexedKV();
  }
  register(value, identifier) {
    if (this.kv.getByValue(value)) {
      return;
    }
    if (!identifier) {
      identifier = this.generateIdentifier(value);
    }
    this.kv.set(identifier, value);
  }
  clear() {
    this.kv.clear();
  }
  getIdentifier(value) {
    return this.kv.getByValue(value);
  }
  getValue(identifier) {
    return this.kv.getByKey(identifier);
  }
}
class ClassRegistry extends Registry {
  constructor() {
    super((c) => c.name);
    this.classToAllowedProps = /* @__PURE__ */ new Map();
  }
  register(value, options) {
    if (typeof options === "object") {
      if (options.allowProps) {
        this.classToAllowedProps.set(value, options.allowProps);
      }
      super.register(value, options.identifier);
    } else {
      super.register(value, options);
    }
  }
  getAllowedProps(value) {
    return this.classToAllowedProps.get(value);
  }
}
function valuesOfObj(record) {
  if ("values" in Object) {
    return Object.values(record);
  }
  const values = [];
  for (const key in record) {
    if (record.hasOwnProperty(key)) {
      values.push(record[key]);
    }
  }
  return values;
}
function find(record, predicate) {
  const values = valuesOfObj(record);
  if ("find" in values) {
    return values.find(predicate);
  }
  const valuesNotNever = values;
  for (let i = 0; i < valuesNotNever.length; i++) {
    const value = valuesNotNever[i];
    if (predicate(value)) {
      return value;
    }
  }
  return void 0;
}
function forEach(record, run) {
  Object.entries(record).forEach(([key, value]) => run(value, key));
}
function includes(arr, value) {
  return arr.indexOf(value) !== -1;
}
function findArr(record, predicate) {
  for (let i = 0; i < record.length; i++) {
    const value = record[i];
    if (predicate(value)) {
      return value;
    }
  }
  return void 0;
}
class CustomTransformerRegistry {
  constructor() {
    this.transfomers = {};
  }
  register(transformer) {
    this.transfomers[transformer.name] = transformer;
  }
  findApplicable(v) {
    return find(this.transfomers, (transformer) => transformer.isApplicable(v));
  }
  findByName(name) {
    return this.transfomers[name];
  }
}
const getType$1 = (payload) => Object.prototype.toString.call(payload).slice(8, -1);
const isUndefined = (payload) => typeof payload === "undefined";
const isNull = (payload) => payload === null;
const isPlainObject$1 = (payload) => {
  if (typeof payload !== "object" || payload === null)
    return false;
  if (payload === Object.prototype)
    return false;
  if (Object.getPrototypeOf(payload) === null)
    return true;
  return Object.getPrototypeOf(payload) === Object.prototype;
};
const isEmptyObject = (payload) => isPlainObject$1(payload) && Object.keys(payload).length === 0;
const isArray$1 = (payload) => Array.isArray(payload);
const isString = (payload) => typeof payload === "string";
const isNumber = (payload) => typeof payload === "number" && !isNaN(payload);
const isBoolean = (payload) => typeof payload === "boolean";
const isRegExp = (payload) => payload instanceof RegExp;
const isMap = (payload) => payload instanceof Map;
const isSet = (payload) => payload instanceof Set;
const isSymbol = (payload) => getType$1(payload) === "Symbol";
const isDate = (payload) => payload instanceof Date && !isNaN(payload.valueOf());
const isError = (payload) => payload instanceof Error;
const isNaNValue = (payload) => typeof payload === "number" && isNaN(payload);
const isPrimitive = (payload) => isBoolean(payload) || isNull(payload) || isUndefined(payload) || isNumber(payload) || isString(payload) || isSymbol(payload);
const isBigint = (payload) => typeof payload === "bigint";
const isInfinite = (payload) => payload === Infinity || payload === -Infinity;
const isTypedArray = (payload) => ArrayBuffer.isView(payload) && !(payload instanceof DataView);
const isURL = (payload) => payload instanceof URL;
const escapeKey = (key) => key.replace(/\\/g, "\\\\").replace(/\./g, "\\.");
const stringifyPath = (path2) => path2.map(String).map(escapeKey).join(".");
const parsePath = (string, legacyPaths) => {
  const result = [];
  let segment = "";
  for (let i = 0; i < string.length; i++) {
    let char = string.charAt(i);
    if (!legacyPaths && char === "\\") {
      const escaped = string.charAt(i + 1);
      if (escaped === "\\") {
        segment += "\\";
        i++;
        continue;
      } else if (escaped !== ".") {
        throw Error("invalid path");
      }
    }
    const isEscapedDot = char === "\\" && string.charAt(i + 1) === ".";
    if (isEscapedDot) {
      segment += ".";
      i++;
      continue;
    }
    const isEndOfSegment = char === ".";
    if (isEndOfSegment) {
      result.push(segment);
      segment = "";
      continue;
    }
    segment += char;
  }
  const lastSegment = segment;
  result.push(lastSegment);
  return result;
};
function simpleTransformation(isApplicable, annotation, transform, untransform) {
  return {
    isApplicable,
    annotation,
    transform,
    untransform
  };
}
const simpleRules = [
  simpleTransformation(isUndefined, "undefined", () => null, () => void 0),
  simpleTransformation(isBigint, "bigint", (v) => v.toString(), (v) => {
    if (typeof BigInt !== "undefined") {
      return BigInt(v);
    }
    console.error("Please add a BigInt polyfill.");
    return v;
  }),
  simpleTransformation(isDate, "Date", (v) => v.toISOString(), (v) => new Date(v)),
  simpleTransformation(isError, "Error", (v, superJson) => {
    const baseError = {
      name: v.name,
      message: v.message
    };
    if ("cause" in v) {
      baseError.cause = v.cause;
    }
    superJson.allowedErrorProps.forEach((prop) => {
      baseError[prop] = v[prop];
    });
    return baseError;
  }, (v, superJson) => {
    const e = new Error(v.message, { cause: v.cause });
    e.name = v.name;
    e.stack = v.stack;
    superJson.allowedErrorProps.forEach((prop) => {
      e[prop] = v[prop];
    });
    return e;
  }),
  simpleTransformation(isRegExp, "regexp", (v) => "" + v, (regex) => {
    const body = regex.slice(1, regex.lastIndexOf("/"));
    const flags = regex.slice(regex.lastIndexOf("/") + 1);
    return new RegExp(body, flags);
  }),
  simpleTransformation(
    isSet,
    "set",
    // (sets only exist in es6+)
    // eslint-disable-next-line es5/no-es6-methods
    (v) => [...v.values()],
    (v) => new Set(v)
  ),
  simpleTransformation(isMap, "map", (v) => [...v.entries()], (v) => new Map(v)),
  simpleTransformation((v) => isNaNValue(v) || isInfinite(v), "number", (v) => {
    if (isNaNValue(v)) {
      return "NaN";
    }
    if (v > 0) {
      return "Infinity";
    } else {
      return "-Infinity";
    }
  }, Number),
  simpleTransformation((v) => v === 0 && 1 / v === -Infinity, "number", () => {
    return "-0";
  }, Number),
  simpleTransformation(isURL, "URL", (v) => v.toString(), (v) => new URL(v))
];
function compositeTransformation(isApplicable, annotation, transform, untransform) {
  return {
    isApplicable,
    annotation,
    transform,
    untransform
  };
}
const symbolRule = compositeTransformation((s, superJson) => {
  if (isSymbol(s)) {
    const isRegistered = !!superJson.symbolRegistry.getIdentifier(s);
    return isRegistered;
  }
  return false;
}, (s, superJson) => {
  const identifier = superJson.symbolRegistry.getIdentifier(s);
  return ["symbol", identifier];
}, (v) => v.description, (_, a, superJson) => {
  const value = superJson.symbolRegistry.getValue(a[1]);
  if (!value) {
    throw new Error("Trying to deserialize unknown symbol");
  }
  return value;
});
const constructorToName = [
  Int8Array,
  Uint8Array,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  Uint8ClampedArray
].reduce((obj, ctor) => {
  obj[ctor.name] = ctor;
  return obj;
}, {});
const typedArrayRule = compositeTransformation(isTypedArray, (v) => ["typed-array", v.constructor.name], (v) => [...v], (v, a) => {
  const ctor = constructorToName[a[1]];
  if (!ctor) {
    throw new Error("Trying to deserialize unknown typed array");
  }
  return new ctor(v);
});
function isInstanceOfRegisteredClass(potentialClass, superJson) {
  if (potentialClass?.constructor) {
    const isRegistered = !!superJson.classRegistry.getIdentifier(potentialClass.constructor);
    return isRegistered;
  }
  return false;
}
const classRule = compositeTransformation(isInstanceOfRegisteredClass, (clazz, superJson) => {
  const identifier = superJson.classRegistry.getIdentifier(clazz.constructor);
  return ["class", identifier];
}, (clazz, superJson) => {
  const allowedProps = superJson.classRegistry.getAllowedProps(clazz.constructor);
  if (!allowedProps) {
    return { ...clazz };
  }
  const result = {};
  allowedProps.forEach((prop) => {
    result[prop] = clazz[prop];
  });
  return result;
}, (v, a, superJson) => {
  const clazz = superJson.classRegistry.getValue(a[1]);
  if (!clazz) {
    throw new Error(`Trying to deserialize unknown class '${a[1]}' - check https://github.com/blitz-js/superjson/issues/116#issuecomment-773996564`);
  }
  return Object.assign(Object.create(clazz.prototype), v);
});
const customRule = compositeTransformation((value, superJson) => {
  return !!superJson.customTransformerRegistry.findApplicable(value);
}, (value, superJson) => {
  const transformer = superJson.customTransformerRegistry.findApplicable(value);
  return ["custom", transformer.name];
}, (value, superJson) => {
  const transformer = superJson.customTransformerRegistry.findApplicable(value);
  return transformer.serialize(value);
}, (v, a, superJson) => {
  const transformer = superJson.customTransformerRegistry.findByName(a[1]);
  if (!transformer) {
    throw new Error("Trying to deserialize unknown custom value");
  }
  return transformer.deserialize(v);
});
const compositeRules = [classRule, symbolRule, customRule, typedArrayRule];
const transformValue = (value, superJson) => {
  const applicableCompositeRule = findArr(compositeRules, (rule) => rule.isApplicable(value, superJson));
  if (applicableCompositeRule) {
    return {
      value: applicableCompositeRule.transform(value, superJson),
      type: applicableCompositeRule.annotation(value, superJson)
    };
  }
  const applicableSimpleRule = findArr(simpleRules, (rule) => rule.isApplicable(value, superJson));
  if (applicableSimpleRule) {
    return {
      value: applicableSimpleRule.transform(value, superJson),
      type: applicableSimpleRule.annotation
    };
  }
  return void 0;
};
const simpleRulesByAnnotation = {};
simpleRules.forEach((rule) => {
  simpleRulesByAnnotation[rule.annotation] = rule;
});
const untransformValue = (json, type, superJson) => {
  if (isArray$1(type)) {
    switch (type[0]) {
      case "symbol":
        return symbolRule.untransform(json, type, superJson);
      case "class":
        return classRule.untransform(json, type, superJson);
      case "custom":
        return customRule.untransform(json, type, superJson);
      case "typed-array":
        return typedArrayRule.untransform(json, type, superJson);
      default:
        throw new Error("Unknown transformation: " + type);
    }
  } else {
    const transformation = simpleRulesByAnnotation[type];
    if (!transformation) {
      throw new Error("Unknown transformation: " + type);
    }
    return transformation.untransform(json, superJson);
  }
};
const getNthKey = (value, n) => {
  if (n > value.size)
    throw new Error("index out of bounds");
  const keys = value.keys();
  while (n > 0) {
    keys.next();
    n--;
  }
  return keys.next().value;
};
function validatePath(path2) {
  if (includes(path2, "__proto__")) {
    throw new Error("__proto__ is not allowed as a property");
  }
  if (includes(path2, "prototype")) {
    throw new Error("prototype is not allowed as a property");
  }
  if (includes(path2, "constructor")) {
    throw new Error("constructor is not allowed as a property");
  }
}
const getDeep = (object, path2) => {
  validatePath(path2);
  for (let i = 0; i < path2.length; i++) {
    const key = path2[i];
    if (isSet(object)) {
      object = getNthKey(object, +key);
    } else if (isMap(object)) {
      const row = +key;
      const type = +path2[++i] === 0 ? "key" : "value";
      const keyOfRow = getNthKey(object, row);
      switch (type) {
        case "key":
          object = keyOfRow;
          break;
        case "value":
          object = object.get(keyOfRow);
          break;
      }
    } else {
      object = object[key];
    }
  }
  return object;
};
const setDeep = (object, path2, mapper) => {
  validatePath(path2);
  if (path2.length === 0) {
    return mapper(object);
  }
  let parent = object;
  for (let i = 0; i < path2.length - 1; i++) {
    const key = path2[i];
    if (isArray$1(parent)) {
      const index = +key;
      parent = parent[index];
    } else if (isPlainObject$1(parent)) {
      parent = parent[key];
    } else if (isSet(parent)) {
      const row = +key;
      parent = getNthKey(parent, row);
    } else if (isMap(parent)) {
      const isEnd = i === path2.length - 2;
      if (isEnd) {
        break;
      }
      const row = +key;
      const type = +path2[++i] === 0 ? "key" : "value";
      const keyOfRow = getNthKey(parent, row);
      switch (type) {
        case "key":
          parent = keyOfRow;
          break;
        case "value":
          parent = parent.get(keyOfRow);
          break;
      }
    }
  }
  const lastKey = path2[path2.length - 1];
  if (isArray$1(parent)) {
    parent[+lastKey] = mapper(parent[+lastKey]);
  } else if (isPlainObject$1(parent)) {
    parent[lastKey] = mapper(parent[lastKey]);
  }
  if (isSet(parent)) {
    const oldValue = getNthKey(parent, +lastKey);
    const newValue = mapper(oldValue);
    if (oldValue !== newValue) {
      parent.delete(oldValue);
      parent.add(newValue);
    }
  }
  if (isMap(parent)) {
    const row = +path2[path2.length - 2];
    const keyToRow = getNthKey(parent, row);
    const type = +lastKey === 0 ? "key" : "value";
    switch (type) {
      case "key": {
        const newKey = mapper(keyToRow);
        parent.set(newKey, parent.get(keyToRow));
        if (newKey !== keyToRow) {
          parent.delete(keyToRow);
        }
        break;
      }
      case "value": {
        parent.set(keyToRow, mapper(parent.get(keyToRow)));
        break;
      }
    }
  }
  return object;
};
const enableLegacyPaths = (version) => version < 1;
function traverse(tree, walker2, version, origin = []) {
  if (!tree) {
    return;
  }
  const legacyPaths = enableLegacyPaths(version);
  if (!isArray$1(tree)) {
    forEach(tree, (subtree, key) => traverse(subtree, walker2, version, [
      ...origin,
      ...parsePath(key, legacyPaths)
    ]));
    return;
  }
  const [nodeValue, children] = tree;
  if (children) {
    forEach(children, (child, key) => {
      traverse(child, walker2, version, [
        ...origin,
        ...parsePath(key, legacyPaths)
      ]);
    });
  }
  walker2(nodeValue, origin);
}
function applyValueAnnotations(plain, annotations, version, superJson) {
  traverse(annotations, (type, path2) => {
    plain = setDeep(plain, path2, (v) => untransformValue(v, type, superJson));
  }, version);
  return plain;
}
function applyReferentialEqualityAnnotations(plain, annotations, version) {
  const legacyPaths = enableLegacyPaths(version);
  function apply(identicalPaths, path2) {
    const object = getDeep(plain, parsePath(path2, legacyPaths));
    identicalPaths.map((path3) => parsePath(path3, legacyPaths)).forEach((identicalObjectPath) => {
      plain = setDeep(plain, identicalObjectPath, () => object);
    });
  }
  if (isArray$1(annotations)) {
    const [root, other] = annotations;
    root.forEach((identicalPath) => {
      plain = setDeep(plain, parsePath(identicalPath, legacyPaths), () => plain);
    });
    if (other) {
      forEach(other, apply);
    }
  } else {
    forEach(annotations, apply);
  }
  return plain;
}
const isDeep = (object, superJson) => isPlainObject$1(object) || isArray$1(object) || isMap(object) || isSet(object) || isError(object) || isInstanceOfRegisteredClass(object, superJson);
function addIdentity(object, path2, identities) {
  const existingSet = identities.get(object);
  if (existingSet) {
    existingSet.push(path2);
  } else {
    identities.set(object, [path2]);
  }
}
function generateReferentialEqualityAnnotations(identitites, dedupe) {
  const result = {};
  let rootEqualityPaths = void 0;
  identitites.forEach((paths) => {
    if (paths.length <= 1) {
      return;
    }
    if (!dedupe) {
      paths = paths.map((path2) => path2.map(String)).sort((a, b) => a.length - b.length);
    }
    const [representativePath, ...identicalPaths] = paths;
    if (representativePath.length === 0) {
      rootEqualityPaths = identicalPaths.map(stringifyPath);
    } else {
      result[stringifyPath(representativePath)] = identicalPaths.map(stringifyPath);
    }
  });
  if (rootEqualityPaths) {
    if (isEmptyObject(result)) {
      return [rootEqualityPaths];
    } else {
      return [rootEqualityPaths, result];
    }
  } else {
    return isEmptyObject(result) ? void 0 : result;
  }
}
const walker = (object, identities, superJson, dedupe, path2 = [], objectsInThisPath = [], seenObjects = /* @__PURE__ */ new Map()) => {
  const primitive = isPrimitive(object);
  if (!primitive) {
    addIdentity(object, path2, identities);
    const seen = seenObjects.get(object);
    if (seen) {
      return dedupe ? {
        transformedValue: null
      } : seen;
    }
  }
  if (!isDeep(object, superJson)) {
    const transformed2 = transformValue(object, superJson);
    const result2 = transformed2 ? {
      transformedValue: transformed2.value,
      annotations: [transformed2.type]
    } : {
      transformedValue: object
    };
    if (!primitive) {
      seenObjects.set(object, result2);
    }
    return result2;
  }
  if (includes(objectsInThisPath, object)) {
    return {
      transformedValue: null
    };
  }
  const transformationResult = transformValue(object, superJson);
  const transformed = transformationResult?.value ?? object;
  const transformedValue = isArray$1(transformed) ? [] : {};
  const innerAnnotations = {};
  forEach(transformed, (value, index) => {
    if (index === "__proto__" || index === "constructor" || index === "prototype") {
      throw new Error(`Detected property ${index}. This is a prototype pollution risk, please remove it from your object.`);
    }
    const recursiveResult = walker(value, identities, superJson, dedupe, [...path2, index], [...objectsInThisPath, object], seenObjects);
    transformedValue[index] = recursiveResult.transformedValue;
    if (isArray$1(recursiveResult.annotations)) {
      innerAnnotations[escapeKey(index)] = recursiveResult.annotations;
    } else if (isPlainObject$1(recursiveResult.annotations)) {
      forEach(recursiveResult.annotations, (tree, key) => {
        innerAnnotations[escapeKey(index) + "." + key] = tree;
      });
    }
  });
  const result = isEmptyObject(innerAnnotations) ? {
    transformedValue,
    annotations: !!transformationResult ? [transformationResult.type] : void 0
  } : {
    transformedValue,
    annotations: !!transformationResult ? [transformationResult.type, innerAnnotations] : innerAnnotations
  };
  if (!primitive) {
    seenObjects.set(object, result);
  }
  return result;
};
function getType(payload) {
  return Object.prototype.toString.call(payload).slice(8, -1);
}
function isArray(payload) {
  return getType(payload) === "Array";
}
function isPlainObject(payload) {
  if (getType(payload) !== "Object")
    return false;
  const prototype = Object.getPrototypeOf(payload);
  return !!prototype && prototype.constructor === Object && prototype === Object.prototype;
}
function assignProp(carry, key, newVal, originalObject, includeNonenumerable) {
  const propType = {}.propertyIsEnumerable.call(originalObject, key) ? "enumerable" : "nonenumerable";
  if (propType === "enumerable")
    carry[key] = newVal;
  if (includeNonenumerable && propType === "nonenumerable") {
    Object.defineProperty(carry, key, {
      value: newVal,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
}
function copy(target, options = {}) {
  if (isArray(target)) {
    return target.map((item) => copy(item, options));
  }
  if (!isPlainObject(target)) {
    return target;
  }
  const props = Object.getOwnPropertyNames(target);
  const symbols = Object.getOwnPropertySymbols(target);
  return [...props, ...symbols].reduce((carry, key) => {
    if (key === "__proto__")
      return carry;
    if (isArray(options.props) && !options.props.includes(key)) {
      return carry;
    }
    const val = target[key];
    const newVal = copy(val, options);
    assignProp(carry, key, newVal, target, options.nonenumerable);
    return carry;
  }, {});
}
class SuperJSON {
  /**
   * @param dedupeReferentialEqualities  If true, SuperJSON will make sure only one instance of referentially equal objects are serialized and the rest are replaced with `null`.
   */
  constructor({ dedupe = false } = {}) {
    this.classRegistry = new ClassRegistry();
    this.symbolRegistry = new Registry((s) => s.description ?? "");
    this.customTransformerRegistry = new CustomTransformerRegistry();
    this.allowedErrorProps = [];
    this.dedupe = dedupe;
  }
  serialize(object) {
    const identities = /* @__PURE__ */ new Map();
    const output = walker(object, identities, this, this.dedupe);
    const res = {
      json: output.transformedValue
    };
    if (output.annotations) {
      res.meta = {
        ...res.meta,
        values: output.annotations
      };
    }
    const equalityAnnotations = generateReferentialEqualityAnnotations(identities, this.dedupe);
    if (equalityAnnotations) {
      res.meta = {
        ...res.meta,
        referentialEqualities: equalityAnnotations
      };
    }
    if (res.meta)
      res.meta.v = 1;
    return res;
  }
  deserialize(payload, options) {
    const { json, meta } = payload;
    let result = options?.inPlace ? json : copy(json);
    if (meta?.values) {
      result = applyValueAnnotations(result, meta.values, meta.v ?? 0, this);
    }
    if (meta?.referentialEqualities) {
      result = applyReferentialEqualityAnnotations(result, meta.referentialEqualities, meta.v ?? 0);
    }
    return result;
  }
  stringify(object) {
    return JSON.stringify(this.serialize(object));
  }
  parse(string) {
    return this.deserialize(JSON.parse(string), { inPlace: true });
  }
  registerClass(v, options) {
    this.classRegistry.register(v, options);
  }
  registerSymbol(v, identifier) {
    this.symbolRegistry.register(v, identifier);
  }
  registerCustom(transformer, name) {
    this.customTransformerRegistry.register({
      name,
      ...transformer
    });
  }
  allowErrorProps(...props) {
    this.allowedErrorProps.push(...props);
  }
}
SuperJSON.defaultInstance = new SuperJSON();
SuperJSON.serialize = SuperJSON.defaultInstance.serialize.bind(SuperJSON.defaultInstance);
SuperJSON.deserialize = SuperJSON.defaultInstance.deserialize.bind(SuperJSON.defaultInstance);
SuperJSON.stringify = SuperJSON.defaultInstance.stringify.bind(SuperJSON.defaultInstance);
SuperJSON.parse = SuperJSON.defaultInstance.parse.bind(SuperJSON.defaultInstance);
SuperJSON.registerClass = SuperJSON.defaultInstance.registerClass.bind(SuperJSON.defaultInstance);
SuperJSON.registerSymbol = SuperJSON.defaultInstance.registerSymbol.bind(SuperJSON.defaultInstance);
SuperJSON.registerCustom = SuperJSON.defaultInstance.registerCustom.bind(SuperJSON.defaultInstance);
SuperJSON.allowErrorProps = SuperJSON.defaultInstance.allowErrorProps.bind(SuperJSON.defaultInstance);
SuperJSON.serialize;
SuperJSON.deserialize;
SuperJSON.stringify;
SuperJSON.parse;
SuperJSON.registerClass;
SuperJSON.registerCustom;
SuperJSON.registerSymbol;
SuperJSON.allowErrorProps;
const t = server.initTRPC.context().create({ isServer: true, transformer: SuperJSON });
const { router, procedure } = t;
function fresh() {
  try {
    return loadConfig();
  } catch {
    return createConfig();
  }
}
function runOp(op) {
  const { config, result } = op(fresh());
  saveConfig(config);
  return result;
}
const scopeSchema = zod.z.union([
  zod.z.object({ kind: zod.z.literal("global") }),
  zod.z.object({ kind: zod.z.literal("project"), path: zod.z.string() }),
  zod.z.object({ kind: zod.z.literal("library") })
]);
const toolTypeSchema = zod.z.enum(["server", "skill", "agent", "command", "style", "plugin", "hook"]);
const wireRequestSchema = zod.z.object({
  type: toolTypeSchema,
  name: zod.z.string(),
  source: scopeSchema,
  target: scopeSchema
});
const unwireRequestSchema = zod.z.object({
  type: toolTypeSchema,
  name: zod.z.string(),
  scope: scopeSchema
});
const discoveredToolSchema = zod.z.object({
  id: zod.z.string(),
  type: toolTypeSchema,
  name: zod.z.string(),
  description: zod.z.string(),
  scope: scopeSchema,
  origin: zod.z.enum(["discovered", "managed"]),
  filePath: zod.z.string().optional(),
  detail: zod.z.string(),
  pluginEnabled: zod.z.boolean().optional(),
  pluginMarketplace: zod.z.string().optional()
});
const syncOptsSchema = zod.z.object({ dryRun: zod.z.boolean().optional(), force: zod.z.boolean().optional() }).optional();
const syncSkillsOptsSchema = zod.z.object({ dryRun: zod.z.boolean().optional() }).optional();
const configRouter = router({
  load: procedure.query(() => {
    try {
      return loadConfig();
    } catch {
      return createConfig();
    }
  }),
  save: procedure.input(zod.z.object({ config: zod.z.unknown() })).mutation(({ input }) => {
    saveConfig(input.config);
    return { ok: true };
  }),
  path: procedure.query(() => CONFIG_PATH),
  /**
   * Subscribe to external-change events emitted by `config-watcher.ts` when
   * something outside the desktop app (e.g. the CLI) rewrites the config
   * file. Renderer clients invalidate their cached `config.load` query on
   * each fire.
   */
  onExternalChange: procedure.subscription(() => {
    return observable.observable((emit) => {
      const handler = () => emit.next({ at: Date.now() });
      configEvents.on("change", handler);
      return () => {
        configEvents.off("change", handler);
      };
    });
  })
});
const serversRouter = router({
  add: procedure.input(
    zod.z.object({
      name: zod.z.string(),
      server: zod.z.record(zod.z.unknown())
    })
  ).mutation(
    ({ input }) => runOp(
      (c) => addServer(c, {
        name: input.name,
        ...input.server
      })
    )
  ),
  remove: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => removeServer(c, input.name))),
  enable: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => enableServer(c, input.name))),
  disable: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => disableServer(c, input.name)))
});
const groupsRouter = router({
  create: procedure.input(zod.z.object({ name: zod.z.string(), description: zod.z.string().optional() })).mutation(({ input }) => runOp((c) => createGroup(c, input.name, input.description))),
  delete: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => deleteGroup(c, input.name))),
  addServer: procedure.input(zod.z.object({ group: zod.z.string(), server: zod.z.string() })).mutation(({ input }) => runOp((c) => addServerToGroup(c, input.group, input.server))),
  removeServer: procedure.input(zod.z.object({ group: zod.z.string(), server: zod.z.string() })).mutation(({ input }) => runOp((c) => removeServerFromGroup(c, input.group, input.server))),
  addSkill: procedure.input(zod.z.object({ group: zod.z.string(), skill: zod.z.string() })).mutation(({ input }) => runOp((c) => addSkillToGroup(c, input.group, input.skill))),
  removeSkill: procedure.input(zod.z.object({ group: zod.z.string(), skill: zod.z.string() })).mutation(({ input }) => runOp((c) => removeSkillFromGroup(c, input.group, input.skill))),
  addPlugin: procedure.input(zod.z.object({ group: zod.z.string(), plugin: zod.z.string() })).mutation(({ input }) => runOp((c) => addPluginToGroup(c, input.group, input.plugin))),
  removePlugin: procedure.input(zod.z.object({ group: zod.z.string(), plugin: zod.z.string() })).mutation(({ input }) => runOp((c) => removePluginFromGroup(c, input.group, input.plugin)))
});
const projectsRouter = router({
  /**
   * Scan detected clients' history for recently-used project paths, then
   * enrich each entry with its registry status (active/archived/…).
   */
  scan: procedure.query(() => {
    const scanned = scanClientsForProjects();
    const pathToStatus = /* @__PURE__ */ new Map();
    const pathToDisplayName = /* @__PURE__ */ new Map();
    try {
      for (const p of listProjects()) {
        for (const path2 of p.paths) {
          pathToStatus.set(path2, p.status);
          if (p.displayName && p.displayName.trim().length > 0) {
            pathToDisplayName.set(path2, p.displayName);
          }
        }
      }
    } catch {
    }
    return scanned.map((p) => ({
      ...p,
      name: pathToDisplayName.get(p.path) ?? p.name,
      registryStatus: pathToStatus.get(p.path) ?? "unregistered"
    }));
  })
});
const libraryRouter = router({
  scanGlobal: procedure.query(() => scanLibraryGlobal()),
  scanProject: procedure.input(zod.z.object({ path: zod.z.string() })).query(({ input }) => scanLibraryProject(input.path)),
  scanAllProjects: procedure.input(zod.z.object({ paths: zod.z.array(zod.z.string()) })).query(({ input }) => {
    const result = {};
    for (const path2 of input.paths) {
      try {
        result[path2] = scanLibraryProject(path2);
      } catch {
        result[path2] = [];
      }
    }
    return result;
  }),
  wire: procedure.input(wireRequestSchema).mutation(({ input }) => wireTool(input)),
  unwire: procedure.input(unwireRequestSchema).mutation(({ input }) => unwireTool(input)),
  // --- Canonical library store (v2.0.2) ---
  /**
   * Ensure the canonical library store at `~/.config/ensemble/library/` is
   * populated. Idempotent: if the store already exists, this is a cheap
   * manifest read that returns the current counts. First-time invocation
   * scans `~/.claude/` + the supplied project paths and copies file content
   * into the store.
   *
   * Does not modify anything the renderer currently reads — this is the
   * v2.0.2 canonical store sitting alongside the existing scan path until
   * the renderer is ready to read from it directly.
   */
  bootstrap: procedure.input(zod.z.object({ projectPaths: zod.z.array(zod.z.string()).default([]) })).mutation(({ input }) => bootstrapLibrary(input.projectPaths)),
  /** Return the canonical library manifest, or null if the store is empty. */
  manifest: procedure.query(() => readManifest()),
  /** Return the library entries in stable order. Empty array if no store. */
  entries: procedure.query(() => {
    const m = readManifest();
    if (!m) return [];
    return listEntries(m);
  }),
  /**
   * Reconcile the current manifest against a fresh scan of one scope. The
   * renderer passes the scan it already has (from `library.scanGlobal` or
   * `library.scanProject`) and gets back a bucketed `{matches, drifts,
   * orphans, ignored}` result.
   */
  reconcileScope: procedure.input(
    zod.z.object({
      scope: zod.z.union([zod.z.literal("global"), zod.z.object({ path: zod.z.string() })])
    })
  ).query(({ input }) => {
    const manifest = readManifest();
    if (!manifest) return null;
    const tools = input.scope === "global" ? scanLibraryGlobal() : scanLibraryProject(input.scope.path);
    return reconcile(manifest, tools);
  }),
  /** Whether the canonical library store has been initialized. */
  storeExists: procedure.query(() => libraryStoreExists()),
  /**
   * Adopt a scanned orphan into the library. Copies its content (or server
   * def) into the canonical store and appends a manifest entry.
   */
  adoptOrphan: procedure.input(zod.z.object({ tool: discoveredToolSchema })).mutation(({ input }) => adoptOrphan(input.tool)),
  /**
   * Promote the on-disk version of a drifted tool into the library. The
   * previous canonical content is overwritten with what's currently on disk.
   */
  promoteDrift: procedure.input(zod.z.object({ tool: discoveredToolSchema })).mutation(({ input }) => promoteDrift(input.tool)),
  /**
   * Add an entry id to the ignored list so future scans stop flagging it as
   * an orphan. Persistent until the user adopts it.
   */
  ignore: procedure.input(zod.z.object({ id: zod.z.string() })).mutation(({ input }) => ignoreEntry(input.id)),
  /** Remove an entry id from the ignored list. */
  unignore: procedure.input(zod.z.object({ id: zod.z.string() })).mutation(({ input }) => unignoreEntry(input.id)),
  /**
   * Delete an entry from the library. File-based entries lose their canonical
   * content; the id is added to the ignored list so future scans don't
   * immediately re-adopt the on-disk copy as an orphan.
   */
  removeEntry: procedure.input(zod.z.object({ id: zod.z.string() })).mutation(({ input }) => removeEntry(input.id)),
  /**
   * Relink a library entry's source to a new marketplace identifier. Pure
   * metadata rename — the entry's content is preserved but the id rewrites
   * from `name@oldSource` to `name@newSource`.
   */
  relinkSource: procedure.input(zod.z.object({ id: zod.z.string(), newSource: zod.z.string() })).mutation(({ input }) => relinkEntrySource(input.id, input.newSource)),
  /**
   * Compose candidate sources for relinking a library entry. Returns an
   * aggregated list drawn from two channels:
   *
   * 1. **Registry adapters** — `searchRegistries(entry.name)` across
   *    claude-plugins.dev, Official MCP Registry, and Glama. Filtered to
   *    close name matches to keep noise down.
   * 2. **Configured marketplaces** — every marketplace already in
   *    `config.marketplaces`. Useful for local-directory sources and for
   *    GitHub repos the user has previously added.
   *
   * The renderer can show a third "Add GitHub repo…" section that writes
   * through `marketplaces.add` and then re-runs this query to pick up the
   * new option.
   */
  searchSourceCandidates: procedure.input(zod.z.object({ name: zod.z.string(), type: toolTypeSchema })).query(async ({ input }) => {
    const out = [];
    try {
      const hits = await searchRegistries(input.name);
      for (const hit of hits) {
        const hitName = String(hit.name ?? "").toLowerCase();
        const needle = input.name.toLowerCase();
        if (!hitName) continue;
        if (hitName === needle || hitName.startsWith(needle)) {
          out.push({
            source: String(
              hit.source ?? hit.backend ?? "registry"
            ),
            label: String(hit.displayName ?? hit.name),
            confidence: hitName === needle ? "exact" : "partial",
            channel: "registry"
          });
        }
      }
    } catch {
    }
    try {
      const cfg = loadConfig();
      for (const mp of cfg.marketplaces ?? []) {
        out.push({
          source: mp.name,
          label: mp.name,
          confidence: "configured",
          channel: "marketplace",
          marketplaceSource: mp.source
        });
      }
    } catch {
    }
    return out;
  })
});
const clientsRouter = router({
  detect: procedure.query(() => detectClients()),
  liveStatus: procedure.query(() => {
    const clients = detectClients();
    const statuses = {};
    for (const client of clients) {
      let total = 0;
      let managed = 0;
      for (const path2 of resolvedPaths(client)) {
        try {
          const raw = readClientConfig(path2);
          const keys = client.serversKey.split(".");
          let node = raw;
          for (const k of keys) {
            if (node && typeof node === "object") {
              node = node[k];
            } else {
              node = void 0;
              break;
            }
          }
          if (node && typeof node === "object") {
            total += Object.keys(node).length;
          }
          managed += Object.keys(getManagedServers(raw, client.serversKey)).length;
        } catch {
        }
      }
      statuses[client.id] = { total, managed };
    }
    return statuses;
  }),
  assign: procedure.input(zod.z.object({ client: zod.z.string(), group: zod.z.string() })).mutation(({ input }) => runOp((c) => assignClient(c, input.client, input.group))),
  unassign: procedure.input(zod.z.object({ client: zod.z.string() })).mutation(({ input }) => runOp((c) => unassignClient(c, input.client)))
});
const syncRouter = router({
  client: procedure.input(zod.z.object({ client: zod.z.string(), opts: syncOptsSchema })).mutation(({ input }) => {
    const config = fresh();
    const { config: newConfig, result } = syncClient(config, input.client, input.opts);
    if (!input.opts?.dryRun) saveConfig(newConfig);
    return result;
  }),
  skills: procedure.input(zod.z.object({ client: zod.z.string(), opts: syncSkillsOptsSchema })).mutation(({ input }) => {
    return syncSkills(fresh(), input.client, input.opts);
  }),
  all: procedure.input(zod.z.object({ opts: syncOptsSchema }).optional()).mutation(({ input }) => {
    const config = fresh();
    const { config: newConfig, results } = syncAllClients(config, input?.opts);
    if (!input?.opts?.dryRun) saveConfig(newConfig);
    return results;
  }),
  contextCost: procedure.input(zod.z.object({ client: zod.z.string() })).query(({ input }) => computeContextCost(fresh(), input.client)),
  suggestSplits: procedure.query(() => {
    const config = fresh();
    return suggestGroupSplits(config, config.servers);
  })
});
const pluginsRouter = router({
  install: procedure.input(zod.z.object({ name: zod.z.string(), marketplace: zod.z.string() })).mutation(({ input }) => runOp((c) => installPlugin(c, input.name, input.marketplace))),
  uninstall: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => uninstallPlugin(c, input.name))),
  enable: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => enablePlugin(c, input.name))),
  disable: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => disablePlugin(c, input.name)))
});
const marketplacesRouter = router({
  add: procedure.input(
    zod.z.object({
      name: zod.z.string(),
      source: zod.z.record(zod.z.string())
    })
  ).mutation(
    ({ input }) => runOp(
      (c) => addMarketplace(c, input.name, input.source)
    )
  ),
  remove: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => removeMarketplace(c, input.name))),
  /**
   * Pre-flight validation for manually-entered GitHub marketplace repos.
   * Hits the unauthenticated GitHub API once — `GET /repos/:owner/:repo` —
   * and returns `{ ok, reason }`. Rate-limit exhaustion is treated as a
   * soft pass (`ok: true, reason: "rate-limited"`) rather than a hard fail
   * so a temporary limit doesn't block the user. Actual 404s are hard fails.
   */
  validateGithubRepo: procedure.input(zod.z.object({ repo: zod.z.string() })).query(async ({ input }) => {
    const match = /^([A-Za-z0-9][\w.-]*)\/([A-Za-z0-9][\w.-]*)$/.exec(input.repo.trim());
    if (!match) {
      return { ok: false, reason: "expected owner/repo format" };
    }
    const [, owner, repo] = match;
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: "application/vnd.github+json" }
      });
      if (res.status === 200) return { ok: true };
      if (res.status === 404) return { ok: false, reason: "repo not found" };
      if (res.status === 403 || res.status === 429) {
        return { ok: true, reason: "rate-limited (not verified)" };
      }
      return { ok: false, reason: `github returned ${res.status}` };
    } catch (e) {
      return { ok: false, reason: e instanceof Error ? e.message : "network error" };
    }
  })
});
const skillsRouter = router({
  install: procedure.input(
    zod.z.object({
      name: zod.z.string(),
      skill: zod.z.record(zod.z.unknown())
    })
  ).mutation(
    ({ input }) => runOp(
      (c) => installSkill(c, {
        name: input.name,
        ...input.skill
      })
    )
  ),
  uninstall: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => uninstallSkill(c, input.name))),
  enable: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => enableSkill(c, input.name))),
  disable: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => disableSkill(c, input.name))),
  listDirs: procedure.query(() => listSkillDirs()),
  read: procedure.input(zod.z.object({ name: zod.z.string() })).query(({ input }) => readSkillMd(input.name)),
  checkDeps: procedure.query(() => checkSkillDependencies(fresh()))
});
const rulesRouter = router({
  add: procedure.input(zod.z.object({ path: zod.z.string(), group: zod.z.string() })).mutation(({ input }) => runOp((c) => addRule(c, input.path, input.group))),
  remove: procedure.input(zod.z.object({ path: zod.z.string() })).mutation(({ input }) => runOp((c) => removeRule(c, input.path)))
});
const profilesRouter = router({
  save: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => saveProfile(c, input.name))),
  activate: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => activateProfile(c, input.name))),
  list: procedure.query(() => listProfiles(fresh())),
  delete: procedure.input(zod.z.object({ name: zod.z.string() })).mutation(({ input }) => runOp((c) => deleteProfile(c, input.name)))
});
const collisionsRouter = router({
  detect: procedure.query(() => detectCollisions(fresh()))
});
const searchRouter = router({
  local: procedure.input(zod.z.object({ query: zod.z.string() })).query(({ input }) => searchAll(fresh(), input.query)),
  registry: procedure.input(zod.z.object({ query: zod.z.string() })).query(async ({ input }) => searchRegistries(input.query)),
  show: procedure.input(zod.z.object({ id: zod.z.string() })).query(async ({ input }) => showRegistry(input.id)),
  backends: procedure.query(() => listBackends())
});
const doctorRouter = router({
  run: procedure.query(() => runDoctor(fresh()))
});
const noteRefSchema = zod.z.object({ ref: zod.z.string().min(1) });
const notesRouter = router({
  get: procedure.input(noteRefSchema).query(({ input }) => getUserNotes(fresh(), input.ref)),
  set: procedure.input(zod.z.object({ ref: zod.z.string().min(1), text: zod.z.string() })).mutation(({ input }) => runOp((c) => setUserNotes(c, { ref: input.ref, text: input.text })))
});
const snapshotsRouter = router({
  /** All snapshots on disk, newest first. */
  list: procedure.query(() => list()),
  /** Load a single snapshot by id (includes the full file manifest). */
  show: procedure.input(zod.z.object({ id: zod.z.string() })).query(({ input }) => get(input.id)),
  /**
   * Restore a snapshot. The renderer must have already confirmed with the
   * user — this mutation does the file I/O unconditionally.
   */
  restore: procedure.input(zod.z.object({ id: zod.z.string() })).mutation(({ input }) => restore(input.id))
});
const appRouter = router({
  config: configRouter,
  servers: serversRouter,
  groups: groupsRouter,
  projects: projectsRouter,
  library: libraryRouter,
  clients: clientsRouter,
  sync: syncRouter,
  plugins: pluginsRouter,
  marketplaces: marketplacesRouter,
  skills: skillsRouter,
  rules: rulesRouter,
  profiles: profilesRouter,
  collisions: collisionsRouter,
  search: searchRouter,
  doctor: doctorRouter,
  notes: notesRouter,
  snapshots: snapshotsRouter
});
electron.app.enableSandbox();
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: "#f5f4f0",
    show: !utils.is.dev ? false : true,
    webPreferences: {
      preload: node_path.join(__dirname, "../preload/index.cjs"),
      sandbox: true
      // nodeIntegration: false and contextIsolation: true are defaults.
    }
  });
  if (utils.is.dev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
  mainWindow.webContents.on("render-process-gone", (_e, details) => {
    log.error("Renderer gone:", details);
  });
  mainWindow.webContents.on("preload-error", (_e, preloadPath, err) => {
    log.error("Preload error at", preloadPath, err);
  });
  mainWindow.webContents.on("did-fail-load", (_e, code, desc, url) => {
    log.error("did-fail-load:", code, desc, url);
  });
  if (!utils.is.dev) {
    electron.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'"
          ]
        }
      });
    });
  }
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("http://localhost") && !url.startsWith("file://")) {
      event.preventDefault();
      log.warn("Blocked navigation to:", url);
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) {
      electron.shell.openExternal(url);
    }
    return { action: "deny" };
  });
  main.createIPCHandler({ router: appRouter, windows: [mainWindow] });
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });
  if (utils.is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(node_path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  startConfigWatcher();
  createWindow();
  if (!utils.is.dev) {
    initAutoUpdater("latest");
  }
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  stopConfigWatcher();
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", () => {
  log.info("App quitting");
});
//# sourceMappingURL=index.cjs.map
