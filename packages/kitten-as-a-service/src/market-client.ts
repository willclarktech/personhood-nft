import axios from "axios";
import { marketBaseUrl, marketRatePath } from "./constants";

const baseClient = axios.create({
	baseURL: marketBaseUrl,
});

type MarketClientParams = {
	tokenId: string;
	issuer: string;
	height: number;
};

const marketClient = {
	get: (params: MarketClientParams) =>
		baseClient.get(marketRatePath, { params }),
};

export default marketClient;
