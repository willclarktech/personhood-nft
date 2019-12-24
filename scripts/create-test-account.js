const Web3 = require("web3");

const web3 = new Web3();
const { address, privateKey } = web3.eth.accounts.create();

console.info(JSON.stringify({ address, privateKey }, undefined, "\t"));
