import Head from "../head";
import StackableContainer from "./StackableContainer";

const Page = (props) => {
  return (
    <div className="page">
      <Head title={props.title || "Cosmos Multisig Manager"} />
      <div className="container">
        {props.rootMultisig && (
          <div className="nav">
            <StackableContainer base lessPadding lessMargin>
              <p>
                <a href={`/multi/${props.rootMultisig}`}>
                  ← Back to multisig account
                </a>
              </p>
            </StackableContainer>
          </div>
        )}
        {props.children}
      </div>
      <div className="footer-links">
        <StackableContainer base lessPadding lessMargin>
          <p>
            <a href="https://github.com/samepant/cosmoshub-legacy-multisig">
              View on github
            </a>
          </p>
        </StackableContainer>
      </div>
      <style jsx>{`
        .page {
          display: flex;
          justify-content: center;
          padding: 120px 0;
        }
        .container {
          position: relative;
        }
        .nav {
          position: absolute;
          top: -40px;
          left: 0;
          display: flex;
        }
        a,
        a:visited {
          color: white;
        }
        .footer-links {
          position: fixed;
          bottom: 20px;
          right: 20px;
        }
      `}</style>
      <style global jsx>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          color: white;
          min-height: 100vh;
          background: linear-gradient(
            240.16deg,
            #3f023c 10.46%,
            #561253 54.88%,
            #580a55 94.89%
          );
          font-size: 16px;
          margin: 0;
        }
        * {
          box-sizing: border-box;
        }
        *:focus {
          outline: none;
        }
        button {
          cursor: pointer;
        }
        h1 {
          margin: 0;
          font-weight: 400;
          line-height: 1.15;
          font-size: 1.4em;
          text-align: center;
        }
        h2 {
          font-size: 1.25em;
          font-weight: 400;
          margin: 0;
        }
        h3 {
          font-size: 1em;
          font-style: italic;
          font-weight: bold;
          margin: 0;
        }
        p {
          max-width: 350px;
          margin: 0;
          font-size: 12px;
          font-style: italic;
          line-height: 14px;
        }
      `}</style>
    </div>
  );
};

export default Page;
