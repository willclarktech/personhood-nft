import { RequestHandler } from "express";
import personhoodNftContract from "./personhood-nft-contract";

export const issueToken: RequestHandler = async (req, res) => {
	const { address } = req.body;
	const { transactionHash } = await personhoodNftContract.methods
		.issue(address)
		.send();

	if (!transactionHash) {
		console.error("transaction failed");
		res.redirect("/failure.html");
		return;
	}

	console.info(`sent transaction: ${transactionHash}`);
	res.redirect("/success.html");
};
