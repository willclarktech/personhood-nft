import express from "express";
import Web3 from "web3";
import { hasPaid, sessionMiddleware } from "./middleware";
import { serveKitten, getChallenge } from "./handlers";
import { spendEventTopic, ethProvider, port } from "./constants";

const web3 = new Web3(ethProvider);
const topics = [spendEventTopic];

const challenges = new Set<string>();
const app = express()
	.set("port", port)
	.use(sessionMiddleware)
	.get("/challenge", getChallenge(web3, topics, challenges))
	.get("/kitten", hasPaid(challenges), serveKitten);

export default app;
