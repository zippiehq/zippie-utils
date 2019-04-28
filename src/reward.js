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
 * @module zippie-utils/reward
 */

const axios = require('axios')
const shajs = require('sha.js')

let __uri = 'https://rewardapi-kovan.zippie.org'
let __prefix = ''
let __privateKey = ''
let __apiKey = ''

function init(prefix, privateKey, apiKey, uri) {
  __prefix = prefix
  __privateKey = privateKey
  __apiKey = apiKey
  __uri = uri || __uri
}

function sha256hash(message) {
  const buf = Buffer.from(message, 'hex')
  const hash = shajs('sha256').update(buf).digest()

  return hash.toString('hex')
}

function getUserReference(userid) {
  return sha256hash(__prefix + userid)
}

/**
 * 
 * @param {*} userRef 
 * @param {*} token 
 */
async function getUserBalance(userRef, token) {
  const response = await axios.post(
    __uri + '/get_user_balance',
    {
      userid: userRef,
      token_address: token
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * 
 * @param {*} userid 
 * @param {*} token 
 */
async function getCheques(userRef, token, apiKey) {
  const response = await axios.post(
    __uri + '/get_cheques',
    {
      userid: userRef,
      token_address: token
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * 
 * @param {*} userid 
 * @param {*} token 
 */
async function createPendingCheque(userRef, token, apiKey) {
  const response = await axios.post(
    __uri + '/create_pending_cheque',
    {
      userid: userRef,
      token_address: token
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * 
 * @param {*} userRef 
 * @param {*} token 
 * @param {*} amount 
 */
async function rewardTo(userRef, token, amount) {
  const intAmount = parseInt(amount)
  const response = await axios.post(
    __uri + '/reward_to',
    {
      userid: userRef,
      token_address: token,
      reward_amount: intAmount
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * 
 * @param {*} cheque 
 */
async function markChequeClaimed(cheque) {
  const response = await axios.post(
    __uri + '/mark_cheque_claimed',
    {
      cheque
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * 
 * @param {*} userid 
 * @param {*} walletAddress 
 * @param {*} token 
 */
async function registerWallet(userRef, walletAddress, token) {
  const response = await axios.post(
    __uri + '/register_wallet',
    {
      userid: userRef,
      address: walletAddress,
      token_address: token
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

async function createReferralCode(userid, apiKey) {
  const response = await axios.post(
    __uri + '/create_referral_code',
    {
      userid:  userid,
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

async function getUserIdFromReferralCode(referral_code, apiKey) {
  const response = await axios.post(
    __uri + '/get_userid_from_referral_code',
    {
      referral_code: referral_code
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

async function getUserKey(userid, key, apiKey) {
  const response = await axios.post(
    __uri + '/get_userid_kv',
    {
      userid: userid,
      key: key
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

async function setUserKey(userid, key, value, apiKey) {
  const response = await axios.post(
    __uri + '/set_userid_kv',
    {
      userid: userid,
      key: key,
      value: value
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

module.exports = {
  init,
  getUserReference,
  getUserBalance,
  getCheques,
  createPendingCheque,
  rewardTo,
  markChequeClaimed,
  registerWallet,
  createReferralCode,
  getUserIdFromReferralCode,
  getUserKey,
  setUserKey
}