import { RequestHandler } from "express";
import session from "express-session";
import { sessionSecret, oneHour } from "./constants";

export const sessionMiddleware = session({
	secret: sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: oneHour }
});

export const hasPaid: (
	challenges: Set<string>
) => RequestHandler = challenges => async (req, res, next) => {
	const challenge = req.session?.challenge;
	if (!challenge) {
		res.status(401).send("visit /challenge to get a challenge");
		return;
	}
	if (!challenges.has(challenge)) {
		res.status(401).send("complete the challenge");
		return;
	}

	req.session!.challenge = undefined;
	challenges.delete(challenge);
	next();
};
