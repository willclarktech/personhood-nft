import crypto from "crypto";
import { Request, RequestHandler } from "express";
import { readFileSync } from "fs";
import path from "path";
import Web3 from "web3";
import { Log } from "web3-core";
import { address, minimumValue } from "./constants";
import { parseSpendEventLog } from "./encoding";
import marketClient from "./market-client";

const createDataHandler = (
	req: Request,
	challenges: Set<string>,
	challenge: string,
	handleSuccess: () => void,
	handleError: (error: Error) => void
) => async ({ data }: Log) => {
	const { session } = req;
	if (!session) {
		return handleError(new Error("session not found"));
	}

	const { tokenId, issuer, height, recipient, memo } = parseSpendEventLog(data);

	if (recipient === address.toLowerCase() && memo === challenge) {
		try {
			const { data: marketData } = await marketClient.get("/rate", {
				params: {
					tokenId,
					issuer,
					height
				}
			});
			if (typeof marketData.rate !== "number") {
				throw new Error("unrecognised response from market API");
			}
			session.value += marketData.rate;
		} catch (error) {
			console.error(error.message || error.code || "unknown error");
		}
	}

	if (session.value >= minimumValue) {
		challenges.add(challenge);
		handleSuccess();
	}
};

export const getChallenge: (
	web3: Web3,
	topics: string[],
	challenges: Set<string>
) => RequestHandler = (web3, topics, challenges) => (req, res) => {
	const { session } = req;
	if (!session) throw new Error("session not found");

	const challenge = crypto.randomBytes(32).toString("hex");
	session.value = 0;
	session.challenge = challenge;
	res.send(challenge);

	const options = {
		// address: process.env.CONTRACT_ADDRESS
		topics
	};
	const subscription = web3.eth.subscribe("logs", options);
	const timeout = setTimeout(() => subscription.unsubscribe(), 3600000);
	const clearChallenge = (): void => {
		subscription.unsubscribe();
		clearTimeout(timeout);
		session.challenge = undefined;
	};

	const onError = (error: Error): void => {
		console.error(error);
		clearChallenge();
	};
	const onData = createDataHandler(
		req,
		challenges,
		challenge,
		clearChallenge,
		onError
	);

	subscription.on("data", onData).on("error", onError);
};

export const serveText: RequestHandler = (req, res) => {
	const kittenPath = path.join(__dirname, "..", "static", "kitten.jpg");
	const kitten = readFileSync(kittenPath);
	res.send(kitten);
};
