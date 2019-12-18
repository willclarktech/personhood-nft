const PersonhoodNFT = artifacts.require("PersonhoodNFT");

contract(
	"PersonhoodNFT",
	([_rootAccount, defaultIdentifier, defaultPerson]) => {
		it("deploys successfully", async () => {
			const instance = await PersonhoodNFT.deployed();
			const name = await instance.name();
			expect(name).to.equal("PersonhoodNFT");
		});

		it("allows any account to create tokens for another account", async () => {
			const instance = await PersonhoodNFT.deployed();
			const ownedTokensBefore = (
				await instance.balanceOf(defaultPerson)
			).toNumber();

			const result = await instance.identify(defaultPerson, {
				from: defaultIdentifier
			});
			const tokenId = result.logs[0].args.tokenId.toNumber();

			const ownedTokensAfter = (
				await instance.balanceOf(defaultPerson)
			).toNumber();
			expect(ownedTokensAfter).to.equal(ownedTokensBefore + 1);

			const retrievedTokenId = (
				await instance.tokenOfOwnerByIndex(defaultPerson, ownedTokensAfter - 1)
			).toNumber();
			expect(retrievedTokenId).to.equal(tokenId);
		});

		it("retrieves a token", async () => {
			const instance = await PersonhoodNFT.deployed();
			const timestampBefore = Math.floor(Date.now() / 1000);
			const identificationResult = await instance.identify(defaultPerson, {
				from: defaultIdentifier
			});
			const tokenId = identificationResult.logs[0].args.tokenId.toNumber();

			const getResult = await instance.get(tokenId);
			expect(getResult.issuer).to.equal(defaultIdentifier);
			expect(getResult.timestamp.toNumber()).to.be.at.least(timestampBefore);
		});
	}
);
