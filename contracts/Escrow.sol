// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";



contract Escrow is ERC721, ERC721Enumerable {
   
    address payable public rider;
    address payable public insignator;
    bool public unlocked;
    bool public done;



    constructor(address payable _insignator, address payable _rider) ERC721("Escrow", "ESCRW") {
        insignator = _insignator;
        rider = _rider;
        unlocked = false;
        done = false;
        _safeMint(insignator, 0);
        _safeMint(rider, 1);
    }

    function safeMint(address to, uint256 tokenId) public {
        require(tokenId <= 1);
        _safeMint(to, tokenId);
    }

    function withdraw() public whenNotDone onlyInsignator{
        (bool sent, ) = insignator.call{value: address(this).balance}("");
        require(sent, "Withdraw failed");
    }

    function withdrawRider() public whenNotDone onlyRider {
        require(unlocked, "The insignator has not unlocked the money yet");
        (bool sent, ) = rider.call{value: address(this).balance}("");
        require(sent, "Withdraw failed");
        done = true;
    }

    function unlockMoney() public whenNotDone onlyInsignator {
        unlocked = true;
    }

    function lockMoney() public whenNotDone onlyInsignator {
        unlocked = false;
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // modifiers
    
    modifier onlyInsignator() {
        require(ownerOf(0) == msg.sender, "only the insignator can call this function");
        _;
    }

    modifier onlyRider() {
        require(ownerOf(1) == msg.sender, "Only rider can call this method");
        _;
    }

    modifier whenNotDone() {
        require(!done, "The status of this escrow contract is done");
        _;
    }

    

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


    


    
}