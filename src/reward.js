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
 * 
 * @example
 * // Initialise Reward API
 * reward.init('secure_prefix', 'private_key', 'api_key')
 * 
 * // Create a secure user reference
 * const userRef = reward.getUserReference('dave@example.com')
 * 
 * // Check balance
 * const balance = reward.getUserBalance(userRef, 'reward_token')
 * 
 * // Add to balance
 * reward.rewardTo(userRef, 'reward_token')
 * 
 */

const axios = require('axios')
const shajs = require('sha.js')

let __uri = 'https://goerli-rewardapi.zippie.org'
let __prefix = ''
let __privateKey = ''
let __apiKey = ''

/**
 * Initialise Reward API with common values
 * @param {String} prefix secure salt
 * @param {*} privateKey 
 * @param {String} apiKey zippie service api key
 * @param {String} uri Reward Service URI
 */
function init(prefix, privateKey, apiKey, uri) {
  __prefix = prefix
  __privateKey = privateKey
  __apiKey = apiKey
  __uri = uri || __uri
}

/**
 * Create a hash digest of a message
 * @private
 * @param {String} message 
 * @returns {String} hex encoded hash
 */
function sha256hash(message) {
  const buf = Buffer.from(message)
  const hash = shajs('sha256').update(buf).digest()

  return hash.toString('hex')
}

/**
 * Converts a local User Id into a secure value suitible for
 * use with the Reward API
 * @param {String} userid local user id
 * @returns {String} hex encoded secure user reference
 */
function getUserReference(userid) {
  return sha256hash(__prefix.toString() + userid.toString())
}

/**
 * Gets the current reward balance for a user
 * @param {String} userRef secure user reference
 * @param {String} token reward token address
 * @returns {String} balance
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
 * @param {String} userRef secure user reference
 * @param {String} token reward token address
 */
async function getCheques(userRef, token) {
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
 * Creates a pending payment with the current balance of a reward token
 * @param {String} userRef secure user reference
 * @param {String} token reward token address
 */
async function createPendingCheque(userRef, token) {
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
 * Adds an amount to the users pending reward balance
 * @param {String} userRef secure user reference
 * @param {String} token reward token address
 * @param {String} amount token amount to add
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
 * Mark a cheque as claimed
 * @param {String} cheque 
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
 * @param {String} userRef secure user reference
 * @param {String} walletAddress users wallet address
 * @param {String} token reward token address
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

/**
 * Creates a unique referral code for a user
 * @param {String} userRef secure user reference
 */
async function createReferralCode(userRef) {
  const response = await axios.post(
    __uri + '/create_referral_code',
    {
      userid:  userRef,
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Retrieves a secure user reference for a given referral code
 * @param {String} referral_code 
 */
async function getUserIdFromReferralCode(referral_code) {
  const response = await axios.post(
    __uri + '/get_userid_from_referral_code',
    {
      referral_code: referral_code
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Gets a value for a stored key
 * @param {String} userRef secure user reference
 * @param {String} key value to retrieve
 */
async function getUserKey(userRef, key) {
  const response = await axios.post(
    __uri + '/get_userid_kv',
    {
      userid: userRef,
      key: key
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Sets a Key Value pair for a user
 * @param {String} userRef secure user reference
 * @param {String} key 
 * @param {String} value 
 */
async function setUserKey(userRef, key, value) {
  const response = await axios.post(
    __uri + '/set_userid_kv',
    {
      userid: userRef,
      key: key,
      value: value
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
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