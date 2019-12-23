import axios from "axios";
import {
	grecaptchaBaseUrl,
	grecaptchaSecret,
	grecaptchaSiteVerifyPath,
} from "./constants";

const grecaptchaClient = axios.create({
	baseURL: grecaptchaBaseUrl,
	headers: {
		"Content-Type": "application/json",
	},
});

const client = {
	post: (token: string) =>
		grecaptchaClient.post(
			grecaptchaSiteVerifyPath,
			{},
			{
				params: {
					secret: grecaptchaSecret,
					response: token,
				},
			},
		),
};

export default client;
