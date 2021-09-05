# How to Use this App

This app requires the [Keplr wallet extension](https://wallet.keplr.app/) to be enabled and setup on your browser.

## Table of Contents

- [Creating and Using Accounts](#accounts)
  - [Use Existing Multisig Account](#using-an-existing-multisig-account)
  - [Create a New Multisig Account](#creating-a-new-multisig-account)
- [Creating a Transaction](#creating-a-transaction)
- [Signing a Transaction](#signing-a-transaction)
- [Broadcasting a Transaction](#broadcast-a-transaction)

## Accounts

### Using an existing multisig account

To use this app with an existing multisig account, simply enter the address in the field provided, and click "Use this Multisig". Note that this address must have sent transactions in the past for this app to be able to use it. If you have an existing multisig that has not sent any transactions, you can recreate it using this tool (be sure to enter the same public keys and threshold). You may want to [Create a Transaction](#creating-a-transaction) next.

### Creating a new multisig account

To create a new multisig account, click the "Create New Multisig" button on the app's homepage. Then enter in the Secp256k1 encoded pubkeys of the accounts you would like to use, as well as the number of signatures required to sign a transaction. Click "Create Multisig". You may want to [Create a Transaction](#creating-a-transaction) next.

## Creating a Transaction

On the multisig account page, click "Create Transaction". Enter in the to address, the amount and optionally a memo. The gas limit is adjustable, but you probably do not want to change it, as the gas fees are set automatically by the app. Once all the necessary fields are filled in, click "Create Transaction". You may want to [Sign a Transaction](#signing-a-transaction) next.

## Signing a Transaction

To sign a transaction, make sure you have the Keplr wallet app installed and setup on your browser. Then navigate to the transaction page for the transaction you are trying to sign. Click "Connect Wallet" and then "Sign Transaction". Approve the transaction in the Keplr window that pops up. That's it! Once enough necessary signers have signed, anyone will be able to broadcast the transaction.

## Broadcasting a Transaction

Once enough signers have signed a transaction, the transaction will become broadcastable. To broadcast, click "Broadcast Transaction". Once initiated it will take several moments for it to go through. Once successfully broadcast, the app will show a success message and will give you a link to view the transaction on mintscan. If the transaction could not be broadcast, the error will appear under the broadcast button.
