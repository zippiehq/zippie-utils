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
const __uri = 'https://kovan-reward.zippie.org/reward'

/**
 * Get payment link for reward tokens
 * @param {string} token token contract address
 * @param {String} amount  token amount
 * @param {String} message  message for payment link
 * @param {String} apiKey  zippie api key
 */
async function getRewardTokens(token, amount, message, apiKey) {
    const response = await axios.post(
        __uri,
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

  module.exports = {getRewardTokens}