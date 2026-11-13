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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = function (to, from, except, desc) {
    if (from && typeof from === "object" || typeof from === "function")
        for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
            key = keys[i];
            if (!__hasOwnProp.call(to, key) && key !== except)
                __defProp(to, key, {
                    get: (function (k) { return from[k]; }).bind(null, key),
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
        }
    return to;
};
var __toESM = function (mod, isNodeMode, target) { return (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
    value: mod,
    enumerable: true
}) : target, mod)); };
var https = require("https");
https = __toESM(https);
var fs = require("fs");
fs = __toESM(fs);
var IP_CONTROL_PORT_NAME = "AeroTizen.IpControlProbe";
var isHdmiPort = function (value) { return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 999; };
var PRIVATE_DIRECTORY = "wgt-private";
var ROUTING_FILENAME = "aerotizen-home-routing-v1.json";
var MAX_ROUTING_BYTES = 4096;
var MAX_ROUTING_CHARACTERS = 4096;
var PRIVATE_FILE_MODE = 384;
var FILE_NOT_FOUND = "ENOENT";
var missing = function (error) { return error !== null && typeof error === "object" && "code" in error && error.code === FILE_NOT_FOUND; };
var openHomeStore = function (host, ready, filename) {
    if (filename === void 0) { filename = ROUTING_FILENAME; }
    var _host$filesystem;
    if (!(host === null || host === void 0 || (_host$filesystem = host.filesystem) === null || _host$filesystem === void 0 ? void 0 : _host$filesystem.resolve)) {
        ready(null, false);
        return;
    }
    try {
        host.filesystem.resolve(PRIVATE_DIRECTORY, function (directory) {
            try {
                var uri = directory.toURI();
                if (uri.indexOf("file:///") !== 0)
                    throw new Error("Private storage URI unavailable");
                var folder_1 = decodeURIComponent(uri.slice(7)).replace(/\/$/, "");
                var path_1 = folder_1 + "/" + filename;
                ready({
                    exists: function () {
                        try {
                            fs.statSync(path_1);
                            return true;
                        }
                        catch (error) {
                            if (missing(error))
                                return false;
                            throw error;
                        }
                    },
                    getValue: function () {
                        if (fs.statSync(path_1).size > MAX_ROUTING_BYTES)
                            throw new Error("Home mode file too large");
                        return fs.readFileSync(path_1, "utf8");
                    },
                    setValue: function (_key, value) {
                        if (value.length > MAX_ROUTING_CHARACTERS)
                            throw new Error("Home mode value too large");
                        var temporary = path_1 + "." + Date.now() + "-" + Math.random().toString(16).slice(2);
                        var failure = null;
                        try {
                            var descriptor = fs.openSync(temporary, "wx", PRIVATE_FILE_MODE);
                            try {
                                fs.writeFileSync(descriptor, value, "utf8");
                                fs.fsyncSync(descriptor);
                            }
                            finally {
                                fs.closeSync(descriptor);
                            }
                            fs.renameSync(temporary, path_1);
                            var parent = fs.openSync(folder_1, "r");
                            try {
                                fs.fsyncSync(parent);
                            }
                            finally {
                                fs.closeSync(parent);
                            }
                        }
                        catch (error) {
                            failure = error;
                        }
                        try {
                            fs.unlinkSync(temporary);
                        }
                        catch (error) {
                            if (!missing(error) && !failure)
                                failure = error;
                        }
                        if (failure)
                            throw failure;
                    }
                }, false);
            }
            catch (_unused) {
                ready(null, true);
            }
        }, function () { return ready(null, true); }, "rw");
    }
    catch (_unused2) {
        ready(null, true);
    }
};
var LOOPBACK_HOST = "127.0.0.1";
var IP_CONTROL_FILENAME = "aerotizen-ip-control-v1.json";
var IP_CONTROL_HTTPS_PORT = 1516;
var HTTP_OK = 200;
var MAX_RESPONSE_CHARACTERS = 8192;
var PAIR_TIMEOUT_MS = 3e4;
var RPC_TIMEOUT_MS = 3e3;
var RPC_ID = 1;
var TOKEN_REVOKED = -32010;
var HDMI_SOURCE = /^HDMI\s*([1-9][0-9]{0,2})$/i;
var record = function (value) { return value !== null && typeof value === "object" ? value : null; };
var readState = function (store) {
    try {
        var state = record(JSON.parse(store.getValue(IP_CONTROL_FILENAME)));
        if (typeof (state === null || state === void 0 ? void 0 : state.token) === "string" && state.token.trim() && Array.isArray(state.ports))
            return {
                token: state.token,
                ports: Array.from(new Set(state.ports.filter(isHdmiPort)))
            };
    }
    catch (_unused) { }
    return {
        token: "",
        ports: []
    };
};
var startIpControl = function (host) {
    var pending = new Set();
    var disposed = false;
    var request = function (method, params, timeoutMs) { return new Promise(function (resolve, reject) {
        if (disposed) {
            reject(new Error("Service stopped"));
            return;
        }
        var packet = __assign({ jsonrpc: "2.0", id: RPC_ID, method: method }, params ? { params: params } : {});
        var body = JSON.stringify(packet);
        var active = true;
        var deadline;
        var req;
        var finish = function (error, value) {
            if (!active)
                return;
            active = false;
            pending.delete(cancel);
            clearTimeout(deadline);
            if (error) {
                req === null || req === void 0 || req.destroy();
                reject(error);
            }
            else
                resolve(value);
        };
        var cancel = function () { return finish(new Error("Request cancelled")); };
        pending.add(cancel);
        try {
            req = https.request({
                hostname: LOOPBACK_HOST,
                port: IP_CONTROL_HTTPS_PORT,
                path: "/",
                method: "POST",
                rejectUnauthorized: false,
                agent: false,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body)
                }
            }, function (res) {
                if (res.statusCode !== HTTP_OK) {
                    finish(new Error("HTTP error"));
                    return;
                }
                var data = "";
                res.setEncoding("utf8");
                res.on("error", function (error) { return finish(error); });
                res.on("data", function (chunk) {
                    data += chunk;
                    if (data.length > MAX_RESPONSE_CHARACTERS)
                        finish(new Error("Reply too large"));
                });
                res.on("end", function () {
                    if (!active)
                        return;
                    try {
                        var reply = record(JSON.parse(data));
                        if (!reply || reply.id !== RPC_ID || reply.error || !("result" in reply)) {
                            var _record;
                            finish(Object.assign(new Error("RPC error"), { code: (_record = record(reply === null || reply === void 0 ? void 0 : reply.error)) === null || _record === void 0 ? void 0 : _record.code }));
                        }
                        else
                            finish(null, reply.result);
                    }
                    catch (_unused2) {
                        finish(new Error("Invalid reply"));
                    }
                });
            });
            deadline = setTimeout(function () { return finish(new Error("Request timed out")); }, timeoutMs);
            req.on("close", function () { return finish(new Error("Connection closed")); });
            req.on("error", function (error) { return finish(error); });
            req.end(body);
        }
        catch (_unused3) {
            finish(new Error("Request failed"));
        }
    }); };
    if (!(host === null || host === void 0 ? void 0 : host.messageport))
        return function () { };
    var store = null;
    var state = {
        token: "",
        ports: []
    };
    var ready = new Promise(function (resolve) {
        openHomeStore(host, function (storage) {
            if (!disposed) {
                store = storage;
                if (storage)
                    state = readState(storage);
            }
            resolve();
        }, IP_CONTROL_FILENAME);
    });
    var learn = function (nativePorts) { return __awaiter(void 0, void 0, void 0, function () {
        var _record3, token, active, error_1, _record2, pairing, _a, _unused4_1, _unused5_1, inputSource, match, port, known, added, ports, next;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!store)
                        return [2, { status: "storageFailed" }];
                    token = state.token;
                    if (!token) return [3, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4, request("getTVStates", { AccessToken: token }, RPC_TIMEOUT_MS)];
                case 2:
                    active = _b.sent();
                    return [3, 4];
                case 3:
                    error_1 = _b.sent();
                    if (((_record2 = record(error_1)) === null || _record2 === void 0 ? void 0 : _record2.code) !== TOKEN_REVOKED)
                        return [2, { status: "readFailed" }];
                    token = "";
                    return [3, 4];
                case 4:
                    if (!!token) return [3, 11];
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    _a = record;
                    return [4, request("createAccessToken", null, PAIR_TIMEOUT_MS)];
                case 6:
                    pairing = _a.apply(void 0, [_b.sent()]);
                    if (typeof (pairing === null || pairing === void 0 ? void 0 : pairing.AccessToken) !== "string" || !pairing.AccessToken.trim())
                        return [2, { status: "pairFailed" }];
                    token = pairing.AccessToken;
                    return [3, 8];
                case 7:
                    _unused4_1 = _b.sent();
                    return [2, { status: "pairFailed" }];
                case 8:
                    _b.trys.push([8, 10, , 11]);
                    return [4, request("getTVStates", { AccessToken: token }, RPC_TIMEOUT_MS)];
                case 9:
                    active = _b.sent();
                    return [3, 11];
                case 10:
                    _unused5_1 = _b.sent();
                    return [2, { status: "readFailed" }];
                case 11:
                    inputSource = (_record3 = record(active)) === null || _record3 === void 0 ? void 0 : _record3.inputSource;
                    if (typeof inputSource !== "string" || !inputSource.trim() || disposed)
                        return [2, { status: "readFailed" }];
                    match = HDMI_SOURCE.exec(inputSource.trim());
                    port = match ? Number(match[1]) : void 0;
                    known = port !== void 0 && (nativePorts.includes(port) || state.ports.includes(port));
                    added = port !== void 0 && !known;
                    ports = added ? __spreadArray(__spreadArray([], state.ports, true), [port], false).sort(function (a, b) { return a - b; }) : state.ports;
                    if (added || token !== state.token) {
                        next = {
                            token: token,
                            ports: ports
                        };
                        try {
                            store.setValue(IP_CONTROL_FILENAME, JSON.stringify(next));
                        }
                        catch (_unused6) {
                            return [2, { status: "storageFailed" }];
                        }
                        state = next;
                    }
                    if (added)
                        return [2, {
                                status: "added",
                                port: port,
                                ports: ports
                            }];
                    return [2, {
                            status: known ? "known" : "noHdmi",
                            port: port,
                            ports: ports
                        }];
            }
        });
    }); };
    var switchInput = function (port) { return __awaiter(void 0, void 0, void 0, function () {
        var _unused7_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!state.ports.includes(port))
                        return [2, { status: "switchFailed" }];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, request("inputSourceControl", {
                            AccessToken: state.token,
                            inputSource: "HDMI" + port
                        }, RPC_TIMEOUT_MS)];
                case 2:
                    _a.sent();
                    return [2, { status: "switched" }];
                case 3:
                    _unused7_1 = _a.sent();
                    return [2, { status: "switchFailed" }];
                case 4: return [2];
            }
        });
    }); };
    var running = false;
    var local = host.messageport.requestTrustedLocalMessagePort(IP_CONTROL_PORT_NAME);
    var receive = function (data, remote) { return __awaiter(void 0, void 0, void 0, function () {
        var message, command, result, _unused8_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = data[0];
                    if (disposed || !remote || remote.appId !== "DclHome001.Home" || !message)
                        return [2];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, , 12]);
                    command = record(JSON.parse(message.value));
                    return [4, ready];
                case 2:
                    _a.sent();
                    if (disposed || !command)
                        return [2];
                    result = { status: "unavailable" };
                    if (!(command.action === "list")) return [3, 3];
                    result = {
                        status: "listed",
                        ports: state.ports
                    };
                    return [3, 10];
                case 3:
                    if (!!running) return [3, 10];
                    running = true;
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, , 9, 10]);
                    if (!(command.action === "learn" && Array.isArray(command.nativePorts) && command.nativePorts.every(isHdmiPort))) return [3, 6];
                    return [4, learn(command.nativePorts)];
                case 5:
                    result = _a.sent();
                    return [3, 8];
                case 6:
                    if (!(command.action === "switch" && isHdmiPort(command.port))) return [3, 8];
                    return [4, switchInput(command.port)];
                case 7:
                    result = _a.sent();
                    _a.label = 8;
                case 8: return [3, 10];
                case 9:
                    running = false;
                    return [7];
                case 10:
                    if (!disposed)
                        remote.sendMessage([{
                                key: message.key,
                                value: JSON.stringify(result)
                            }]);
                    return [3, 12];
                case 11:
                    _unused8_1 = _a.sent();
                    return [3, 12];
                case 12: return [2];
            }
        });
    }); };
    var listener = local.addMessagePortListener(function (data, remote) {
        receive(data, remote);
    });
    return function () {
        disposed = true;
        Array.from(pending).forEach(function (cancel) { return cancel(); });
        try {
            local.removeMessagePortListener(listener);
        }
        catch (_unused9) { }
    };
};
module.exports = startIpControl;
