const gaiaWrap = require("../../../lib/gaiaWrap");
const { v4: uuidv4 } = require("uuid");
const { queries } = require("../../../database/connectDatabase");

const get = async (req, res) => {
  const allKeys = await gaiaWrap.listKeys();
  res.status(200).send(allKeys);
};

const post = async (req, res) => {
  try {
    // req.body.members should have array of members:
    // members: [{nickname: 'Cyril', pubkey: ''}]
    // req.body.threshold should have integer <= members.length
    const { members, threshold } = req.body;

    // for each member, create key and save to DB
    // have to do this sequentially/synchronously to avoid
    // locking up gaiacli
    const saveProms = [];
    let commaSepKeyNames = "";

    for (var i = 0; i < members.length; i++) {
      const member = members[i];
      const keyname = await createAndSaveKey(member);

      // combine keyNames into string for creating multisig key
      commaSepKeyNames += keyname;

      if (i !== members.length - 1) {
        // not the last one so add a comma
        commaSepKeyNames += ",";
      }
    }

    // create multisig key
    const multiName = uuidv4();
    await gaiaWrap.createMultiSigKey({
      multiName,
      commaSepKeyNames,
      threshold,
    });
    let multiAddress = await gaiaWrap.getMultiAddress({ keyName: multiName });

    // save multisig
    const saveResult = queries.insertMultiKey.run({
      key_name: multiName,
      address: multiAddress,
      multi_threshold: threshold,
      multi_members: commaSepKeyNames,
      is_multi: 1,
    });

    res.status(200).send(multiAddress);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

const createAndSaveKey = async (member) => {
  try {
    // create gaiacli key
    member.key_name = uuidv4();

    await gaiaWrap.createKey({
      keyName: member.key_name,
      pubkey: member.pubkey,
    });

    // save single key
    const saveResult = queries.insertSingleKey.run(member);

    return member.key_name;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export default (req, res) => {
  switch (req.method) {
    case "GET":
      get(req, res);
      break;
    case "POST":
      post(req, res);
      break;
    default:
      res.status(404).send();
  }
};
