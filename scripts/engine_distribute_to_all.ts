import fs from "fs";
import path from "path";
import "dotenv/config";
import {
  Contract,
  Interface,
  JsonRpcProvider,
  Wallet,
  ethers
} from 'ethers';
import { buildFees, nextNonce } from './_fees.js';

const RPC =
  process.env.ALFAJORES_RPC_URL ||
  "https://alfajores-forno.celo-testnet.org";
const PK = process.env.PRIVATE_KEY as string;
const ENGINE = process.env.ENGINE_ADDRESS as string;
const TOKEN = process.env.FLB_TOKEN_ADDRESS as string;
const RECIPIENTS_FILE =
  process.env.RECIPIENTS_FILE || "recipients.json";

const ONE_FLB_WEI = ethers.parseUnits("1", 18);

type Row = {
  address: string;
  amount?: string | number;
};

type Candidate = {
  name: string;
  inputs: readonly string[];
  prepareArgs: (
    token: string,
    to: string,
    amount: bigint
  ) => Array<string | bigint>;
};

const CANDIDATES: Candidate[] = [
  {
    name: "transferToken",
    inputs: ["address", "address", "uint256"],
    prepareArgs: (token, to, amount) => [token, to, amount]
  },
  {
    name: "mint",
    inputs: ["address", "uint256"],
    prepareArgs: (_token, to, amount) => [to, amount]
  },
  {
    name: "sendToken",
    inputs: ["address", "address", "uint256"],
    prepareArgs: (token, to, amount) => [token, to, amount]
  },
  {
    name: "distribute",
    inputs: ["address", "uint256", "address"],
    prepareArgs: (token, to, amount) => [to, amount, token]
  },
  {
    name: "distribute",
    inputs: ["address", "uint256"],
    prepareArgs: (_token, to, amount) => [to, amount]
  },
  {
    name: "send",
    inputs: ["address", "uint256", "address"],
    prepareArgs: (token, to, amount) => [to, amount, token]
  },
  {
    name: "send",
    inputs: ["address", "uint256"],
    prepareArgs: (_token, to, amount) => [to, amount]
  }
];

function ensure(label: string, value: string | undefined) {
  if (!value) throw new Error(`Missing ${label} in environment`);
}

function parseAmount(raw: Row["amount"]): bigint {
  if (raw === undefined || raw === null) return ONE_FLB_WEI;
  if (typeof raw === "number") return ethers.parseUnits(raw.toString(), 18);
  const trimmed = raw.trim();
  if (!trimmed) return ONE_FLB_WEI;
  return ethers.parseUnits(trimmed, 18);
}

async function detectEngineFunction(
  provider: JsonRpcProvider,
  engineAddress: string,
  wallet: Wallet
) {
  const proxyCode = await provider.getCode(engineAddress);
  if (proxyCode === "0x") {
    throw new Error(`No contract code found at ENGINE ${engineAddress}`);
  }

  const IMPLEMENTATION_SLOT =
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  const rawSlot = await provider.getStorage(
    engineAddress,
    IMPLEMENTATION_SLOT
  );

  const implAddress = ethers.getAddress(
    "0x" + rawSlot.slice(rawSlot.length - 40)
  );
  const code = (await provider.getCode(implAddress)).toLowerCase();
  if (code === "0x") {
    throw new Error(`No implementation code found for ENGINE proxy at ${implAddress}`);
  }

  const dummyRecipient = "0x000000000000000000000000000000000000dEaD";
  const probeAmount = ONE_FLB_WEI;

  for (const candidate of CANDIDATES) {
    const iface = new Interface([
      {
        type: "function",
        name: candidate.name,
        stateMutability: "nonpayable",
        inputs: candidate.inputs.map((type) => ({ type })),
        outputs: []
      }
    ]);

    const func = iface.getFunction(candidate.name);
    if (!func) {
      continue; // Should not happen given the candidate definition
    }
    const selector = func.selector.toLowerCase().slice(2);

    if (!code.includes(selector)) {
      continue;
    }

    const contract = new Contract(engineAddress, iface, wallet);
    const args = candidate.prepareArgs(TOKEN, dummyRecipient, probeAmount).map(
      (arg) => (typeof arg === "bigint" ? arg.toString() : arg)
    );

    try {
      await (contract as any)[candidate.name].staticCall(...args);
    } catch (error) {
      console.log(
        `[warn] Probe for ${candidate.name} reverted (${(error as Error).message}). Assuming selector exists.`
      );
    }

    return {
      description: `${candidate.name}(${candidate.inputs.join(",")})`,
      execute: (recipient: string, amount: bigint, overrides: any) => {
        const prepared = candidate
          .prepareArgs(TOKEN, recipient, amount)
          .map((arg) => (typeof arg === "bigint" ? arg.toString() : arg));
        return (contract as any)[candidate.name](...prepared, overrides);
      }
    };
  }

  throw new Error(
    "Unable to detect an engine distribution function. Provide the engine ABI or set a known function name."
  );
}

(async () => {
  ensure("PRIVATE_KEY", PK);
  ensure("ENGINE_ADDRESS", ENGINE);
  ensure("FLB_TOKEN_ADDRESS", TOKEN);

  const provider = new JsonRpcProvider(RPC);
  const wallet = new Wallet(PK, provider);

  console.log(`Operator: ${wallet.address}`);
  console.log(`Engine  : ${ENGINE}`);
  console.log(`Token   : ${TOKEN}`);

  const recipientsPath = path.resolve(RECIPIENTS_FILE);
  if (!fs.existsSync(recipientsPath)) {
    throw new Error(`Recipients file not found: ${recipientsPath}`);
  }

  const rawRows: Row[] = JSON.parse(
    fs.readFileSync(recipientsPath, "utf8")
  );

  const recipients = rawRows.filter((row) => {
    if (!row.address) return false;
    if (!ethers.isAddress(row.address)) {
      console.warn(`[warn] Skipping invalid address ${row.address}`);
      return false;
    }
    return true;
  });

  if (!recipients.length) {
    throw new Error("No valid recipients found in recipients.json");
  }

  const engine = await detectEngineFunction(provider, ENGINE, wallet);
  console.log(`[detected] Engine function: ${engine.description}`);

  let nonce = await nextNonce(provider, wallet.address);

  console.log(`[gas] Starting nonce: ${nonce}`);

  let index = 0;
  for (const row of recipients) {
    index += 1;
    const amountWei = parseAmount(row.amount);
    const formatted = ethers.formatUnits(amountWei, 18);

    console.log(
      `[tx:${index}/${recipients.length}] ${row.address} <- ${formatted} FLB`
    );

    try {
      const fee = await buildFees(provider);
      const tx = await engine.execute(row.address, amountWei, {
        ...fee,
        nonce
      });
      console.log(`   [sent] tx: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`   [mined] block: ${receipt.blockNumber}`);

      nonce += 1;
    } catch (error) {
      console.error(
        `   [error] failed to send to ${row.address}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  console.log("Engine distribution complete.");
})().catch((error) => {
  console.error("Distribution aborted:", error);
  process.exitCode = 1;
});
