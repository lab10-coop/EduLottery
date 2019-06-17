var Lottery = artifacts.require("./EduLottery.sol");

module.exports = function(deployer) {

    var roundRuntimeInBlocks = '60';
    var minPauseRuntimeInBlocks = '30';

    deployer.deploy(Lottery, web3.utils.toWei('1'), roundRuntimeInBlocks, minPauseRuntimeInBlocks);
    deployer.deploy(Lottery, web3.utils.toWei('1'), roundRuntimeInBlocks, minPauseRuntimeInBlocks);
    deployer.deploy(Lottery, web3.utils.toWei('1'), roundRuntimeInBlocks, minPauseRuntimeInBlocks);
    deployer.deploy(Lottery, web3.utils.toWei('1'), roundRuntimeInBlocks, minPauseRuntimeInBlocks);
};
