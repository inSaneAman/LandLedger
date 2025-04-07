const hre = require("hardhat");

async function main() {
  console.log("Deploying LandRegistry contract...");

  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();

  await landRegistry.deployed();

  console.log("LandRegistry deployed to:", landRegistry.address);
  console.log("Transaction hash:", landRegistry.deployTransaction.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 