// Generated by CoffeeScript 1.4.0
(function() {
  var assertNoConflicts, coffee, compileReplacePattern, decr, filelet, fs, incr, loglet, makelet, pad, run, _,
    __slice = [].slice;

  makelet = require('makelet');

  loglet = require('loglet');

  fs = require('fs');

  filelet = require('filelet');

  coffee = require('coffee-script');

  _ = require('underscore');

  assertNoConflicts = function(sources, targets) {
    var err, file, results, _i, _len;
    results = [];
    for (_i = 0, _len = targets.length; _i < _len; _i++) {
      file = targets[_i];
      if (_.find(sources, function(f) {
        return f === file;
      })) {
        results.push(file);
      }
    }
    if (results.length !== 0) {
      err = {
        error: 'rename_conflict',
        conflicts: results
      };
      loglet.error(err);
      throw err;
    }
  };

  pad = function(str, len) {
    var i;
    return ((function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = len - str.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push('0');
      }
      return _results;
    })()).join('') + str;
  };

  incr = function(str, count) {
    var num;
    if (count == null) {
      count = 1;
    }
    num = parseInt(str);
    num += count;
    return pad(num.toString(), str.length);
  };

  decr = function(str, count) {
    var num;
    if (count == null) {
      count = 1;
    }
    num = parseInt(str);
    num -= count;
    return pad(num.toString(), str.length);
  };

  compileReplacePattern = function(pattern) {
    var changed, func;
    changed = pattern.replace(/\$(\d+)/g, "arguments[$1]");
    changed = "() -> \"" + changed + "\"";
    func = coffee["eval"](changed, {
      sandbox: {
        incr: incr,
        decr: decr,
        pad: pad
      }
    });
    return func;
  };

  run = function(options) {
    var files, pattern, repPat, rootDir, runner, transformed, _ref;
    if (options == null) {
      options = {};
    }
    if (options.debug) {
      loglet.setKeys(options.debug);
    }
    runner = new makelet();
    _ref = runner.patternSplit(options.pattern), rootDir = _ref[0], pattern = _ref[1];
    process.chdir(rootDir);
    files = runner.wildcard(pattern);
    if (files.length === 0) {
      loglet.log('no_file_matched_by_pattern:', pattern);
      return process.exit(0);
    }
    if (!options.replace) {
      loglet.log('matched files:');
      loglet.log(files);
      loglet.log('supply replacement pattern to rename them.');
      return process.exit(0);
    }
    try {
      repPat = compileReplacePattern(options.replace);
      transformed = runner.patsubst(files, pattern, repPat);
      assertNoConflicts(files, transformed);
      runner.fileMap(transformed, files, function(args, done) {
        if (options.dryRun) {
          loglet.log('dryrun', args.source, '=>', args.target);
          return done(null);
        } else {
          loglet.log('move', args.source, '=>', args.target);
          return filelet.move(args.source, args.target, done);
        }
      });
      return runner.run.apply(runner, __slice.call(transformed).concat([function() {
        return loglet.log('done.');
      }]));
    } catch (e) {
      loglet.error(e);
      return process.exit(-1);
    }
  };

  module.exports = {
    run: run
  };

}).call(this);
