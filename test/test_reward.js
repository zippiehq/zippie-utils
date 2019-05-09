const expect = require('chai').expect
const reward = require('../src/reward')
const utils = require('../src/utility')
const testTokens = require('./test_tokens')

function getRandom(length) {
    return utils.randomKey(length).toString('utf8')
}

const userId = getRandom(8)
const prefix = getRandom(8)

describe('test: reward', function () {

    this.timeout('4000')

    before(function() {
        reward.init(prefix, 'not used', 'user')
    })

    it('getUserReference', function() {
        const user = getRandom(8)
        const user2 = getRandom(8)

        console.log({user, user2})

        const userRef = reward.getUserReference(user)
        const userRef2 = reward.getUserReference(user2)
        expect(userRef).to.not.eq(user)
        expect(userRef).to.not.eq(userRef2)
    })

    describe('Backend Tests', function() {
        before(function() {
            reward.init(prefix, 'not used', 'owner')
        })

        Object.keys(testTokens).forEach(key => {
            it('rewardTo ' + key, function(done) {
                let token = testTokens[key]
                const userRef = reward.getUserReference(userId)
                console.log({token, userRef})

                reward.rewardTo(userRef, token.address, token.amount).then(result => {
                    expect(result).to.contain({success: true})
                    done()
                }).catch(error=> {
                    done(error)
                })
            })
        })
    })

    describe('User Tests', function() {
        before(function() {
            reward.init(prefix, 'not used', 'user')
        })

        Object.keys(testTokens).forEach(key => {
            it('getUserBalance ' + key , function(done) {
                let token = testTokens[key]
                const userRef = reward.getUserReference(userId)
                console.log({token, userRef})

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
                const userRef = reward.getUserReference(userId)
                console.log({token, userRef})

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
                const userRef = reward.getUserReference(userId)
                console.log({token, userRef})

                reward.getCheques(userRef, token.address).then(result => {
                    console.log(result)
                    done()
                }).catch(error=> {
                    done(error)
                })
            })
        })

        it('createReferalCode', async function() {
            const userRef = reward.getUserReference(userId)
            const code = await reward.createReferralCode(userRef)
            console.log(code)

            expect(code).to.contain.key('referral_code')
        })

        it('setUserKey', async function() {
            const userRef = reward.getUserReference(userId)

            const response = await reward.setUserKey(userRef, 'TEST', 'VALUE')
            console.log(response)
        })

        it('getUserKey', async function() {
            const userRef = reward.getUserReference(userId)

            const keyValue = await reward.getUserKey(userRef, 'TEST')

            expect(keyValue).to.eq('VALUE')
        })
    })
})