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
 * @module zippie-utils/dashboard
 */

const axios = require('axios')
let __uri = 'https://settings.zippie.org'

function setUri(uri) {
  __uri = uri
  return this
}

function setEnv(env) {
  if (env === 'dev') {
    __uri = 'https://settings.dev.zippie.org'
  } else if (env === 'testing') {
    __uri = 'https://settings.testing.zippie.org'
  } else {
    __uri = 'https://settings.zippie.org'
  }
  return this
}

async function getDashboardTokenInfo() {
    const response = await axios.get(__uri + '/applications.json?xhr', {})
    
    if ('error' in response) throw response.error
    return response.data
}

module.exports = { 
  setUri,
  setEnv,
  getDashboardTokenInfo,
}