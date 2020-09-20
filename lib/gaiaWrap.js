const exec = require("../utilities/promiseExec");

// All of the following functions return the string output (if there is any)
// from the gaia command line utility.

// Some Notes
//
// - gaiacli locks its keystore when writing, so running concurrent commands will fail,
//   use sequential operators (like for loops) and not async ones (like forEach)
//
// - There are newline characters in some of the return values. Newline characters get
//   stripped when the return value is a single line

// KEY WRAPPERS

const createKey = (props) => {
  // props = {
  //   keyName: 'string',
  //   pubkey: 'string',
  // }

  return exec(`gaiacli keys add ${props.keyName} --pubkey=${props.pubkey}`);
};

const getMultiAddress = async (props) => {
  // props = {
  //   keyName: 'string',
  // }

  const rawReturn = await exec(`gaiacli keys show ${props.keyName} -a`);
  const cleaned = rawReturn.replace(/(\r\n|\n|\r)/gm, "");

  return cleaned;
};

const createMultiSigKey = (props) => {
  // props = {
  //   multiName: 'string',
  //   commaSepKeyNames: 'string',
  //   threshold: 'string',
  // }

  return exec(
    `gaiacli keys add ${props.multiName} --multisig=${props.commaSepKeyNames} --multisig-threshold=${props.threshold}`
  );
};

const listKeys = () => {
  return exec("gaiacli keys list");
};

// TRANSACTION WRAPPERS

const broadcastTX = (props) => {
  // props = {
  //   txFilename: 'string',
  // }

  return exec(`gaiacli tx broadcast ${props.txFilename} --dry-run`);
};

const signMulti = (props) => {
  // props = {
  //   keyName: 'string',
  //   signatureFiles: array of filepaths,
  //   unsignedFile: 'filepath'
  // }
  let signatureFileString = "";

  for (var i = 0; i < props.signatureFiles.length; i++) {
    signatureFileString += props.signatureFiles[i];

    if (i !== props.signatureFiles.length - 1) {
      // add space
      signatureFileString += " ";
    }
  }

  return exec(
    `gaiacli tx multisign ${props.unsignedFile} ${props.keyName} ${signatureFileString}`
  );
};

module.exports = {
  broadcastTX,
  createMultiSigKey,
  createKey,
  getMultiAddress,
  listKeys,
  signMulti,
};
