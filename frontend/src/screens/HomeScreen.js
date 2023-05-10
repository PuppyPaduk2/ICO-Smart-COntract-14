import React, { useState, useEffect, useContext } from "react";

import { useNavigate } from "react-router-dom";

import Circle from "../components/Circle";
import SaleEnds from "../components/SaleEnds";
import millify from "millify";
import TokenDetails from "../components/TokenDetails";
import TransactionToast from "../components/TransactionToast";
import GlobalContext from "../context/GlobalContext";
import handleError from "../utils/handleError";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { Progress } from "antd";

const HomeScreen = () => {
  const { provider, signer, contract, account, icoState, handleConnectWallet } =
    useContext(GlobalContext);
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [userAmount, setUserAmount] = useState("");
  const handleBuy = async () => {
    if (!signer) {
      handleConnectWallet();
      return;
    }

    try {
      const tx = await contract.stknICO.invest({
        value: ethers.utils.parseEther((0.0001 * userAmount).toString()),
      });
      setUserAmount("");
      toast.success(
        <TransactionToast
          userAmount={userAmount}
          hash={tx.hash}
          text="Placed Buy request for"
          text2="Please Wait Few Mins for confirmation"
        />
      );

      await tx.wait();

      toast.success(
        <TransactionToast
          userAmount={userAmount}
          hash={tx.hash}
          text="Purchased"
        />
      );
      handleConnectWallet();
    } catch (error) {
      handleError(error, "STKN");
    }
  };
  useEffect(() => {
    setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
  }, []);
  return (
    <div>
      <div className="md:ml-6 md:flex md:h-[20vh] md:items-center">
        <div className="flex justify-center items-center w-full">
          <div className="card mt-4">
            <div className="text-2xl text-center p-4">Current Time: {time}</div>
          </div>
        </div>
        <div className="flex justify-center items-center w-full">
          <div className="btn text-[1rem]">Connect Wallet</div>
        </div>
      </div>
      <div className="md:ml-6 md:flex md:h-[20vh] md:items-center">
        <div className="flex justify-center items-center w-full">
          <div className="card">
            <div className="flex justify-center items-center flex-col">
              <div className="m-3">Price: 0.0001 Ether</div>
              <input
                className="input"
                type="number"
                min={10}
                max={30000}
                placeholder="No. of STKN Tokens..."
                value={userAmount}
                onChange={(e) => {
                  setUserAmount(e.target.value);
                }}
              />
              {userAmount >= 10 && userAmount <= 30000 ? (
                <div className="mb-3 text-green-500">
                  Total Pay:{" "}
                  {millify(0.0001 * userAmount, {
                    precision: 4,
                  })}{" "}
                  Ether
                </div>
              ) : null}
              {userAmount < 10 && userAmount !== "" ? (
                <div className="text-red-500 mb-3">Min Tokens: 10 </div>
              ) : null}
              {userAmount > 30000 ? (
                <div className="text-red-500 mb-3">Max Tokens: 30000 </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center w-full">
          <div className="btn text-[1rem]"> Button </div>
        </div>
      </div>
      <div className="md:ml-6 md:flex md:h-[20vh] md:items-center">
        <div className="flex justify-center items-center w-full">
          <div className="card" style={{width:'60%'}}>
            <Progress percent={50} strokeWidth={10} strokeColor={"yellow"} />
          </div>
        </div>
      </div>
      <div className="md:ml-6 md:flex md:h-[20vh] md:items-center">
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
  );
};

export default HomeScreen;
