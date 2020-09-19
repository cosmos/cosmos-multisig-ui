DROP TABLE IF EXISTS keys;
DROP TABLE IF EXISTS transactions;

CREATE TABLE keys (
  id integer PRIMARY KEY AUTOINCREMENT,
  key_name text,
  pubkey text,
  address text,
  multi_threshold integer,
  multi_members text, -- Comma separated UUIDs 
  nickname text,
  is_multi integer
);

CREATE TABLE transactions (
  id integer PRIMARY KEY AUTOINCREMENT,
  uuid text,
  unsigned text,
  signatures text,
  signed text,
  completed_tx text,
  multi_key_name text NOT NULL
);