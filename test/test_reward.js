const expect = require('chai').expect
const reward = require('../src/reward')
const testTokens = require('./test_tokens')

describe('test: reward', function () {

    this.timeout('4000')
    Object.keys(testTokens).forEach(key => {
        it('getRewardTokens ' + key, function(done) {
        let token = testTokens[key]
        reward.getRewardTokens(token.amount, token.message, token.address)
            .then(result => {
                expect(result).to.contain(token.appUri)
                done()
            })
            .catch(error => {
                done(error)
            })
        })      
    })
})