import { abbreviateLongString } from "../../lib/displayHelpers";
import CopyAndPaste from "./CopyAndPaste";

export default ({ hash, abbreviate }) => (
  <div className="hash-view">
    <div>{abbreviate ? abbreviateLongString(hash) : hash}</div>
    <CopyAndPaste copyText={hash} />
    <style jsx>{`
      .hash-view {
        display: flex;
      }
    `}</style>
  </div>
);
