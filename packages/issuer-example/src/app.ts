import axios from "axios";
import bodyParser from "body-parser";
import express, { RequestHandler } from "express";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import personhoodNFT from "./contracts/PersonhoodNFT.json";
import {
	ethProvider,
	issuerAddress,
	contractAddress,
	ethAddressRegExp,
	grecaptchaSecret,
	minimumPersonhoodScore,
	publicPath,
	port,
} from "./constants";
const grecaptchaClient = axios.create({
	baseURL: "https://www.google.com/recaptcha/api",
	headers: {
		"Content-Type": "application/json",
	},
});
const web3 = new Web3(ethProvider);
const contractOptions = {
	from: issuerAddress,
};
const contract = new web3.eth.Contract(
	personhoodNFT.abi as AbiItem[],
	contractAddress,
	contractOptions,
) as any;

const validateForm: RequestHandler = (req, res, next) => {
	const { address, grecaptcha } = req.body;

	if (!ethAddressRegExp.test(address) || !grecaptcha) {
		console.error("bad address or grecaptcha");
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

const checkScore: RequestHandler = (req, res, next) => {
	const { score } = res.locals;

	if (score < minimumPersonhoodScore) {
		console.error(`bad personhood score: ${score}`);
		res.redirect("/failure.html");
		return;
	}

	console.info(`good personhood score: ${score}`);
	next();
};

const issueToken: RequestHandler = async (req, res) => {
	const { address } = req.body;
	const { transactionHash } = await contract.methods.issue(address).send();

	if (!transactionHash) {
		console.error("transaction failed");
		res.redirect("/failure.html");
		return;
	}

	console.info(`sent transaction: ${transactionHash}`);
	res.redirect("/success.html");
};

const app = express()
	.set("port", port)
	.use(bodyParser.urlencoded({ extended: true }))
	.use("/", express.static(publicPath))
	.post("/submit", validateForm, getPersonhoodScore, checkScore, issueToken);

export default app;
