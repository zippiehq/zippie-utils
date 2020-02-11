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

 /**
 * @module zippie-utils/crdt
 */

const secp256k1 = require('secp256k1')
const permastore = require('./permastore')

function setEnv(env) {
  permastore.setEnv(env)
}

function GrowOnlySet (pubkey, signer) {
  var index  = []

  return {
    index () { return index.slice(0) },

    get (cid) {
      if (!index.includes(cid)) throw 'IndexOutOfRange'
      return permastore.fetch(cid)
    },

    insert (data) {
      return permastore.insert(data, signer)
    },

    length () {
      return index.length
    },

    async sync () {
      const remote = await permastore.list(pubkey)
      const multihashes = remote.map(i => i.split('.')[1])
      index = multihashes.filter((v, i, a) => a.indexOf(v) === i)
    }
  }
}

function TwoPhaseSet (added, removed) {
  var index = []

  return {
    index () { return index.slice(0) },

    get (cid) {
      if (!index.includes(cid)) throw 'IndexOutOfRange'
      return permastore.fetch(cid)
    },

    insert (data) {
      return added.insert(data)
    },

    async remove (cid) {
      return removed.insert(await this.get(cid))
    },

    length () { return index.length },

    async sync () {
      await Promise.all([added.sync(), removed.sync()])
      index = added.index().filter(v => !removed.index().includes(v))
    }
  }
}

module.exports = { setEnv, GrowOnlySet, TwoPhaseSet }