# `patrename` - a pattern-based file bulk rename utility.

## Install

    npm install -g patrename
    
## Usage

    patrename [-y|--dryRun] <source_path_pattern> [<replace_pattern>]

`patrename` utilizes Javascript regular expressions to match files - you can test to see how the regular expression matches by not supplying the `<replace_pattern>`:

    $ patrename 'test_(\d+).png' # matches all files in the current directory that matches the expression. 
    matched files: 
    [ 'test_01.png',
      'test_02.png',
      ...
    ]
    supply replacement pattern to rename them.

`-y` or `--dryRun` will allow you to test out your replacement pattern without actually rename the files.

The replacement pattern is done as a [`CoffeeScript`](http://coffeescript.org) interpolated string, with the matched pattern named as `$1`, `$2`, `$3`, etc.

For example, if the goal is to strip the `test_` prefix from the file name, we just supply `#{$1}.png` as the replacement string.

    $ patrename 'test_(\d+).png' '#{$1}.png'

One thing to keep in mind is that in shells that use `$` as variable prefixes, double quote strings will require an escape with `\`. I.e., 

    '#{$1}.png'

or

    "#{\$1}.png"

A couple of utility functions are supplied - `incr` will increment the number, and `descr` will decrement the number.

    $ patrename 'test_(\d+).png' '#{incr($1)}.png'
    # will rename test_1.png to 2.png, etc. 

## File Conflicts

If the source file names exists in target file names, `patrename` will stop processing. This is to avoid potential race conditions that clobber files due to name overlaps. 

The way around the potential problem is to move files twice - first to temp file names so not to conflict with the eventual file names, and then rename the second time to the target file names.

For example, let's say that you have `00.png`, `01.png`, and `02.png`, and you want to increment the file name to `01.png`, `02.png`, and `03.png`.

Since `01.png` and `02.png` exists in both the source as well as the target names, they are in conflict and `patrename` will not process further. What we can do is 



    # rename to `test_#{$1}.png` so the file names are now `test_00.png`, `test_01.png`, and `test_02.png`.
    
    $ patrename '(\d+).png' 'test_#{$1}.png'
    
    # rename to `#{incr($1)}.png` so we get back `01.png`, `02.png`, and `03.png`.
    
    $ patrename 'test_(\d+).png' '#{incr($1)}.png'    


