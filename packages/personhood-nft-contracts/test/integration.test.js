const axios = require("axios");

const PersonhoodNFT = artifacts.require("PersonhoodNFT");

const webServiceClient = axios.create({
	baseURL: "http://localhost:3000/"
});

const encodeHex = hexString => `0x${hexString}`;

contract(
	"PersonhoodNFT integration",
	([_rootAccount, defaultIssuer, defaultPerson, defaultService]) => {
		it("integrates with a service", async () => {
			const instance = await PersonhoodNFT.deployed();

			// No session -> no kitten
			try {
				await webServiceClient.get("/kitten");
				fail("unexpected successful kitten get");
			} catch (error) {
				expect(error.response.status).to.equal(401);
				expect(error.response.data).to.equal(
					"visit /challenge to get a challenge"
				);
			}

			const challengeResponse = await webServiceClient.get("/challenge");
			const challenge = challengeResponse.data;
			expect(challenge).to.match(/^[a-f0-9]{64}$/);

			const cookieToSet = challengeResponse.headers["set-cookie"][0];
			const cookie = cookieToSet.slice(0, cookieToSet.indexOf(";"));
			if (process.env.DEBUG) console.debug(cookie);

			// No token burned -> no kitten
			try {
				await webServiceClient.get("/kitten", {
					headers: { cookie }
				});
				fail("unexpected successful kitten get");
			} catch (error) {
				expect(error.response.status).to.equal(401);
				expect(error.response.data).to.equal("complete the challenge");
			}

			const issueResult = await instance.identify(defaultPerson, {
				from: defaultIssuer
			});
			const tokenId = issueResult.logs[0].args.tokenId.toNumber();

			await instance.spend(tokenId, defaultService, encodeHex(challenge), {
				from: defaultPerson
			});

			// Token burned -> kitten :)
			const kittenResponse = await webServiceClient.get("/kitten", {
				headers: { cookie }
			});
			expect(kittenResponse.data.length).to.be.above(80000);
		});
	}
);
