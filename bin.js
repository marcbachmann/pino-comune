#!/usr/bin/env node
const {stdin, stdout, stderr} = process
const jsonStringToLog = require('./json-to-log')(stderr)
stdin.pipe(require('split2')(jsonStringToLog)).pipe(stdout)
