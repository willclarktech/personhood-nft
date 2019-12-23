const Web3 = require("web3");

const web3 = new Web3();
const { address, privateKey } = web3.eth.accounts.create();

console.info(`Private key: ${privateKey}`);
console.info(`Address: ${address}`);
