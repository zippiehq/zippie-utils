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
const CID = require('cids')
const axios = require('axios')
const shajs = require('sha.js')
const secp256k1 = require('secp256k1')

const util = require('./utility')


/**
 * Fetch object from IPFS service
 * @param {String} cid Multihash of target object to retreive
 */
async function fetch (cid) {
  const uri = 'https://permastore2.zippie.org/ipfs/' + cid
  const response = await axios.get(uri, { responseType: 'arraybuffer' })
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Store object into IPFS service.
 * @param {Buffer} data Object to store in IPFS
 */
async function store (data) {
  data = (typeof data === 'string' ? Buffer.from(data) : data).toString('hex')
  const uri = 'https://fms.zippie.org/ipfs_store_v2'
  const response = await axios.post(uri, { data })
  if ('error' in response.data) throw response.data.error
  return response.data.multihash
}

/**
 * List references in permastore V2 index for pubkey
 * @param {Buffer|String} pubkey secp256k1 public key to query
 */
async function list (pubkey) {
  pubkey = util.convertPublicKey(pubkey, true).toString('hex')

  const uri = 'https://fms.zippie.org/perma_list_v2'
  const response = await axios.post(uri, { pubkey })
  if ('error' in response.data) throw response.data.error
  return response.data.response
}

/**
 * Store data in IPFS and insert a reference into permastore V2 index
 * using supplied function to generate auth signature.
 * @param {Buffer} data Object to store in IPFS and reference in index
 * @param {SignerFunc} func Function used to generate auth signature
 */
async function insert (data, func) {
  const uri = 'https://fms.zippie.org/perma_store_v2'

  const multihash = await store(data)
  const timestamp = Math.floor(Date.now() / 1000) - 1549458383

  const cid = new CID(multihash)
  const buf = Buffer.alloc(cid.buffer.length + 4, 0x00)

  cid.buffer.copy(buf, 4)
  buf.writeUInt32LE(timestamp, 0)

  const hash = shajs('sha256').update(buf).digest()
  const signature = await func(hash)

  const response = await axios.post(uri, {
    timestamp, cid: multihash, signature
  })

  if ('error' in response.data) throw response.data.error
  return response.data
}

module.exports = {
  fetch,
  store,
  list,
  insert,
}
