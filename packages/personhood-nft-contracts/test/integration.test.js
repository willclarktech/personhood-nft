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
			const kittenResponse1 = await webServiceClient.get("/kitten");
			expect(kittenResponse1.data).to.equal(
				"visit /challenge to get a challenge"
			);

			const challengeResponse = await webServiceClient.get("/challenge");
			const challenge = challengeResponse.data;
			expect(challenge).to.match(/^[a-f0-9]{64}$/);

			const cookieToSet = challengeResponse.headers["set-cookie"][0];
			const cookie = cookieToSet.slice(0, cookieToSet.indexOf(";"));

			// No token burned -> no kitten
			const kittenResponse2 = await webServiceClient.get("/kitten", {
				headers: { cookie }
			});
			expect(kittenResponse2.data).to.equal("complete the challenge");

			const issueResult = await instance.identify(defaultPerson, {
				from: defaultIssuer
			});
			const tokenId = issueResult.logs[0].args.tokenId.toNumber();

			await instance.spend(tokenId, defaultService, encodeHex(challenge), {
				from: defaultPerson
			});

			// Token burned -> kitten :)
			const kittenResponse3 = await webServiceClient.get("/kitten", {
				headers: { cookie }
			});
			expect(kittenResponse3.data).to.equal("have a kitten");
		});
	}
);
