const expect = require('chai').expect
const reward = require('../src/reward')
const utils = require('../src/utility')
const testTokens = require('./test_tokens')

describe('test: reward', function () {

    this.timeout('4000')

    const userId = utils.randomKey(64).toString('hex')
    const prefix = utils.randomKey(8).toString('hex')


    reward.init(prefix, 'not used', 'apikey')

    const userRef = reward.getUserReference(userId)
    console.log('UserID', userRef)

    Object.keys(testTokens).forEach(key => {
        it('rewardTo ' + key, function(done) {
            let token = testTokens[key]

            reward.rewardTo(userRef, token.address, token.amount).then(result => {
                expect(result).to.contain({success: true})
                done()
            }).catch(error=> {
                done(error)
            })
        })
    })

    Object.keys(testTokens).forEach(key => {
        it('getUserBalance ${key}', function(done) {
            let token = testTokens[key]
            reward.getUserBalance(userRef, token.address).then(result => {
                console.log(result)
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
            reward.createPendingCheque(userRef, token.address).then(result => {
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
            reward.getCheques(userRef, token.address).then(result => {
                console.log(result)
                done()
            }).catch(error=> {
                done(error)
            })
        })
    })
})