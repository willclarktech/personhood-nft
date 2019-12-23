import { RequestHandler } from "express";
import personhoodNftContract from "./personhood-nft-contract";
import { failurePage, successPage } from "./constants";

export const issueToken: RequestHandler = async (req, res) => {
	const { address } = req.body;

	if (!address) {
		console.error("missing address");
		res.redirect(failurePage);
		return;
	}

	try {
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
	} catch (error) {
		console.error(error.message || error.code || "unknown error");
		res.redirect(failurePage);
	}
};
