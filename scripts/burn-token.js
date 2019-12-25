const Web3 = require("web3");
const personhoodNFT = require("../packages/personhood-nft-contracts/build/contracts/PersonhoodNFT.json");

if (process.argv.length !== 4) {
	console.error("Usage: node scripts/burn-token.js <token ID> <challenge>");
	process.exit(1);
}

const [tokenId, memo] = process.argv.slice(2);
const serviceAddress = "0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b";

const web3 = new Web3("ws://localhost:8545");

const contractAddress = "0xcfeb869f69431e42cdb54a4f4f105c19c080a601";
const contractOptions = {
	from: "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0",
	gas: 6700000,
};

const personhoodNftContract = new web3.eth.Contract(
	personhoodNFT.abi,
	contractAddress,
	contractOptions,
);

module.exports = personhoodNftContract.methods
	.spend(tokenId, serviceAddress, `0x${memo}`)
	.send()
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
