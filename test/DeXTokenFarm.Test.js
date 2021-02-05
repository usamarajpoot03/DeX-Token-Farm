const {
    assert
} = require("chai");

const MockDaiToken = artifacts.require("MockDaiToken");
const DeXToken = artifacts.require("DeXToken");
const DeXTokenFarm = artifacts.require("DeXTokenFarm");

require("dotenv").config({
    path: "../.env"
});

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract("DeXTokenFarm Test", async (accounts) => {
    const [owner, investor, anotherAccount] = accounts;
    let mockDaiToken, deXToken, deXTokenFarm;

    before(async () => {
        mockDaiToken = await MockDaiToken.new();
        deXToken = await DeXToken.new();
        deXTokenFarm = await DeXTokenFarm.new(mockDaiToken.address, deXToken.address);

        //assign one million(ALL) DeXTokens to DeXTokenFarm as it is going to give DeXTokens as reward for stacking 
        await deXToken.transfer(deXTokenFarm.address, tokens('1000000'));

        //assing 100 MockDaiTokens to investor so he can have something to invest
        await mockDaiToken.transfer(investor, tokens('100'), {
            from: owner
        });

    });

    describe("Mock DAI Deployments", async () => {
        it("has a name ", async () => {
            const mDaiName = await mockDaiToken.name();
            assert.equal(mDaiName, "Mock Dai Token");
        });
    })

    describe("Dex Token Deployments", async () => {
        it("has a name ", async () => {
            const deXTokenName = await deXToken.name();
            assert.equal(deXTokenName, "DeX Token");
        });
    })

    describe("DeX Token Farm Deployments", async () => {
        it("has a name ", async () => {
            const deXTokenFarmName = await deXTokenFarm.name();
            assert.equal(deXTokenFarmName, "DeX Token Farm");
        });

        it("Dex Token has all tokens", async () => {
            const deXTokenFarmBalance = await deXToken.balanceOf(deXTokenFarm.address);
            assert.equal(deXTokenFarmBalance, tokens('1000000'));
        });
    })

    describe("Farming tokens", async () => {
        it("rewards are given for staking", async () => {
            const balanceOfInvestor = await mockDaiToken.balanceOf(investor);
            assert.equal(balanceOfInvestor, tokens('100'), 'investor balance is 100 before stacking');

            //approve before stacking
            await mockDaiToken.approve(deXTokenFarm.address, tokens('100'), {
                from: investor
            });

            //stacking
            await deXTokenFarm.stackTokens(tokens('100'), {
                from: investor
            });

            //check the investor balance is withdrawn from the investor account
            const updatedBalanceOfInvestor = await mockDaiToken.balanceOf(investor);
            assert.equal(updatedBalanceOfInvestor, tokens('0'), 'investor balance is 0 after stacking');

            //check the tokenFarm balance is increase by 100 after investor's investment of 100
            const balanceOfTokenFarmDai = await mockDaiToken.balanceOf(deXTokenFarm.address);
            assert.equal(balanceOfTokenFarmDai, tokens('100'), 'DeX Token Farm balance is 100 after investor s investment of 100');

            //check the stacking balance of investor is increase by 100
            stackingBalanceOfInvestor = await deXTokenFarm.stackingBalance(investor);
            assert.equal(stackingBalanceOfInvestor, tokens('100'), 'Investor stacking balance is 100 after stacking');

            //check the stacking status of investor
            let stackingStatusOfInvestor = await deXTokenFarm.isStaking(investor);
            assert.equal(stackingStatusOfInvestor, true, 'Investor stacking status is true');

            //issue tokens function can only be called by owner
            await deXTokenFarm.issueTokens({
                from: anotherAccount
            }).should.be.rejected;

            await deXTokenFarm.issueTokens({
                from: owner
            });

            //investor got 100 DeX Tokens from DeX Token Farm as a reward for stacking
            const balanceOfInvestorDeX = await deXToken.balanceOf(investor);
            assert.equal(balanceOfInvestorDeX, tokens('100'), 'investor DeX Token balance is 100 after stacking 100 DaiTokens');



            //stacking
            await deXTokenFarm.unstakeTokens({
                from: investor
            });

            //check the investor balance is withdrawn from the investor account
            const balanceOfInvestorAfterUnstaking = await mockDaiToken.balanceOf(investor);
            assert.equal(balanceOfInvestorAfterUnstaking, tokens('100'), 'investor balance is again 100 after unstaking');

            //check the tokenFarm balance is increase by 100 after investor's investment of 100
            const remainingBalanceOfTokenFarmDai = await mockDaiToken.balanceOf(deXTokenFarm.address);
            assert.equal(remainingBalanceOfTokenFarmDai, tokens('0'), 'DeX Token Farm balance is again 0 after investor unstaked the tokens');

            //check the stacking balance of investor is again 0
            stackingBalanceOfInvestor = await deXTokenFarm.stackingBalance(investor);
            assert.equal(stackingBalanceOfInvestor, tokens('0'), 'Investor stacking balance is 0 after unstaking');

            //check the stacking status of investor
            stackingStatusOfInvestor = await deXTokenFarm.isStaking(investor);
            assert.equal(stackingStatusOfInvestor, false, 'Investor stacking status is false after unstaking');


            //investor still maintain 100 DeX Tokens from DeX Token Farm as a reward for stacking
            const balanceOfInvestorDeXAfterUnstaking = await deXToken.balanceOf(investor);
            assert.equal(balanceOfInvestorDeXAfterUnstaking, tokens('100'), 'investor DeX Token balance is 100 after unstaking 100 DaiTokens');

        });
    })
});