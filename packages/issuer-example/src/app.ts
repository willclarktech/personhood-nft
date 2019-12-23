import bodyParser from "body-parser";
import express from "express";
import { publicPath, port } from "./constants";
import { issueToken } from "./handlers";
import { validateForm, getPersonhoodScore, checkScore } from "./middleware";

const app = express()
	.set("port", port)
	.use(bodyParser.urlencoded({ extended: true }))
	.use("/", express.static(publicPath))
	.post("/submit", validateForm, getPersonhoodScore, checkScore, issueToken);

export default app;
