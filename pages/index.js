import Head from "../components/head";

import MultiSigForm from "../components/MultiSigForm";

export default () => (
  <div>
    <Head title="Home" />

    <div className="hero">
      <h1 className="title">Cosmoshub-3 Multisig Builder</h1>
      <p className="description">
        Add Cosmoshub-3 account public keys and set a threshold of necessary
        votes
      </p>
      <MultiSigForm />
    </div>

    <style jsx>{`
      .hero {
        width: 100%;
        text-align: center;
      }
      .title {
        margin: 0;
        width: 100%;
        padding-top: 2em;
        line-height: 1.15;
        font-size: 2em;
      }
    `}</style>
    <style global jsx>{`
      body {
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
          Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        color: white;
        background: #500a58;
        font-size: 16px;
      }

      *:focus {
        outline: none;
      }
      button {
        cursor: pointer;
      }
    `}</style>
  </div>
);
