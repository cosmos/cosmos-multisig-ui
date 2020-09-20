const { v4: uuidv4 } = require("uuid");
const { queries } = require("../../../database/connectDatabase");

const get = async (req, res) => {
  try {
    const {
      query: { uuid },
    } = req;

    const multi = query.getMultiFromUUID.get(uuid);
    res.status(200).send(multi);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

export default (req, res) => {
  switch (req.method) {
    case "GET":
      get(req, res);
      break;
    default:
      res.status(404).send();
  }
};
