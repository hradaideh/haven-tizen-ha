"use strict";
var MAX_LOG_BYTES = 262144;
var PRIVATE_DIRECTORY = "wgt-private";
var PRIVATE_FILE_MODE = 384;
var openDiagnosticsStore = function (host, ready, options) {
    var _host$filesystem;
    if (!(host === null || host === void 0 || (_host$filesystem = host.filesystem) === null || _host$filesystem === void 0 ? void 0 : _host$filesystem.resolve)) {
        ready(null);
        return;
    }
    var fs = options.fs, byteLength = options.byteLength;
    try {
        host.filesystem.resolve(PRIVATE_DIRECTORY, function (directory) {
            try {
                var uri = directory.toURI();
                if (uri.indexOf("file:///") !== 0) {
                    ready(null);
                    return;
                }
                var file_1 = decodeURIComponent(uri.slice(7)).replace(/\/$/, "") + "/aerotizen-diagnostics-v1.json";
                ready({
                    load: function (done) {
                        fs.stat(file_1, function (error, stat) {
                            if (error || stat.size > MAX_LOG_BYTES) {
                                done(null, null);
                                return;
                            }
                            fs.readFile(file_1, "utf8", function (failure, value) {
                                done(failure, !failure && byteLength(value) <= MAX_LOG_BYTES ? value : null);
                            });
                        });
                    },
                    save: function (value, done) {
                        if (byteLength(value) > MAX_LOG_BYTES) {
                            done(new Error("Log size limit"));
                            return;
                        }
                        var temporary = file_1 + ".tmp";
                        var failed = function (error) { return fs.unlink(temporary, function () { return done(error); }); };
                        fs.writeFile(temporary, value, {
                            encoding: "utf8",
                            mode: PRIVATE_FILE_MODE
                        }, function (error) {
                            if (error) {
                                failed(error);
                                return;
                            }
                            fs.rename(temporary, file_1, function (failure) {
                                if (failure)
                                    failed(failure);
                                else
                                    done(null);
                            });
                        });
                    }
                });
            }
            catch (_unused) {
                ready(null);
            }
        }, function () { return ready(null); }, "rw");
    }
    catch (_unused2) {
        ready(null);
    }
};
var fs = require("fs");
var storage_default = function (host, ready) { return openDiagnosticsStore(host, ready, {
    fs: fs,
    byteLength: function (value) { return Buffer.byteLength(value, "utf8"); }
}); };
module.exports = storage_default;
