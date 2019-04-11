const expect = require('chai').expect
const reward = require('../src/reward')
const utils = require('../src/utility')
const testTokens = require('./test_tokens')

describe('test: reward', function () {

    this.timeout('4000')
    Object.keys(testTokens).forEach(key => {
        it('getRewardTokens ' + key, function(done) {
        let token = testTokens[key]
        reward.getRewardTokens(token.address, token.amount, token.message, token.address)
            .then(result => {
                expect(result).to.contain(token.appUri)
                done()
            })
            .catch(error => {
                done(error)
            })
        })      
    })

    const userId = utils.randomKey(64).toString('hex')
    console.log('UserID', userId)

    Object.keys(testTokens).forEach(key => {
        it('rewardTo ' + key, function(done) {
            let token = testTokens[key]
            reward.rewardTo(userId, token.address, token.amount, 'apikey').then(result => {
                expect(result).to.contain({success: true})
                done()
            }).catch(error=> {
                done(error)
            })
        })
    })

    Object.keys(testTokens).forEach(key => {
        it('getUserBalance ' + key, function(done) {
            let token = testTokens[key]
            reward.getUserBalance(userId, token.address, 'apikey').then(result => {
                expect(result).to.contain.all.keys(['balance', 'pending', 'wallets', 'cheques'])
                done()
            }).catch(error=> {
                done(error)
            })
        })
    })

    Object.keys(testTokens).forEach(key => {
        it('createPendingCheque ' + key, function(done) {
            let token = testTokens[key]
            reward.createPendingCheque(userId, token.address, 'apikey').then(result => {
                console.log(result)
                done()
            }).catch(error=> {
                done(error)
            })
        })
    })

    Object.keys(testTokens).forEach(key => {
        it('getCheques ' + key, function(done) {
            let token = testTokens[key]
            reward.getCheques(userId, token.address, 'apikey').then(result => {
                console.log(result)
                done()
            }).catch(error=> {
                done(error)
            })
        })
    })
})