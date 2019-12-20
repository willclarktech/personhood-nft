import { RequestHandler } from "express";
import session from "express-session";
import { sessionSecret, oneHour } from "./constants";

export const sessionMiddleware = session({
	secret: sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: oneHour },
});

export const hasPaid: (
	challenges: Set<string>,
) => RequestHandler = challenges => async (req, res, next) => {
	const { session } = req;
	if (!session) {
		res.status(401).send("session not found");
		return;
	}
	const challenge = session.challenge;
	if (!challenge) {
		res.status(401).send("visit /challenge to get a challenge");
		return;
	}
	if (!challenges.has(challenge)) {
		res.status(401).send("complete the challenge");
		return;
	}

	session.challenge = undefined;
	challenges.delete(challenge);
	next();
};
