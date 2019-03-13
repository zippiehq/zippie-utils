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

const fms = require('../src/fms')
const signer = require('../src/signers').secp256k1

describe('test: fms', function () {
  const authkey = crypto.randomBytes(32)
  const revokekey = crypto.randomBytes(32)

  this.timeout(5000)

  it('store with invalid data', function (done) {
    fms.store('a', 'b', 'data')
      .then(r => {
        console.error(r)
        done('FAIL')
      })
      .catch(e => {
        done()
      })
  })

  it('store with valid (uncompressed keys) parameters', function (done) {
    const authpub = secp256k1.publicKeyCreate(authkey, false)
    const revokepub = secp256k1.publicKeyCreate(revokekey, false)

    fms.store(authpub, revokepub.toString('hex'), 'data')
      .then(r => {
        expect(r).to.have.keys(['status'])
        expect(r.status).to.equal('ok')
        done()
      })
      .catch(done)
  })

  it('store with valid (compressed keys) parameters', function (done) {
    const authpub = secp256k1.publicKeyCreate(authkey, true)
    const revokepub = secp256k1.publicKeyCreate(revokekey, true)

    fms.store(authpub.toString('hex'), revokepub, 'test')
      .then(r => {
        expect(r).to.have.keys(['status'])
        expect(r.status).to.equal('ok')
        done()
      })
      .catch(done)
  })

  it ('fetch with invalid parameter', function (done) {
    fms.fetch(signer('a'))
      .then(r => {
        done('FAIL')
      })
      .catch(e => {
        done()
      })
  })

  it ('fetch with valid authkey (Buffer) parameter', function (done) {
    fms.fetch(signer(authkey))
      .then(r => {
        expect(r.toString()).to.eq('test')
        done()
      })
      .catch(done)
  })

  it ('fetch with valid authkey (string) parameter', function (done) {
    fms.fetch(signer(authkey.toString('hex')))
      .then(r => {
        expect(r.toString()).to.eq('test')
        done()
      })
      .catch(done)
  })

  it ('revoke with invalid parameter', function (done) {
    fms.revoke(signer('a'))
      .then(r => {
        console.error(r)
        done('FAIL')
      })
      .catch(e => {
        done()
      })
  })

  it ('revoke with valid revokekey (Buffer) parameter', function (done) {
    fms.revoke(signer(revokekey))
      .then(r => {
        expect(r).to.have.keys(['status'])
        expect(r.status).to.equal('ok')
        done()
      })
      .catch(done)
  })

  it ('revoke with revoked key', function (done) {
    fms.revoke(signer(revokekey.toString('hex')))
      .then(r => {
        console.log(r)
        done('FAIL')
      })
      .catch(e => {
        expect(e).to.eq('NoSuchKey')
        done()
      })
  })

  it ('fetch with revoked key', function (done) {
    fms.fetch(signer(authkey))
      .then(r => {
        console.log(r)
        done('FAIL')
      })
      .catch(e => {
        expect(e).to.eq('NoSuchKey')
        done()
      })
  })
})