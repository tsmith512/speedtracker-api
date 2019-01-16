'use strict'

const config = require('./config')
const ErrorHandler = require('./lib/ErrorHandler')
const GitHub = require('./lib/GitHub')
const SpeedTracker = require('./lib/SpeedTracker')
const argv = require('yargs')
  .usage('Usage: node index.js [options]')
  .describe('u', 'GitHub user who owns the reporting dashboard repo')
  .alias('u', 'user')
  .describe('r', 'GitHub repo for the reporting dashboard')
  .alias('r', 'repo')
  .describe('b', 'Git branch to query and update')
  .alias('b', 'branch')
  .default('b', 'master')
  .describe('p', 'Dashboard profile to test')
  .alias('p', 'profile')
  .describe('v', 'Output: 0 = errors only, 1 = info, 2 = debug')
  .alias('v', 'verbose')
  .count('v')
  .demandOption(['u', 'r', 'p'])
  .help('h')
  .alias('h', 'help')
  .argv;

/* This is probably not a very "good" way to do this, but I'm still building */
const VERBOSE_LEVEL = argv.v;
function WARN()  { VERBOSE_LEVEL >= 0 && console.log.apply(console, arguments); }
function INFO()  { VERBOSE_LEVEL >= 1 && console.log.apply(console, arguments); }
function DEBUG() { VERBOSE_LEVEL >= 2 && console.log.apply(console, arguments); }

// ------------------------------------
// GitHub
// ------------------------------------

const github = new GitHub()

github.authenticate(config.get('githubToken'))


// ------------------------------------
// Kick off the test process with args
// ------------------------------------

const testHandler = (options) => {
  const blockList = config.get('blockList').split(',')

  // Abort if user is blocked
  if (blockList.indexOf(options.user) !== -1) {
    ErrorHandler.log(`Request blocked for user ${options.user}`)

    return res.status(429).send()
  }

  INFO(['Configuring new SpeedTracker for ', options.user, '/', options.repo, '@', options.branch, ':', options.profile].join(''));

  const speedtracker = new SpeedTracker({
    branch: options.branch,
    remote: github,
    repo: options.repo,
    user: options.user
  })

  let profileName = options.profile

  DEBUG('Starting test')
  speedtracker.runTest(profileName).then(response => {
    INFO('Test complete')
    DEBUG(response)
  }).catch(err => {
    ErrorHandler.log(err)
    WARN(err)
  })
}

const options = {
  user: argv.user,
  repo: argv.repo,
  branch: argv.branch,
  profile: argv.profile
};

DEBUG(options);

testHandler(options);

// ------------------------------------
// Basic error logging
// ------------------------------------

process.on('unhandledRejection', (reason, promise) => {
  if (reason) {
    ErrorHandler.log(reason)
  }
})
