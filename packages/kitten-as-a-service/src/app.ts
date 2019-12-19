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

const getSession: RequestHandler = (req, res, next) => {
	if (req.session) req.session.seen = true;
	res.send("here you go");
};
app.get("/session", getSession);

const hasPaid: RequestHandler = (req, res, next) => {
	if (req.session?.seen) req.session.paid = true;
	next();
};
const serveText: RequestHandler = (req, res, next) => {
	const text = req.session?.paid ? "have a kitten" : "you don’t get a kitten";
	res.send(text);
};
app.use("/kitten", hasPaid, serveText);

export default app;
