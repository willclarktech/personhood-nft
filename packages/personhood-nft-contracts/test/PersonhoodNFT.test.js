const PersonhoodNFT = artifacts.require("PersonhoodNFT");

contract("PersonhoodNFT", () => {
	it("deploys successfully", async () => {
		const instance = await PersonhoodNFT.deployed();
		const name = await instance.name();
		expect(name).to.equal("PersonhoodNFT");
	});
});
