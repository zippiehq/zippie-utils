/*
 * Copyright (c) 2018 Zippie Ltd.
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
 * @module zippie-utils/fms
 */

const axios = require('axios')
const shajs = require('sha.js')

const util = require('./utility')

let __uri = 'https://fms.zippie.com'

function setUri(uri) {
  __uri = uri
  return this
}

function setEnv(env) {
  if (env === 'dev' || env === 'development') {
    __uri = 'https://fms.dev.zippie.com'
  } else if (env === 'testing') {
    __uri = 'https://fms.testing.zippie.com'
  } else {
    __uri = 'https://fms.zippie.com'
  }
  return this
}

/**
 * 
 * @param {Buffer|string} authpubkey 
 * @param {Buffer|string} revokepubkey 
 * @param {Buffer|string} data 
 */
async function store (authpubkey, revokepubkey, data) {
  data = (typeof data === 'string' ? Buffer.from(data) : data).toString('hex')

  authpubkey = util.convertPublicKey(authpubkey).toString('hex')
  revokepubkey = util.convertPublicKey(revokepubkey).toString('hex')

  const response = await axios.post(__uri + '/store', {
    authpubkey,
    revokepubkey,
    data
  })

  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * 
 * @param {SignerFunc} func
 */
async function fetch (func) {
  // Timestamp used to generate signature for device verification on FMS
  const timestamp = Date.now().toString()
  const digest = shajs('sha256').update(timestamp).digest()

  const { signature: sig, recovery } = await func(digest)

  const response = await axios.post(__uri + '/fetch', {
    timestamp, sig, recovery
  })

  if ('error' in response.data) throw response.data.error.code
  return Buffer.from(response.data.data, 'hex')
}

/**
 * 
 * @param {SignerFunc} func
 */
async function fetchJson (func) {
  // Timestamp used to generate signature for device verification on FMS
  const timestamp = Date.now().toString()
  const digest = shajs('sha256').update(timestamp).digest()

  const { signature: sig, recovery } = await func(digest)

  const response = await axios.post(__uri + '/fetch', {
    timestamp, sig, recovery
  })

  if ('error' in response.data) throw response.data.error.code
  return response.data
}

/**
 * 
 * @param {SignerFunc} func
 */
async function revoke (func) {
  // Timestamp used to generate signature for device verification on FMS
  const timestamp = Date.now().toString()
  const digest = shajs('sha256').update(timestamp).digest()

  const { signature: sig, recovery } = await func(digest)

  // Perform XHR request to FMS to get remote slice.
  const response = await axios.post(__uri + '/revoke', {
    timestamp, sig, recovery,
  })

  if ('error' in response.data) throw response.data.error.code
  return response.data
}

module.exports = {
  setUri,
  setEnv,
  store,
  fetch,
  fetchJson,
  revoke,
}