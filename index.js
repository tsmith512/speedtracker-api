'use strict'

const config = require('./config')
const ErrorHandler = require('./lib/ErrorHandler')
const GitHub = require('./lib/GitHub')
const SpeedTracker = require('./lib/SpeedTracker')


// ------------------------------------
// GitHub
// ------------------------------------

const github = new GitHub()

github.authenticate(config.get('githubToken'))

// ------------------------------------
// DB connection
// @TODO: No Dataabse or Scheduler init here, which only leaves
// opening the Express server to listen on the config port, which was originally
// in the database connection callback.
// ------------------------------------

server.listen(config.get('port'), () => {
  console.log(`(*) Server listening on port ${config.get('port')}`)
})

// ------------------------------------
// Endpoint: Test
// ------------------------------------

const testHandler = (req, res) => {
  const blockList = config.get('blockList').split(',')

  // Abort if user is blocked
  if (blockList.indexOf(req.params.user) !== -1) {
    ErrorHandler.log(`Request blocked for user ${req.params.user}`)

    return res.status(429).send()
  }

  const speedtracker = new SpeedTracker({
    branch: req.params.branch,
    key: req.query.key,
    remote: github,
    repo: req.params.repo,
    user: req.params.user
  })

  let profileName = req.params.profile

  speedtracker.runTest(profileName).then(response => {
    res.send(JSON.stringify(response))
  }).catch(err => {
    ErrorHandler.log(err)

    res.status(500).send(JSON.stringify(err))
  })
}

server.get('/v1/test/:user/:repo/:branch/:profile', testHandler)
server.post('/v1/test/:user/:repo/:branch/:profile', testHandler)

// ------------------------------------
// Endpoint: Catch all
// ------------------------------------

server.all('*', (req, res) => {
  const response = {
    success: false,
    error: 'INVALID_URL_OR_METHOD'
  }

  res.status(404).send(JSON.stringify(response))
})

// ------------------------------------
// Basic error logging
// ------------------------------------

process.on('unhandledRejection', (reason, promise) => {
  if (reason) {
    ErrorHandler.log(reason)
  }
})
