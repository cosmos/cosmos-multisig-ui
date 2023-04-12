import Link from "next/link";

const DevHelper = () => (
  <div className="dev-helper">
    <h3>Dev Helper</h3>
    <h4>Pages</h4>
    <ul>
      <li>
        <Link href="/">Index/Start</Link>
      </li>
      <li>
        <Link href="/create">Create Multisig</Link>
      </li>
      <li>
        <Link href="/multi/cosmos10nmdf6nt2qzvgn9q2nuwmmfc359yfesmu3gw22">View Multisig</Link>
      </li>
      <li>
        <Link href="/multi/cosmos10nmdf6nt2qzvgn9q2nuwmmfc359yfesmu3gw22/transaction/295630000375202310">
          View/Sign Transaction
        </Link>
      </li>
    </ul>
    <Link href="https://github.com/samepant/cosmoshub-legacy-multisig">View on Github</Link>

    <style jsx>{`
      .dev-helper {
        position: fixed;
        bottom: 0;
        right: 0;
        background: darkseagreen;
        padding: 1em;
      }

      ul {
      }
      li {
        margin-bottom: 0.5em;
      }
      a {
        color: white;
      }
    `}</style>
  </div>
);

export default DevHelper;
