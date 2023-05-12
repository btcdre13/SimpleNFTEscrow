const hre = require("hardhat");

async function main () {
  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy("0x0000000000000000000000000000000000000000", "0x1111111111111111111111111111111111111111");
  await escrow.deployed();

  console.log(`Escrow contract deployed at address: ${escrow.address}`);
  
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
