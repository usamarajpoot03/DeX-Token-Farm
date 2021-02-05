var MockDaiToken = artifacts.require("MockDaiToken.sol");
var DeXToken = artifacts.require("DeXToken.sol");
var DeXTokenFarm = artifacts.require("DeXTokenFarm.sol");

require("dotenv").config({
    path: "../.env"
});

module.exports = async function (deployer, network, accounts) {

    //accounts[0] is the deployer
    //accounts[1] is the investor : going to invest 1 MockDaiToken and will earn some DeXTokens as reward
    const oneMillionTokens = '1000000000000000000000000';
    const oneHundredToken = '100000000000000000000';

    const investor = accounts[1];

    // deploy all three contracts
    await deployer.deploy(MockDaiToken)
    const mockDaiTokenInstance = await MockDaiToken.deployed();

    await deployer.deploy(DeXToken);
    const deXTokenInstance = await DeXToken.deployed();

    await deployer.deploy(DeXTokenFarm, mockDaiTokenInstance.address, deXTokenInstance.address);
    const deXTokenFarmInstance = await DeXTokenFarm.deployed();

    //assign one million(ALL) DeXTokens to DeXTokenFarm as it is going to give DeXTokens as reward for stacking 
    await deXTokenInstance.transfer(deXTokenFarmInstance.address, oneMillionTokens);

    //assing 100 MockDaiTokens to investor so he can have something to invest
    await mockDaiTokenInstance.transfer(investor, oneHundredToken);


}