const expect = require('chai').expect
const airtime = require('../src/airtime')
const reward = require('../src/reward')
const testTokens = require('./test_tokens')

describe('test: airtime', function () {

    this.timeout(10000)

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

    it('pay for topup', async function() {

        const blankCheque = await reward.getRewardTokens('6', 'airtime tokens', '0x89E2bb8091232Af7daC4bd473224Ee32AC8147b1')

        const response = await airtime.payForTopup(blankCheque, '40743585264', 'orange-romania', true)
    })

})