makelet = require 'makelet'
loglet = require 'loglet'
fs = require 'fs'
filelet = require 'filelet'
coffee = require 'coffee-script'
_ = require 'underscore'

assertNoConflicts = (sources, targets) ->
  results = []
  for file in targets 
    if _.find(sources, (f) -> f == file)
      results.push file
  if results.length != 0
    err = {error: 'rename_conflict', conflicts: results}
    loglet.error err
    throw err

pad = (str, len) ->
  ('0' for i in [0...(len - str.length)]).join('') + str

incr = (str, count = 1) ->
  num = parseInt str
  num += count
  pad(num.toString(), str.length)

decr = (str, count = 1) ->
  num = parseInt str
  num -= count
  pad(num.toString(), str.length)

compileReplacePattern = (pattern) ->
  changed = pattern.replace /\$(\d+)/g, "arguments[$1]"
  changed = "() -> \"#{changed}\""
  func = coffee.eval changed, 
    sandbox:
      incr: incr
      decr: decr
      pad: pad
  func

run = (options = {}) ->
  # what would the types of file that we can process? we ought to allow for direct 
  # mapping between 
  if options.debug
    loglet.setKeys options.debug
  runner = new makelet()
  [ rootDir, pattern ] = runner.patternSplit options.pattern
  process.chdir rootDir
  files = runner.wildcard(pattern)
  if files.length == 0
    loglet.log 'no_file_matched_by_pattern:', pattern
    return process.exit(0)
  if not options.replace
    loglet.log 'matched files:'
    loglet.log files 
    loglet.log 'supply replacement pattern to rename them.'
    return process.exit(0)
  try 
    repPat = compileReplacePattern options.replace
    transformed = runner.patsubst files, pattern, repPat
    assertNoConflicts files, transformed
  
    runner.fileMap transformed, files, (args, done) ->
      if options.dryRun
        loglet.log 'dryrun', args.source, '=>', args.target
        done null
      else
        loglet.log 'move', args.source, '=>', args.target
        filelet.move args.source, args.target, done
    runner.run transformed..., () ->
      loglet.log 'done.'
  catch e
   loglet.error e
   process.exit(-1)

module.exports = 
  run: run
  
