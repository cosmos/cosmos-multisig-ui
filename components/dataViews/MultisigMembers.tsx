import React from "react";
import { isSecp256k1Pubkey, pubkeyToAddress, SinglePubkey } from "@cosmjs/amino";

import HashView from "./HashView";
import StackableContainer from "../layout/StackableContainer";

interface Props {
  /** Pubkeys of the multisig members */
  members: readonly SinglePubkey[];
  addressPrefix: string;
  threshold: string;
}

const MultisigMembers = (props: Props) => (
  <StackableContainer lessPadding>
    <div className="meta-data">
      <div>
        <h2>Threshold</h2>
        <div className="info threshold">{props.threshold}</div>
      </div>
      <div>
        <h2>Members</h2>
        <ul>
          {props.members.map((pubkey) => {
            const address = pubkeyToAddress(pubkey, props.addressPrefix);
            // simplePubkey is base64 encoded compressed secp256k1 in almost every case. The fallback is added to be safe though.
            const simplePubkey = isSecp256k1Pubkey(pubkey) ? pubkey.value : `${pubkey.type} pubkey`;
            return (
              <li key={address} className="info">
                <HashView hash={`${address} (${simplePubkey})`} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
    <style jsx>{`
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .info {
        margin: 10px 0;
        background: rgba(255, 255, 255, 0.03);
        padding: 10px;
        border-radius: 8px;
      }
      .threshold {
        font-size: 3.71em;
        text-align: center;
      }
      .meta-data li {
        display: block;
      }
      .meta-data {
        display: flex;
        column-gap: 1rem;
      }
      .meta-data > div {
        width: 26%;
      }
      .meta-data > div:last-child {
        width: auto;
      }
    `}</style>
  </StackableContainer>
);

export default MultisigMembers;
