const { newKitFromWeb3 } = require("@celo/contractkit");
const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

const recipientsPath = path.join(__dirname, "recipients.json");
const recipients = JSON.parse(fs.readFileSync(recipientsPath, "utf8"));

const web3 = new Web3("https://alfajores-forno.celo-testnet.org");
const kit = newKitFromWeb3(web3);

const tokenAddress = "0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1";
const senderPrivateKey = process.env.PRIVATE_KEY;

const runAirdrop = async () => {
  if (!senderPrivateKey) throw new Error("PRIVATE_KEY is not set");
  kit.addAccount(senderPrivateKey);
  const [account] = await kit.web3.eth.getAccounts();
  if (!account) throw new Error("No account available after adding PRIVATE_KEY");
  kit.connection.defaultAccount = account;
  const token = await kit.contracts.getErc20(tokenAddress);

  for (const r of recipients) {
    console.log(`Sending 1 FLB to ${r.address}`);
    await token.transfer(r.address, r.amount).sendAndWaitForReceipt({ from: account });
  }

  console.log("✅ Airdrop completed!");
};

runAirdrop().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
