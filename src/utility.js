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
 * @module zippie-utils/utility
 */

const secp256k1 = require('secp256k1')
const crypto = require('crypto')
const bs58 = require('bs58')

/**
 * Encrypt Plaintext with Key and IV
 * @param {BinaryLike} plaintext data to encrypt
 * @param {CipherKey} key Private key
 * @param {BinaryLike} iv Initialisation Vector
 * @returns {Buffer} Encrypted Cipher text
 */
function aes128cbcEncrypt(plaintext, key, iv) {
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv)
    const firstChunk = cipher.update(plaintext)
    const secondChunk = cipher.final()
    return Buffer.concat([firstChunk, secondChunk])
  }

  /**
   * Decrypt Ciphertext with Key and IV
   * @param {BinaryLike} ciphertext 
   * @param {CipherKey} key 
   * @param {BinaryLike} iv 
   * @returns {Buffer} Plaintext
   */
function aes128cbcDecrypt(ciphertext, key, iv) {
    const cipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
    const firstChunk = cipher.update(ciphertext)
    const secondChunk = cipher.final()
    return Buffer.concat([firstChunk, secondChunk])
}

 /**
 * Ensures public key parameters are in correct format.
 * @private
 * @param {Buffer|string} pubkey 
 * @returns {Buffer}
 */
function convertPublicKey (pubkey, compress = false) {
  pubkey = (typeof pubkey === 'string' ? Buffer.from(pubkey, 'hex') : pubkey)
  return secp256k1.publicKeyConvert(pubkey, compress)
}

/**
 * Get a Cryptographically secure
 * random number of byte length size
 * @param {Number} size 
 * @returns {Buffer}
 */
function randomKey(size) {
  return crypto.randomBytes(size)
}

/**
 * Encodes Key and IV into a base58 string
 * @param {Buffer} key 
 * @param {Buffer} iv 
 * @returns {String} keyiv
 */
function bs58KeyIvEncode(key,iv) {
  const keyiv = Buffer.concat([key, iv])
  const encoded = bs58.encode(keyiv)

  return encoded
}

/**
 * Decodes base58 string into Key and IV
 * @param {String} keyiv 
 * @returns {Object} {key, iv}
 */
function bs58KeyIvDecode(keyiv) {
  const decoded = bs58.decode(keyiv)

  const key = decoded.slice(0,16)
  const iv = decoded.slice(16,32)

  return {key, iv}
}

module.exports = { 
  convertPublicKey, 
  aes128cbcDecrypt, 
  aes128cbcEncrypt, 
  randomKey,
  bs58KeyIvEncode,
  bs58KeyIvDecode 
}