pragma solidity >=0.5.12 <0.6.0;

import '@openzeppelin/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721Full.sol';

contract PersonhoodNFT is ERC721Full, Ownable {
	constructor() ERC721Full("PersonhoodNFT", "PNFT") public {}
}
