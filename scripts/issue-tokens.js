const DeXTokenFarm = artifacts.require("DeXTokenFarm");

module.exports = async function (callback) {
    console.log('--------------Issuing tokens--------------');

    let dexTokenFarmInstance = await DeXTokenFarm.deployed();
    await dexTokenFarmInstance.issueTokens();

    console.log('--------------Successfully Issued Tokens--------------');
    callback();
}