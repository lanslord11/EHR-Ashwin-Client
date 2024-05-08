import './App.css';
import Upload from "./artifacts/contracts/Upload.sol/Upload.json"
import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import FileUpload from "./components/FileUpload";
import Display from './components/Display';
import Modal from './components/Modal';

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadProvider = async () => {
      try {
        // Check if MetaMask is installed
        if (window.ethereum) {
          // Initialize provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          // Listen for chain and account changes
          window.ethereum.on("chainChanged", () => window.location.reload());
          window.ethereum.on("accountsChanged", () => window.location.reload());

          // Request account access
          const accounts = await provider.send("eth_requestAccounts", []);
          const address = accounts[0]; // Get the first account
          setAccount(address);

          // Get signer with the provided account
          const signer = provider.getSigner(address);
          console.log("Signer", signer);

          // Set contract address
          const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

          // Initialize contract with signer
          const contract = new ethers.Contract(contractAddress, Upload.abi, signer);
          setContract(contract);
        } else {
          console.error("MetaMask is not installed");
        }
      } catch (error) {
        console.error("Error initializing provider:", error);
      }
    };

    loadProvider();
  }, []);

  return (
    <>
      {!modalOpen && (<button style={{zIndex:"3"}} className='share' onClick={() => setModalOpen(true)}>
        <img src="https://img.icons8.com/ios/452/share--v1.png" alt="share" />
      </button>)}
      {modalOpen && (<Modal setModalOpen={setModalOpen} contract={contract}></Modal>)}
      <div className="App">
        <h1 style={{ color: "white" }}>EHR Blockchain</h1>
        <div className="bg"></div>
        <div className="bg bg2"></div>
        <div className="bg bg3"></div>

        <p style={{ color: "white" }}>Account : {account ? account : "MM not connected"}</p>
        <FileUpload account={account} provider={provider} contract={contract}></FileUpload>
        <Display contract={contract} account={account}></Display>
      </div>
    </>
  );
}

export default App;
