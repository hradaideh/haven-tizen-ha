"use strict";
var LAUNCHER_APP_ID = "DclHome001.Home";
var LOOPBACK_HOST = "127.0.0.1";
var SAMSUNG_API_PORT = 8001;
var SAMSUNG_INFO_PATH = "/api/v2/";
var SAMSUNG_APPLICATIONS_PATH = "/api/v2/applications/";
var WATCHER_PORT = 47790;
var object = function (value) { return value !== null && typeof value === "object" ? value : null; };
var errorMessage = function (value) {
    var _object;
    var message = (_object = object(value)) === null || _object === void 0 ? void 0 : _object.message;
    return typeof message === "string" ? message : void 0;
};
var eventBatch = function (value) {
    if (Array.isArray(value))
        return value;
    var packet = object(value);
    return (packet === null || packet === void 0 ? void 0 : packet.schema_version) === DIAGNOSTIC_SCHEMA_VERSION ? packet.records : null;
};
var isAppStatus = function (value) { return value !== null && typeof value.running === "boolean" && typeof value.visible === "boolean"; };
var tvCapability = function (info) {
    var device = object(info === null || info === void 0 ? void 0 : info.device);
    var flag = device === null || device === void 0 ? void 0 : device.FrameTVSupport;
    if (flag === true || flag === "true")
        return "frame";
    if (flag === false || flag === "false")
        return "non-frame";
    return device && !Array.isArray(device) && (typeof device.modelName === "string" && device.modelName.length > 0 || typeof device.model === "string" && device.model.length > 0 || device.PowerState === "on" || device.PowerState === "standby" || device.PowerState === "off") && !Object.prototype.hasOwnProperty.call(device, "FrameTVSupport") ? "not-advertised" : "unknown";
};
var http = require("http");
var createArtMode = require("./artmode");
var diagnostics = {
    record: function () { },
    flushStorage: function () { },
    attach: function () { },
    ingest: function () {
        return false;
    },
    snapshot: function () {
        return {
            schema_version: 1,
            records: []
        };
    }
};
try {
    diagnostics = require("./diagnostics").createDiagnostics("service");
}
catch (e) { }
var diagnosticContext = {
    start: function () { },
    accept: function () { },
    enrich: function (value) {
        return value;
    }
};
try {
    diagnosticContext = require("./diagnostics-context")();
}
catch (e) { }
var SELF = LAUNCHER_APP_ID;
var HIDDEN_GRACE_MS = 250;
var FRAME_HIDDEN_GRACE_MS = 1500;
var WATCHED_HIDDEN_GRACE_MS = 1500;
var APP_GRACE_MS = 2500;
var WATCH_STOP_GRACE_MS = 1500;
var WATCH_COVER_GRACE_MS = 1e4;
var INVENTORY_SCAN_INTERVAL_MS = 5e3;
var BOOT_DELAY_MS = 3e3;
var BOOT_FALLBACK_MS = 15e3;
var API_REQUEST_TIMEOUT_MS = 1500;
var MAX_API_REPLY_CHARACTERS = 65536;
var LAUNCH_COOLDOWN_MS = 2e3;
var GUARD_DEADLINE_MS = 6e3;
var SCAN_WATCHDOG_MS = 2e3;
var CAPABILITY_RETRY_MS = 5e3;
var WATCHER_POLL_INTERVAL_MS = 300;
var GUARD_HISTORY_LIMIT = 100;
var MAX_MODE_REQUEST_CHARACTERS = 4096;
var MAX_EVENT_BATCH_CHARACTERS = 16384;
var MAX_EVENT_BATCH_RECORDS = 24;
var DIAGNOSTIC_SCHEMA_VERSION = 1;
var MAX_STARTUP_TRACE_CHARACTERS = 4096;
var MAX_STARTUP_MARKS = 32;
var HOME_CONTROL_PATH = "/control/home";
var DIAGNOSTIC_PATHS = {
    logs: "/diagnostics/logs",
    events: "/diagnostics/events"
};
var LOCAL_CONTROL_MARKER = "1";
var HTTP_STATUS = {
    ok: 200,
    badRequest: 400,
    forbidden: 403,
    notFound: 404,
    methodNotAllowed: 405,
    conflict: 409,
    tooLarge: 413,
    unsupportedMedia: 415
};
var started = false;
var stopped = false;
var server = null;
var interval;
var capabilityRetry;
var busy = false;
var scanNumber = 0;
var pending = null;
var bootUntil = 0;
var bootDone = false;
var bootFallback;
var bootTimer;
var state = {
    watched: null,
    seen: false,
    leaving: false,
    apps: [],
    running: {},
    selfVisible: null,
    hiddenSince: 0,
    watchedHiddenSince: 0,
    watchAt: 0,
    lastLaunch: 0,
    last: null,
    epoch: 0,
    heartbeats: 0,
    guard: {
        capability: "unknown",
        artMode: "unknown",
        pending: null,
        lastBlocked: null,
        launchCalls: 0,
        history: []
    }
};
var createHomeMode = require("./home-mode");
var homeMode = createHomeMode(null, updateMode, true);
function watcherEnabled() {
    return !stopped && homeMode.read().mode === "watcher";
}
function record(kind, detail) {
    diagnostics.record("watcher." + kind, { reason: detail });
    state.guard.history.push({
        at: Date.now(),
        kind: kind,
        detail: detail
    });
    if (state.guard.history.length > GUARD_HISTORY_LIMIT)
        state.guard.history.shift();
}
function block(reason) {
    if (state.guard.lastBlocked !== reason)
        record("blocked", reason);
    state.guard.lastBlocked = reason;
}
function invalidate(reason) {
    state.epoch += 1;
    if (pending) {
        clearTimeout(pending.timer);
        record("cancelled", reason);
    }
    pending = null;
    state.guard.pending = null;
}
function resetWatchedTiming() {
    state.watchedHiddenSince = 0;
    state.watchedRan = false;
    state.watchedStoppedSince = 0;
}
function resetHiddenTiming() {
    state.hiddenSince = 0;
    state.watchedHiddenSince = 0;
    state.watchedStoppedSince = 0;
    state.selfVisible = null;
    state.watchAt = Date.now();
}
function resetTracking() {
    state.watched = null;
    state.seen = false;
    resetWatchedTiming();
    resetHiddenTiming();
}
var art = createArtMode({ onChange: function (value, reason) {
        var previous = state.guard.artMode;
        state.guard.artMode = value;
        if (value !== "off" || previous !== "off") {
            invalidate("Art status: " + value);
            if (value !== previous) {
                resetHiddenTiming();
                record("art-status", value);
            }
        }
        if (value !== "off")
            block("Art status: " + value + " (" + reason + ")");
    } });
