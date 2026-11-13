"use strict";
var privacySchema_default = {
    app_ids: [
        "DclHome001.Home",
        "com.samsung.tv.csfs",
        "org.tizen.hbbtv",
        "org.tizen.tv-viewer"
    ],
    events: [
        "app.launch_accepted",
        "app.launch_failed",
        "app.launch_requested",
        "app.launch_result",
        "app.launch_unavailable",
        "app.visibility",
        "command.finish",
        "command.start",
        "device.operation",
        "diagnostic.unknown",
        "handoff.accepted",
        "handoff.failed",
        "handoff.request",
        "handoff.visibility_unconfirmed",
        "home.native_result",
        "home.prepared",
        "service.exit",
        "service.launch_accepted",
        "service.launch_requested",
        "service.mode",
        "service.request",
        "service.ready",
        "service.start",
        "service.start_failed",
        "service.unavailable",
        "ui.appcontrol",
        "ui.error",
        "ui.loaded",
        "ui.rejection",
        "ui.start",
        "ui.visibility",
        "watcher.art-status",
        "watcher.blocked",
        "watcher.cancelled",
        "watcher.capability",
        "watcher.checking",
        "watcher.launch",
        "watcher.unseen",
        "watcher.unwatched"
    ],
    errors: [
        "ConnectionError",
        "ConnectionRefusedError",
        "Denied",
        "DeviceSessionError",
        "Error",
        "EvalError",
        "FileNotFoundError",
        "HTTPError",
        "HTTPException",
        "HandoffError",
        "HomeError",
        "IOError",
        "InvalidValuesError",
        "KeyError",
        "LaunchError",
        "NetworkError",
        "NotFoundError",
        "NotSupportedError",
        "OSError",
        "PermissionError",
        "RangeError",
        "RecursionError",
        "ReferenceError",
        "RequestFailed",
        "RuntimeError",
        "ScriptError",
        "SdbError",
        "SecurityError",
        "SyntaxError",
        "SystemExit",
        "TimeoutError",
        "TypeError",
        "URIError",
        "URLError",
        "UnhandledRejection",
        "UnknownError",
        "ValueError"
    ],
    reasons: [
        "AppControl failed",
        "AppControl is unavailable",
        "Home routing mode changed",
        "HomeWatcher request failed",
        "HomeWatcher unavailable",
        "Native Home or handoff mode",
        "Samsung Home escape",
        "TV capability unknown",
        "TV power state unavailable or not on",
        "TV tuner selection is unavailable",
        "source selection failed",
        "another app is active",
        "app inventory changed",
        "app inventory unavailable",
        "app launch requested",
        "boot",
        "boot (TV type unknown)",
        "covered without an app",
        "final Art check blocked",
        "frame",
        "guard deadline",
        "home_pressed_in_app",
        "launch denied",
        "launch failed",
        "launcher returned",
        "launcher visible or status unavailable",
        "non-frame",
        "off",
        "on",
        "os_release_fields_missing",
        "os_release_unavailable",
        "service exit",
        "service_module_failed",
        "service_start_rejected",
        "service_start_timeout",
        "unknown",
        "watched app visible or status unavailable"
    ],
    numbers: [
        "at",
        "buffered",
        "cli_files",
        "code",
        "column",
        "discarded",
        "duration_ms",
        "elapsed_ms",
        "invalid",
        "last_status",
        "line",
        "omitted_legacy_records",
        "pending_errors",
        "protocol",
        "queued",
        "read_failures",
        "receipt_summaries",
        "reported_at",
        "retries",
        "sequence",
        "skipped_files",
        "uid",
        "watcher_heartbeats",
        "watcher_launch_calls",
        "write_failures",
        "writes"
    ],
    bools: [
        "RolledBack",
        "Success",
        "accepted",
        "boot",
        "complete",
        "dirty",
        "failed",
        "hidden",
        "persistent",
        "query_staging_cleaned",
        "reachable",
        "saving",
        "sdk_staging_cleaned",
        "size_limit_reached",
        "unsaved"
    ],
    source_files: [
        "__init__.py",
        "__main__.py",
        "app-catalog.js",
        "app-lookup.js",
        "apps.js",
        "artmode.js",
        "artwork.js",
        "backgrounds.js",
        "brands.js",
        "build-info.js",
        "build_info.py",
        "catalog.py",
        "cdp.py",
        "certs.py",
        "cli.py",
        "clock.js",
        "config.js",
        "continue-row.js",
        "continue-watching.js",
        "device.py",
        "diagnostic_privacy.py",
        "diagnostics-context.js",
        "diagnostics-privacy.js",
        "diagnostics-storage.js",
        "diagnostics-store.js",
        "diagnostics.js",
        "diagnostics.py",
        "discover.py",
        "dom.js",
        "fireplace.js",
        "home-mode.js",
        "home-screen.js",
        "home-store.js",
        "home.py",
        "home_control.py",
        "homewatch.js",
        "index.html",
        "index.js",
        "inputs.js",
        "inspect_app.py",
        "launcher-diagnostics.js",
        "launcher-ui.js",
        "logos.js",
        "main.js",
        "native-navigation.js",
        "network.js",
        "photo-weather.js",
        "releases.py",
        "remote.py",
        "root.py",
        "sdb.py",
        "sdk.py",
        "settings-ui.js",
        "settings.js",
        "signer.py",
        "startup.js",
        "weather.js"
    ],
    enums: {
        "action": [
            "/apps",
            "/home",
            "/leave",
            "/startup",
            "/watch",
            "apply",
            "backup",
            "export",
            "hdmi",
            "home",
            "leave",
            "live_tv",
            "open",
            "restore",
            "samsung_home",
            "status",
            "watch"
        ],
        "command": [
            "apps",
            "certs",
            "debloat",
            "discover",
            "home",
            "inspect",
            "install",
            "key",
            "launch",
            "logs",
            "status",
            "uninstall",
            "update"
        ],
        "method": [
            "app_control",
            "applist",
            "capability",
            "debug_launch",
            "duid",
            "forward",
            "install",
            "launch",
            "pull",
            "push",
            "shell",
            "shell_bounded",
            "tcp_request",
            "uninstall",
            "wrt_service"
        ],
        "mode": [
            "blocked",
            "hold",
            "native",
            "stock",
            "unknown",
            "watcher"
        ],
        "status": [
            "accepted",
            "confirmed",
            "failed",
            "ok",
            "unavailable",
            "unconfirmed"
        ],
        "phase": [
            "autostart",
            "boot",
            "db/appfw/booting_appid_backup",
            "db/appfw/home_appid",
            "db/appfw/startup_appid",
            "db/first_screen/type",
            "db/menu/smart_hub/ontvsetting/auto_start",
            "final",
            "home_operation"
        ],
        "component": ["launcher", "service"],
        "state": [
            "acknowledged",
            "active",
            "applied",
            "blocked",
            "collected",
            "completed",
            "failed",
            "hold",
            "idle",
            "loading",
            "native",
            "not_requested",
            "partial",
            "paused",
            "pending",
            "rejected",
            "restored",
            "rolled_back",
            "stock",
            "unavailable",
            "unknown",
            "watcher"
        ],
        "storage": [
            "failed",
            "loading",
            "ready",
            "saving",
            "unavailable"
        ],
        "clock": ["monotonic", "wall_fallback"],
        "arch": [
            "aarch64",
            "arm",
            "arm64",
            "armv7",
            "armv7l",
            "ia32",
            "x64",
            "x86",
            "x86_64"
        ],
        "access": ["sdk_uid_901", "temporary_root"]
    }
};
var MAX_NUMBER = 0x2386f26fc10000;
var MAX_MESSAGE_CHARACTERS = 1024;
var MAX_STACK_CHARACTERS = 4096;
var MAX_STACK_FRAMES = 8;
var MAX_ALIAS_CHARACTERS = 256;
var MAX_ALIASES = 512;
var SESSION_SEED_RANGE = 4294967296;
var ERROR_PATTERNS = [
    {
        text: "cannot read",
        code: "property_access_failed"
    },
    {
        text: "is not defined",
        code: "reference_unavailable"
    },
    {
        text: "unexpected token",
        code: "invalid_syntax"
    },
    {
        text: "launch denied",
        code: "launch_denied"
    },
    {
        text: "launch failed",
        code: "launch_failed"
    }
];
var DETAIL_KEYS = [
    "action",
    "method",
    "duration_ms",
    "mode",
    "operation",
    "app_id",
    "error",
    "reason",
    "status",
    "phase",
    "line",
    "component",
    "version",
    "hidden",
    "operation_id",
    "message",
    "file",
    "column",
    "stack",
    "code",
    "build_id",
    "commit",
    "dirty"
];
var has = function (list, value) { return list.indexOf(value) >= 0; };
var errorCode = function (value) {
    var text = typeof value === "string" ? value.slice(0, MAX_MESSAGE_CHARACTERS).toLowerCase() : "";
    for (var _i = 0, ERROR_PATTERNS_1 = ERROR_PATTERNS; _i < ERROR_PATTERNS_1.length; _i++) {
        var pattern = ERROR_PATTERNS_1[_i];
        if (text === pattern.code || text.indexOf(pattern.text) >= 0)
            return pattern.code;
    }
    return "detail_omitted";
};
var sourceFile = function (value) {
    if (typeof value !== "string")
        return "[unknown source]";
    var name = value.split(/[?#]/)[0].split(/[\\/]/).pop();
    return name && has(privacySchema_default.source_files, name) ? name : "[unknown source]";
};
var stack = function (value) {
    if (typeof value !== "string")
        return "";
    return value.slice(0, MAX_STACK_CHARACTERS).split("\n").map(function (line) {
        var match = line.match(/(?:^|[\\/])([a-zA-Z0-9_-]+\.(?:js|html|py)):(\d+)(?::(\d+))?/);
        return match && has(privacySchema_default.source_files, match[1]) ? match[1] + ":" + match[2] + (match[3] ? ":" + match[3] : "") : "";
    }).filter(Boolean).slice(0, MAX_STACK_FRAMES).join("\n");
};
var createDiagnosticsPrivacy = function () {
    var aliases = Object.create(null);
    var keys = [];
    var serial = 0;
    var seed = ("00000000" + Math.floor(Math.random() * SESSION_SEED_RANGE).toString(16)).slice(-8);
    var alias = function (input, kind) {
        if (typeof input !== "string" || input.length > MAX_ALIAS_CHARACTERS)
            return null;
        if (kind === "app" && /^app-[0-9]+$/.test(input) || kind !== "app" && /^d-[a-f0-9]{8}-[0-9]+(?:-[0-9]+)?$/.test(input))
            return input;
        var key = kind + ":" + input;
        if (!aliases[key]) {
            if (keys.length >= MAX_ALIASES)
                delete aliases[keys.shift()];
            serial += 1;
            aliases[key] = kind === "app" ? "app-" + serial : "d-" + seed + "-" + serial;
            keys.push(key);
        }
        return aliases[key];
    };
    var value = function (input, key) {
        if (input === null || input === void 0)
            return null;
        if (has(privacySchema_default.bools, key))
            return typeof input === "boolean" ? input : null;
        if (has(privacySchema_default.numbers, key))
            return typeof input === "number" && isFinite(input) && input >= 0 && input <= MAX_NUMBER ? input : null;
        var choices = privacySchema_default.enums[key];
        if (choices)
            return typeof input === "string" && has(choices, input) ? input : null;
        if (key === "app_id")
            return typeof input === "string" && has(privacySchema_default.app_ids, input) ? input : alias(input, "app");
        if (key === "id" || key === "session" || key === "operation_id")
            return alias(input, "ref");
        if (key === "message")
            return errorCode(input);
        if (key === "error" || key === "error_type")
            return typeof input === "string" && has(privacySchema_default.errors, input) ? input : "Error";
        if (key === "reason") {
            if (typeof input === "string" && (has(privacySchema_default.reasons, input) || /^(?:(?:fresh )?Art status: (on|off|unknown)|HomeWatcher HTTP [1-5][0-9]{2})$/.test(input)))
                return input;
            if (typeof input === "string" && input.indexOf("home pressed in ") === 0)
                return "home_pressed_in_app";
            return errorCode(input);
        }
        if (key === "file")
            return sourceFile(input);
        if (key === "stack")
            return stack(input);
        if (key === "operation")
            return typeof input === "string" && /^http:\/\/tizen.org\/appcontrol\/operation\/(main|default|view|service)$/.test(input) ? input : null;
        if (key === "version" || key === "tizen")
            return typeof input === "string" && /^[0-9]{1,3}(?:\.[0-9]{1,3}){1,3}$/.test(input) ? input : null;
        if (key === "build_id" || key === "commit")
            return typeof input === "string" && /^[a-f0-9]{40,64}$/.test(input) ? input : null;
        if (key === "firmware")
            return typeof input === "string" && /^[A-Z0-9][A-Z0-9_.-]{1,127}$/.test(input) && /[0-9]/.test(input) ? input : null;
        return null;
    };
    return {
        session: "d-" + seed + "-0",
        value: value,
        event: function (name) { return typeof name === "string" && has(privacySchema_default.events, name) ? name : "diagnostic.unknown"; },
        details: function (data) {
            var result = {};
            if (data && typeof data === "object") {
                var input = data;
                for (var _i = 0, DETAIL_KEYS_1 = DETAIL_KEYS; _i < DETAIL_KEYS_1.length; _i++) {
                    var key = DETAIL_KEYS_1[_i];
                    if (Object.prototype.hasOwnProperty.call(input, key) && has([
                        "string",
                        "number",
                        "boolean"
                    ], typeof input[key]))
                        result[key] = value(input[key], key);
                }
            }
            return result;
        }
    };
};
var MAX_CHARACTERS = 6e4;
var SAVE_DELAY_MS = 500;
var MAX_PENDING_ERRORS = 16;
var MILLISECONDS_PER_SECOND = 1e3;
var NANOSECONDS_PER_MILLISECOND = 1e6;
var monotonicClock = function () {
    if (typeof performance !== "undefined" && performance.now)
        return function () { return performance.now(); };
    if (typeof process !== "undefined" && process.hrtime) {
        var hrtime_1 = process.hrtime;
        return function () {
            var time = hrtime_1();
            return time[0] * MILLISECONDS_PER_SECOND + time[1] / NANOSECONDS_PER_MILLISECOND;
        };
    }
    return Date.now;
};
var recordObject = function (value) { return value !== null && typeof value === "object" ? value : null; };
var createDiagnostics = function (source, options) {
    if (options === void 0) { options = {}; }
    var _options$later, _options$now;
    var privacy = createDiagnosticsPrivacy();
    var later = (_options$later = options.later) !== null && _options$later !== void 0 ? _options$later : (function (callback, delayMs) { return setTimeout(callback, delayMs); });
    var mono = (_options$now = options.now) !== null && _options$now !== void 0 ? _options$now : monotonicClock();
    var origin = mono();
    var session = privacy.session;
    var records = [];
    var total = 0;
    var store = null;
    var serial = 0;
    var discarded = 0;
    var invalid = 0;
    var writeFailures = 0;
    var readFailures = 0;
    var writes = 0;
    var storageState = "unavailable";
    var pendingErrors = 0;
    var elapsed = 0;
    var revision = 0;
    var saved = 0;
    var loading = false;
    var saving = false;
    var saveTimer = null;
    var scheduleSave = function (delayMs) {
        if (delayMs === void 0) { delayMs = SAVE_DELAY_MS; }
        if (!store || loading || saving || saveTimer !== null || revision === saved)
            return;
        saveTimer = later(persist, delayMs);
        if (typeof saveTimer === "object") {
            var _saveTimer$unref;
            (_saveTimer$unref = saveTimer.unref) === null || _saveTimer$unref === void 0 || _saveTimer$unref.call(saveTimer);
        }
    };
    function persist() {
        saveTimer = null;
        if (!store || loading || saving || revision === saved)
            return;
        var target = store;
        var writing = revision;
        var complete = false;
        saving = true;
        storageState = "saving";
        var done = function (error) {
            if (complete)
                return;
            complete = true;
            saving = false;
            if (error) {
                store = null;
                storageState = "failed";
                writeFailures += 1;
                return;
            }
            storageState = "ready";
            writes += 1;
            saved = writing;
            scheduleSave();
        };
        try {
            target.save(JSON.stringify(records), done);
        }
        catch (error) {
            done(error);
        }
    }
    var ingest = function (incoming) {
        if (!Array.isArray(incoming) || incoming.length > 200)
            return false;
        var changed = false;
        var _loop_1 = function (input) {
            var item = recordObject(input);
            if (!item || item.source !== "ui" && item.source !== "service" || typeof item.id !== "string" || !/^[a-z0-9-]{1,64}$/.test(item.id) || typeof item.at !== "number" || !isFinite(item.at) || typeof item.event !== "string" || !/^[a-zA-Z0-9_.-]{1,64}$/.test(item.event)) {
                invalid += 1;
                return "continue";
            }
            var id = privacy.value(item.id, "id");
            var name = privacy.event(item.event);
            if (typeof id !== "string" || records.some(function (entry) { return entry.id === id; }))
                return "continue";
            var entry = {
                id: id,
                at: item.at,
                source: item.source,
                event: name,
                data: name === "diagnostic.unknown" ? {} : privacy.details(item.data)
            };
            if (typeof item.session === "string" && /^[a-z0-9-]{1,64}$/.test(item.session)) {
                var session_1 = privacy.value(item.session, "session");
                if (typeof session_1 === "string")
                    entry.session = session_1;
            }
            if (typeof item.sequence === "number" && isFinite(item.sequence) && item.sequence > 0 && Math.floor(item.sequence) === item.sequence)
                entry.sequence = item.sequence;
            if (typeof item.elapsed_ms === "number" && isFinite(item.elapsed_ms) && item.elapsed_ms >= 0)
                entry.elapsed_ms = item.elapsed_ms;
            records.push(entry);
            total += JSON.stringify(entry).length;
            changed = true;
            while (records.length > 200 || total > MAX_CHARACTERS) {
                total -= JSON.stringify(records.shift()).length;
                discarded += 1;
            }
        };
        for (var _i = 0, incoming_1 = incoming; _i < incoming_1.length; _i++) {
            var input = incoming_1[_i];
            _loop_1(input);
        }
        if (changed) {
            revision += 1;
            scheduleSave();
        }
        return true;
    };
    var stamp = function (name, data) {
        elapsed = Math.max(elapsed, Math.round(mono() - origin));
        serial += 1;
        return {
            id: session + "-" + serial,
            session: session,
            sequence: serial,
            at: Date.now(),
            elapsed_ms: elapsed,
            source: source,
            event: privacy.event(name),
            data: data
        };
    };
    var health = function () { return ({
        session: session,
        buffered: records.length,
        discarded: discarded,
        invalid: invalid,
        pending_errors: pendingErrors,
        storage: storageState,
        unsaved: revision !== saved,
        saving: saving,
        writes: writes,
        write_failures: writeFailures,
        read_failures: readFailures,
        clock: mono === Date.now ? "wall_fallback" : "monotonic"
    }); };
    return {
        record: function (name, data) {
            try {
                var entry = stamp(name, data);
                ingest([entry]);
                return entry.id;
            }
            catch (_unused) {
                return null;
            }
        },
        captureError: function (name, error, context) {
            if (pendingErrors >= MAX_PENDING_ERRORS) {
                discarded += 1;
                return;
            }
            var entry = stamp(name, privacy.details(context));
            pendingErrors += 1;
            later(function () {
                pendingErrors -= 1;
                try {
                    var failure = recordObject(error);
                    var data = entry.data;
                    data.error = typeof (failure === null || failure === void 0 ? void 0 : failure.name) === "string" ? failure.name : "Error";
                    if (typeof (failure === null || failure === void 0 ? void 0 : failure.message) === "string")
                        data.message = failure.message;
                    else if (typeof error === "string")
                        data.message = error;
                    else
                        data.message = "Error details unavailable";
                    data.stack = typeof (failure === null || failure === void 0 ? void 0 : failure.stack) === "string" ? failure.stack : "";
                    ingest([entry]);
                }
                catch (_unused2) {
                    invalid += 1;
                }
            }, 0);
        },
        health: health,
        ingest: ingest,
        snapshot: function () { return ({
            schema_version: 1,
            health: health(),
            records: JSON.parse(JSON.stringify(records))
        }); },
        flushStorage: function () { return scheduleSave(0); },
        attach: function (storage, ready) {
            if (!storage || loading || saving)
                return;
            store = storage;
            loading = true;
            storageState = "loading";
            var loaded = function (error, value) {
                if (!loading || store !== storage)
                    return;
                if (error) {
                    loading = false;
                    store = null;
                    storageState = "failed";
                    readFailures += 1;
                    ready === null || ready === void 0 || ready();
                    return;
                }
                var recent = records;
                try {
                    var previous = value ? JSON.parse(value) : [];
                    records = [];
                    total = 0;
                    if (!ingest(previous))
                        invalid += 1;
                    ingest(recent);
                }
                catch (_unused3) {
                    invalid += 1;
                    records = recent;
                    total = records.reduce(function (sum, item) { return sum + JSON.stringify(item).length; }, 0);
                }
                loading = false;
                storageState = "ready";
                revision += 1;
                scheduleSave();
                ready === null || ready === void 0 || ready();
            };
            try {
                storage.load(loaded);
            }
            catch (error) {
                loaded(error);
            }
        }
    };
};
exports.createDiagnostics = createDiagnostics;
exports.createDiagnosticsPrivacy = createDiagnosticsPrivacy;
