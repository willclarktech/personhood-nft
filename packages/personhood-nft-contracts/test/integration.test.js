const axios = require("axios");

const PersonhoodNFT = artifacts.require("PersonhoodNFT");

const webServicePort = process.env.WEB_SERVICE_PORT || 3000;
const webServiceClient = axios.create({
	baseURL: `http://localhost:${webServicePort}`,
});

const encodeHex = hexString => `0x${hexString}`;

contract(
	"PersonhoodNFT integration",
	([_root, person, service, highValueIssuer, lowValueIssuer]) => {
		it("integrates with a service", async () => {
			const instance = await PersonhoodNFT.deployed();

			// No session -> no kitten
			try {
				await webServiceClient.get("/kitten");
				expect.fail("unexpected successful kitten get");
			} catch (error) {
				if (!error.response) {
					expect.fail("no response");
				}
				expect(error.response.status).to.equal(401);
				expect(error.response.data).to.equal(
					"visit /challenge to get a challenge",
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
					headers: { cookie },
				});
				expect.fail("unexpected successful kitten get");
			} catch (error) {
				if (!error.response) {
					expect.fail("no response");
				}
				expect(error.response.status).to.equal(401);
				expect(error.response.data).to.equal("complete the challenge");
			}

			const issueResult = await instance.issue(person, {
				from: highValueIssuer,
			});
			const tokenId = issueResult.logs[0].args.tokenId.toNumber();
			await instance.spend(tokenId, service, encodeHex(challenge), {
				from: person,
			});

			// Token burned -> kitten :)
			const kittenResponse = await webServiceClient.get("/kitten", {
				headers: { cookie },
			});

			if (!kittenResponse.data) {
				expect.fail("no response data");
			}
			expect(kittenResponse.data.length).to.be.above(80000);
		});

		it("differentiates between different issuers", async () => {
			const instance = await PersonhoodNFT.deployed();

			const challengeResponse = await webServiceClient.get("/challenge");
			const challenge = challengeResponse.data;
			expect(challenge).to.match(/^[a-f0-9]{64}$/);

			const cookieToSet = challengeResponse.headers["set-cookie"][0];
			const cookie = cookieToSet.slice(0, cookieToSet.indexOf(";"));
			if (process.env.DEBUG) console.debug(cookie);

			const issueResult1 = await instance.issue(person, {
				from: lowValueIssuer,
			});
			const tokenId1 = issueResult1.logs[0].args.tokenId.toNumber();

			await instance.spend(tokenId1, service, encodeHex(challenge), {
				from: person,
			});

			// One token not worth enough -> no kitten
			try {
				await webServiceClient.get("/kitten", {
					headers: { cookie },
				});
				expect.fail("unexpected successful kitten get");
			} catch (error) {
				if (!error.response) {
					expect.fail("no response");
				}
				expect(error.response.status).to.equal(401);
				expect(error.response.data).to.equal("complete the challenge");
			}

			const issueResult2 = await instance.issue(person, {
				from: lowValueIssuer,
			});
			const tokenId2 = issueResult2.logs[0].args.tokenId.toNumber();
			await instance.spend(tokenId2, service, encodeHex(challenge), {
				from: person,
			});

			// Two tokens still not worth enough -> no kitten
			try {
				await webServiceClient.get("/kitten", {
					headers: { cookie },
				});
				expect.fail("unexpected successful kitten get");
			} catch (error) {
				if (!error.response) {
					expect.fail("no response");
				}
				expect(error.response.status).to.equal(401);
				expect(error.response.data).to.equal("complete the challenge");
			}

			const issueResult3 = await instance.issue(person, {
				from: lowValueIssuer,
			});
			const tokenId3 = issueResult3.logs[0].args.tokenId.toNumber();
			await instance.spend(tokenId3, service, encodeHex(challenge), {
				from: person,
			});

			// Token burned -> kitten :)
			const kittenResponse = await webServiceClient.get("/kitten", {
				headers: { cookie },
			});
			if (!kittenResponse.data) {
				expect.fail("no response data");
			}
			expect(kittenResponse.data.length).to.be.above(80000);
		});
	},
);
