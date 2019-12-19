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
		return res.send("visit /challenge to get a challenge");
	}
	if (!challenges.has(challenge)) {
		return res.send("complete the challenge");
	}

	challenges.delete(challenge);
	next();
};
