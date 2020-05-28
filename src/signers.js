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
 * @module zippie-utils/signers
 */

const mod = require('secp256k1')

/**
 * 
 * @param {*} key 
 */
function secp256k1 (key) {
  key = (typeof key  === 'string' ? Buffer.from(key, 'hex') : key)

  return function (digest) {
    const { signature, recovery } = mod.sign(digest, key)
    return { signature: signature.toString('hex'), recovery }
  }
}

/**
 * 
 * @param {*} vault 
 * @param {*} derive 
 */
function vault (vault, derive, scope = 'default') {
  return async function (digest) {
    const { signature, recovery } = await vault.secp256k1.sign(derive, digest.toString('hex'), scope)
    return { signature, recovery }
  }
}

module.exports = { secp256k1, vault }