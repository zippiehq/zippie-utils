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
const axios = require("axios");

/**
 * @module zippie-utils/mailbox
 */

let __uri = "https://fms.zippie.org";

function setUri(uri) {
  __uri = uri;
}

/**
 * Store data in mailbox
 * @param {String} address recipient address
 * @param {Object} data recipient data
 */

async function store(address, data) {
  let req = JSON.stringify({
    recipient: address,
    data: Buffer.from(JSON.stringify(data), "utf8").toString("hex")
  });

  let res = await axios.post(__uri + "/mailbox_store", req, {
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
  if (res.status !== 200) {
    console.error("VAULT: MAILBOX Failed store query for request:", req);
    console.error("VAULT: MAILBOX Failed store query response:", res);
    return false;
  }

  let result;
  try {
    result = res.data;
  } catch (e) {
    console.error("VAULT: Error parsing MAILBOX store response:", e);
    return false;
  }

  if ("error" in result) {
    console.error("VAULT: MAILBOX store returned error:", result);
    return false;
  }

  return true;
}

/**
 * list data in mailbox
 * @param {String} address recipient address
 */

async function list(address) {
  let req = JSON.stringify({
    recipient: address
  });

  let res = await axios.post(__uri + "/mailbox_list", req, {
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });

  if (res.status !== 200) {
    console.error("VAULT: MAILBOX Failed list query for request:", req);
    console.error("VAULT: MAILBOX Failed list query response:", res);
    return false;
  }

  let result;
  try {
    result = res.data;
  } catch (e) {
    console.error("VAULT: Error parsing MAILBOX list response:", e);
    return null;
  }

  if ("error" in result) {
    console.error("VAULT: MAILBOX list returned error:", result);
    return null;
  }

  return result.response;
}

/**
 * list data in mailbox
 * @param {String} address recipient address
 * @param {String} hash recipient hash
 */
async function fetch(address, hash) {
  let req = JSON.stringify({
    recipient: address,
    hash: hash
  });

  let res = await axios.post(__uri + "/mailbox_fetch", req, {
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
  if (res.status !== 200) {
    console.error("VAULT: MAILBOX Failed fetch query for request:", req);
    console.error("VAULT: MAILBOX Failed fetch query response:", res);
    return false;
  }

  result = res.data;

  if ("error" in result) {
    console.error("VAULT: MAILBOX fetch returned error:", result);
    return null;
  }

  return result;
}

module.exports = {
  setUri,
  fetch,
  list,
  store
};
