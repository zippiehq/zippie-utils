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

const permastore = require('./permastore')
const utility = require('./utility')

async function possiblyDecrypt(data, aeskey) {
    if (data.encrypted) {
        if (data.encrypted.cipher === 'aes-128-cbc') {
            var plaintext = utility.aes128cbcDecrypt(Buffer.from(data.encrypted.ciphertext, 'hex'), aeskey, Buffer.from(data.encrypted.iv, 'hex'))
            return JSON.parse(plaintext.toString('utf8'))
        } else {
            throw 'unknown cipher'
        }
    } else {
        return data
    }
}

async function listFeed(pubkey, aeskey = null) {
    let plist = await permastore.list(pubkey)
    let result = []
    for (var element of plist) {
        const spl = element.split('.')
        const cid = spl[1]
        const proof = spl[2]
        // permastore.prove(pubkey, cid, proof)
        const data = await permastore.fetch(cid)
        var parsed = JSON.parse(Buffer.from(data).toString('utf8'))
        try {
            if (aeskey) {
              parsed = await possiblyDecrypt(parsed, aeskey)
            }
            result.push(parsed)
        } catch (err) {
            // don't worry about errors, just don't forward them
        }
    }
    return result
}

async function publishToFeedRaw(data, signer) {
    return await permastore.insert(data, signer)
}

async function publishToFeedPlaintext(data, signer) {
    return await publishToFeedRaw(Buffer.from(JSON.stringify(data)), signer)
}

async function publishToFeedEncrypted(data, signer, aeskey) {
    const iv = utility.randomKey(16)
    const res = utility.aes128cbcEncrypt(Buffer.from(JSON.stringify(data)), aeskey, iv)
    const json = {
        encrypted: {
            cipher: 'aes-128-cbc',
            iv: iv.toString('hex'),
            ciphertext: res.toString('hex')
        }
    }
    return await publishToFeedPlaintext(json, signer)
}

module.exports = { listFeed, publishToFeedPlaintext, publishToFeedRaw, publishToFeedEncrypted}