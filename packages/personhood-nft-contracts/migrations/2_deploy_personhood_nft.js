const PersonhoodNFT = artifacts.require("PersonhoodNFT");

module.exports = function(deployer) {
	deployer.deploy(PersonhoodNFT);
};
