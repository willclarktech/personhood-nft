pragma solidity >=0.5.12 <0.6.0;

import "@openzeppelin/contracts/drafts/Counters.sol";
import '@openzeppelin/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721Full.sol';

contract PersonhoodNFT is ERC721Full, Ownable {
	using Counters for Counters.Counter;

	Counters.Counter private _tokenIds;

	constructor() ERC721Full("PersonhoodNFT", "PNFT") public {}

	function identify(address person) external returns (uint256) {
		_tokenIds.increment();

		uint256 newItemId = _tokenIds.current();
		_mint(person, newItemId);

		return newItemId;
	}
}
