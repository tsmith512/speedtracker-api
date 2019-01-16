'use strict'

const config = require('./config')
const ErrorHandler = require('./lib/ErrorHandler')
const GitHub = require('./lib/GitHub')
const SpeedTracker = require('./lib/SpeedTracker')
const argv = require('yargs').argv;


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

  const speedtracker = new SpeedTracker({
    branch: options.branch,
    remote: github,
    repo: options.repo,
    user: options.user
  })

  let profileName = options.profile

  speedtracker.runTest(profileName).then(response => {
    console.log(JSON.stringify(response))
  }).catch(err => {
    ErrorHandler.log(err)
    console.log(JSON.stringify(err))
  })
}

testHandler({
  user: argv.user,
  repo: argv.repo,
  branch: argv.branch,
  profile: argv.profile
});

// ------------------------------------
// Basic error logging
// ------------------------------------

process.on('unhandledRejection', (reason, promise) => {
  if (reason) {
    ErrorHandler.log(reason)
  }
})
