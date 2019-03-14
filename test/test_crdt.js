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

const signer = require('../src/signers').secp256k1
const crdt = require('../src/crdt')

describe('test: crdt gset', function () {
  const key = crypto.randomBytes(32)
  const gset = crdt.GrowOnlySet(secp256k1.publicKeyCreate(key), signer(key))

  it('list index', function (done) {
    gset.sync()
      .then(() => {
        expect(gset.index().length).to.eq(0)
        done()    
      })
  })

  it('insert data', function (done) {
    gset.insert('TEST')
      .then(r => {
        expect(r).to.include.keys(['status', 'path'])
        expect(r.status).to.eq('ok')
        done()
      })
  })

  it('list index', function (done) {
    gset.sync()
      .then(() => {
        expect(gset.index().length).to.eq(1)
        done()
      })
  })

  it('insert data (duplicate)', function (done) {
    gset.insert('TEST')
      .then(r => {
        expect(r).to.include.keys(['status', 'path'])
        expect(r.status).to.eq('ok')
        done()
      })
  })

  it('list index (check no duplicate)', function (done) {
    gset.sync()
      .then(() => {
        expect(gset.index().length).to.eq(1)
        done()
      })
  })

  it('get data invalid cid', function (done) {
    gset.sync()
      .then(() => gset.get('a'))
      .then(() => done('FAIL'))
      .catch(e => {
        expect(e).to.eq('IndexOutOfRange')
        done()
      })
  })

  it('get data with non-indexed cid', function (done) {
    gset.sync()
      .then(() => gset.get('QmcziropQqSUDbNfAkYBwsLQXdEVf9N88Nqz4K1dfKfQGL'))
      .then(() => done('FAIL'))
      .catch(e => {
        expect(e).to.eq('IndexOutOfRange')
        done()
      })
  })

  it('get data with valid cid', function (done) {
    gset.sync()
      .then(() => gset.get('QmcziropQqSUDbNfAkYBwsLQXdEVf9N88Nqz4K1dfKeQGL'))
      .then(r => {
        expect(r.toString()).to.eq('TEST')
        done()
      })
      .catch(e => done(e))
  })
})

describe('test: crdt 2pset', function () {
  const akey = crypto.randomBytes(32)
  const bkey = crypto.randomBytes(32)
  const added = crdt.GrowOnlySet(secp256k1.publicKeyCreate(akey), signer(akey))
  const removed = crdt.GrowOnlySet(secp256k1.publicKeyCreate(bkey), signer(bkey))
  const set = crdt.TwoPhaseSet(added, removed)

  this.timeout(5000)

  it('list index', function (done) {
    set.sync()
      .then(() => {
        expect(set.index().length).to.eq(0)
        done()    
      })
  })

  it('insert data', function (done) {
    set.insert('TEST')
      .then(r => {
        expect(r).to.include.keys(['status', 'path'])
        expect(r.status).to.eq('ok')
        done()
      })
  })

  it('list index', function (done) {
    set.sync()
      .then(() => {
        expect(set.index().length).to.eq(1)
        done()
      })
  })

  it('insert data (duplicate)', function (done) {
    set.insert('TEST')
      .then(r => {
        expect(r).to.include.keys(['status', 'path'])
        expect(r.status).to.eq('ok')
        done()
      })
  })

  it('list index (check no duplicate)', function (done) {
    set.sync()
      .then(() => {
        expect(set.index().length).to.eq(1)
        done()
      })
  })

  it('insert data', function (done) {
    set.insert('TEST2')
      .then(r => {
        expect(r).to.include.keys(['status', 'path'])
        expect(r.status).to.eq('ok')
        done()
      })
  })

  it('list index', function (done) {
    set.sync()
      .then(() => {
        expect(set.index().length).to.eq(2)
        done()
      })
  })

  it('remove data', function (done) {
    set.sync()
      .then(() => set.remove(set.index()[1]))
      .then(r => {
        expect(r).to.include.keys(['status', 'path'])
        expect(r.status).to.eq('ok')
      })
      .then(() => set.sync())
      .then(() => {
        expect(set.index().length).to.eq(1)
        done()
      })
  })

  it('list index', function (done) {
    set.sync()
      .then(() => {
        expect(set.index().length).to.eq(1)
        done()
      })
  })

  it('get data invalid cid', function (done) {
    set.sync()
      .then(() => set.get('a'))
      .then(() => done('FAIL'))
      .catch(e => {
        expect(e).to.eq('IndexOutOfRange')
        done()
      })
  })

  it('get data with non-indexed cid', function (done) {
    set.sync()
      .then(() => set.get('QmcziropQqSUDbNfAkYBwsLQXdEVf9N88Nqz4K1dfKfQGL'))
      .then(() => done('FAIL'))
      .catch(e => {
        expect(e).to.eq('IndexOutOfRange')
        done()
      })
  })

  it('get data with valid cid', function (done) {
    set.sync()
      .then(() => set.get('QmcziropQqSUDbNfAkYBwsLQXdEVf9N88Nqz4K1dfKeQGL'))
      .then(r => {
        expect(r.toString()).to.eq('TEST')
        done()
      })
      .catch(e => done(e))
  })
})