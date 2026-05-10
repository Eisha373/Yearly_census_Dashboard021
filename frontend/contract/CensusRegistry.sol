// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NetworkStateCensus {
    
    struct Citizen {
        address wallet;
        string country;
        string metricType;
        uint256 timestamp;
        bool isActive;
    }
    
    mapping(address => Citizen) public citizens;
    address[] public citizenList;
    uint256 public totalMembers;
    
    event CitizenRegistered(address indexed wallet, string country, string metricType);
    
    function registerCitizen(string memory _country, string memory _metricType) public {
        require(!citizens[msg.sender].isActive, "Already registered");
        citizens[msg.sender] = Citizen({
            wallet: msg.sender,
            country: _country,
            metricType: _metricType,
            timestamp: block.timestamp,
            isActive: true
        });
        citizenList.push(msg.sender);
        totalMembers++;
        emit CitizenRegistered(msg.sender, _country, _metricType);
    }
    
    function getTotalMembers() public view returns (uint256) {
        return totalMembers;
    }
    
    function getCitizen(address _wallet) public view returns (
        string memory country,
        string memory metricType,
        uint256 timestamp,
        bool isActive
    ) {
        Citizen memory c = citizens[_wallet];
        return (c.country, c.metricType, c.timestamp, c.isActive);
    }
    
    function getAllCitizens() public view returns (address[] memory) {
        return citizenList;
    }
}