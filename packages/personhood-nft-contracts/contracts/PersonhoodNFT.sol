pragma solidity >=0.5.12 <0.6.0;

import "@openzeppelin/contracts/drafts/Counters.sol";
import '@openzeppelin/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721Full.sol';

contract PersonhoodNFT is ERC721Full, ERC721Burnable, Ownable {
	using Counters for Counters.Counter;

	struct Personhood {
		address issuer;
		uint256 timestamp;
	}

	Counters.Counter private tokenIds;
	mapping (uint256 => Personhood) private personhoods;

	event Spend(uint256 tokenId, address recipient, bytes32 memo);

	constructor() ERC721Full("PersonhoodNFT", "PNFT") public {}

	function identify(address person) external returns (uint256) {
		tokenIds.increment();

		uint256 tokenId = tokenIds.current();
		Personhood memory personhood = Personhood({
			issuer: msg.sender,
			timestamp: now
		});

		_mint(person, tokenId);
		personhoods[tokenId] = personhood;

		return tokenId;
	}

	function get(uint256 tokenId) external view returns (address issuer, uint256 timestamp) {
		Personhood memory personhood = personhoods[tokenId];
		return (personhood.issuer, personhood.timestamp);
	}

	function spend(uint256 tokenId, address recipient, bytes32 memo) external {
		burn(tokenId);
		delete personhoods[tokenId];
		emit Spend(tokenId, recipient, memo);
	}
}
