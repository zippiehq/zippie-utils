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
 * @module zippie-utils/permastore
 */

const CID = require('cids')
const axios = require('axios')
const shajs = require('sha.js')

const util = require('./utility')
const Unixfs = require('ipfs-unixfs')
const dagPB = require('ipld-dag-pb')

let __uri = "https://fms.zippie.com";
let __mirroruri = "https://permastore2.zippie.com"

function setUri(uri) {
  __uri = uri
  return this
}

function setMirrorUri(mirroruri) {
  __mirroruri = mirroruri;
  return this
}

function setEnv(env) {
  if (env === 'dev' || env === 'development') {
    __uri = 'https://fms.dev.zippie.com'
    __mirroruri = 'https://permastore2.dev.zippie.com'
  } else if (env === 'testing') {
    __uri = 'https://fms.testing.zippie.com'
    __mirroruri = 'https://permastore2.testing.zippie.com'
  } else {
    __uri = 'https://fms.zippie.com'
    __mirroruri = 'https://permastore2.zippie.com'
  }
  return this
}

async function recreate_cid (buf) {
  var ufs = new Unixfs('file', buf)
  const dagNode = dagPB.DAGNode.create(ufs.marshal())
  const cid = await dagPB.util.cid(dagPB.util.serialize(dagNode), {cidVersion: 0})
    
  const multihash = cid.toBaseEncodedString('base58btc')  
  return multihash
}

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

const fetchData = async (url, cache = 'default') => {
  if(isBrowser) {
    const response = await fetch(url, { responseType: 'arraybuffer', cache: cache})
    const buffer = await response.arrayBuffer()
    return buffer;
  }

  const response = await axios.get(url, { responseType: 'arraybuffer' })
  if ('error' in response.data) throw response.data.error
  return response.data

}

/**
 * Fetch object from IPFS service
 * @param {String} cid Multihash of target object to retreive
 */
async function fetchPerma (cid) {
  const uri = __mirroruri + '/ipfs/' + cid
  try{
    const response = await fetchData(uri, 'force-cache')

    const fetchedcid = await recreate_cid(Buffer.from(response))

    if (fetchedcid !== cid) {
      throw 'ERROR: Downloaded data CID (' + fetchedcid + ') does not match CID requested (' + cid + ')'
    }
  
    return response
  } catch (e) {
    console.error(e)
  }

}

/**
 * Encrypt Object as JSON Encoded String
 * With random Key and IV
 * @param {Object} data 
 * @returns {data, keyiv} data: buffer with encrypted data keyiv: bs58 encoded keyiv string
 */
async function encryptObject (data) {
  var dataJson = JSON.stringify(data)
  var data2 = Buffer.from(dataJson)
  var key = util.randomKey(16)
  var iv = util.randomKey(16)

  const encrypted = util.aes128cbcEncrypt(data2, key, iv)
  const keyiv = util.bs58KeyIvEncode(key, iv)

  return {data: encrypted, keyiv}
}

/**
 * Decrypt Object encrypted with EncryptObject
 * @param {Buffer} data encrypted data buffer
 * @param {String} keyiv bs58 encoded keyiv string
 */
async function decryptObject (data, keyiv) {
  const {key, iv} = util.bs58KeyIvDecode(keyiv)
  const decryptedBuffer = util.aes128cbcDecrypt(data, key, iv)

  const decrypted = JSON.parse(decryptedBuffer.toString())

  return decrypted
}

/**
 * Store object into IPFS service.
 * @param {Buffer} data Object to store in IPFS
 */
async function store (data) {
  data = (typeof data === 'string' ? Buffer.from(data) : data).toString('hex')
  const uri = __uri + '/ipfs_store_v2'
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

  const uri = __uri + '/perma_list_v2'
  const response = await axios.post(uri, { pubkey })
  if ('error' in response.data) throw response.data.error
  return response.data.response
}

/**
 * List references in permastore V2 index for multiple pubkeys
 * @param {Buffer|String} pubkeys secp256k1 list of public key to query
 */
async function listBatched (pubkeys) {
  const pubkeys2 = pubkeys.map(pubkey => util.convertPublicKey(pubkey, true).toString('hex'))
  const uri = __uri + '/perma_list_batched_v2'
  const response = await axios.post(uri, { pubkeys: pubkeys2 })
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
  const uri = __uri + '/perma_store_v2'

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

/**
 * Store a CID in IPFS and insert a reference into permastore V2 index
 * using supplied function to generate auth signature.
 * @param {String} cid CID to reference in index
 * @param {SignerFunc} func Function used to generate auth signature
 */
async function insertCID (multihash, func) {
  const uri = __uri + '/perma_store_v2'

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

/**
 * 
 * @param {String} entry // Permastore Entry
 */
async function fetchEntry (entry) {
  const s = entry.split('.')
  const proof = s[2]
  const cid = s[1]


  const proof_data = await fetchPerma(proof)
  // XXX: Verify Proof


  const cid_data = await fetchPerma(cid)

  return cid_data
}

module.exports = {
  setUri,
  setMirrorUri,
  setEnv,
  fetch: fetchPerma,
  store,
  list,
  listBatched,
  insert,
  fetchEntry,
  insertCID,
  encryptObject,
  decryptObject
}
