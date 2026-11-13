"use strict";
var LOOPBACK_HOST = "127.0.0.1";
var SAMSUNG_API_PORT = 8001;
var MAX_MESSAGE_BYTES = 131072;
var HISTORY_LIMIT = 64;
var RECONNECT_DELAY_MS = 4e3;
var REPLY_TIMEOUT_MS = 2e3;
var POLL_INTERVAL_MS = 3e3;
var FRESH_TIMEOUT_MS = 2500;
var WEBSOCKET_MASK_BYTES = 4;
var REQUEST_NONCE_BYTES = 4;
var HANDSHAKE_NONCE_BYTES = 16;
var WEBSOCKET_ACCEPT_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
var WEBSOCKET_VERSION = "13";
var ART_CHANNEL_PATH = "/api/v2/channels/com.samsung.art-app?name=QWVyb1RpemVu";
var SWITCHING_PROTOCOLS_STATUS = 101;
var FIN_BIT = 128;
var MASK_BIT = 128;
var RESERVED_BITS = 112;
var OPCODE_BITS = 15;
var LENGTH_BITS = 127;
var SHORT_LENGTH_MARKER = 126;
var LONG_LENGTH_MARKER = 127;
var MAX_OUTBOUND_PAYLOAD_BYTES = 65535;
var MAX_CONTROL_PAYLOAD_BYTES = 125;
var BASE_HEADER_BYTES = 2;
var SHORT_LENGTH_BYTES = 2;
var SHORT_HEADER_BYTES = 4;
var LONG_HEADER_BYTES = 10;
var OPCODES = {
    continuation: 0,
    text: 1,
    close: 8,
    ping: 9,
    pong: 10
};
var record = function (value) { return value !== null && typeof value === "object" ? value : null; };
var createArtMode = function (input) {
    if (input === void 0) { input = {}; }
    var options = input || {};
    var http = null;
    var crypto = null;
    var running = false;
    var active = null;
    var retryTimer;
    var queryTimer;
    var freshTimer;
    var pending = null;
    var waiting = [];
    var sequence = 0;
    var state = {
        phase: "not-started",
        artMode: "unknown",
        generation: 0,
        sentQueries: 0,
        matchedReplies: 0,
        latest: null,
        samples: [],
        events: [],
        runtime: {
            http: false,
            crypto: false,
            buffer: typeof Buffer !== "undefined"
        }
    };
    function now() {
        return Date.now();
    }
    function ring(list, item) {
        list.push(item);
        if (list.length > HISTORY_LIMIT)
            list.shift();
    }
    function event(kind, detail) {
        ring(state.events, {
            at: now(),
            kind: kind,
            detail: detail || null
        });
    }
    function sample(value, reason, id, sentAt) {
        var item = {
            at: now(),
            value: value,
            reason: reason,
            requestId: id || null,
            sentAt: sentAt || null,
            generation: state.generation
        };
        state.artMode = value;
        state.latest = item;
        ring(state.samples, item);
        if (typeof options.onChange === "function")
            try {
                options.onChange(value, reason);
            }
            catch (e) {
                event("callback-error", "status callback failed");
            }
    }
    function bytes(value) {
        return new Buffer(value);
    }
    function allocate(length) {
        var out = new Buffer(length);
        out.fill(0);
        return out;
    }
    function finish(ownedWaiter, value) {
        var waiter = ownedWaiter;
        if (waiter.done)
            return;
        waiter.done = true;
        clearTimeout(waiter.timer);
        try {
            waiter.callback(value);
        }
        catch (e) {
            event("callback-error", "fresh callback failed");
        }
    }
    function finishAll(waiters, value) {
        for (var i = 0; i < waiters.length; i += 1)
            finish(waiters[i], value);
    }
    function invalidate(reason, value) {
        var old = pending;
        pending = null;
        if (old)
            clearTimeout(old.timer);
        var queued = waiting;
        waiting = [];
        clearTimeout(freshTimer);
        freshTimer = void 0;
        sample(value || "unknown", reason, old && old.id, old && old.sentAt);
        if (old)
            finishAll(old.waiters, value || "unknown");
        finishAll(queued, value || "unknown");
    }
    function clearTransportTimers() {
        clearTimeout(retryTimer);
        retryTimer = void 0;
        clearTimeout(queryTimer);
        queryTimer = void 0;
        clearTimeout(freshTimer);
        freshTimer = void 0;
    }
    function dispose(connection) {
        var conn = connection;
        if (!conn)
            return;
        clearTimeout(conn.timer);
        conn.failed = true;
        if (conn.socket)
            conn.socket.destroy();
        if (conn.request) {
            if (typeof conn.request.destroy === "function")
                conn.request.destroy();
            else if (typeof conn.request.abort === "function")
                conn.request.abort();
        }
    }
    function lost(conn, reason) {
        if (active !== conn || conn.failed)
            return;
        active = null;
        dispose(conn);
        clearTransportTimers();
        invalidate(reason);
        event("connection-lost", reason);
        if (running) {
            state.phase = "retry-wait";
            retryTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
    }
    function sendFrame(conn, opcode, payload) {
        if (!running || active !== conn || conn.failed || !conn.socket)
            return false;
        try {
            if (payload.length > MAX_OUTBOUND_PAYLOAD_BYTES)
                throw new Error("outbound frame too large");
            var extra = payload.length < SHORT_LENGTH_MARKER ? 0 : SHORT_LENGTH_BYTES;
            var frame = allocate(BASE_HEADER_BYTES + extra + WEBSOCKET_MASK_BYTES + payload.length);
            frame[0] = FIN_BIT | opcode;
            frame[1] = MASK_BIT | (extra ? SHORT_LENGTH_MARKER : payload.length);
            if (extra)
                frame.writeUInt16BE(payload.length, BASE_HEADER_BYTES);
            var maskAt = BASE_HEADER_BYTES + extra;
            if (!crypto)
                throw new Error("crypto module unavailable");
            var mask = crypto.randomBytes(WEBSOCKET_MASK_BYTES);
            mask.copy(frame, maskAt);
            for (var i = 0; i < payload.length; i += 1)
                frame[maskAt + WEBSOCKET_MASK_BYTES + i] = payload[i] ^ mask[i % WEBSOCKET_MASK_BYTES];
            conn.socket.write(frame);
            return true;
        }
        catch (e) {
            lost(conn, "write failed");
            return false;
        }
    }
    function pumpFresh() {
        clearTimeout(freshTimer);
        freshTimer = void 0;
        if (!waiting.length || pending)
            return;
        if (!running || !active || !active.ready || active.failed) {
            var queued = waiting;
            waiting = [];
            finishAll(queued, "unknown");
            return;
        }
        var callers = waiting;
        waiting = [];
        requestArt(active, callers);
    }
    function queuePump() {
        if (!freshTimer && waiting.length)
            freshTimer = setTimeout(pumpFresh, 0);
    }
    function requestArt(conn, waiters) {
        if (waiters === void 0) { waiters = []; }
        if (!running || active !== conn || !conn.ready || pending)
            return;
        var id;
        try {
            if (!crypto)
                throw new Error("crypto module unavailable");
            id = "aerotizen-" + now() + "-" + ++sequence + "-" + crypto.randomBytes(REQUEST_NONCE_BYTES).toString("hex");
        }
        catch (e) {
            finishAll(waiters || [], "unknown");
            lost(conn, "request ID failed");
            return;
        }
        var sentAt = now();
        var message = {
            method: "ms.channel.emit",
            params: {
                event: "art_app_request",
                to: "broadcast",
                data: JSON.stringify({
                    request: "get_artmode_status",
                    id: id,
                    request_id: id
                })
            }
        };
        var current = {
            id: id,
            sentAt: sentAt,
            timer: void 0,
            waiters: waiters
        };
        pending = current;
        if (!sendFrame(conn, OPCODES.text, bytes(JSON.stringify(message))))
            return;
        state.sentQueries += 1;
        event("query-sent", id);
        current.timer = setTimeout(function () {
            if (pending !== current)
                return;
            pending = null;
            sample("unknown", "reply-timeout", id, sentAt);
            finishAll(current.waiters, "unknown");
            queuePump();
        }, REPLY_TIMEOUT_MS);
    }
    function scheduleQuery(conn) {
        clearTimeout(queryTimer);
        queryTimer = setTimeout(function () {
            if (!running || active !== conn || conn.failed)
                return;
            if (waiting.length)
                pumpFresh();
            else
                requestArt(conn);
            scheduleQuery(conn);
        }, POLL_INTERVAL_MS);
    }
    function message(connection, payload) {
        var conn = connection;
        var msg;
        try {
            msg = record(JSON.parse(payload.toString("utf8")));
        }
        catch (e) {
            event("invalid-message", "JSON parse failed");
            return;
        }
        if (!msg || typeof msg !== "object")
            return;
        if (msg.event === "ms.channel.ready") {
            if (!conn.ready) {
                conn.ready = true;
                state.phase = "querying";
                clearTimeout(conn.timer);
                event("channel-ready");
                if (waiting.length)
                    pumpFresh();
                else
                    requestArt(conn);
                scheduleQuery(conn);
            }
            return;
        }
        if (msg.event === "go_to_standby") {
            invalidate("standby-event");
            return;
        }
        if (msg.event !== "d2d_service_message")
            return;
        var reply;
        try {
            reply = record(typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data);
        }
        catch (e) {
            event("invalid-reply", "JSON parse failed");
            return;
        }
        if (!reply || typeof reply !== "object")
            return;
        var value = reply.value || reply.status;
        var statusEvent = reply.event === "get_artmode_status" || reply.event === "artmode_status";
        if (statusEvent && pending && (reply.request_id || reply.id) === pending.id) {
            if (value !== "on" && value !== "off") {
                invalidate("invalid-reply");
                return;
            }
            var current = pending;
            pending = null;
            clearTimeout(current.timer);
            state.matchedReplies += 1;
            sample(value, "matching-reply", current.id, current.sentAt);
            finishAll(current.waiters, running && active === conn ? value : "unknown");
            queuePump();
            return;
        }
        if (reply.event === "go_to_standby")
            invalidate("standby-event");
        else if ((statusEvent || reply.event === "artmode_changed") && value === "on")
            invalidate("art-on-event", "on");
    }
    function receive(connection, chunk) {
        var conn = connection;
        if (!running || active !== conn || conn.failed)
            return;
        if (conn.input.length + chunk.length > 131086) {
            lost(conn, "input limit");
            return;
        }
        conn.input = Buffer.concat([conn.input, chunk]);
        while (conn.input.length >= BASE_HEADER_BYTES) {
            var input_1 = conn.input;
            var fin = (input_1[0] & FIN_BIT) !== 0;
            var opcode = input_1[0] & OPCODE_BITS;
            var length = input_1[1] & LENGTH_BITS;
            var offset = BASE_HEADER_BYTES;
            if (input_1[0] & RESERVED_BITS || input_1[1] & MASK_BIT) {
                lost(conn, "invalid frame flags");
                return;
            }
            if (length === SHORT_LENGTH_MARKER) {
                if (input_1.length < SHORT_HEADER_BYTES)
                    return;
                length = input_1.readUInt16BE(BASE_HEADER_BYTES);
                offset = SHORT_HEADER_BYTES;
            }
            else if (length === LONG_LENGTH_MARKER) {
                if (input_1.length < LONG_HEADER_BYTES)
                    return;
                if (input_1.readUInt32BE(BASE_HEADER_BYTES) !== 0) {
                    lost(conn, "frame limit");
                    return;
                }
                length = input_1.readUInt32BE(6);
                offset = LONG_HEADER_BYTES;
            }
            if (length > MAX_MESSAGE_BYTES) {
                lost(conn, "frame limit");
                return;
            }
            if (opcode >= OPCODES.close && (!fin || length > MAX_CONTROL_PAYLOAD_BYTES)) {
                lost(conn, "invalid control frame");
                return;
            }
            if (input_1.length < offset + length)
                return;
            var payload = input_1.slice(offset, offset + length);
            conn.input = input_1.slice(offset + length);
            if (opcode === OPCODES.close) {
                lost(conn, "peer closed");
                return;
            }
            if (opcode === OPCODES.ping) {
                event("ping");
                if (!sendFrame(conn, OPCODES.pong, payload))
                    return;
            }
            else if (opcode === OPCODES.pong)
                event("pong");
            else if (opcode === OPCODES.text) {
                if (conn.fragments) {
                    lost(conn, "overlapping text frames");
                    return;
                }
                if (fin)
                    message(conn, payload);
                else {
                    conn.fragments = [payload];
                    conn.fragmentSize = payload.length;
                }
            }
            else if (opcode === OPCODES.continuation) {
                if (!conn.fragments) {
                    lost(conn, "unexpected continuation");
                    return;
                }
                conn.fragmentSize += payload.length;
                if (conn.fragmentSize > MAX_MESSAGE_BYTES) {
                    lost(conn, "message limit");
                    return;
                }
                conn.fragments.push(payload);
                if (fin) {
                    var full = Buffer.concat(conn.fragments, conn.fragmentSize);
                    conn.fragments = null;
                    conn.fragmentSize = 0;
                    message(conn, full);
                }
            }
            else {
                lost(conn, "unsupported opcode");
                return;
            }
            if (active !== conn || conn.failed)
                return;
        }
    }
    function connect() {
        if (!running || active || !http || !crypto)
            return;
        state.phase = "connecting";
        state.generation += 1;
        var conn = {
            failed: false,
            ready: false,
            socket: null,
            request: null,
            input: allocate(0),
            fragments: null,
            fragmentSize: 0,
            timer: void 0
        };
        active = conn;
        try {
            var key = crypto.randomBytes(HANDSHAKE_NONCE_BYTES).toString("base64");
            var accept_1 = crypto.createHash("sha1").update(key + WEBSOCKET_ACCEPT_GUID).digest("base64");
            conn.request = http.request({
                host: LOOPBACK_HOST,
                port: SAMSUNG_API_PORT,
                method: "GET",
                path: ART_CHANNEL_PATH,
                headers: {
                    Connection: "Upgrade",
                    Upgrade: "websocket",
                    "Sec-WebSocket-Version": WEBSOCKET_VERSION,
                    "Sec-WebSocket-Key": key
                }
            });
            conn.request.on("upgrade", function (res, socket, head) {
                if (!running || active !== conn || conn.failed) {
                    socket.destroy();
                    return;
                }
                conn.socket = socket;
                if (res.statusCode !== SWITCHING_PROTOCOLS_STATUS || String(res.headers.upgrade || "").toLowerCase() !== "websocket" || !/(^|,)\s*upgrade\s*(,|$)/i.test(String(res.headers.connection || "")) || res.headers["sec-websocket-accept"] !== accept_1) {
                    lost(conn, "invalid upgrade");
                    return;
                }
                event("websocket-open");
                socket.on("data", function (chunk) {
                    receive(conn, chunk);
                });
                socket.on("error", function () {
                    lost(conn, "socket error");
                });
                socket.on("end", function () {
                    lost(conn, "socket ended");
                });
                socket.on("close", function () {
                    lost(conn, "socket closed");
                });
                if (head && head.length)
                    receive(conn, head);
            });
            conn.request.on("response", function (res) {
                if (typeof res.resume === "function")
                    res.resume();
                lost(conn, "HTTP response without upgrade");
            });
            conn.request.on("error", function () {
                lost(conn, "request error");
            });
            conn.timer = setTimeout(function () {
                lost(conn, "channel timeout");
            }, REPLY_TIMEOUT_MS);
            conn.request.end();
        }
        catch (e) {
            lost(conn, "connect failed");
        }
    }
    function start() {
        if (running)
            return;
        running = true;
        state.phase = "starting";
        try {
            http = require("http");
            state.runtime.http = true;
        }
        catch (e) {
            event("runtime-error", "http module unavailable");
        }
        try {
            crypto = require("crypto");
            state.runtime.crypto = true;
        }
        catch (e) {
            event("runtime-error", "crypto module unavailable");
        }
        if (!http || !crypto || !state.runtime.buffer) {
            running = false;
            state.phase = "unavailable";
            invalidate("required runtime capability unavailable");
            return;
        }
        connect();
    }
    function stop() {
        running = false;
        state.phase = "stopped";
        clearTransportTimers();
        var conn = active;
        active = null;
        dispose(conn);
        invalidate("stopped");
    }
    function fresh(callback) {
        if (typeof callback !== "function")
            return;
        if (!running || !active || !active.ready || active.failed) {
            try {
                callback("unknown");
            }
            catch (e) {
                event("callback-error", "fresh callback failed");
            }
            return;
        }
        var waiter = {
            callback: callback,
            done: false,
            timer: void 0
        };
        waiter.timer = setTimeout(function () {
            if (!waiter.done)
                invalidate("fresh-timeout");
        }, FRESH_TIMEOUT_MS);
        waiting.push(waiter);
        queuePump();
    }
    return {
        start: start,
        stop: stop,
        fresh: fresh,
        getState: function () {
            return JSON.parse(JSON.stringify(state));
        }
    };
};
module.exports = createArtMode;
