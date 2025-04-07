// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandRegistry {
    struct Land {
        string landId;
        string location;
        uint256 area;
        string ownerName;
        string documentHash;
        uint256 price;
        bool isListed;
        address owner;
        uint256 timestamp;
    }

    mapping(string => Land) public lands;
    mapping(address => string[]) public ownerLands;
    
    event LandAdded(string landId, address owner);
    event LandUpdated(string landId, address owner);
    event LandListed(string landId, uint256 price);
    event LandUnlisted(string landId);

    modifier onlyLandOwner(string memory _landId) {
        require(lands[_landId].owner == msg.sender, "Not the land owner");
        _;
    }

    function addLand(
        string memory _landId,
        string memory _location,
        uint256 _area,
        string memory _ownerName,
        string memory _documentHash,
        uint256 _price
    ) public {
        require(lands[_landId].owner == address(0), "Land already exists");
        
        lands[_landId] = Land({
            landId: _landId,
            location: _location,
            area: _area,
            ownerName: _ownerName,
            documentHash: _documentHash,
            price: _price,
            isListed: false,
            owner: msg.sender,
            timestamp: block.timestamp
        });

        ownerLands[msg.sender].push(_landId);
        emit LandAdded(_landId, msg.sender);
    }

    function updateLand(
        string memory _landId,
        string memory _location,
        uint256 _area,
        string memory _ownerName,
        string memory _documentHash
    ) public onlyLandOwner(_landId) {
        Land storage land = lands[_landId];
        land.location = _location;
        land.area = _area;
        land.ownerName = _ownerName;
        land.documentHash = _documentHash;
        
        emit LandUpdated(_landId, msg.sender);
    }

    function listLand(string memory _landId, uint256 _price) public onlyLandOwner(_landId) {
        Land storage land = lands[_landId];
        land.isListed = true;
        land.price = _price;
        
        emit LandListed(_landId, _price);
    }

    function unlistLand(string memory _landId) public onlyLandOwner(_landId) {
        Land storage land = lands[_landId];
        land.isListed = false;
        
        emit LandUnlisted(_landId);
    }

    function getLandDetails(string memory _landId) public view returns (
        string memory landId,
        string memory location,
        uint256 area,
        string memory ownerName,
        string memory documentHash,
        uint256 price,
        bool isListed,
        address owner,
        uint256 timestamp
    ) {
        Land memory land = lands[_landId];
        return (
            land.landId,
            land.location,
            land.area,
            land.ownerName,
            land.documentHash,
            land.price,
            land.isListed,
            land.owner,
            land.timestamp
        );
    }

    function getOwnerLands(address _owner) public view returns (string[] memory) {
        return ownerLands[_owner];
    }

    function getListedLands() public view returns (string[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < ownerLands[msg.sender].length; i++) {
            if (lands[ownerLands[msg.sender][i]].isListed) {
                count++;
            }
        }

        string[] memory listedLands = new string[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < ownerLands[msg.sender].length; i++) {
            if (lands[ownerLands[msg.sender][i]].isListed) {
                listedLands[index] = ownerLands[msg.sender][i];
                index++;
            }
        }
        return listedLands;
    }
} 