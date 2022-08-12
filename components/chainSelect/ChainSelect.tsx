import React, { useEffect, useState } from "react";
import axios from "axios";
import { StargateClient } from "@cosmjs/stargate";

import GearIcon from "../icons/Gear";
import Button from "../inputs/Button";
import Input from "../inputs/Input";
import { useAppContext } from "../../context/AppContext";
import Select from "../inputs/Select";
import StackableContainer from "../layout/StackableContainer";
import { assert } from "@cosmjs/utils";

interface ChainOption {
  label: string;
  value: number;
}

interface GithubChainRegistryItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

const ChainSelect = () => {
  const { state, dispatch } = useAppContext();

  // UI State
  const [chainArray, setChainArray] = useState([]);
  const [chainOptions, setChainOptions] = useState<ChainOption[]>([]);
  const [chainError, setChainError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
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
  const [tempRegistryName, setRegistryName] = useState(state.chain.registryName);
  const [tempExplorerLink, setExplorerLink] = useState(state.chain.explorerLink);

  const url = "https://api.github.com/repos/cosmos/chain-registry/contents";

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
    setExplorerLink(state.chain.explorerLink);
    setRegistryName(state.chain.registryName);
  }, [state]);

  const getGhJson = async () => {
    // getting chain info from this repo: https://github.com/cosmos/chain-registry
    try {
      const res = await axios.get(url);
      const chains = res.data.filter((item: GithubChainRegistryItem) => {
        return item.type == "dir" && !item.name.startsWith(".") && item.name != "testnets";
      });
      setChainArray(chains);
      const options = chains.map(({ name }: GithubChainRegistryItem, index: number) => {
        return { label: name, value: index };
      });
      setChainOptions(options);
      assert(state.chain.registryName, "registryName missing");
      setSelectValue(findExistingOption(options, state.chain.registryName));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      setShowSettings(true);
      setChainError(error.message);
    }
  };

  const findExistingOption = (options: ChainOption[], registryName: string) => {
    const index = options.findIndex((option) => option.label === registryName);
    if (index >= 0) {
      return options[index];
    }
    return { label: "unkown chain", value: -1 };
  };

  const getChainInfo = async (chainOption: GithubChainRegistryItem) => {
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

      const nodeAddress = getNodeFromArray(chainData.apis.rpc);
      const addressPrefix = chainData["bech32_prefix"];
      const chainId = chainData["chain_id"];
      const chainDisplayName = chainData["pretty_name"];
      const registryName = chainOption.name;
      const explorerLink = getExplorerFromArray(chainData.explorers);
      let denom: string;
      let displayDenom: string;
      let displayDenomExponent: number;
      let gasPrice: string;

      if (assetData.assets.length > 1) {
        denom = "";
        displayDenom = "";
        gasPrice = "";
        displayDenomExponent = 0;

        setChainError("Multiple token denoms available, enter manually");
        setShowSettings(true);
      } else {
        const asset = assetData.assets[0];
        denom = asset.base;
        displayDenom = asset.symbol;
        gasPrice = `0.03${asset.base}`;
        displayDenomExponent = 6; // TODO: determine dynamically
      }

      // test client connection
      const client = await StargateClient.connect(nodeAddress);
      await client.getHeight();

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
          registryName,
          addressPrefix,
          explorerLink,
        },
      });
      setShowSettings(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      setShowSettings(true);
      setChainError(error.toString());
    }
  };

  const getExplorerFromArray = (array: { kind: string; url: string; tx_page: string }[]) => {
    if (array && array.length > 0) {
      return array[0]["tx_page"];
    }
    return "";
  };

  const getNodeFromArray = (nodeArray: { address: string; provider: string }[]) => {
    // only return https connections
    const secureNodes = nodeArray.filter((node) => node.address.includes("https://"));
    if (secureNodes.length === 0) {
      throw new Error("No SSL enabled RPC nodes available for this chain");
    }
    return secureNodes[0].address;
  };

  const onChainSelect = (option: ChainOption) => {
    const index = chainOptions.findIndex((opt) => opt.label === option.label);
    setSelectValue(chainOptions[index]);
    getChainInfo(chainArray[option.value]);
  };

  const setChainFromForm = async () => {
    setChainError(null);
    try {
      // test client connection
      assert(tempNodeAddress, "tempNodeAddress missing");
      const client = await StargateClient.connect(tempNodeAddress);
      await client.getHeight();

      // change app state
      dispatch({
        type: "changeChain",
        value: {
          nodeAddress: tempNodeAddress,
          denom: tempDenom,
          displayDenom: tempDisplayDenom,
          displayDenomExponent: tempDisplayDenomExponent,
          gasPrice: tempGasPrice,
          chainId: tempChainId,
          chainDisplayName: tempChainName,
          registryName: tempRegistryName,
          addressPrefix: tempAddressPrefix,
          explorerLink: tempExplorerLink,
        },
      });
      assert(tempRegistryName, "tempRegistryName missing");
      const selectedOption = findExistingOption(chainOptions, tempRegistryName);
      setSelectValue(selectedOption);
      setShowSettings(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setChainName(e.target.value)
                  }
                  label="Chain Name"
                />

                <Input
                  width="48%"
                  value={tempChainId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChainId(e.target.value)}
                  label="Chain ID"
                />
              </div>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={tempAddressPrefix}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAddressPrefix(e.target.value)
                  }
                  label="Bech32 Prefix (address prefix)"
                />
                <Input
                  width="48%"
                  value={tempNodeAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNodeAddress(e.target.value)
                  }
                  label="RPC Node URL (must be https)"
                />
              </div>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={tempDisplayDenom}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDisplayDenom(e.target.value)
                  }
                  label="Display Denom"
                />
                <Input
                  width="48%"
                  value={tempDenom}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDenom(e.target.value)}
                  label="Base Denom"
                />
              </div>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={tempDisplayDenomExponent}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDisplayDenomExponent(parseInt(e.target.value, 10))
                  }
                  label="Denom Exponent"
                />
                <Input
                  width="48%"
                  value={tempGasPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGasPrice(e.target.value)}
                  label="Gas Price"
                />
              </div>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={tempExplorerLink}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setExplorerLink(e.target.value)
                  }
                  label="Explorer Link (with '${txHash}' included)"
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
