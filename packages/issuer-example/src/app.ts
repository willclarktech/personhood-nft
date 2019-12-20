import bodyParser from "body-parser";
import express, { RequestHandler } from "express";
import path from "path";

const port = process.env.PORT || 3002;
const publicPath = path.join(__dirname, "..", "public");

const ethAddressRegExp = /0x[a-f0-9]{20}/i;

const validateForm: RequestHandler = (req, res, next) => {
	const { address, grecaptcha } = req.body;

	if (!ethAddressRegExp.test(address) || !grecaptcha) {
		res.redirect("/failure.html");
		return;
	}
	next();
};

const issueToken: RequestHandler = (req, res) => {
	res.redirect("/success.html");
};

const app = express()
	.set("port", port)
	.use("/", express.static(publicPath))
	.use(bodyParser.urlencoded({ extended: true }))
	.post("/submit", validateForm, issueToken);

export default app;
