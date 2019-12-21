import axios from "axios";
import bodyParser from "body-parser";
import express, { RequestHandler } from "express";
import path from "path";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import personhoodNFT from "./contracts/PersonhoodNFT.json";

if (!process.env.GRECAPTCHA_SECRET) {
	throw new Error("Must set env variable GRECAPTCHA_SECRET");
}
const grecaptchaSecret = process.env.GRECAPTCHA_SECRET;
const port = process.env.PORT || 3002;
const publicPath = path.join(__dirname, "..", "public");
const minimumPersonhoodScore = 0.5;
const issuerAddress = "0xe11ba2b4d45eaed5996cd0823791e0c93114882d";
const contractAddress = "0xcfeb869f69431e42cdb54a4f4f105c19c080a601";

const ethAddressRegExp = /0x[a-f0-9]{40}/i;
const grecaptchaClient = axios.create({
	baseURL: "https://www.google.com/recaptcha/api",
	headers: {
		"Content-Type": "application/json",
	},
});
const ethProvider = process.env.ETH_PROVIDER || "ws://localhost:8545";
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
