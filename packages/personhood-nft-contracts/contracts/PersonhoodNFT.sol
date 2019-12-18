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

	Counters.Counter private _tokenIds;
	mapping (uint256 => Personhood) private _personhoods;

	constructor() ERC721Full("PersonhoodNFT", "PNFT") public {}

	function identify(address person) external returns (uint256) {
		_tokenIds.increment();

		uint256 tokenId = _tokenIds.current();
		Personhood memory personhood = Personhood({
			issuer: msg.sender,
			timestamp: now
		});

		_mint(person, tokenId);
		_personhoods[tokenId] = personhood;

		return tokenId;
	}

	function get(uint256 tokenId) external view returns (address issuer, uint256 timestamp) {
		Personhood memory personhood = _personhoods[tokenId];
		return (personhood.issuer, personhood.timestamp);
	}

	function spend(uint256 tokenId) external {
		burn(tokenId);
		delete _personhoods[tokenId];
	}
}
