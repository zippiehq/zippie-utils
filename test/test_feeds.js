/*
 * Copyright (c) 2019 Zippie Ltd.
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

const signer = require('../src/signers').secp256k1
const feeds = require('../src/feeds')

describe('test: feeds', function () {
  const key = crypto.randomBytes(32)
  const aeskey = crypto.randomBytes(16)
  const badaeskey = crypto.randomBytes(16)
  const pubkey = secp256k1.publicKeyCreate(key, true)
  const test1 = { hello: 'hello1' } 
  const test2 = { hello: 'hello2' }
  it('publishes plaintext object correctly', function (done) {
    feeds.publishToFeedPlaintext(test1, signer(key)).then((result) => {
      feeds.listFeed(pubkey).then((result) => {
        expect(result.length).to.equal(1)
        expect(JSON.stringify(result[0])).to.equal(JSON.stringify(test1))
        done()
      })
    })
  })
  it('published encrypted object correctly', function (done) {
    feeds.publishToFeedEncrypted(test2, signer(key), aeskey).then((result) => {
      feeds.listFeed(pubkey, aeskey).then((result) => {
        expect(result.length).to.equal(2)
        expect(JSON.stringify(result[0])).to.equal(JSON.stringify(test1))
        expect(JSON.stringify(result[1])).to.equal(JSON.stringify(test2))
        done()
      })
    })
  })
  it('deal with bad decryption correctly', function (done) {
    feeds.listFeed(pubkey, badaeskey).then((result) => {
      expect(result.length).to.equal(1)
      expect(JSON.stringify(result[0])).to.equal(JSON.stringify(test1))
      done()
    })
  })
})
