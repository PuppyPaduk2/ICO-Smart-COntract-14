import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import GlobalContext from "../context/GlobalContext";
import Navbar from "./Navbar";
import NavbarMobile from "./NavbarMobile";

const Header = () => {
  const { provider, account, handleConnectWallet } = useContext(GlobalContext);

  const navigate = useNavigate();

  return (
    <div className="header">
      <div className="flex gap-2">
        <NavbarMobile />

        <div
          className="font-poppins font-bold text-[21px] hover:text-blue-400"
          onClick={() => navigate("/")}
        >
          ICO App
        </div>
      </div>
      
    </div>
  );
};

export default Header;
