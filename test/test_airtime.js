const expect = require('chai').expect
const airtime = require('../src/airtime')
const axios = require('axios')

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
  }

async function getRewardTokens(token, amount, message) {
    const response = await axios.post(
      'https://goerli-reward.zippie.org' + '/reward',
      {
        token: token,
        amount: amount,
        message: message,
        version: "v2"
      },
      { headers: { 'Content-Type': 'application/json;charset=UTF-8', 'api-key': token }}
    )
  
    if ('error' in response.data) throw response.data.error
    return response.data.url
  }

describe('test: airtime', function () {

    this.timeout(15000)

    it('getInventory - no slug', function (done) {
        airtime.getInventory().then(result => {
            expect(result).is.an('Object')
            done()
        })
        .catch(error => {
            done(error)
        })
    })

    it('getInventory - with slug', function(done) {
        airtime.getInventory('singtel-singapore').then(result => {
            expect(result).is.an('Object')
            expect(result).to.include.keys(['operator', 'country'])
            done()
        })
        .catch(error => {
            done(error)
        })
    })

    it('checkPhoneNumber', function(done) {
        airtime.checkPhoneNumber('40743585264', 'orange-romania').then(result => {
            expect(result).is.an('Object')
            expect(result).to.include.keys(['operator'])
            done()
        })
        .catch(error => {
            done(error)
        })
    })

    it('allowed tokens', async function() {
        const tokens = await airtime.getAllowedTokens()
        
        expect(tokens).is.an('Array')
    })

    it('pay for topup', async function() {
        const blankCheque = await getRewardTokens('0xA354cF34b9155fE293918Ba2b1e982044b2A1169', '25', 'airtime tokens')

        const response = await airtime.payForTopup(blankCheque, '260966603511', 'mtn-zambia', true)

        expect(response).is.an('Object')
        expect(response).to.include.keys(['orderId'])

        await sleep(8000)

        const status = await airtime.checkOrderStatus(response.orderId)
        expect(status).is.an('Object')
    })
})