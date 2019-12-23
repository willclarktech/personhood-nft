import { RequestHandler } from "express";
import personhoodNftContract from "./personhood-nft-contract";
import { failurePage, successPage } from "./constants";

export const issueToken: RequestHandler = async (req, res) => {
	const { address } = req.body;
	const { transactionHash } = await personhoodNftContract.methods
		.issue(address)
		.send();

	if (!transactionHash) {
		console.error("transaction failed");
		res.redirect(failurePage);
		return;
	}

	console.info(`sent transaction: ${transactionHash}`);
	res.redirect(successPage);
};
