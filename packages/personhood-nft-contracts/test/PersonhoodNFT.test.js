const PersonhoodNFT = artifacts.require("PersonhoodNFT");

const nullAddress = "0x0000000000000000000000000000000000000000";

const createMemo = () => Buffer.from(`Some memo ${Math.random()}`, "ascii");

const decodeHex = str => Buffer.from(str.slice(2), "hex");

contract(
	"PersonhoodNFT",
	([_rootAccount, defaultIssuer, defaultPerson, defaultService]) => {
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

			const result = await instance.issue(defaultPerson, {
				from: defaultIssuer,
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
			const blockHeightBefore = (await web3.eth.getBlock()).number;
			const identificationResult = await instance.issue(defaultPerson, {
				from: defaultIssuer,
			});
			const tokenId = identificationResult.logs[0].args.tokenId.toNumber();

			const getResult = await instance.get(tokenId);
			expect(getResult.issuer).to.equal(defaultIssuer);
			expect(getResult.height.toNumber()).to.be.above(blockHeightBefore);
		});

		it("spends a token", async () => {
			const instance = await PersonhoodNFT.deployed();
			const identificationResult = await instance.issue(defaultPerson, {
				from: defaultIssuer,
			});
			const tokenId = identificationResult.logs[0].args.tokenId.toNumber();
			const ownedTokensBefore = (
				await instance.balanceOf(defaultPerson)
			).toNumber();

			await instance.spend(tokenId, defaultService, createMemo(), {
				from: defaultPerson,
			});
			const ownedTokensAfter = (
				await instance.balanceOf(defaultPerson)
			).toNumber();
			expect(ownedTokensAfter).to.equal(ownedTokensBefore - 1);

			const getResult = await instance.get(tokenId);
			expect(getResult.issuer).to.equal(nullAddress);
			expect(getResult.height.toNumber()).to.equal(0);
		});

		it("emits a Spend event when spending", async () => {
			const instance = await PersonhoodNFT.deployed();
			const identificationResult = await instance.issue(defaultPerson, {
				from: defaultIssuer,
			});
			const { args, blockNumber } = identificationResult.logs[0];
			const tokenId = args.tokenId.toNumber();
			const memo = createMemo();

			const spendResult = await instance.spend(tokenId, defaultService, memo, {
				from: defaultPerson,
			});
			expect(spendResult.logs).to.have.length(2);

			const spendLog = spendResult.logs[1];
			expect(spendLog.event).to.equal("Spend");
			expect(spendLog.args.tokenId.toNumber()).to.equal(tokenId);
			expect(spendLog.args.issuer).to.equal(defaultIssuer);
			expect(spendLog.args.height.toNumber()).to.equal(blockNumber);
			expect(spendLog.args.recipient).to.equal(defaultService);
			expect(decodeHex(spendLog.args.memo).slice(0, memo.length)).to.deep.equal(
				memo,
			);
		});
	},
);
