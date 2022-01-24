import React, { useEffect, useState } from "react";
import axios from "axios";
import { StargateClient } from "@cosmjs/stargate";

import GearIcon from "../icons/Gear";
import Button from "../inputs/Button";
import Input from "../../components/inputs/Input";
import { useAppContext } from "../../context/AppContext";
import Select from "../inputs/Select";
import StackableContainer from "../layout/StackableContainer";

const ChainSelect = () => {
  const { state, dispatch } = useAppContext();

  // UI State
  const [chainArray, setChainArray] = useState();
  const [chainOptions, setChainOptions] = useState();
  const [chainError, setChainError] = useState();
  const [showSettings, setShowSettings] = useState(false);
  const [denomOptions, setDenomOptions] = useState([]);
  const [selectValue, setSelectValue] = useState({ label: "Loading...", value: -1 });

  // Chain State
  const [tempChainId, setChainId] = useState(state.chain.chainId);
  const [tempNodeAddress, setNodeAddress] = useState(state.chain.nodeAddress);
  const [tempAddressPrefix, setAddressPrefix] = useState(state.chain.addressPrefix);
  const [tempDenom, setDenom] = useState(state.chain.denom);
  const [tempDisplayDenom, setDisplayDenom] = useState(state.chain.displayDenom);
  const [tempDisplayDenomExponent, setDisplayDenomExponent] = useState(
    state.chain.displayDenomExponent,
  );
  const [tempGasPrice, setGasPrice] = useState(state.chain.gasPrice);
  const [tempChainName, setChainName] = useState(state.chain.chainDisplayName);

  let url = "https://api.github.com/repos/cosmos/chain-registry/contents";

  useEffect(() => {
    getGhJson();
  }, []);

  useEffect(() => {
    // set settings form fields to new values
    setChainId(state.chain.chainId);
    setNodeAddress(state.chain.nodeAddress);
    setAddressPrefix(state.chain.addressPrefix);
    setDenom(state.chain.denom);
    setDisplayDenom(state.chain.displayDenom);
    setDisplayDenomExponent(state.chain.displayDenomExponent);
    setGasPrice(state.chain.gasPrice);
    setChainName(state.chain.chainDisplayName);
  }, [state]);

  const getGhJson = async () => {
    // getting chain info from this repo: https://github.com/cosmos/chain-registry
    try {
      const res = await axios.get(url);
      const chains = res.data.filter((item) => {
        return item.type == "dir" && item.name != ".github";
      });
      setChainArray(chains);
      const options = chains.map(({ name }, index) => {
        return { label: name, value: index };
      });
      setChainOptions(options);
      console.log(state.chain);
      setSelectValue(findExistingOption(options));
    } catch (error) {
      console.log(error);
      setShowSettings(true);
      setChainError(error.message);
    }
  };

  const findExistingOption = (options) => {
    const index = options.findIndex((option) => option.label === state.chain.chainDisplayName);
    if (index >= 0) {
      return options[index];
    }
    return { label: "unkown chain", value: -1 };
  };

  const getChainInfo = async (chainOption) => {
    setChainError(null);
    try {
      const chainInfoUrl =
        "https://cdn.jsdelivr.net/gh/cosmos/chain-registry@master/" +
        chainOption.path +
        "/chain.json";
      const chainAssetUrl =
        "https://cdn.jsdelivr.net/gh/cosmos/chain-registry@master/" +
        chainOption.path +
        "/assetlist.json";

      const { data: chainData } = await axios.get(chainInfoUrl);
      const { data: assetData } = await axios.get(chainAssetUrl);
      console.log(chainData, assetData);

      const nodeAddress = getNodeFromArray(chainData.apis.rpc);
      const addressPrefix = chainData["bech32_prefix"];
      const chainId = chainData["chain_id"];
      const chainDisplayName = chainData["chain_name"];
      let asset = "";
      let denom = "";
      let displayDenom = "";
      const displayDenomExponent = 6;
      let gasPrice = "";

      if (assetData.assets.length > 1) {
        setDenomOptions(assetData.assets);
        asset = "";
        denom = "";
        displayDenom = "";
        gasPrice = "";

        setChainError("Multiple token denoms available, enter manually");
        setShowSettings(true);
      } else {
        asset = assetData.assets[0];
        denom = asset.base;
        displayDenom = asset.symbol;
        gasPrice = `0.03${asset.base}`;
      }

      // test client connection
      const client = await StargateClient.connect(state.chain.nodeAddress);
      console.log("success?", client);
      // change app state
      dispatch({
        type: "changeChain",
        value: {
          nodeAddress,
          denom,
          displayDenom,
          displayDenomExponent,
          gasPrice,
          chainId,
          chainDisplayName,
          addressPrefix,
        },
      });
      setShowSettings(false);
    } catch (error) {
      console.log(error);
      setShowSettings(true);
      setChainError(error.message);
    }
  };

  const getNodeFromArray = (nodeArray) => {
    // only return https connections
    const secureNodes = nodeArray.filter((node) => node.address.includes("https://"));
    if (secureNodes.length === 0) {
      throw new Error("No SSL enabled RPC nodes available for this chain");
    }
    return secureNodes[0].address;
  };

  const onChainSelect = (option) => {
    const index = chainOptions.findIndex((opt) => opt.label === option.label);
    setSelectValue(chainOptions[index]);
    getChainInfo(chainArray[option.value]);
  };

  const setChainFromForm = async () => {
    setChainError(null);
    try {
      // test client connection
      const client = await StargateClient.connect(state.chain.nodeAddress);
      console.log("success?", client);
      // change app state
      dispatch({
        type: "changeChain",
        value: {
          nodeAddress: tempNodeAddress,
          denom: tempDenom,
          displayDenom: tempDisplayDenom,
          setDisplayDenomExponent: tempDisplayDenomExponent,
          gasPrice: tempGasPrice,
          chainId: tempChainId,
          chainDisplayName: tempChainName,
          addressPrefix: tempAddressPrefix,
        },
      });

      setShowSettings(false);
    } catch (error) {
      console.log(error);
      setShowSettings(true);
      setChainError(error.message);
    }
  };

  return (
    <div className="chain-select-container">
      <StackableContainer lessPadding base>
        <p>Chain select</p>
        <div className="flex">
          <div className="select-parent">
            <Select
              options={chainOptions}
              onChange={onChainSelect}
              value={selectValue}
              name="chain-select"
            />
          </div>
          {showSettings ? (
            <button className="remove" onClick={() => setShowSettings(!showSettings)}>
              ✕
            </button>
          ) : (
            <button onClick={() => setShowSettings(!showSettings)}>
              <GearIcon color="white" />
            </button>
          )}
        </div>
        {showSettings && (
          <>
            {chainError && <p className="error">{chainError}</p>}
            <StackableContainer lessPadding lessMargin lessRadius>
              <p>Settings</p>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={tempChainName}
                  onChange={(e) => setChainName(e.target.value)}
                  label="Chain Name"
                />

                <Input
                  width="48%"
                  value={tempChainId}
                  onChange={(e) => setChainId(e.target.value)}
                  label="Chain ID"
                />
              </div>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={tempAddressPrefix}
                  onChange={(e) => setAddressPrefix(e.target.value)}
                  label="Bech32 Prefix (address prefix)"
                />
                <Input
                  width="48%"
                  value={tempNodeAddress}
                  onChange={(e) => setNodeAddress(e.target.value)}
                  label="RPC Node URL (must be https)"
                />
              </div>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={tempDisplayDenom}
                  onChange={(e) => setDisplayDenom(e.target.value)}
                  label="Display Denom"
                />
                <Input
                  width="48%"
                  value={tempDenom}
                  onChange={(e) => setDenom(e.target.value)}
                  label="Base Denom"
                />
              </div>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={tempDisplayDenomExponent}
                  onChange={(e) => setDisplayDenomExponent(e.target.value)}
                  label="Denom Exponent"
                />
                <Input
                  width="48%"
                  value={tempGasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  label="Gas Price"
                />
              </div>
              <Button label="Set Chain" onClick={setChainFromForm} />
            </StackableContainer>
          </>
        )}
      </StackableContainer>
      <style jsx>{`
        .chain-select-container {
          position: absolute;
          z-index: 10;
          top: 1em;
          right: 1em;
          width: ${showSettings ? "600px" : "300px"};
        }
        .flex {
          margin-top: 0.5em;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .select-parent {
          width: calc(98% - 3em);
        }
        .settings-group {
          display: flex;
          justify-content: space-between;
          margin-top: 1.5em;
        }
        button {
          background: none;
          border: none;
          display: block;
          width: 3em;
          height: 3em;
          opacity: 0.7;
          user-select: none;
        }
        button:hover {
          opacity: 1;
        }
        button.remove {
          background: rgba(255, 255, 255, 0.2);

          border-radius: 50%;
          border: none;
          color: white;
        }
        .error {
          color: coral;
          font-size: 0.8em;
          text-align: left;
          margin: 1em 0 0 0;
        }
      `}</style>
    </div>
  );
};

export default ChainSelect;
