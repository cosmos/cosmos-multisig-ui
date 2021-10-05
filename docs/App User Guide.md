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

To use this app with an existing multisig account, simply enter the address in the field provided, and click "Use this Multisig". Note that this address must have sent transactions in the past for this app to be able to use it. If you have an existing multisig that has not sent any transactions, you can recreate it using this tool (be sure to enter the same public keys and threshold). 

![Screen Shot 2021-09-05 at 1 08 28 PM](https://user-images.githubusercontent.com/6718506/132136687-856a71bd-cd3b-465c-a2e8-8f4283161a11.png)

You may want to [Create a Transaction](#creating-a-transaction) next.

### Creating a new multisig account

To create a new multisig account, click the "Create New Multisig" button on the app's homepage. Then enter in the addresses of the accounts you would like to use, as well as the number of signatures required to sign a transaction. Click "Create Multisig". These addresses must have sent transactions in the past to be used, the app will show an error if there is no on chain account information for any of the addresses.

![Screen Shot 2021-10-04 at 10 10 21 PM](https://user-images.githubusercontent.com/6718506/135949511-b0d51820-7359-4707-a873-966e31b187c0.png)
![Screen Shot 2021-10-04 at 10 10 24 PM](https://user-images.githubusercontent.com/6718506/135949518-08e9e994-9695-4847-b152-5f28610dd221.png)


You may want to [Create a Transaction](#creating-a-transaction) next.

## Creating a Transaction

On the multisig account page, click "Create Transaction". 

![Screen Shot 2021-09-05 at 1 16 56 PM](https://user-images.githubusercontent.com/6718506/132136739-c43eeaeb-15fd-48d3-afa2-8e630740cf82.png)
Enter in the to address, the amount and optionally a memo. The gas limit is adjustable, but you probably do not want to change it, as the gas fees are set automatically by the app. Once all the necessary fields are filled in, click "Create Transaction". 
![Screen Shot 2021-09-05 at 1 19 30 PM](https://user-images.githubusercontent.com/6718506/132136750-d2e91252-fa4d-4f56-9d80-8460c85deec4.png)

You may want to [Sign a Transaction](#signing-a-transaction) next.

## Signing a Transaction

To sign a transaction, make sure you have the Keplr wallet app installed and setup on your browser. Then navigate to the transaction page for the transaction you are trying to sign.  

![Screen Shot 2021-09-05 at 1 19 49 PM](https://user-images.githubusercontent.com/6718506/132136776-da6c0853-c55b-4bfb-9228-7615a2811cde.png)

Click "Connect Wallet" and then "Sign Transaction". Approve the transaction in the Keplr window that pops up. That's it! Once you've successfully signed a transaction, you will see a confirmation message.

![Screen Shot 2021-09-05 at 1 23 24 PM](https://user-images.githubusercontent.com/6718506/132136783-c81c9a30-b5b2-487a-8d2d-83cde819fc55.png)


Once enough necessary signers have signed, anyone will be able to [broadcast the transaction](#broadcasting-a-transaction).

## Broadcasting a Transaction

Once enough signers have signed a transaction, the transaction will become broadcastable. To broadcast, click "Broadcast Transaction". 

![Screen Shot 2021-09-05 at 1 24 06 PM](https://user-images.githubusercontent.com/6718506/132136802-1365b50b-2398-4fef-80e8-37c34b5ea8a1.png)

Once initiated it will take several moments for it to go through. 
![Screen Shot 2021-09-05 at 1 24 30 PM](https://user-images.githubusercontent.com/6718506/132136822-9d3f32fd-577a-45af-aced-80a4e61f1537.png)

Once successfully broadcast, the app will show a success message and will give you a link to view the transaction on mintscan. If the transaction could not be broadcast, the error will appear under the broadcast button.

![Screen Shot 2021-09-05 at 1 24 39 PM](https://user-images.githubusercontent.com/6718506/132136826-c4f7c46c-7cf8-4a12-880d-96f0abd400a3.png)

