import { RequestHandler } from "express";
import {
	ethAddressRegExp,
	failurePage,
	minimumPersonhoodScore,
	grecaptchaAction,
	grecaptchaHostname,
	grecaptchaMaxAge,
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

	try {
		const { data } = await grecaptchaClient.post(grecaptcha);

		if (!data.success) {
			console.error(`unsuccessful grecaptcha: ${data["error-codes"]}`);
			res.redirect(failurePage);
			return;
		}

		if (
			data.action !== grecaptchaAction ||
			data.hostname !== grecaptchaHostname
		) {
			console.error(
				`incorrect grecaptcha action or hostname: ${data.action}; ${data.hostname}`,
			);
			res.redirect(failurePage);
			return;
		}

		const datetime = new Date(data.challenge_ts);
		if (Date.now() - datetime.getTime() > grecaptchaMaxAge) {
			console.error("grecaptcha too old");
		}

		res.locals.score = data.score;

		next();
	} catch (error) {
		console.error(error.message || error.code || "unknown error");
		res.redirect(failurePage);
	}
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
