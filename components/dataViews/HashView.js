import React from "react";

import { abbreviateLongString } from "../../lib/displayHelpers";
import CopyAndPaste from "./CopyAndPaste";

const HashView = ({ hash, abbreviate }) => (
  <div className="hash-view">
    <div>{abbreviate ? abbreviateLongString(hash) : hash}</div>
    <CopyAndPaste copyText={hash} />
    <style jsx>{`
      .hash-view {
        display: flex;
        font-family: monospace;
        column-gap: 0.5em;
      }
    `}</style>
  </div>
);

export default HashView;
