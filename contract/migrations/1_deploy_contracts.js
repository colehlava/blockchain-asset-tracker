// const Asset = artifacts.require("Asset");
const ChainOfCustody = artifacts.require("ChainOfCustody");

module.exports = function(deployer) {
    // deployer.deploy(Asset);
    // deployer.link(Asset, ChainOfCustody);
    deployer.deploy(ChainOfCustody);
};
