import { ellideMiddle } from "../../lib/displayHelpers";
import CopyAndPaste from "./CopyAndPaste";

interface Props {
  hash: string;
  abbreviate?: boolean;
}

const HashView = (props: Props) => (
  <div className="hash-view">
    <div>{props.abbreviate ? ellideMiddle(props.hash, 12) : props.hash}</div>
    <CopyAndPaste copyText={props.hash} />
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
