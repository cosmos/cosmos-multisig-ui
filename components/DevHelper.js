const DevHelper = (props) => (
  <div className="dev-helper">
    <h3>Dev Helper</h3>
    <h4>Pages</h4>
    <ul>
      <li>
        <a href="/">Index/Start</a>
      </li>
      <li>
        <a href="/create">Create Multisig</a>
      </li>
      <li>
        <a href="/multi/cosmos10nmdf6nt2qzvgn9q2nuwmmfc359yfesmu3gw22">
          View Multisig
        </a>
      </li>
      <li>
        <a href="/multi/cosmos10nmdf6nt2qzvgn9q2nuwmmfc359yfesmu3gw22/transaction/295630000375202310">
          View/Sign Transaction
        </a>
      </li>
    </ul>
    <a href="https://github.com/samepant/cosmoshub-legacy-multisig">
      View on Github
    </a>

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
