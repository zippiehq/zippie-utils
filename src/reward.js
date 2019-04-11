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
const __uri = 'https://kovan-reward.zippie.org'
const __uriv2 = 'https://rewardapi-kovan.zippie.org'


/**
 * Get payment link for reward tokens
 * @param {string} token token contract address
 * @param {String} amount  token amount
 * @param {String} message  message for payment link
 * @param {String} apiKey  zippie api key
 */
async function getRewardTokens(token, amount, message, apiKey) {
    const response = await axios.post(
        __uri + '/reward',
      {
        token: token,
        amount: amount,
        message: message
      },
      { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': apiKey }}
    )

    if ('error' in response.data) throw response.data.error
    return response.data.url
  }

  function sha256hash(userid) {
    const buf = Buffer.from(userid, 'hex')
    const hash = shajs('sha256').update(buf).digest()

    return hash.toString('hex')
  }

/**
 * 
 * @param {*} userid 
 * @param {*} token 
 */
async function getUserBalance(userid, token, apiKey) {
  const userRef = sha256hash(userid)
  const response = await axios.post(
    __uriv2 + '/get_user_balance',
    {
      userid: userRef,
      token_address: token
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * 
 * @param {*} userid 
 * @param {*} token 
 */
async function getCheques(userid, token, apiKey) {
  const userRef = sha256hash(userid)
  const response = await axios.post(
    __uriv2 + '/get_cheques',
    {
      userid: userRef,
      token_address: token
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * 
 * @param {*} userid 
 * @param {*} token 
 */
async function createPendingCheque(userid, token, apiKey) {
  const userRef = sha256hash(userid)
  const response = await axios.post(
    __uriv2 + '/create_pending_cheque',
    {
      userid: userRef,
      token_address: token
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * 
 * @param {*} userid 
 * @param {*} token 
 * @param {*} amount 
 */
async function rewardTo(userid, token, amount, apiKey) {
  const userRef = sha256hash(userid)
  const intAmount = parseInt(amount)
  const response = await axios.post(
    __uriv2 + '/reward_to',
    {
      userid: userRef,
      token_address: token,
      reward_amount: intAmount
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

/**
 * 
 * @param {*} cheque 
 */
async function markChequeClaimed(cheque, apiKey) {
  const response = await axios.post(
    __uriv2 + '/mark_cheque_claimed',
    {
      cheque
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': apiKey }}
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
async function registerWallet(userid, walletAddress, token, apiKey) {
  const userRef = sha256hash(userid)
  const response = await axios.post(
    __uriv2 + '/register_wallet',
    {
      userid: userRef,
      address: walletAddress,
      token_address: token
    },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': apiKey }}
  )

  if ('error' in response.data) throw response.data.error
  return response.data
}

module.exports = {
  getRewardTokens,
  getUserBalance,
  getCheques,
  createPendingCheque,
  rewardTo,
  markChequeClaimed,
  registerWallet
}