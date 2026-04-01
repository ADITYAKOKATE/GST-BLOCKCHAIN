import hre from "hardhat";

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log("Checking contract at:", contractAddress);
  const code = await hre.ethers.provider.getCode(contractAddress);
  
  if (code === "0x") {
    console.log("No contract deployed at this address!");
    return;
  }
  
  const GSTInvoice = await hre.ethers.getContractAt("GSTInvoice", contractAddress);
  const filter = GSTInvoice.filters.InvoiceStored();
  const logs = await GSTInvoice.queryFilter(filter, 0, "latest");

  console.log(`Found ${logs.length} transactions.`);
  logs.forEach((log, index) => {
    console.log(`\nTransaction ${index + 1}:`);
    console.log("ID:", log.args.id);
    console.log("Owner:", log.args.owner);
    console.log("Seller:", log.args.seller);
    console.log("Buyer:", log.args.buyer);
    console.log("Amount:", log.args.amount.toString());
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
