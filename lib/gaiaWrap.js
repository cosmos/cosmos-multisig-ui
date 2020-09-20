const exec = require("../utilities/promiseExec");

// All of the following functions return the string output (if there is any)
// from the gaia command line utility.

// Some Notes
//
// - gaiacli locks its keystore when writing, so running concurrent commands will fail,
//   use sequential operators (like for loops) and not async ones (like forEach)
//
// - Be wary of newline characters in the returned value :)

// KEY WRAPPERS

const createKey = (props) => {
  // props = {
  //   keyName: 'string',
  //   pubkey: 'string',
  // }

  return exec(`gaiacli keys add ${props.keyName} --pubkey=${props.pubkey}`);
};

const getMultiAddress = (props) => {
  // props = {
  //   keyName: 'string',
  // }

  return exec(`gaiacli keys show ${props.keyName} -a`);
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

  return exec(`gaiacli tx broadcast ${txFilename}`);
};

const signMulti = (props) => {
  // props = {
  //   keyName: 'string',
  //   signatureFiles: array of filepaths,
  // }

  const signatureFileString = "";

  for (var i = 0; i < props.signatureFiles.length; i++) {
    signatureFileString += props.signatureFiles[i];

    if (i !== signatureFiles.length - 1) {
      // add space
      signatureFileString += " ";
    }
  }

  return exec(
    `gaiacli tx multisign unsigned.json ${keyName} ${signatureFileString}`
  );
};

module.exports = {
  createMultiSigKey,
  createKey,
  listKeys,
  getMultiAddress,
};
