const siteKey = "6Lc45sgUAAAAAEyPJz_mI5rfjUX_2_OlnjRcAzYm";
const action = "social";
const inputId = "grecaptcha-token-input";
grecaptcha.ready(() =>
	grecaptcha.execute(siteKey, { action }).then(token => {
		document.getElementById(inputId).value = token;
	}),
);
