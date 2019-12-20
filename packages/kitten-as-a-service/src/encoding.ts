const encodeHex = (hexString: string) => `0x${hexString}`;
const encodeAddress = (hexString: string) => encodeHex(hexString.slice(24));
const decodeHeight = (hexString: string) => parseInt(hexString, 16);

export const parseSpendEventLog = (data: string) => {
	const prefix = data.slice(0, 2);
	const tokenIdBytes = data.slice(2, 66);
	const tokenId = encodeHex(tokenIdBytes);
	const issuerBytes = data.slice(66, 130);
	const issuer = encodeAddress(issuerBytes);
	const heightBytes = data.slice(130, 194);
	const height = decodeHeight(heightBytes);
	const recipientBytes = data.slice(194, 258);
	const recipientAddress = encodeAddress(recipientBytes);
	const memo = data.slice(258, 322);

	return { prefix, tokenId, issuer, height, recipientAddress, memo };
};
