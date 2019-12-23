import { RequestHandler } from "express";
import {
	ethAddressRegExp,
	grecaptchaSecret,
	minimumPersonhoodScore,
} from "./constants";
import grecaptchaClient from "./grecaptcha-client";

export const validateForm: RequestHandler = (req, res, next) => {
	const { address, grecaptcha } = req.body;

	if (!ethAddressRegExp.test(address) || !grecaptcha) {
		console.error("bad address or grecaptcha");
		res.redirect("/failure.html");
		return;
	}

	next();
};

export const getPersonhoodScore: RequestHandler = async (req, res, next) => {
	const postData = {};
	const params = {
		secret: grecaptchaSecret,
		response: req.body.grecaptcha,
	};

	const { data } = await grecaptchaClient.post("/siteverify", postData, {
		params,
	});

	if (!data.success) {
		console.error(`unsuccessful grecaptcha: ${data["error-codes"]}`);
		res.redirect("/failure.html");
		return;
	}

	res.locals.score = data.score;

	next();
};

export const checkScore: RequestHandler = (req, res, next) => {
	const { score } = res.locals;

	if (score < minimumPersonhoodScore) {
		console.error(`bad personhood score: ${score}`);
		res.redirect("/failure.html");
		return;
	}

	console.info(`good personhood score: ${score}`);
	next();
};
