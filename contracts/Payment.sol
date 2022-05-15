//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

contract Payment is OwnableUpgradeable {
    uint public itemIds;
    mapping (uint => address) public itemToOwner;
    mapping (uint => uint) public itemToValue;
    mapping (uint => uint8) public itemToType;
    mapping (uint8 => uint) public typeCount;

    event ItemBought(address buyer, uint itemId, uint value, uint8 itemType);

    function initialize(address payee) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        _transferOwnership(payee);
        itemIds = 0;
    }

    function buyItem(uint8 itemType) public payable {
        itemIds++;
        require(msg.value > 0, 'You must pay for the item');
        itemToOwner[itemIds] = msg.sender;
        itemToValue[itemIds] = msg.value;
        itemToType[itemIds] = itemType;
        emit ItemBought(msg.sender, itemIds, msg.value, itemType);
        typeCount[itemType]++;
    }

    function withdraw() public onlyOwner payable {
        payable(msg.sender).transfer(getBalance());
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
}
