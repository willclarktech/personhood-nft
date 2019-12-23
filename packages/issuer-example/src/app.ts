import bodyParser from "body-parser";
import express from "express";
import { indexPath, publicPath, port, submitPath } from "./constants";
import { issueToken } from "./handlers";
import { validateForm, getPersonhoodScore, checkScore } from "./middleware";

const app = express()
	.set("port", port)
	.use(bodyParser.urlencoded({ extended: true }))
	.use(indexPath, express.static(publicPath))
	.post(submitPath, validateForm, getPersonhoodScore, checkScore, issueToken);

export default app;
