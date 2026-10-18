#!/usr/bin/env node
/**
 * CLI for Gate 3, docs references (issue #52). See README.md.
 */

const { printReport } = require('../_lib/errors');

const { validate } = require('./validate');

const { invocations, errors } = validate(process.cwd());

printReport({ name: 'docs references', invocations, errors });

process.exit(errors.length > 0 ? 1 : 0);
