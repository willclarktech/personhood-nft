import axios from "axios";
import { marketBaseUrl } from "./constants";

const marketClient = axios.create({
	baseURL: marketBaseUrl
});

export default marketClient;
