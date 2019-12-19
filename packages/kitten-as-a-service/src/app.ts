import crypto from "crypto";
import express, { RequestHandler } from "express";
import session from "express-session";
import Web3 from "web3";

const web3 = new Web3("ws://localhost:8545");

const spendTopic =
	"0xf284472981c03adf655fea3bd63fce13ffc577bd2c4f3978ebf36c56c1cda2a4";

const app = express();

const challenges = new Set<string>();

app.set("port", process.env.PORT || 3000);

app.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 3600000
		}
	})
);

const getChallenge: (set: Set<string>) => RequestHandler = set => (
	req,
	res
) => {
	if (!req.session) throw new Error("session not found");

	const challenge = crypto.randomBytes(32).toString("hex");
	req.session.challenge = challenge;
	res.send(challenge);

	const options = {
		// address: process.env.CONTRACT_ADDRESS
		topics: [spendTopic]
	};
	const subscription = web3.eth.subscribe("logs", options);
	const timeout = setTimeout(() => subscription.unsubscribe(), 3600000);

	subscription
		.on("data", ({ data }) => {
			// const destination = data.slice(66, 130);
			const memo = data.slice(130, 194);
			// if (destination === process.env.ADDRESS && memo === challenge) {
			if (memo === challenge) {
				set.add(challenge);
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

const hasPaid: (set: Set<string>) => RequestHandler = set => async (
	req,
	res,
	next
) => {
	const challenge = req.session?.challenge;
	if (!challenge) {
		return res.send("visit /challenge to get a challenge");
	}
	if (!set.has(challenge)) {
		return res.send("complete the challenge");
	}

	set.delete(challenge);
	next();
};

const serveText: RequestHandler = (req, res) => {
	res.send("have a kitten");
};

app.get("/challenge", getChallenge(challenges));
app.use("/kitten", hasPaid(challenges), serveText);

export default app;
