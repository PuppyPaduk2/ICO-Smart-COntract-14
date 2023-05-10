// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");

function datetoTimestamp(_dateString) {
  // Convert the input date string to a Date object
  const date = new Date(_dateString);
  
  // Get the Unix timestamp of the input date
  const timestamp = Math.floor(date.getTime() / 1000);
  
  return timestamp;
}

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ICOToken = await ethers.getContractFactory("ICOtoken");
  const token = await ICOToken.deploy();
  await token.deployed();

  const ICO = await ethers.getContractFactory("ICO");
  const ico = await ICO.deploy(datetoTimestamp("2023/05/09 18:00:00"), datetoTimestamp("2023/05/10 18:00:00"));
  await ico.deployed();

  console.log("Token address:", token.address);
  console.log("ICO address:", ico.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(token, ico);
}

function saveFrontendFiles(token, ico) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: token.address, ICO: ico.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("ICOtoken");
  const ICOArtifact = artifacts.readArtifactSync("ICO");

  fs.writeFileSync(
    path.join(contractsDir, "ICOtoken.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, "ICO.json"),
    JSON.stringify(ICOArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
