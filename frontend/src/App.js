import React, { useState, useEffect } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/Header";
import GlobalContext from "./context/GlobalContext";
import Footer from "./components/Footer";
import millify from "millify";

import { Progress } from "antd";
import Web3 from 'web3';
import ICO from './contracts/ICO.json';
import ICOToken from './contracts/ICOtoken.json';


const web3 = new Web3(Web3.givenProvider);
const icoAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const icoTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function App() {

  // const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toLocaleString());

  const [account, setAccount] = useState('');
  const [bnbbalance, setBnbBalance] = useState(0);
  const [icobalance, setIcoBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [totalDeposit, settotalDeposit] = useState(0);

  const connectBlockchain = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    console.log(account);
    setAccount(account);
    const bnbBalance = await web3.eth.getBalance(account);
    setBnbBalance(bnbBalance);
    const contract = new web3.eth.Contract(ICOToken.abi, icoTokenAddress);
    const icoBalance = await contract.methods.balanceOf(account).call();
    setIcoBalance(icoBalance);
  };

  const depositBNB = async () => {
    const contract = new web3.eth.Contract(ICO.abi, icoAddress);
    const amount = web3.utils.toWei(depositAmount.toString(), 'ether');
    await contract.methods.deposit().send({
      value: amount,
      from: account
    });
    setDepositAmount(0);
    alert('BNB has been deposited successfully!');
  };

  const withdrawBNB = async () => {
    const contract = new web3.eth.Contract(ICO.abi, icoAddress);
    await contract.methods.withdraw().send({
      from: account
    });
    alert('BNB has been withdrawn successfully!');
  };

  const claimICO = async () => {
    const contract = new web3.eth.Contract(ICO.abi, icoAddress);
    await contract.methods.claim().send({
      from: account
    });
    alert('ICO tokens have been claimed successfully!');
  };

  useEffect(() => {
    setInterval(() => {
      setTime(new Date().toLocaleString());
    }, 1000);
    setInterval(() => {
      const contract = new web3.eth.Contract(ICO.abi, icoAddress);
      settotalDeposit(contract.methods.getTotalDeposit());
    }, 10000)
  }, []);

  return (
    <div className="app-wrapper">
      <GlobalContext.Provider
        value={{
        }}
      >
        {account ? (
          <div className="">
            <Header />
            <ToastContainer
              position="top-center"
              theme="dark"
              toastStyle={{
                backgroundColor: "#1e40af",
                fontWeight: "bold",
                fontFamily: "poppins",
                borderRadius: "5rem",
              }}
            />
            <div className="screen-wrapper">
              <div>
                <div className="md:ml-6 md:flex md:h-[20vh] md:items-center">
                  <div className="flex justify-center items-center w-full">
                    <div className="card mt-4">
                      <div className="text-2xl text-center p-4">BNB Balance: {web3.utils.fromWei(bnbbalance.toString(), 'ether')} BNB</div>
                      {/* <div className="text-2xl text-center p-4">ICO Token Balance: {icobalance} ICO</div> */}
                    </div>
                  </div>
                  <div className="flex justify-center items-center w-full">
                    <div className="card mt-4">
                      <div className="text-2xl text-center p-4">Current Time: {time}</div>
                    </div>
                  </div>
                </div>

                <div className="md:ml-6 md:flex md:h-[20vh] md:items-center">
                  <div className="flex justify-center items-center w-full">
                    <form onSubmit={(e) => { e.preventDefault(); depositBNB(); }}>
                      <div className="card">
                        <div className="flex justify-center items-center flex-col">
                          <div className="m-3">Min: 0.01BNB | Max: 0.05BNB</div>
                          <input
                            className="input"
                            type="number"
                            value={depositAmount}
                            step="0.1"
                            min="10"
                            max="50"
                            required
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="No. of ICO Tokens..."
                          />
                          {depositAmount >= 10 && depositAmount <= 50 ? (
                            <div className="mb-3 text-green-500">
                              Total Pay:{" "}
                              {millify(0.001 * depositAmount, {
                                precision: 4,
                              })}{" "}
                            </div>
                          ) : null}
                          {depositAmount < 10 && depositAmount !== "" ? (
                            <div className="text-red-500 mb-3">Min Tokens: 10 </div>
                          ) : null}
                          {depositAmount > 50 ? (
                            <div className="text-red-500 mb-3">Max Tokens: 50 </div>
                          ) : null}
                        </div>
                      </div>
                      <button className="btn text-[1rem]" type="submit">Deposit</button>&nbsp;
                      <button className="btn text-[1rem]" onClick={() => withdrawBNB()}>Withdraw</button>&nbsp;
                      <button className="btn text-[1rem]" onClick={() => claimICO()}>Claim</button>
                    </form>
                  </div>
                </div>

                <div className="md:ml-6 md:flex md:h-[35vh] md:items-center">
                  <div className="flex justify-center items-center w-full">
                    <div className="card" style={{ width: '60%' }}>
                      <div className="flex">
                        <div style={{ paddingLeft: '10%', fontSize: '15px' }}>Soft Cap</div>
                        <div style={{ paddingLeft: '80%', fontSize: '15px' }}>Hard Cap</div>
                      </div>
                      <Progress percent={totalDeposit/10} strokeWidth={15} showInfo={false} strokeColor={"yellow"} />
                    </div>
                  </div>
                </div>

                <div className="md:ml-6 md:flex md:h-[1vh] md:items-center">
                  <div className="flex justify-center items-center w-full">
                    <div className="card mt-4">
                      <div className="text-2xl text-center p-4">Start Time: </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center w-full">
                    <div className="card mt-4">
                      <div className="text-2xl text-center p-4">End Time: </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-end">
              <Footer />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div className="md:ml-6 md:flex md:h-[20vh] md:items-center">
              <div className="flex justify-center items-center w-full">
                <div className="card mt-4">
                  <h1 className='text-2xl text-center p-4'>BNB Testnet ICO</h1>
                </div>
              </div>
            </div>
            <button className="btn text-[1rem]" onClick={() => connectBlockchain()}>Connect to Wallet</button>
          </div>
        )}
      </GlobalContext.Provider>
    </div>
  );
}
export default App;