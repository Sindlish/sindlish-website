#!/usr/bin/env node
/**
 * CLI for the manual a11y checklist gate (issue #52). See README.md.
 */

const { printReport } = require('../_lib/errors');

const { validate } = require('./validate');

const { invocations, errors } = validate(process.cwd());

printReport({ name: 'a11y checklist', invocations, errors });

process.exit(errors.length > 0 ? 1 : 0);
