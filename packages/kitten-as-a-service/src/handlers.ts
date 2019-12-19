import crypto from "crypto";
import { RequestHandler } from "express";
import { readFileSync } from "fs";
import path from "path";
import Web3 from "web3";

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
			// const destination = data.slice(66, 130);
			const memo = data.slice(130, 194);
			// if (destination === process.env.ADDRESS && memo === challenge) {
			if (memo === challenge) {
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
