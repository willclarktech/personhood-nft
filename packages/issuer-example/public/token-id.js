const decodeQuery = qs => {
	const trimmed = qs.startsWith("?") ? qs.slice(1) : qs;
	const split = trimmed.split("&").map(entry => entry.split("="));
	return split.reduce(
		(query, entry) => ({
			...query,
			[entry[0]]: entry[1],
		}),
		{},
	);
};

const queryString = decodeURIComponent(document.location.search);
const { tokenId } = decodeQuery(queryString);

if (tokenId) {
	document.getElementById("token-id").textContent = tokenId;
}
