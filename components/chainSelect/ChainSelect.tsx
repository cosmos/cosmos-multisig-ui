import { StargateClient } from "@cosmjs/stargate";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useChains } from "../../context/ChainsContext";
import {
  setChain,
  setChainFromRegistry,
  setChainsError,
} from "../../context/ChainsContext/helpers";
import { RegistryAsset } from "../../types/chainRegistry";
import GearIcon from "../icons/Gear";
import Button from "../inputs/Button";
import Input from "../inputs/Input";
import Select from "../inputs/Select";
import StackableContainer from "../layout/StackableContainer";

interface ChainOption {
  readonly label: string;
  readonly value: string;
}

const ChainSelect = () => {
  const router = useRouter();
  const { chain, chains, chainsError, chainsDispatch } = useChains();

  const [optionToConfirm, setOptionToConfirm] = useState<ChainOption | null>(null);
  const [showAuxView, setShowAuxView] = useState<null | "settings" | "confirmRedirect">(null);
  const [chainInForm, setChainInForm] = useState(chain);
  const [stringAssets, setStringAssets] = useState(JSON.stringify(chain.assets));

  const chainArray = [...chains.mainnets, ...chains.testnets];
  const chainOptions: readonly ChainOption[] = chainArray.map(({ name }) => ({
    label: name,
    value: name,
  }));
  const selectValue = chainOptions.find((option) => option.value === chain.registryName) ?? {
    label: "unknown chain",
    value: chain.registryName,
  };

  useEffect(() => {
    setChainInForm(chain);
    setStringAssets(JSON.stringify(chain.assets));
  }, [chain]);

  useEffect(() => {
    try {
      const assets: readonly RegistryAsset[] = JSON.parse(stringAssets);
      setChainInForm((oldChain) => ({ ...oldChain, assets }));
    } catch {
      setChainsError(chainsDispatch, "Assets needs to be valid JSON");
    }
  }, [chainsDispatch, stringAssets]);

  const selectChainOption = (chainOption: ChainOption) => {
    if (router.pathname !== "/" && chainOption.value !== selectValue.value) {
      setOptionToConfirm(chainOption);
      setShowAuxView("confirmRedirect");
      return;
    }

    setChainsError(chainsDispatch, null);
    setChainFromRegistry(chainsDispatch, chainOption.value);
    setOptionToConfirm(null);
  };

  const redirectAndChangeChain = () => {
    setShowAuxView(null);

    if (optionToConfirm) {
      setChainFromRegistry(chainsDispatch, optionToConfirm.value);
      setOptionToConfirm(null);
    }

    router.push("/");
  };

  const setChainFromForm = async () => {
    setChainsError(chainsDispatch, null);

    try {
      // test client connection
      const client = await StargateClient.connect(chainInForm.nodeAddress);
      await client.getHeight();

      setShowAuxView(null);
      setChain(chainsDispatch, chainInForm);
    } catch (error) {
      if (error instanceof Error) {
        setChainsError(chainsDispatch, error.message);
      } else {
        setChainsError(chainsDispatch, "Error when setting new chain");
      }
      setShowAuxView("settings");
    }
  };

  return (
    <div className="chain-select-container">
      <StackableContainer lessPadding base>
        <p>Chain select</p>
        <div className="flex" style={{ margin: 0 }}>
          <div className="select-parent">
            <Select
              name="chain-select"
              options={chainOptions}
              value={selectValue}
              onChange={selectChainOption}
            />
          </div>
          {showAuxView ? (
            <button
              className="remove"
              onClick={() => {
                setShowAuxView(null);
                setOptionToConfirm(null);
              }}
            >
              ✕
            </button>
          ) : (
            <button onClick={() => setShowAuxView("settings")} style={{ width: "auto" }}>
              <GearIcon color="white" />
            </button>
          )}
        </div>
        {showAuxView === "settings" ? (
          <>
            {chainsError ? <p className="error">{chainsError}</p> : null}
            <StackableContainer lessPadding lessMargin lessRadius>
              <p>Settings</p>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={chainInForm.chainDisplayName}
                  onChange={({ target }) =>
                    setChainInForm((oldChain) => ({ ...oldChain, chainDisplayName: target.value }))
                  }
                  label="Chain Name"
                />

                <Input
                  width="48%"
                  value={chainInForm.chainId}
                  onChange={({ target }) =>
                    setChainInForm((oldChain) => ({ ...oldChain, chainId: target.value }))
                  }
                  label="Chain ID"
                />
              </div>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={chainInForm.addressPrefix}
                  onChange={({ target }) =>
                    setChainInForm((oldChain) => ({ ...oldChain, addressPrefix: target.value }))
                  }
                  label="Bech32 Prefix (address prefix)"
                />
                <Input
                  width="48%"
                  value={chainInForm.nodeAddress}
                  onChange={({ target }) =>
                    setChainInForm((oldChain) => ({ ...oldChain, nodeAddress: target.value }))
                  }
                  label="RPC Node URL (must be https)"
                />
              </div>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={chainInForm.displayDenom}
                  onChange={({ target }) =>
                    setChainInForm((oldChain) => ({ ...oldChain, displayDenom: target.value }))
                  }
                  label="Display Denom"
                />
                <Input
                  width="48%"
                  value={chainInForm.denom}
                  onChange={({ target }) =>
                    setChainInForm((oldChain) => ({ ...oldChain, denom: target.value }))
                  }
                  label="Base Denom"
                />
              </div>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={chainInForm.displayDenomExponent}
                  onChange={({ target }) =>
                    setChainInForm((oldChain) => ({
                      ...oldChain,
                      displayDenomExponent: Number(target.value),
                    }))
                  }
                  label="Denom Exponent"
                />
                <Input
                  width="48%"
                  value={stringAssets}
                  onChange={({ target }) => setStringAssets(target.value)}
                  label="Assets"
                />
              </div>
              <div className="settings-group">
                <Input
                  width="48%"
                  value={chainInForm.gasPrice}
                  onChange={({ target }) =>
                    setChainInForm((oldChain) => ({ ...oldChain, gasPrice: target.value }))
                  }
                  label="Gas Price"
                />
                <Input
                  width="48%"
                  value={chainInForm.explorerLink}
                  onChange={({ target }) =>
                    setChainInForm((oldChain) => ({ ...oldChain, explorerLink: target.value }))
                  }
                  label="Explorer Link (with '${txHash}' included)"
                />
              </div>
              <Button label="Set Chain" onClick={setChainFromForm} />
            </StackableContainer>
          </>
        ) : null}
        {showAuxView === "confirmRedirect" && optionToConfirm ? (
          <StackableContainer lessPadding lessMargin lessRadius>
            <p>
              If you change to {optionToConfirm.label} your unsaved changes will be lost and you
              will be redirected to the main screen
            </p>
            <Button label={`Change to ${optionToConfirm.label}`} onClick={redirectAndChangeChain} />
          </StackableContainer>
        ) : null}
      </StackableContainer>
      <style jsx>{`
        .chain-select-container {
          position: absolute;
          z-index: 10;
          top: 1em;
          right: 1em;
          width: ${showAuxView === "settings" ? "600px" : "300px"};
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
