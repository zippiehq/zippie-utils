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
 * reward.rewardTo(userRef, 'reward_token', 'You Received a Reward')
 * 
 */

const axios = require('axios')
const shajs = require('sha.js')

let __uri = 'https://zippie-rewardapi.zippie.com'
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
  return this
}

/**
 * Set Reward Service URI based on environment
 * @param {String} env environment
 */
function setEnv(env) {
  if (env === 'dev' || env === 'development') {
    __uri ='https://zippie-rewardapi.dev.zippie.com'
  } else if (env === 'testing') {
    __uri = 'https://zippie-rewardapi.testing.zippie.com'
  } else {
    __uri = 'https://zippie-rewardapi.zippie.com'
  }
  return this
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
 * @param {String} message display message for transaction
 */
async function createPendingCheque(userRef, token, message) {
  const response = await axios.post(
    __uri + '/create_pending_cheque',
    {
      userid: userRef,
      token_address: token,
      message
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
 * @param {String} message reward description message, maximum 100 characters
 * @param {JSON} metadata additional metadata about the reward
 */
async function rewardTo(userRef, token, amount, message, metadata) {
  const intAmount = parseInt(amount)
  const response = await axios.post(
    __uri + '/reward_to',
    {
      userid: userRef,
      token_address: token,
      reward_amount: intAmount,
      reward_message: message,
      reward_metadata: metadata
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

async function rewardMany(rewardInfo, token, message) {
  const response = await axios.post(
    __uri + '/reward_many',
    {
      reward_info: rewardInfo,
      token_address: token,
      reward_message: message
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Mark a cheque as claimed
 * @param {String} cheque cheque reference
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
 * @param {String} referral_code referral code generated by createReferralCode
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
 * @param {String} key index key
 * @param {String} value value to be stored
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

/**
 * Create a One Time Password for phone number verification
 * @param {String} phonenumber Phone number to verify
 * @param {String} message Message for the OTP SMS
 * @param {String} referralCode Code for referral
 * @param {String} customer Zippie Project ID
 */
async function createOTP(phonenumber, message, referralCode, customer) {
  const response = await axios.post(
    __uri + '/create_otp',
    {
      phonenumber,
      message,
      referralCode,
      customer
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Resends an One Time Password in case of non-delivery
 * @param {String} phonenumber Phone number to verify 
 * @param {String} message Message for the OTP SMS 
 * @param {String} customer Zippie Project ID
 */
async function resendOTP(phonenumber, message, customer) {
  const response = await axios.post(
    __uri + '/resend_otp',
    {
      phonenumber,
      message,
      customer
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Submits the One Time Password recieved for verificaiton
 * @param {String} phonenumber Phone number to verify  
 * @param {String} otpCode OTP received by SMS
 * @param {String} customer zippie project id
 */
async function submitOTP(phonenumber, otpCode, customer) {
  const response = await axios.post(
    __uri + '/submit_otp',
    {
      phonenumber,
      otp: otpCode,
      customer
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Checks to see if a phone number has passed verification
 * @param {String} phonenumber Phone number to check
 */
async function checkPhoneNumber(phonenumber) {
  const response = await axios.post(
    __uri + '/check_phone_number',
    {
      phonenumber
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Set a phone number to claimed
 * @param {String} phonenumber phone number to finish referral process
 */
async function finishReferral(phonenumber) {
  const response = await axios.post(
    __uri + '/finish_referral',
    {
      phonenumber
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Queue a reward to be released later
 * this will show up in the users transactions
 * but cannot be used until released or expiry
 * 
 * @param {String} userRef secure user reference
 * @param {String} amount amount to reward
 * @param {String} tokenAddress token to reward
 * @param {String} message message for user
 * @param {Date} expiry when the condition will expire
 */
async function queuePendingReward(userRef, amount, tokenAddress, message, expiry) {
  const response = await axios.post(
    __uri + '/queue_pending_reward',
    {
      userid: userRef,
      reward_amount: amount,
      token_address: tokenAddress,
      reward_message: message,
      expiry
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * List all the pending rewards for a user
 * 
 * @param {String} userRef secure user reference
 * @param {String} tokenAddress token to list
 */
async function getPendingRewards(userRef, tokenAddress) {
  const response = await axios.post(
    __uri + '/get_pending_rewards',
    {
      userid: userRef,
      tokenAddress
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Releases a pending reward allocated with queuePendingReward
 * 
 * @param {String} userRef secure user reference
 * @param {String} rewardId reward identifier
 */
async function releasePendingReward(userRef, rewardId) {
  const response = await axios.post(
    __uri + '/release_pending_reward',
    {
      userid: userRef,
      rewardId
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Cancels a pending reward allocated with queuePendingReward
 * 
 * @param {String} userRef secure user reference
 * @param {String} rewardId reward identifier
 */
async function cancelPendingReward(userRef, rewardId) {
  const response = await axios.post(
    __uri + '/cancel_pending_reward',
    {
      userid: userRef,
      rewardId
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * Send generic event to reward api
 * Events and actions can be defined in the rewards dashboard
 * @param {JSON} jsonData JSON Encoded event data
 */
async function sendEvent(jsonData) {
  const response = await axios.post(
    __uri + '/event',
  jsonData,
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

module.exports = {
  init,
  setEnv,
  getUserReference,
  sendEvent,
  getUserBalance,
  getCheques,
  createPendingCheque,
  rewardTo,
  markChequeClaimed,
  registerWallet,
  createReferralCode,
  getUserIdFromReferralCode,
  getUserKey,
  setUserKey,
  createOTP,
  resendOTP,
  submitOTP,
  checkPhoneNumber,
  finishReferral,
  queuePendingReward,
  getPendingRewards,
  releasePendingReward,
  cancelPendingReward,
  rewardMany
}