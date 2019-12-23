import Web3 from "web3";
import { AbiItem } from "web3-utils";
import personhoodNFT from "./contracts/PersonhoodNFT.json";
import { ethProvider, issuerAddress, contractAddress } from "./constants";

export const web3 = new Web3(ethProvider);

const contractOptions = {
	from: issuerAddress,
};

export const contract = new web3.eth.Contract(
	personhoodNFT.abi as AbiItem[],
	contractAddress,
	contractOptions,
) as any;
