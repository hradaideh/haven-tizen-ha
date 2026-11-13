"use strict";
var LAUNCHER_APP_ID = "DclHome001.Home";
var HOME_ROUTING_KEY = "aerotizen.home-routing.v1";
var HOME_CONTROL_PROTOCOL = 1;
var TRANSACTION_PATTERN = /^[a-f0-9]{32}$/;
var BASELINE_HASH_PATTERN = /^[a-f0-9]{64}$/;
var fields = function (value) { return value !== null && typeof value === "object" ? value : null; };
var validReceipt = function (input) {
    var value = fields(input);
    if (!value)
        return false;
    if (value.mode === "watcher")
        return value.transaction === null && value.baseline_sha256 === null;
    return (value.mode === "native" || value.mode === "hold") && typeof value.transaction === "string" && TRANSACTION_PATTERN.test(value.transaction) && typeof value.baseline_sha256 === "string" && BASELINE_HASH_PATTERN.test(value.baseline_sha256);
};
var createHomeMode = function (preference, changed, blocked) {
    if (blocked === void 0) { blocked = false; }
    var storage = (preference === null || preference === void 0 ? void 0 : preference.exists) && preference.getValue && preference.setValue ? preference : null;
    var saved = {
        mode: blocked ? "blocked" : "watcher",
        transaction: null,
        baseline_sha256: null
    };
    try {
        if (storage === null || storage === void 0 ? void 0 : storage.exists(HOME_ROUTING_KEY)) {
            var value = JSON.parse(storage.getValue(HOME_ROUTING_KEY));
            if (!validReceipt(value))
                throw new Error("Invalid saved Home mode");
            saved = value;
        }
    }
    catch (_unused) {
        saved = {
            mode: "blocked",
            transaction: null,
            baseline_sha256: null
        };
    }
    var read = function () { return ({
        protocol: HOME_CONTROL_PROTOCOL,
        app_id: LAUNCHER_APP_ID,
        persistent: !!storage,
        mode: saved.mode,
        transaction: saved.transaction,
        baseline_sha256: saved.baseline_sha256
    }); };
    var change = function (input) {
        if (!storage)
            throw new Error("Persistent Home mode is unavailable");
        var request = fields(input);
        if (!request || request.expected_mode !== saved.mode || request.expected_transaction !== saved.transaction || request.expected_baseline_sha256 !== saved.baseline_sha256)
            throw new Error("Home mode changed; read it again");
        var next = {
            mode: request.mode,
            transaction: request.transaction,
            baseline_sha256: request.baseline_sha256
        };
        if (!validReceipt(next) || saved.mode === "blocked" || (next.mode === "hold" ? saved.mode !== "watcher" && next.baseline_sha256 !== saved.baseline_sha256 : saved.mode !== "hold" || next.mode === "native" && (next.transaction !== saved.transaction || next.baseline_sha256 !== saved.baseline_sha256)))
            throw new Error("Invalid Home handoff transition");
        var encoded = JSON.stringify(next);
        try {
            storage.setValue(HOME_ROUTING_KEY, encoded);
            if (storage.getValue(HOME_ROUTING_KEY) !== encoded)
                throw new Error("Home mode readback failed");
            saved = next;
        }
        catch (error) {
            saved = {
                mode: "blocked",
                transaction: saved.transaction,
                baseline_sha256: saved.baseline_sha256
            };
            changed();
            throw error;
        }
        changed();
        return read();
    };
    return {
        read: read,
        change: change
    };
};
module.exports = createHomeMode;
