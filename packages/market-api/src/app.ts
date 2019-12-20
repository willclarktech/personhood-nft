import express, { RequestHandler } from "express";

interface Query {
	readonly issuer: string;
	readonly tokenId: string;
	readonly height: string;
}

type Handler = (query: Query) => number;

const myFirstIssuer = ({}: Query) => 0.1;

const mySecondIssuer = ({}: Query) => 0.04;

const handlers: { [issuer: string]: Handler } = {
	"0xe11ba2b4d45eaed5996cd0823791e0c93114882d": myFirstIssuer,
	"0xd03ea8624c8c5987235048901fb614fdca89b117": mySecondIssuer
};

const getRate: RequestHandler = (req, res) => {
	const { query } = req;
	console.info(`Received query: ${JSON.stringify(query)}`);

	const handler = handlers[query.issuer];
	if (!handler) {
		res.status(404).send("issuer not known");
		return;
	}

	const rate = handler(query);
	res.send({ rate });
};

const checkQuery: RequestHandler = (req, res, next) => {
	const { query } = req;
	if (!query.height || !query.issuer || !query.tokenId) {
		res.status(400).send("required query params: height, issuer, tokenId");
		return;
	}
	next();
};

const port = process.env.PORT || 3001;

const app = express()
	.set("port", port)
	.get("/rate", checkQuery, getRate);

export default app;
