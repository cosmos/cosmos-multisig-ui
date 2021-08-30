import StackableContainer from "../layout/StackableContainer";
import { abbreviateLongString } from "../../lib/displayHelpers";

const dummyMembers = [
  {
    nickname: "Tolla",
    pubkey: "AqsujWsohxvLS8B6ANf54D9qtIhAtQ2ISptBmXGUZVIN",
    address: "cosmos1j8z4cfgpza4qa33pl02y84n0mdm8n7xzqdwlse",
  },
  {
    nickname: "Yamman",
    pubkey: "AqsujWsohxvLS8B6ANf54D9qtIhAtQ2ISptBmXGUZVIN",
    address: "cosmos145mr4l98w2x96utkcayvtqaag79u7mpyane7q7",
  },
  {
    nickname: "Wallace",
    pubkey: "AqsujWsohxvLS8B6ANf54D9qtIhAtQ2ISptBmXGUZVIN",
    address: "cosmos1t5u0jfg3ljsjrh2m9e47d4ny2hea7eehxrzdgd",
  },
];
const MultisigMembers = (props) => (
  <StackableContainer lessPadding>
    <h2>Members</h2>
    <ul className="meta-data">
      {dummyMembers.map((member) => (
        <li>
          <div className="nickname">
            <label>Nickname:</label>
            <div className="info">{member.nickname}</div>
          </div>
          <div className="address">
            <label>Address:</label>
            <div className="info">{abbreviateLongString(member.address)}</div>
          </div>
        </li>
      ))}
    </ul>
    <style jsx>{`
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .meta-data li {
        margin: 10px 0;
        background: rgba(255, 255, 255, 0.03);
        padding: 10px;
        border-radius: 8px;
      }
      .meta-data li:last-child {
        margin-bottom: 0;
      }
      .meta-data label {
        font-size: 12px;
        background: rgba(255, 255, 255, 0.1);
        padding: 3px 6px;
        border-radius: 5px;
        display: inline-block;
        margin-right: 10px;
      }
      li div:first-child {
        margin-bottom: 10px;
      }
      .info {
        display: inline-block;
      }
    `}</style>
  </StackableContainer>
);

export default MultisigMembers;
