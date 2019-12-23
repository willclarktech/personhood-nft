import axios from "axios";
import { grecaptchaBaseUrl } from "./constants";

const grecaptchaClient = axios.create({
	baseURL: grecaptchaBaseUrl,
	headers: {
		"Content-Type": "application/json",
	},
});

export default grecaptchaClient;
