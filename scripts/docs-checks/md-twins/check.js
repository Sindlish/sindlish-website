#!/usr/bin/env node
/**
 * CLI for the markdown-twin completeness check (issue #52). See README.md.
 */

const { printReport } = require('../_lib/errors');

const { validate } = require('./validate');

const { invocations, errors } = validate(process.cwd());

printReport({ name: 'markdown twins', invocations, errors });

process.exit(errors.length > 0 ? 1 : 0);
