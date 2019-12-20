import crypto from "crypto";
import { RequestHandler } from "express";
import { readFileSync } from "fs";
import path from "path";
import Web3 from "web3";
import { address } from "./constants";

export const getChallenge: (
	web3: Web3,
	topics: string[],
	challenges: Set<string>
) => RequestHandler = (web3, topics, challenges) => (req, res) => {
	if (!req.session) throw new Error("session not found");

	const challenge = crypto.randomBytes(32).toString("hex");
	req.session.challenge = challenge;
	res.send(challenge);

	const options = {
		// address: process.env.CONTRACT_ADDRESS
		topics
	};
	const subscription = web3.eth.subscribe("logs", options);
	const timeout = setTimeout(() => subscription.unsubscribe(), 3600000);

	subscription
		.on("data", ({ data }) => {
			// const prefix = data.slice(0, 2);
			// const tokenId = data.slice(2, 66);
			// const issuer = data.slice(66, 130);
			// const height = data.slice(130, 194);
			const recipientBytes = data.slice(194, 258);
			const recipientAddress = `0x${recipientBytes.slice(24)}`;
			const memo = data.slice(258, 322);
			if (recipientAddress === address.toLowerCase() && memo === challenge) {
				challenges.add(challenge);
				subscription.unsubscribe();
				clearTimeout(timeout);
			}
		})
		.on("error", error => {
			console.error(error);
			subscription.unsubscribe();
			clearTimeout(timeout);
		});
};

export const serveText: RequestHandler = (req, res) => {
	const kittenPath = path.join(__dirname, "..", "static", "kitten.jpg");
	const kitten = readFileSync(kittenPath);
	res.send(kitten);
};
