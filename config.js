var convict = require('convict')

var conf = convict({
  env: {
    doc: 'The applicaton environment',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind',
    format: 'port',
    default: 0,
    env: 'PORT'
  },
  wpt: {
    key: {
      doc: 'WPT API key',
      format: String,
      default: null,
      env: 'WPT_KEY'
    },
    url: {
      doc: 'WPT API URL',
      format: String,
      default: 'https://www.webpagetest.org',
      env: 'WPT_URL'
    }
  },
  githubToken: {
    doc: 'GitHub access token',
    format: String,
    default: null,
    env: 'GITHUB_TOKEN'
  },
  email: {
    sparkboxApiKey: {
      doc: 'Sparkbox API key',
      format: String,
      default: null,
      env: 'SPARKBOX_API_KEY'
    }
  },
  raygunApiKey: {
    doc: 'Raygun API key',
    format: String,
    default: '',
    env: 'RAYGUN_APIKEY'
  },
  blockList: {
    doc: 'Comma-separated list of GitHub usernames to block',
    format: String,
    default: '',
    env: 'BLOCK_LIST'
  },
  pagespeedApiKey: {
    doc: 'Google PageSpeed Insights API key',
    format: String,
    default: '',
    env: 'PAGESPEED_API_KEY'
  }
})

try {
  var env = conf.get('env')

  conf.loadFile(__dirname + '/config.' + env + '.json')
  conf.validate()

  console.log('(*) Local config file loaded')
} catch (e) {

}

module.exports = conf
