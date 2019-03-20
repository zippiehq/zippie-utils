const expect = require('chai').expect

describe ('zippie-utils', function () {
  require('./test_crdt')
  require('./test_fms')
  require('./test_permastore')
  require('./test_feeds')
})