function get(path, cb) {
    var settled = false;
    var req = null;
    var timer = setTimeout(function () {
        finish(null, false);
        if (req)
            req === null || req === void 0 || req.destroy();
    }, API_REQUEST_TIMEOUT_MS);
    function finish(value, unavailable) {
        if (settled)
            return;
        settled = true;
        clearTimeout(timer);
        cb(value, unavailable);
    }
    try {
        req = http.get({
            host: LOOPBACK_HOST,
            port: SAMSUNG_API_PORT,
            path: path
        }, function (res) {
            var body = "";
            res.on("data", function (chunk) {
                body += chunk.toString();
                if (body.length > MAX_API_REPLY_CHARACTERS) {
                    finish(null, false);
                    req === null || req === void 0 || req.destroy();
                }
            });
            res.on("error", function () {
                finish(null, false);
            });
            res.on("end", function () {
                if (res.statusCode === HTTP_STATUS.notFound) {
                    finish(null, true);
                    return;
                }
                if (res.statusCode !== HTTP_STATUS.ok) {
                    finish(null, false);
                    return;
                }
                var value = null;
                try {
                    value = object(JSON.parse(body));
                }
                catch (e) { }
                finish(value, false);
            });
        });
        req.on("error", function () {
            finish(null, false);
        });
    }
    catch (e) {
        finish(null, false);
    }
}
function appStatus(id, cb) {
    get(SAMSUNG_APPLICATIONS_PATH + encodeURIComponent(id), function (value, unavailable) {
        cb(isAppStatus(value) ? value : null, unavailable);
    });
}
function snapshot(cb) {
    var ids = state.apps.slice();
    var left = ids.length;
    var result = {
        running: {},
        visible: null,
        complete: true
    };
    if (!left) {
        cb(result);
        return;
    }
    ids.forEach(function (id) {
        appStatus(id, function (value, unavailable) {
            if (!value && !unavailable)
                result.complete = false;
            result.running[id] = !!(value && value.running);
            if (value && value.visible)
                result.visible = id;
            left -= 1;
            if (!left)
                cb(result);
        });
    });
}
function standAside(result, knownApp) {
    var id = result.visible;
    if (!id) {
        for (var key in result.running)
            if (key !== knownApp && result.running[key] && !state.running[key]) {
                id = key;
                break;
            }
    }
    state.running = result.running;
    if (!id)
        return false;
    invalidate("another app is active");
    state.watched = id;
    state.seen = result.visible === id;
    resetWatchedTiming();
    state.last = "stand aside: " + id;
    return true;
}
function isFrame() {
    return state.guard.capability === "frame";
}
function hiddenGrace() {
    return isFrame() ? FRAME_HIDDEN_GRACE_MS : HIDDEN_GRACE_MS;
}
function launchNow(why) {
    if (!watcherEnabled() || state.leaving)
        return;
    if (Date.now() - state.lastLaunch < LAUNCH_COOLDOWN_MS)
        return;
    commitLaunch(why);
}
function commitLaunch(why) {
    state.lastLaunch = Date.now();
    state.watched = null;
    state.seen = false;
    state.guard.lastBlocked = null;
    state.guard.launchCalls += 1;
    record("launch", why);
    try {
        tizen.application.launch(SELF, function () {
            state.last = "relaunched: " + why;
        }, function (e) {
            state.last = "relaunch failed: " + (e && e.message);
        });
    }
    catch (e) {
        state.last = "relaunch threw: " + errorMessage(e);
    }
}
function bootLaunch() {
    if (bootDone || !watcherEnabled() || state.leaving)
        return;
    bootDone = true;
    clearTimeout(bootFallback);
    bootTimer = setTimeout(function () {
        if (!watcherEnabled() || state.leaving)
            return;
        if (state.guard.capability === "unknown")
            launchNow("boot (TV type unknown)");
        else if (!isFrame())
            launchSelf("boot");
    }, Math.max(0, bootUntil - Date.now()));
}
function permitted() {
    if (!watcherEnabled()) {
        block("Native Home or handoff mode");
        return false;
    }
    if (state.guard.capability === "non-frame" || state.guard.capability === "not-advertised")
        return true;
    if (state.guard.capability !== "frame") {
        block("TV capability unknown");
        return false;
    }
    if (state.guard.artMode !== "off") {
        block("Art status: " + state.guard.artMode);
        return false;
    }
    return true;
}
function freshOff(cb) {
    if (state.guard.capability === "non-frame" || state.guard.capability === "not-advertised") {
        cb("off");
        return;
    }
    if (state.guard.capability !== "frame") {
        cb("unknown");
        return;
    }
    art.fresh(cb);
}
function current(candidate) {
    return watcherEnabled() && !state.leaving && pending === candidate && candidate.epoch === state.epoch && candidate.watched === state.watched;
}
function cancel(candidate, reason) {
    if (pending !== candidate)
        return;
    block(reason);
    invalidate(reason);
}
function recheck(candidate, cb) {
    function ready() {
        if (state.guard.capability !== "frame") {
            cb();
            return;
        }
        get(SAMSUNG_INFO_PATH, function (info) {
            var _object2;
            if (!current(candidate))
                return;
            if (!info || ((_object2 = object(info.device)) === null || _object2 === void 0 ? void 0 : _object2.PowerState) !== "on") {
                cancel(candidate, "TV power state unavailable or not on");
                return;
            }
            cb();
        });
    }
    appStatus(SELF, function (me) {
        if (!current(candidate))
            return;
        if (!me || me.visible) {
            cancel(candidate, "launcher visible or status unavailable");
            return;
        }
        if (candidate.watched)
            appStatus(candidate.watched, function (watched) {
                if (!current(candidate))
                    return;
                if (!watched || watched.visible || !state.seen) {
                    cancel(candidate, "watched app visible or status unavailable");
                    return;
                }
                snapshot(function (result) {
                    if (!current(candidate))
                        return;
                    if (!result.complete) {
                        cancel(candidate, "app inventory unavailable");
                        return;
                    }
                    if (standAside(result, candidate.watched))
                        return;
                    ready();
                });
            });
        else
            snapshot(function (result) {
                if (!current(candidate))
                    return;
                if (!result.complete) {
                    cancel(candidate, "app inventory unavailable");
                    return;
                }
                if (standAside(result))
                    return;
                ready();
            });
    });
}
function launchSelf(why) {
    if (pending || state.leaving || stopped || !permitted())
        return;
    if (!isFrame()) {
        launchNow(why);
        return;
    }
    if (Date.now() - state.lastLaunch < LAUNCH_COOLDOWN_MS)
        return;
    var candidate = {
        epoch: state.epoch,
        watched: state.watched,
        reason: why,
        timer: void 0
    };
    pending = candidate;
    state.guard.pending = {
        reason: why,
        at: Date.now()
    };
    record("checking", why);
    candidate.timer = setTimeout(function () {
        cancel(candidate, "guard deadline");
    }, GUARD_DEADLINE_MS);
    freshOff(function (value) {
        if (!current(candidate))
            return;
        if (value !== "off") {
            cancel(candidate, "fresh Art status: " + value);
            return;
        }
        recheck(candidate, function () {
            if (!current(candidate))
                return;
            freshOff(function (finalValue) {
                if (!current(candidate))
                    return;
                if (finalValue !== "off" || !permitted()) {
                    cancel(candidate, "final Art check blocked");
                    return;
                }
                setTimeout(function () {
                    if (!current(candidate) || !permitted())
                        return;
                    clearTimeout(candidate.timer);
                    pending = null;
                    state.guard.pending = null;
                    commitLaunch(why);
                }, 0);
            });
        });
    });
}
function tick() {
    state.heartbeats += 1;
    if (!watcherEnabled() || state.leaving || busy || pending || Date.now() < bootUntil || !permitted())
        return;
    busy = true;
    var number = ++scanNumber;
    var epoch = state.epoch;
    var finished = false;
    var watchdog = setTimeout(done, SCAN_WATCHDOG_MS);
    function done() {
        if (finished)
            return;
        finished = true;
        clearTimeout(watchdog);
        if (number === scanNumber)
            busy = false;
    }
    function valid() {
        return !finished && watcherEnabled() && !state.leaving && epoch === state.epoch && number === scanNumber;
    }
    appStatus(SELF, function (me) {
        if (!valid() || !me) {
            done();
            return;
        }
        var now = Date.now();
        if (me.visible) {
            state.selfVisible = true;
            state.hiddenSince = 0;
            if (now - state.watchAt >= WATCH_COVER_GRACE_MS) {
                state.watched = null;
                state.seen = false;
                resetWatchedTiming();
            }
            if (now - (state.snapAt || 0) > INVENTORY_SCAN_INTERVAL_MS) {
                state.snapAt = now;
                snapshot(function (result) {
                    if (valid() && (result.complete || !isFrame()))
                        state.running = result.running;
                    done();
                });
            }
            else
                done();
            return;
        }
        if (state.selfVisible !== false)
            state.hiddenSince = now;
        state.selfVisible = false;
        var settling = now - state.hiddenSince < hiddenGrace() || now - state.watchAt < APP_GRACE_MS;
        if (settling && isFrame()) {
            done();
            return;
        }
        if (state.watched) {
            var id_1 = state.watched;
            appStatus(id_1, function (watched) {
                if (!valid() || state.watched !== id_1 || !watched) {
                    done();
                    return;
                }
                if (watched.visible) {
                    state.seen = true;
                    state.watchedHiddenSince = 0;
                }
                else if (state.seen) {
                    if (!state.watchedHiddenSince)
                        state.watchedHiddenSince = Date.now();
                    var grace = isFrame() ? FRAME_HIDDEN_GRACE_MS : WATCHED_HIDDEN_GRACE_MS;
                    if (Date.now() - state.watchedHiddenSince >= grace)
                        launchSelf("home pressed in " + id_1);
                }
                else if (watched.running) {
                    state.watchedRan = true;
                    state.watchedStoppedSince = 0;
                    if (Date.now() - (state.unseenScanAt || 0) >= INVENTORY_SCAN_INTERVAL_MS) {
                        state.unseenScanAt = Date.now();
                        snapshot(function (result) {
                            if (valid() && state.watched === id_1 && result.visible && result.visible !== id_1) {
                                record("unseen", id_1 + " never reported visible; following " + result.visible);
                                standAside(result, id_1);
                            }
                            done();
                        });
                        return;
                    }
                }
                else if (state.watchedRan) {
                    if (!state.watchedStoppedSince)
                        state.watchedStoppedSince = Date.now();
                    if (Date.now() - (state.watchedStoppedSince || 0) >= WATCH_STOP_GRACE_MS) {
                        record("unwatched", id_1 + " stopped running");
                        state.watched = null;
                        state.watchedHiddenSince = 0;
                    }
                }
                done();
            });
            return;
        }
        if (settling) {
            done();
            return;
        }
        snapshot(function (result) {
            if (!valid()) {
                done();
                return;
            }
            if ((result.complete || !isFrame()) && !standAside(result))
                launchSelf("covered without an app");
            done();
        });
    });
}
function discoverCapability() {
    if (!watcherEnabled())
        return;
    get(SAMSUNG_INFO_PATH, function (info) {
        if (!watcherEnabled())
            return;
        var capability = tvCapability(info);
        state.guard.capability = capability;
        record("capability", capability);
        if (capability === "frame") {
            art.start();
            bootLaunch();
        }
        else if (capability === "non-frame" || capability === "not-advertised") {
            state.guard.artMode = "not-supported";
            bootLaunch();
        }
        else {
            block("TV capability unknown");
            capabilityRetry = setTimeout(discoverCapability, CAPABILITY_RETRY_MS);
        }
    });
}
function updateMode() {
    diagnostics.record("service.mode", { mode: homeMode.read().mode });
    invalidate("Home routing mode changed");
    resetTracking();
    scanNumber += 1;
    busy = false;
    clearInterval(interval);
    clearTimeout(capabilityRetry);
    clearTimeout(bootFallback);
    clearTimeout(bootTimer);
    if (interval || capabilityRetry || bootFallback || bootTimer)
        art.stop();
    interval = void 0;
    capabilityRetry = void 0;
    bootFallback = void 0;
    bootTimer = void 0;
    if (!started || !watcherEnabled())
        return;
    bootUntil = Date.now() + BOOT_DELAY_MS;
    bootDone = false;
    interval = setInterval(tick, WATCHER_POLL_INTERVAL_MS);
    bootFallback = setTimeout(bootLaunch, BOOT_FALLBACK_MS);
    discoverCapability();
}
function controlHome(req, res) {
    function reply(code, value) {
        res.writeHead(code, {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
        });
        res.end(JSON.stringify(value));
    }
    var headers = req.headers || {};
    if (req.method !== "POST") {
        reply(HTTP_STATUS.methodNotAllowed, { error: "POST required" });
        return;
    }
    if (headers.origin || headers["x-aerotizen-home"] !== LOCAL_CONTROL_MARKER) {
        reply(HTTP_STATUS.forbidden, { error: "Local native control required" });
        return;
    }
    if (headers["content-type"] !== "application/json") {
        reply(HTTP_STATUS.unsupportedMedia, { error: "JSON required" });
        return;
    }
    var body = "";
    var finished = false;
    if (req.setEncoding)
        req.setEncoding("utf8");
    req.on("data", function (chunk) {
        if (finished)
            return;
        body += chunk.toString();
        if (body.length > MAX_MODE_REQUEST_CHARACTERS) {
            finished = true;
            reply(HTTP_STATUS.tooLarge, { error: "Request too large" });
        }
    });
    req.on("error", function () {
        if (!finished) {
            finished = true;
            reply(HTTP_STATUS.badRequest, { error: "Request failed" });
        }
    });
    req.on("end", function () {
        if (finished)
            return;
        finished = true;
        try {
            reply(HTTP_STATUS.ok, homeMode.change(JSON.parse(body)));
        }
        catch (e) {
            reply(HTTP_STATUS.conflict, {
                error: errorMessage(e),
                homeControl: homeMode.read()
            });
        }
    });
}
function diagnosticRequest(req, res, pathname) {
    var headers = req.headers || {};
    function reply(code, data) {
        var responseHeaders = {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
        };
        if (headers.origin === "null" || headers.origin === "file://")
            responseHeaders["Access-Control-Allow-Origin"] = headers.origin;
        res.writeHead(code, responseHeaders);
        res.end(JSON.stringify(data));
    }
    if (pathname === DIAGNOSTIC_PATHS.logs) {
        if (req.method !== "GET" || headers.origin || headers["x-aerotizen-diagnostics"] !== LOCAL_CONTROL_MARKER) {
            reply(HTTP_STATUS.forbidden, { error: "Developer connection required" });
            return;
        }
        reply(HTTP_STATUS.ok, diagnosticContext.enrich(diagnostics.snapshot(), homeMode.read(), state));
        return;
    }
    if (req.method !== "POST" || headers.origin && headers.origin !== "null" && headers.origin !== "file://") {
        reply(HTTP_STATUS.forbidden, { error: "Local launcher events required" });
        return;
    }
    var body = "";
    var finished = false;
    if (req.setEncoding)
        req.setEncoding("utf8");
    req.on("data", function (chunk) {
        if (finished)
            return;
        body += chunk.toString();
        if (body.length > MAX_EVENT_BATCH_CHARACTERS) {
            finished = true;
            reply(HTTP_STATUS.tooLarge, { error: "Event batch too large" });
        }
    });
    req.on("error", function () {
        if (!finished) {
            finished = true;
            reply(HTTP_STATUS.badRequest, { error: "Event batch failed" });
        }
    });
    req.on("end", function () {
        if (finished)
            return;
        finished = true;
        try {
            var packet = JSON.parse(body);
            var events = eventBatch(packet);
            if (!Array.isArray(events) || events.length > MAX_EVENT_BATCH_RECORDS || events.some(function (item) {
                var _object3;
                return ((_object3 = object(item)) === null || _object3 === void 0 ? void 0 : _object3.source) !== "ui";
            }) || !diagnostics.ingest(events)) {
                reply(HTTP_STATUS.badRequest, { error: "Invalid event batch" });
                return;
            }
            diagnosticContext.accept(packet);
            reply(HTTP_STATUS.ok, {
                schema_version: 1,
                accepted: events.length
            });
        }
        catch (e) {
            reply(HTTP_STATUS.badRequest, { error: "Invalid event batch" });
        }
    });
}
var disposeIpControl;
var onStart = function () {
    if (started)
        return;
    started = true;
    diagnostics.record("service.start");
    try {
        disposeIpControl = require("./ip-control")(typeof tizen !== "undefined" ? tizen : null);
    }
    catch (_unused) { }
    setTimeout(function () {
        diagnosticContext.start();
    }, 0);
    try {
        require("./diagnostics-store")(typeof tizen !== "undefined" ? tizen : null, function (storage) {
            if (storage)
                diagnostics.attach(storage);
        });
    }
    catch (e) { }
    server = http.createServer(function (req, res) {
        var url = require("url").parse(req.url || "", true);
        var query = url.query;
        var pathname = url.pathname || "";
        if (pathname === DIAGNOSTIC_PATHS.logs || pathname === DIAGNOSTIC_PATHS.events) {
            diagnosticRequest(req, res, pathname);
            return;
        }
        if ([
            "/home",
            "/leave",
            "/watch"
        ].indexOf(pathname) >= 0)
            diagnostics.record("service.request", { action: pathname.slice(1) });
        if (pathname === HOME_CONTROL_PATH) {
            controlHome(req, res);
            return;
        }
        if (pathname === "/watch" && query.id !== void 0 && typeof query.id !== "string" || pathname === "/apps" && query.ids !== void 0 && typeof query.ids !== "string") {
            res.writeHead(HTTP_STATUS.badRequest, {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
                "Cache-Control": "no-store"
            });
            res.end(JSON.stringify({ error: "Invalid app identifiers" }));
            return;
        }
        if (pathname === "/startup" && typeof query.data === "string" && query.data.length <= MAX_STARTUP_TRACE_CHARACTERS)
            try {
                var trace = object(JSON.parse(query.data));
                if (trace && typeof trace.script_at === "number" && Array.isArray(trace.marks) && trace.marks.length <= MAX_STARTUP_MARKS)
                    state.startup = trace;
            }
            catch (e) { }
        if (pathname === "/watch" && watcherEnabled()) {
            invalidate("app launch requested");
            state.watched = typeof query.id === "string" ? query.id || null : null;
            state.seen = false;
            state.leaving = false;
            resetWatchedTiming();
            state.watchAt = Date.now();
        }
        else if (pathname === "/apps") {
            invalidate("app inventory changed");
            state.apps = (typeof query.ids === "string" ? query.ids : "").split(",").filter(Boolean);
            state.snapAt = 0;
        }
        else if (pathname === "/leave") {
            invalidate("Samsung Home escape");
            state.leaving = true;
            resetTracking();
        }
        else if (pathname === "/home") {
            invalidate("launcher returned");
            state.leaving = false;
            resetTracking();
        }
        var response = Object.assign({}, state, {
            art: art.getState(),
            homeControl: homeMode.read()
        });
        res.writeHead(HTTP_STATUS.ok, {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
        });
        res.end(JSON.stringify(response));
    });
    server.listen(WATCHER_PORT, LOOPBACK_HOST);
    require("./home-store")(typeof tizen !== "undefined" ? tizen : null, function (storage, failed) {
        if (stopped)
            return;
        homeMode = createHomeMode(storage, updateMode, failed);
        updateMode();
    });
};
var onRequest = function () { };
var onExit = function () {
    disposeIpControl === null || disposeIpControl === void 0 || disposeIpControl();
    diagnostics.record("service.exit");
    diagnostics.flushStorage();
    stopped = true;
    invalidate("service exit");
    scanNumber += 1;
    clearInterval(interval);
    clearTimeout(capabilityRetry);
    clearTimeout(bootFallback);
    clearTimeout(bootTimer);
    art.stop();
    if (server) {
        server.close();
        server = null;
    }
};
exports.onExit = onExit;
exports.onRequest = onRequest;
exports.onStart = onStart;
