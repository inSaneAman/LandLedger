const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistry", function () {
  let LandRegistry;
  let landRegistry;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract
    LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy();
    await landRegistry.deployed();
  });

  describe("Land Management", function () {
    it("Should add a new land", async function () {
      const landId = "LAND123";
      const location = "New York";
      const area = ethers.utils.parseUnits("1000", "ether");
      const ownerName = "John Doe";
      const documentHash = "QmHash123";
      const price = ethers.utils.parseUnits("1.5", "ether");

      await landRegistry.addLand(
        landId,
        location,
        area,
        ownerName,
        documentHash,
        price
      );

      const landDetails = await landRegistry.getLandDetails(landId);
      
      expect(landDetails.landId).to.equal(landId);
      expect(landDetails.location).to.equal(location);
      expect(landDetails.area).to.equal(area);
      expect(landDetails.ownerName).to.equal(ownerName);
      expect(landDetails.documentHash).to.equal(documentHash);
      expect(landDetails.price).to.equal(price);
      expect(landDetails.isListed).to.equal(false);
      expect(landDetails.owner).to.equal(owner.address);
    });

    it("Should update land details", async function () {
      // First add a land
      const landId = "LAND123";
      await landRegistry.addLand(
        landId,
        "New York",
        ethers.utils.parseUnits("1000", "ether"),
        "John Doe",
        "QmHash123",
        ethers.utils.parseUnits("1.5", "ether")
      );

      // Then update it
      const newLocation = "Los Angeles";
      const newArea = ethers.utils.parseUnits("2000", "ether");
      const newOwnerName = "Jane Smith";
      const newDocumentHash = "QmHash456";

      await landRegistry.updateLand(
        landId,
        newLocation,
        newArea,
        newOwnerName,
        newDocumentHash
      );

      const landDetails = await landRegistry.getLandDetails(landId);
      
      expect(landDetails.location).to.equal(newLocation);
      expect(landDetails.area).to.equal(newArea);
      expect(landDetails.ownerName).to.equal(newOwnerName);
      expect(landDetails.documentHash).to.equal(newDocumentHash);
    });

    it("Should list and unlist land", async function () {
      // First add a land
      const landId = "LAND123";
      await landRegistry.addLand(
        landId,
        "New York",
        ethers.utils.parseUnits("1000", "ether"),
        "John Doe",
        "QmHash123",
        ethers.utils.parseUnits("1.5", "ether")
      );

      // List the land
      const newPrice = ethers.utils.parseUnits("2.0", "ether");
      await landRegistry.listLand(landId, newPrice);

      let landDetails = await landRegistry.getLandDetails(landId);
      expect(landDetails.isListed).to.equal(true);
      expect(landDetails.price).to.equal(newPrice);

      // Unlist the land
      await landRegistry.unlistLand(landId);

      landDetails = await landRegistry.getLandDetails(landId);
      expect(landDetails.isListed).to.equal(false);
    });

    it("Should get owner's lands", async function () {
      // Add multiple lands for the owner
      await landRegistry.addLand(
        "LAND123",
        "New York",
        ethers.utils.parseUnits("1000", "ether"),
        "John Doe",
        "QmHash123",
        ethers.utils.parseUnits("1.5", "ether")
      );

      await landRegistry.addLand(
        "LAND456",
        "Los Angeles",
        ethers.utils.parseUnits("2000", "ether"),
        "John Doe",
        "QmHash456",
        ethers.utils.parseUnits("2.5", "ether")
      );

      const ownerLands = await landRegistry.getOwnerLands(owner.address);
      expect(ownerLands.length).to.equal(2);
      expect(ownerLands).to.include("LAND123");
      expect(ownerLands).to.include("LAND456");
    });

    it("Should get listed lands", async function () {
      // Add multiple lands
      await landRegistry.addLand(
        "LAND123",
        "New York",
        ethers.utils.parseUnits("1000", "ether"),
        "John Doe",
        "QmHash123",
        ethers.utils.parseUnits("1.5", "ether")
      );

      await landRegistry.addLand(
        "LAND456",
        "Los Angeles",
        ethers.utils.parseUnits("2000", "ether"),
        "John Doe",
        "QmHash456",
        ethers.utils.parseUnits("2.5", "ether")
      );

      // List only one land
      await landRegistry.listLand("LAND123", ethers.utils.parseUnits("1.5", "ether"));

      const listedLands = await landRegistry.getListedLands();
      expect(listedLands.length).to.equal(1);
      expect(listedLands[0]).to.equal("LAND123");
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to update land", async function () {
      // First add a land
      const landId = "LAND123";
      await landRegistry.addLand(
        landId,
        "New York",
        ethers.utils.parseUnits("1000", "ether"),
        "John Doe",
        "QmHash123",
        ethers.utils.parseUnits("1.5", "ether")
      );

      // Try to update with a different address
      await expect(
        landRegistry.connect(addr1).updateLand(
          landId,
          "Los Angeles",
          ethers.utils.parseUnits("2000", "ether"),
          "Jane Smith",
          "QmHash456"
        )
      ).to.be.revertedWith("Not the land owner");
    });

    it("Should only allow owner to list/unlist land", async function () {
      // First add a land
      const landId = "LAND123";
      await landRegistry.addLand(
        landId,
        "New York",
        ethers.utils.parseUnits("1000", "ether"),
        "John Doe",
        "QmHash123",
        ethers.utils.parseUnits("1.5", "ether")
      );

      // Try to list with a different address
      await expect(
        landRegistry.connect(addr1).listLand(landId, ethers.utils.parseUnits("2.0", "ether"))
      ).to.be.revertedWith("Not the land owner");

      // Try to unlist with a different address
      await expect(
        landRegistry.connect(addr1).unlistLand(landId)
      ).to.be.revertedWith("Not the land owner");
    });
  });
}); 