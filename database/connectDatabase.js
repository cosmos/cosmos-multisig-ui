const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
  path.join(path.resolve(process.cwd(), "database"), "multisig-db.db"),
  {
    verbose: console.log,
  }
);

const queries = {};
// setup queries
queries.insertSingleKey = db.prepare(
  "INSERT INTO keys(nickname, pubkey, key_name) VALUES($nickname, $pubkey, $key_name)"
);
queries.updateSingleKey = db.prepare(
  "UPDATE keys SET address = $address WHERE id = $id"
);
queries.insertMultiKey = db.prepare(
  "INSERT INTO keys(key_name, address, multi_members, is_multi, multi_threshold) VALUES($key_name, $address, $multi_members, $is_multi, $multi_threshold)"
);
queries.getAllMulti = db.prepare("SELECT * FROM keys WHERE is_multi = 1");
queries.getMultiFromUUID = db.prepare("SELECT * FROM keys WHERE key_name = ?");
queries.getMultiFromAddress = db.prepare(
  "SELECT * FROM keys WHERE address = ?"
);
queries.getTransactionForUUID = db.prepare(
  "SELECT * FROM transactions WHERE uuid = ?"
);
queries.insertTransaction = db.prepare(
  "INSERT INTO transactions(multi_key_name, unsigned, uuid) VALUES($multi_key_name, $unsigned, $uuid)"
);
queries.updateTransaction = db.prepare(
  "UPDATE transactions SET completed_tx = $completed_tx WHERE id = $id"
);
queries.getTransactionsForMultiKeyName = db.prepare(
  "SELECT * FROM transactions WHERE multi_key_name = ?"
);

module.exports = {
  db,
  queries,
};
