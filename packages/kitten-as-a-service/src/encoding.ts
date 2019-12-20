const encodeHex = (hexString: string): string => `0x${hexString}`;
const encodeAddress = (hexString: string): string =>
	encodeHex(hexString.slice(24));
const decodeHeight = (hexString: string): number => parseInt(hexString, 16);

interface SpendEventLog {
	prefix: string;
	tokenId: string;
	issuer: string;
	height: number;
	recipient: string;
	memo: string;
}

export const parseSpendEventLog = (data: string): SpendEventLog => {
	const prefix = data.slice(0, 2);
	const tokenIdBytes = data.slice(2, 66);
	const tokenId = encodeHex(tokenIdBytes);
	const issuerBytes = data.slice(66, 130);
	const issuer = encodeAddress(issuerBytes);
	const heightBytes = data.slice(130, 194);
	const height = decodeHeight(heightBytes);
	const recipientBytes = data.slice(194, 258);
	const recipient = encodeAddress(recipientBytes);
	const memo = data.slice(258, 322);

	return { prefix, tokenId, issuer, height, recipient, memo };
};
