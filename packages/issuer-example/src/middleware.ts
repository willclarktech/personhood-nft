import { RequestHandler } from "express";
import {
	ethAddressRegExp,
	failurePage,
	minimumPersonhoodScore,
} from "./constants";
import grecaptchaClient from "./grecaptcha-client";

export const validateForm: RequestHandler = (req, res, next) => {
	const { address, grecaptcha } = req.body;

	if (!ethAddressRegExp.test(address) || !grecaptcha) {
		console.error("bad address or missing grecaptcha");
		res.redirect(failurePage);
		return;
	}

	next();
};

export const getPersonhoodScore: RequestHandler = async (req, res, next) => {
	const { grecaptcha } = req.body;

	if (!grecaptcha) {
		console.error("missing grecaptcha");
		res.redirect(failurePage);
		return;
	}

	const { data } = await grecaptchaClient.post(grecaptcha);

	if (!data.success) {
		console.error(`unsuccessful grecaptcha: ${data["error-codes"]}`);
		res.redirect(failurePage);
		return;
	}

	res.locals.score = data.score;

	next();
};

export const checkScore: RequestHandler = (req, res, next) => {
	const { score } = res.locals;

	if (score === undefined || score < minimumPersonhoodScore) {
		console.error(`bad personhood score: ${score}`);
		res.redirect(failurePage);
		return;
	}

	console.info(`good personhood score: ${score}`);
	next();
};
