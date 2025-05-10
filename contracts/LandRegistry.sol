// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandRegistry {
    struct Land {
        string landId;
        string location;
        uint256 area;
        string ownerName;
        string documentHash;
        address owner;
        uint256 timestamp;
    }

    mapping(string => Land) public lands;
    mapping(address => string[]) public ownerLands;
    
    event LandAdded(string landId, address owner);
    event LandUpdated(string landId, address owner);
    event OwnershipTransferred(string landId, address from, address to);

    modifier onlyLandOwner(string memory _landId) {
        require(lands[_landId].owner == msg.sender, "Not the land owner");
        _;
    }

    function addLand(
        string memory _landId,
        string memory _location,
        uint256 _area,
        string memory _ownerName,
        string memory _documentHash
    ) public {
        require(lands[_landId].owner == address(0), "Land already exists");
        
        lands[_landId] = Land({
            landId: _landId,
            location: _location,
            area: _area,
            ownerName: _ownerName,
            documentHash: _documentHash,
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

    function transferOwnership(string memory _landId, address _newOwner) public onlyLandOwner(_landId) {
        require(_newOwner != address(0), "Invalid new owner address");
        Land storage land = lands[_landId];
        
        // Remove from current owner's list
        string[] storage currentOwnerLands = ownerLands[msg.sender];
        for (uint256 i = 0; i < currentOwnerLands.length; i++) {
            if (keccak256(bytes(currentOwnerLands[i])) == keccak256(bytes(_landId))) {
                currentOwnerLands[i] = currentOwnerLands[currentOwnerLands.length - 1];
                currentOwnerLands.pop();
                break;
            }
        }

        // Add to new owner's list
        ownerLands[_newOwner].push(_landId);
        land.owner = _newOwner;
        
        emit OwnershipTransferred(_landId, msg.sender, _newOwner);
    }

    function getLandDetails(string memory _landId) public view returns (
        string memory landId,
        string memory location,
        uint256 area,
        string memory ownerName,
        string memory documentHash,
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
            land.owner,
            land.timestamp
        );
    }

    function getOwnerLands(address _owner) public view returns (string[] memory) {
        return ownerLands[_owner];
    }
} 