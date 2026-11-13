"use strict";
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
var fs = require("fs");
fs = __toESM(fs);
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
module.exports = openHomeStore;
