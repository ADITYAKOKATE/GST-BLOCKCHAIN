import hre from "hardhat";
import fs from "fs";

async function main() {
  const GSTInvoice = await hre.ethers.getContractFactory("GSTInvoice");
  const gstInvoice = await GSTInvoice.deploy();

  await gstInvoice.waitForDeployment();

  const address = await gstInvoice.getAddress();
  console.log("GSTInvoice deployed to:", address);
  fs.writeFileSync("contract_address.txt", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
