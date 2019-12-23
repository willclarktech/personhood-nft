import axios from "axios";
import {
	grecaptchaBaseUrl,
	grecaptchaSecret,
	grecaptchaSiteVerifyPath,
} from "./constants";

const baseClient = axios.create({
	baseURL: grecaptchaBaseUrl,
	headers: {
		"Content-Type": "application/json",
	},
});

const grecaptchaClient = {
	post: (token: string) =>
		baseClient.post(
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

export default grecaptchaClient;
