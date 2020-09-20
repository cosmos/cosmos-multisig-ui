# Gaiacli node.js wrapper and demo app

## Install / Running

You must have the gaiacli available to the node process running this app.

Install with `npm install`

Run developer mode with `npm run dev`

Build production with `npm run build`

If you want to reset the db run `node database/initialize.js`

## Reason for Being

Conducting a simple multi-signature transaction using the [gaiacli](https://hub.cosmos.network/master/gaia-tutorials/what-is-gaia.html) currently requires a couple handfuls of terminal commands, and for the initial multi-sig creator to send files to all the different signers, who must sign and then send back. It's a little arduous.

This app is a little stop gap that makes creating and signing multi-sig transactions a little simpler while we wait for some upcoming developments in the cosmos dev world. It does this by wrapping the gaiacli in a little [node.js module](https://github.com/samepant/cosmos-multisig-ui/blob/master/lib/gaiaWrap.js), making it available to whatever node.js app we can imagine, and in this case it's a small next.js app that walks through the multi-sig creation and signing process.

At the moment the app reduces the need for direct command line interaction to a single command per signer, and there are plans to eliminate those as well below.

## Future Enhancements

### Use wallet providers for signing the contract

At the moment, the signer of a transaction has to download the transaction json to sign it locally. Many digital asset wallets provide client side libraries for signing with the private keys they store, and we could use this to turn the signing process into a few clicks. At the moment, the ledger wallet has a [cosmos library available](https://github.com/Zondax/ledger-cosmos-js) and based on this [github issue](https://github.com/chainapsis/keplr-extension/issues/23), the kepler wallet will support this soon.

### Remove the need for the server entirely

Right now, this app relies on a server running a gaiacli app to create multisig keys and to do the final signing of the transactions. Because the multisig key can be created with public keys, there shouldn't be a security issue with running everything in the browser. In order to accomplish this, we would need a module that ports the multisign components of the cosmos-sdk to run in the browser. Based on this [github issue](https://github.com/CosmWasm/cosmjs/issues/416), it looks like the CosmWasm dev community is thinking through it.

The server also stores the signatures during the signing process to make it easier to coordinate signing. This could be avoided by storing basic transaction data in the URL (a url-encoded transaction is pretty long, but is still shorter than the standard url length limits ~2000 characters). Another solution would be to store in progress transactions with ipfs, and encode the ipfs url in our app's url.

### Friendlier UI

At the moment the UI is pretty technical and doesn't explain a whole lot about what's happening, and doesn't really have any navigation 😪😪😪
