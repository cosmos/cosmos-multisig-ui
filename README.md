# Cosmoshub Multisig App

This app allows for multisig users to create, sign and broadcast transactions on any stargate enabled chain. It's built with Cosmjs, Next.js, FaunaDB and Vercel.

[The app is live here](https://cosmoshub-legacy-multisig.vercel.app/).

[Here is a user guide on how to use the app](https://github.com/samepant/cosmoshub-legacy-multisig/blob/master/docs/App%20User%20Guide.md)

## Running your own instance

### 1. Clone project / setup Vercel deployment

This app uses Vercel for deployment and hosting, since they support next.js's serverless functions. You will need a vercel account to deploy this app. Use the button below to one-click clone and deploy this repo. The initial deployment will fail until all the necessary environment variables are input from the following steps.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fhello-world)

### 2. Setup environment variables

In the Vercel control panel for your new app, go to `Settings -> Environment Variables` and add in the keys and values from this repo's `.env.sample` file. The only remaining variable should be the `FAUNADB_SECRET`, which will be available once you setup your FaunaDB instance.

### 3. Initializing FaunaDB

This app relies on FaunaDB as for storing account, transaction and signature details.

- Create a [FaunaDB](https://dashboard.fauna.com/) account
- Create a new database
  - Use the "Classic" region
- Click the "Graphql" tab, and import the `db-schema.graphql` file in the root of this repo
- Click the "Security" tab, and create a key. Copy that key into your vercel app's environment variables as the `FAUNADB_SECRET` value

As your instance of the app is used, you can return to the FaunaDB dashboard to view records for any accounts, transactions or signatures.

### 4. Succesful Deployment

Redeploy the app and it will pickup the new environment variables and should be functioning normally.

## Running Locally

### 1. Setup .env.local file

Copy the `.env.sample` file and rename it to `.env.local`

### 2. Run a local cosmos-sdk Simapp instance

It's recommmended that you make your simapp instance mimic the denomination of cosmoshub-4 (`uatom`). Put the local address of your node as the value for `NEXT_PUBLIC_NODE_ADDRESS` in your `.env.local` file.

A more in depth tutorial on this is coming soon :)

### 3. Initializing FaunaDB

This app relies on FaunaDB as for storing account, transaction and signature details.

- Create a [FaunaDB](https://dashboard.fauna.com/) account
- Create a new database
  - Use the "Classic" region
- Click the "Graphql" tab, and import the `db-schema.graphql` file in the root of this repo
- Click the "Security" tab, and create a key. Copy that key into the `.env.local` file for the `FAUNADB_SECRET` value

As your instance of the app is used, you can return to the FaunaDB dashboard to view records for any accounts, transactions or signatures created.

### 3. Run your instance

With the simapp process running, run these commands in another window:

```
// with node v12.5.0 or later
npm install
npm run dev
```
