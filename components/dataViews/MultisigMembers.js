import React from "react";

import HashView from "./HashView";
import StackableContainer from "../layout/StackableContainer";

const MultisigMembers = (props) => (
  <StackableContainer lessPadding>
    <div className="meta-data">
      <div>
        <h2>Threshold</h2>
        <div className="info threshold">{props.threshold}</div>
      </div>
      <div>
        <h2>Members</h2>
        <ul>
          {props.members.map((address) => (
            <li key={address} className="info">
              <HashView hash={address} />
            </li>
          ))}
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
