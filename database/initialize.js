const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const db = new Database(path.join(__dirname, "multisig-db.db"), {
  verbose: console.log,
});

// initialize db
const initialSchema = fs.readFileSync(
  path.join(__dirname, "./schema.sql"),
  "utf8"
);
db.exec(initialSchema);
