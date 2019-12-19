import express, { RequestHandler } from "express";

const app = express();

app.set("port", process.env.PORT || 3000);

const hasPaid: RequestHandler = (req, res, next) => {
	next();
};
const serveText: RequestHandler = (req, res, next) => {
	res.send("have a kitten");
	next();
};
app.use("/kitten", hasPaid, serveText);

export default app;
