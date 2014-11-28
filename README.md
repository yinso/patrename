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


