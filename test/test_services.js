const expect = require('chai').expect

describe ('zippie services', function () {
  require('./test_fms')
  require('./test_permastore')
  require('./test_reward')
  require('./test_airtime')
})
