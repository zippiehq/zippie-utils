/*
 * Copyright (c) 2018-2019 Zippie Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
const expect = require('chai').expect

const crypto = require('crypto')
const secp256k1 = require('secp256k1')

const permastore = require('../src/permastore')
const signer = require('../src/signers').secp256k1

describe('test: permastore', function () {
  const authkey = crypto.randomBytes(32)
  var checkLater

  this.timeout(5000)

  it('store with valid parameter', function (done) {
    expect(async function () {
      const response = await permastore.store(Buffer.from('TEST'))
      expect(response).to.equal('QmcziropQqSUDbNfAkYBwsLQXdEVf9N88Nqz4K1dfKeQGL')
      done()
    }).to.not.throw()
  })

  it('fetch with invalid parameter', function (done) {
    permastore.fetch('a')
      .then(() => done('FAIL'))
      .catch(e => done())
  })

  it('fetch with valid parameter', function (done) {
    permastore.fetch('QmcziropQqSUDbNfAkYBwsLQXdEVf9N88Nqz4K1dfKeQGL')
      .then(r => {
        expect(r.toString()).to.equal('TEST')
        done()
      })
      .catch(e => done(e))
  })

  it('insert with invalid key', function (done) {
    permastore.insert(Buffer.from('TEST'), signer('a'))
      .then(r => {
        done('FAIL')
      })
      .catch(e => {
        done()
      })
  })

  it('insert with valid parameters', function (done) {
    permastore.insert(Buffer.from('TEST'), signer(authkey))
      .then(r => {
        expect(r).to.have.keys(['status', 'path'])
        checkLater = r.path.split('/')[1]
        done()
      })
      .catch(done)
  })

  it('list with invalid key', function (done) {
    permastore.list('a')
      .then(r => {
        done('FAIL')
      })
      .catch(e => {
        done()
      })
  })

  it('list with valid key', function (done) {
    permastore.list(secp256k1.publicKeyCreate(authkey, false))
      .then(r => {
        expect(r).to.include(checkLater)
        done()
      })
      .catch(done)
  })
})
