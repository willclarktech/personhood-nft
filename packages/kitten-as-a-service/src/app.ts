import crypto from "crypto";
import express, { RequestHandler } from "express";
import session from "express-session";

const app = express();

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

const getChallenge: RequestHandler = (req, res) => {
	if (!req.session) throw new Error("session not found");
	const challenge = crypto.randomBytes(32).toString("hex");
	req.session.challenge = challenge;
	res.send(challenge);
};

const hasPaid: RequestHandler = (req, res, next) => {
	if (req.session?.challenge) req.session.paid = true;
	next();
};

const serveText: RequestHandler = (req, res) => {
	const text = req.session?.paid ? "have a kitten" : "you don’t get a kitten";
	res.send(text);
};

app.get("/challenge", getChallenge);
app.use("/kitten", hasPaid, serveText);

export default app;
