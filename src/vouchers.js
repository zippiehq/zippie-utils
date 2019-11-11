const axios = require('axios')

let __uri = 'https://goerli-rewardapi.zippie.org'
let __apiKey = ''

function init(uri, apiKey) {
    __uri = uri
    __apiKey = apiKey
}

async function createVoucherType(name, description, currency, valueInPoints, valueInCurrency, shopUrl, voucherUrl, expires) {
    const response = await axios.post(
      __uri + '/vouchers/create_type',
    {
        voucher_name: name,
        voucher_description: description,
        voucher_currency: currency,
        voucher_value_in_points: valueInPoints,
        voucher_value_in_currency: valueInCurrency,
        external_shop_url: shopUrl,
        external_voucher_url: voucherUrl,
        voucher_expires: expires
    },
      { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
    )
    if ('error' in response.data) throw response.data.error
    return response.data
}

async function addVoucherCodes(voucherType, voucherCodes) {
    const response = await axios.post(
      __uri + '/vouchers/add_codes',
    {
      voucher_type: voucherType,
      voucher_codes: voucherCodes
    },
      { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
    )
    if ('error' in response.data) throw response.data.error
    return response.data
}

async function createVoucherCodes(voucherType, count) {
    const response = await axios.post(
      __uri + '/vouchers/create_codes',
    {
      voucher_type: voucherType,
      voucher_count: count
    },
      { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
    )
    if ('error' in response.data) throw response.data.error
    return response.data
}

async function getVoucherTypes() {
  const response = await axios.post(
    __uri + '/vouchers/get_types',
  {

  },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

async function deleteVoucherType(voucherType, deleteAssigned) {
  const response = await axios.post(
    __uri + '/vouchers/delete_type',
  {
    voucher_type: voucherType,
    delete_assigned: deleteAssigned
  },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

async function getAvailableVoucherTypes() {
    const response = await axios.post(
      __uri + '/vouchers/get_available_types',
    {

    },
      { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
    )
    if ('error' in response.data) throw response.data.error
    return response.data
}

async function getVoucherCodes(voucherType) {
  const response = await axios.post(
    __uri + '/vouchers/get_voucher_codes',
  {
    voucher_type: voucherType
  },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

async function deleteVoucherCodes(voucherCodes, deleteAssigned) {
  const response = await axios.post(
    __uri + '/vouchers/delete_codes',
  {
    voucher_codes: voucherCodes,
    delete_assigned: deleteAssigned
  },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

async function getAssignedVouchers(userId) {
    const response = await axios.post(
      __uri + '/vouchers/get_assigned_vouchers',
    {
        user_id: userId
    },
      { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
    )
    if ('error' in response.data) throw response.data.error
    return response.data
}

async function searchVoucherTypes(searchString) {
    const response = await axios.post(
      __uri + '/vouchers/search_types',
    {
        search: searchString
    },
      { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
    )
    if ('error' in response.data) throw response.data.error
    return response.data
}

async function checkVoucherValid(userId, code) {
    const response = await axios.post(
      __uri + '/vouchers/check_valid',
    {
        user_id: userId,
        voucher_code: code
    },
      { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
    )
    if ('error' in response.data) throw response.data.error
    return response.data
}

async function markVoucherUsed(userId, code) {
    const response = await axios.post(
      __uri + '/vouchers/mark_used',
    {
        user_id: userId,
        voucher_code: code
    },
      { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
    )
    if ('error' in response.data) throw response.data.error
    return response.data
}

async function purchaseVoucher(userId, voucherType, paymentCheque) {
  const response = await axios.post(
    __uri + '/vouchers/mark_used',
  {
      user_id: userId,
      voucher_type: voucherType,
      payment_cheque: paymentCheque
  },
    { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': __apiKey }}
  )
  if ('error' in response.data) throw response.data.error
  return response.data
}

module.exports = {
    init,
    createVoucherType,
    deleteVoucherType,
    getVoucherTypes,
    createVoucherCodes,
    addVoucherCodes,
    getVoucherCodes,
    deleteVoucherCodes,
    getAvailableVoucherTypes,
    getAssignedVouchers,
    checkVoucherValid,
    markVoucherUsed,
    searchVoucherTypes,
    purchaseVoucher
}