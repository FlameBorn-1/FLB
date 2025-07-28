import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import HealthIDNFT_ABI from "../HealthIDNFT.json"; // Adjust path to your ABI

const contractInterface = new ethers.Interface(HealthIDNFT_ABI.abi);

const RoleManager = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [contractAddress, setContractAddress] = useState("0x115aA20101bd0F95516Cc67ea104eD0B0c642919");
  const [role, setRole] = useState("MINTER_ROLE");
  const [targetAccount, setTargetAccount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [metadataUri, setMetadataUri] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
    } else {
      setFeedback({ message: "Please install MetaMask!", type: "error" });
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) return;
    try {
      const signerInstance = await provider.getSigner();
      setSigner(signerInstance);
      const connectedAccount = await signerInstance.getAddress();
      setAccount(connectedAccount);
      setFeedback({ message: `Connected to ${connectedAccount}`, type: "success" });
    } catch (error) {
      console.error(error);
      setFeedback({ message: "Failed to connect wallet.", type: "error" });
    }
  };

  const getContract = () => {
    if (!signer || !ethers.isAddress(contractAddress)) {
      setFeedback({ message: "Invalid contract address or wallet not connected.", type: "error" });
      return null;
    }
    return new ethers.Contract(contractAddress, contractInterface, signer);
  };

  const handleRoleAction = async (action: "grant" | "revoke") => {
    const contract = getContract();
    if (!contract || !ethers.isAddress(targetAccount)) {
      setFeedback({ message: "Invalid target account address.", type: "error" });
      return;
    }

    setLoading(true);
    setFeedback({ message: `Processing ${action} role...`, type: "info" });

    try {
      const roleBytes = ethers.id(role); // ethers.id computes keccak256
      const tx =
        action === "grant"
          ? await contract.grantRole(roleBytes, targetAccount)
          : await contract.revokeRole(roleBytes, targetAccount);

      await tx.wait();
      setFeedback({ message: `Role ${action} successful!`, type: "success" });
    } catch (error: any) {
      console.error(error);
      setFeedback({ message: error.reason || `Failed to ${action} role.`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    const contract = getContract();
    if (!contract || !ethers.isAddress(recipient)) {
      setFeedback({ message: "Invalid recipient address.", type: "error" });
      return;
    }

    setLoading(true);
    setFeedback({ message: "Minting HealthID NFT...", type: "info" });

    try {
      const tx = await contract.mintWithMetadata(recipient, metadataUri);
      const receipt = await tx.wait();
      
      const mintEvent = receipt.logs.find((log: any) => log.fragment?.name === "HealthIDMinted");
      const tokenId = mintEvent?.args?.tokenId?.toString() || "N/A";

      setFeedback({ message: `Mint successful! Token ID: ${tokenId}`, type: "success" });
    } catch (error: any) {
      console.error(error);
      setFeedback({ message: error.reason || "Failed to mint NFT.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' },
    card: { border: '1px solid #eee', padding: '15px', marginBottom: '20px', borderRadius: '5px' },
    input: { width: 'calc(100% - 22px)', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' },
    button: { padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px', backgroundColor: '#007bff', color: 'white' },
    buttonDisabled: { backgroundColor: '#ccc', cursor: 'not-allowed' },
    feedback: { padding: '10px', marginTop: '10px', borderRadius: '4px' },
  };

  return (
    <div style={styles.container}>
      <h2>Kairo Covenant - Role Manager</h2>
      {account ? (
        <p>Connected: {account}</p>
      ) : (
        <button onClick={connectWallet} style={styles.button}>Connect Wallet</button>
      )}

      <hr />

      <div style={styles.card}>
        <h3>Contract Information</h3>
        <label>HealthIDNFT Address</label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* Role Management */}
      <div style={styles.card}>
        <h3>Role Management</h3>
        <label>Account Address</label>
        <input
          type="text"
          placeholder="0x..."
          value={targetAccount}
          onChange={(e) => setTargetAccount(e.target.value)}
          style={styles.input}
        />
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
          <option value="MINTER_ROLE">MINTER_ROLE</option>
          <option value="MULTISIG_ROLE">MULTISIG_ROLE</option>
        </select>
        <button onClick={() => handleRoleAction("grant")} disabled={loading || !account} style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}>
          Grant Role
        </button>
        <button onClick={() => handleRoleAction("revoke")} disabled={loading || !account} style={loading ? {...styles.button, ...styles.buttonDisabled, backgroundColor: '#dc3545'} : {...styles.button, backgroundColor: '#dc3545'}}>
          Revoke Role
        </button>
      </div>

      {/* Minting */}
      <div style={styles.card}>
        <h3>Mint HealthID NFT</h3>
        <label>Recipient Address</label>
        <input
          type="text"
          placeholder="0x..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={styles.input}
        />
        <label>Metadata URI</label>
        <input
          type="text"
          placeholder="ipfs://..."
          value={metadataUri}
          onChange={(e) => setMetadataUri(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleMint} disabled={loading || !account} style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}>
          Mint HealthID
        </button>
      </div>

      {feedback && (
        <div
          style={{
            ...