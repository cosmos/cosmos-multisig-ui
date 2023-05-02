const getConnectError = (error: unknown): string => {
  const rawErrorMsg =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  // Keplr
  if (rawErrorMsg.includes("window.keplr is undefined")) {
    return "Keplr needs to be installed";
  }

  // Ledger
  if (rawErrorMsg.includes("navigator.usb is undefined")) {
    return "Your browser is not compatible with Ledger due to missing WebUSB";
  }

  if (rawErrorMsg.includes("no device selected")) {
    return "A ledger device needs to be selected";
  }

  if (rawErrorMsg.includes("open the cosmos ledger app")) {
    return "The Cosmos Ledger app needs to be open";
  }

  return "Error when connecting to wallet";
};

export { getConnectError };
