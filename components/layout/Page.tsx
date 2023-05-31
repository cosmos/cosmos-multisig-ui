import { useRouter } from "next/router";
import { useState } from "react";
import Head from "../head";
import StackableContainer from "./StackableContainer";

interface PageProps {
  readonly title?: string;
  readonly goBack?: {
    readonly pathname: string;
    readonly title: string;
    readonly needsConfirm?: boolean;
  };
  readonly children: React.ReactNode;
}

const Page = ({ title, goBack, children }: PageProps) => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const linkProps = (() => {
    if (!goBack) {
      return {};
    }

    if (goBack.needsConfirm && !showConfirm) {
      return {
        href: "",
        onClick: (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement, MouseEvent>) => {
          e.preventDefault();
          setShowConfirm(true);
        },
      };
    }

    return {
      href: goBack.pathname,
    };
  })();

  return (
    <div className="page">
      <Head title={title || "Cosmos Multisig Manager"} />
      <StackableContainer>
        {goBack ? (
          <StackableContainer
            base
            lessPadding
            lessMargin
            divProps={{
              style: { width: "fit-content", cursor: "pointer" },
              onClick: linkProps.href ? () => router.push(linkProps.href) : linkProps.onClick,
            }}
          >
            <p>
              <a {...linkProps}>← Back to {goBack.title}</a>
            </p>
            {showConfirm ? (
              <>
                <p style={{ marginTop: "8px" }}>Changes to any form will be lost if you go back</p>
                <p>Click again to confirm</p>
              </>
            ) : null}
          </StackableContainer>
        ) : null}
        {children}
      </StackableContainer>
      <div className="footer-links">
        <StackableContainer base lessPadding lessMargin>
          <p>
            <a href="https://github.com/samepant/cosmoshub-legacy-multisig">View on github</a>
          </p>
        </StackableContainer>
      </div>
      <style jsx>{`
        .page {
          display: flex;
          justify-content: center;
          padding: 120px 0;
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
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
            Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
          color: white;
          min-height: 100vh;
          background: linear-gradient(240.16deg, #3f023c 10.46%, #561253 54.88%, #580a55 94.89%);
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
