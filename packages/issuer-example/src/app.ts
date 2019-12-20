import axios from "axios";
import bodyParser from "body-parser";
import express, { RequestHandler } from "express";
import path from "path";

if (!process.env.GRECAPTCHA_SECRET) {
	throw new Error("Must set env variable GRECAPTCHA_SECRET");
}
const grecaptchaSecret = process.env.GRECAPTCHA_SECRET;
const port = process.env.PORT || 3002;
const publicPath = path.join(__dirname, "..", "public");
const minimumPersonhoodScore = 0.5;

const ethAddressRegExp = /0x[a-f0-9]{20}/i;
const grecaptchaClient = axios.create({
	baseURL: "https://www.google.com/recaptcha/api",
	headers: {
		"Content-Type": "application/json",
	},
});

const validateForm: RequestHandler = (req, res, next) => {
	const { address, grecaptcha } = req.body;

	if (!ethAddressRegExp.test(address) || !grecaptcha) {
		res.redirect("/failure.html");
		return;
	}

	next();
};

const getPersonhoodScore: RequestHandler = async (req, res, next) => {
	const postData = {};
	const params = {
		secret: grecaptchaSecret,
		response: req.body.grecaptcha,
	};

	const {
		data: { success, score },
	} = await grecaptchaClient.post("/siteverify", postData, {
		params,
	});

	if (!success) {
		res.redirect("/failure.html");
		return;
	}

	res.locals.score = score;

	next();
};

const checkScore: RequestHandler = (req, res, next) => {
	const { score } = res.locals;
	console.info(`Personhood score: ${score}`);
	if (score < minimumPersonhoodScore) {
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
	.post("/submit", validateForm, getPersonhoodScore, checkScore, issueToken);

export default app;
