import CopyAndPaste from "./CopyAndPaste";

export default ({ hash }) => (
  <div className="hash-view">
    <div>{hash}</div>
    <CopyAndPaste copyText={hash} />
    <style jsx>{`
      .hash-view {
        display: flex;
      }
    `}</style>
  </div>
);
