// artifact allows to interact with the smart contract
var Election = artifacts.require("./Election.sol");

// this directive deploys the smart contract
module.exports = function(deployer) {
  deployer.deploy(Election);
};
