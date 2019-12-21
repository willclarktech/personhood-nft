import path from "path";

if (!process.env.GRECAPTCHA_SECRET) {
	throw new Error("Must set env variable GRECAPTCHA_SECRET");
}
export const grecaptchaSecret = process.env.GRECAPTCHA_SECRET;
export const port = process.env.PORT || 3002;
export const publicPath = path.join(__dirname, "..", "public");
export const minimumPersonhoodScore = 0.5;
export const issuerAddress = "0xe11ba2b4d45eaed5996cd0823791e0c93114882d";
export const contractAddress = "0xcfeb869f69431e42cdb54a4f4f105c19c080a601";

export const ethAddressRegExp = /0x[a-f0-9]{40}/i;
export const ethProvider = process.env.ETH_PROVIDER || "ws://localhost:8545";
