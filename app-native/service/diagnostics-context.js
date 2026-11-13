"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var MAX_METADATA_CHARACTERS = 16384;
var VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
var BUILD_ID_PATTERN = /^[a-f0-9]{64}$/;
var COMMIT_PATTERN = /^[a-f0-9]{40,64}$/;
var SESSION_PATTERN = /^[a-z0-9-]{1,64}$/;
var MAX_DELIVERY_RETRIES = 3;
var MIN_HTTP_STATUS = 100;
var MAX_HTTP_STATUS = 599;
var HEALTH_COUNTS = [
    "buffered",
    "discarded",
    "invalid",
    "pending_errors",
    "writes",
    "write_failures",
    "read_failures"
];
var HEALTH_FLAGS = ["unsaved", "saving"];
var STORAGE_STATES = [
    "unavailable",
    "loading",
    "ready",
    "saving",
    "failed"
];
var CLOCK_TYPES = ["monotonic", "wall_fallback"];
var DELIVERY_STATES = [
    "idle",
    "acknowledged",
    "unavailable",
    "rejected"
];
var SERVICE_METADATA_PATH = "/etc/os-release";
var fields = function (value) { return value !== null && typeof value === "object" ? value : {}; };
var buildMetadata = function (input) {
    var value = fields(input);
    return {
        version: typeof value.version === "string" && VERSION_PATTERN.test(value.version) ? value.version : null,
        build_id: typeof value.build_id === "string" && BUILD_ID_PATTERN.test(value.build_id) ? value.build_id : null,
        commit: typeof value.commit === "string" && COMMIT_PATTERN.test(value.commit) ? value.commit : null,
        dirty: typeof value.dirty === "boolean" ? value.dirty : null
    };
};
var healthMetadata = function (input, privacy) {
    var value = fields(input);
    var result = {};
    for (var _i = 0, HEALTH_COUNTS_1 = HEALTH_COUNTS; _i < HEALTH_COUNTS_1.length; _i++) {
        var key = HEALTH_COUNTS_1[_i];
        var count = value[key];
        if (typeof count === "number" && isFinite(count) && count >= 0)
            result[key] = count;
    }
    for (var _a = 0, HEALTH_FLAGS_1 = HEALTH_FLAGS; _a < HEALTH_FLAGS_1.length; _a++) {
        var key = HEALTH_FLAGS_1[_a];
        var flag = value[key];
        if (typeof flag === "boolean")
            result[key] = flag;
    }
    if (typeof value.storage === "string" && STORAGE_STATES.indexOf(value.storage) >= 0)
        result.storage = value.storage;
    if (typeof value.clock === "string" && CLOCK_TYPES.indexOf(value.clock) >= 0)
        result.clock = value.clock;
    if (typeof value.session === "string" && SESSION_PATTERN.test(value.session))
        result.session = privacy.value(value.session, "session");
    return result;
};
var environmentMetadata = function (text, privacy) {
    var result = {
        tizen: null,
        firmware: null
    };
    for (var _i = 0, _a = String(text).slice(0, MAX_METADATA_CHARACTERS).split("\n"); _i < _a.length; _i++) {
        var line = _a[_i];
        var match = line.match(/^(VERSION_ID|BUILD_ID)=(.*)$/);
        if (match) {
            var key = match[1] === "VERSION_ID" ? "tizen" : "firmware";
            result[key] = privacy.value(match[2].replace(/^['"]|['"]$/g, ""), key);
        }
    }
    return result;
};
var createDiagnosticsContext = function (options) {
    var _options$now;
    var privacy = options.privacy;
    var now = (_options$now = options.now) !== null && _options$now !== void 0 ? _options$now : Date.now;
    var started = false;
    var environment = {
        state: "loading",
        tizen: null,
        firmware: null,
        arch: options.arch
    };
    var ui = null;
    var uiMetadata = function (input) {
        var packet = fields(input);
        var delivery = fields(packet.delivery);
        return {
            reported_at: now(),
            health: healthMetadata(packet.health, privacy),
            build: buildMetadata(packet.build),
            delivery: {
                state: typeof delivery.state === "string" && DELIVERY_STATES.indexOf(delivery.state) >= 0 ? delivery.state : null,
                retries: typeof delivery.retries === "number" && delivery.retries >= 0 && delivery.retries <= MAX_DELIVERY_RETRIES ? delivery.retries : null,
                last_status: typeof delivery.last_status === "number" && delivery.last_status >= MIN_HTTP_STATUS && delivery.last_status <= MAX_HTTP_STATUS ? delivery.last_status : null
            },
            version: typeof packet.version === "string" && VERSION_PATTERN.test(packet.version) ? packet.version : null,
            queued: typeof packet.queued === "number" && isFinite(packet.queued) && packet.queued >= 0 ? packet.queued : null
        };
    };
    return {
        start: function () {
            if (started)
                return;
            started = true;
            options.read(function (error, text) {
                if (error) {
                    environment = __assign(__assign({}, environment), { state: "unavailable", reason: "os_release_unavailable" });
                    return;
                }
                var metadata = environmentMetadata(text, privacy);
                var complete = !!(metadata.tizen && metadata.firmware);
                environment = __assign(__assign(__assign({ arch: options.arch }, metadata), { state: complete ? "collected" : "partial" }), complete ? {} : { reason: "os_release_fields_missing" });
            });
        },
        accept: function (packet) {
            if (packet && !Array.isArray(packet))
                ui = uiMetadata(packet);
        },
        enrich: function (snapshot, control, state) { return (__assign(__assign({}, snapshot), { build: buildMetadata(options.build), environment: environment, ui: ui, context: {
                mode: control.mode,
                persistent: control.persistent,
                protocol: control.protocol,
                watcher_heartbeats: state.heartbeats,
                watcher_launch_calls: state.guard.launchCalls,
                native_settings: "not_queried"
            } })); }
    };
};
var fs = require("fs");
var readMetadata = function (done) {
    fs.stat(SERVICE_METADATA_PATH, function (error, stat) {
        if (error || stat.size > 16384) {
            done(error || new Error("Metadata size limit"));
            return;
        }
        fs.readFile(SERVICE_METADATA_PATH, "utf8", done);
    });
};
var context_default = function (options) {
    if (options === void 0) { options = {}; }
    var privacy = options.privacy || require("./diagnostics").createDiagnosticsPrivacy();
    var build = {};
    try {
        build = require("../js/build-info");
    }
    catch (_unused) { }
    return createDiagnosticsContext({
        privacy: privacy,
        build: build,
        arch: typeof process !== "undefined" ? process.arch : null,
        read: options.read || readMetadata
    });
};
module.exports = context_default;
