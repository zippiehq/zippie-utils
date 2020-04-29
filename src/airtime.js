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
 * @module zippie-utils/airtime
 */

const axios = require('axios')
let __uri = 'https://zippie-airtime-backend.zippie.com'

function setUri(uri) {
  __uri = uri
  return this
}

/**
 * Set Airtime Service URI based on environment
 * @param {String} env environment
 */
function setEnv(env) {
  if (env === 'dev' || env === 'development') {
    __uri = 'https://zippie-airtime-backend.dev.zippie.com'
  } else if (env === 'testing') {
    __uri = 'https://zippie-airtime-backend.testing.zippie.com'
  } else {
    __uri = 'https://zippie-airtime-backend.zippie.com'
  }
  return this
}

/**
 * Gets available country / operator details
 * @param {String} operator_slug optional: operator id
 * @returns {JSON} inventory information
 */
async function getInventory(operator_slug) {
    const response = await axios.post(__uri + '/inventory', {
        slug: operator_slug
      })
    
    if ('error' in response.data) throw response.data.error
    return response.data
}

/**
 * Checks if a phone number is valid for top up
 * and returns operator information
 * @param {String} phonenumber 
 * @param {String} operator_slug 
 * @returns {JSON} operator information
 */
async function checkPhoneNumber(phonenumber, operator_slug) {
    const response = await axios.post(__uri + '/check_phone_number', {
        phonenumber,
        slug: operator_slug
      })
    
    if ('error' in response.data) throw response.data.error
    return response.data
}

/**
 * Topup a number with tokens from a blank cheque
 * @param {String} blankcheck 
 * @param {String} phonenumber 
 * @param {String} operator_slug 
 * @param {Boolean} testing 
 * @returns {JSON} status and order id
 */
async function payForTopup(blankcheck, phonenumber, operator_slug, testing) {
    const response = await axios.post(__uri + '/pay_for_topup', {
        blankcheck,
        phonenumber,
        slug: operator_slug,
        testing
      })
    
    if ('error' in response.data) throw response.data.error
    return response.data
}

/**
 * Check order status
 * @param {String} orderId order id
 * @returns {JSON} order information
 */
async function checkOrderStatus(orderId) {
    const response = await axios.post(__uri + '/check_order', {
        orderId
      })
    
    if ('error' in response.data) throw response.data.error
    return response.data
}

async function getAllowedTokens() {
  const response = await axios.get(__uri + '/allowed_tokens')
  return response.data
}

module.exports = {
  setUri,
  setEnv,
  getInventory,
  checkPhoneNumber,
  payForTopup,
  checkOrderStatus,
  getAllowedTokens
}