import hre from "hardhat";

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [signer] = await hre.ethers.getSigners();
  const GSTInvoice = await hre.ethers.getContractAt("GSTInvoice", contractAddress, signer);

  const id = "INV-TEST-001";
  const seller = "Test Seller";
  const buyer = "Test Buyer";
  const product = "Test Product";
  const amount = 500;
  const gst = 18;
  const date = "2026-04-01";
  const hash = hre.ethers.id("some-hash");

  console.log("Storing test invoice...");
  const tx = await GSTInvoice.storeInvoice(id, seller, buyer, product, amount, gst, date, hash);
  await tx.wait();
  console.log("Invoice stored! Hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
