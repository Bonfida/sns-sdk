<h1 align="center">SNS React</h1>
<br />

<p align="center">
<img width="250" src="https://i.imgur.com/nn7LMNV.png"/>
</p>

<p align="center">
<a href="https://twitter.com/bonfida">
<img src="https://img.shields.io/twitter/url?label=Bonfida&style=social&url=https%3A%2F%2Ftwitter.com%2Fbonfida">
</a>
</p>

<div style="display: flex; justify-content: center; align-items: center;">
<a style="margin:0 5px" href="https://www.npmjs.com/package/@bonfida/sns-react"><img src="https://img.shields.io/npm/v/@bonfida/sns-react.svg?style=flat"></a>
<a style="margin:0 5px" href="https://www.npmjs.com/package/@bonfida/sns-react"><img src="https://img.shields.io/npm/dm/@bonfida/sns-react.svg"></a>
<a style="margin:0 5px" href="https://github.com/Bonfida/sns-sdk"><img src="https://img.shields.io/github/stars/Bonfida/sns-sdk"></a>
<a style="margin:0 5px" href="https://github.com/Bonfida/sns-sdk"><img src="https://img.shields.io/github/issues/Bonfida/sns-sdk"></a>
</div>

This library provides a set of reusable React hooks to help make your components more efficient and easier to read.

<br />
<h2 align="center">Installation</h2>
<br />

```bash
npm install @bonfida/sns-react
```

or

```bash
yarn add @bonfida/sns-react
```

<br />
<h2 align="center">Peer Dependencies</h2>
<br />

This library depends on the following peer dependencies:

- `@tanstack/react-query`
- `@solana/web3.js`

It utilizes React Query version 5, making all `useQuery` functionalities available (with the exception of `queryFn`) across all hooks. If you're not already using `@tanstack/react-query`, you'll need to install it, then initialize a query client and encapsulate your application with a provider. For more information, visit the [Tanstack Query documentation](https://tanstack.com/query/latest).

<br />
<h2 align="center">Available hooks</h2>
<br />

Below is a brief description of the hooks available in this library. Detailed usage and API guides are available in each hook's respective documentation.

### `useDomainOwner`

This hook can be used to resolve the owner of a domain name.

### `useDomainsForOwner`

This hook can be used to retrieve all the domains owned by a wallet

### `useDomainSize`

This hook can be used to retrive the size of a domain name account

### `useFavoriteDomain`

This hook can be used to retrieve the favorite domain of a wallet if it exists

### `useProfilePic`

This hook can be used to retrieve the profile picture of a domain name if it exists

### `useRecords`

This hook can be used to retrieve the content of multiple records v1 (deperecated)

### `useRecordsV2`

This hook can be used to retrieve the content of multiple records v2

### `useReverseLookup`

This hook can be used to retrieve the reverse of domain name from this public key

### `useSubdomains`

This hook can be used to retrieve the subdomains of .sol domain name

### `useSuggestions`

This hook can be used to generate unregistered domain suggestions related to the given domain

### `useTopDomainsSales`

This hook can be used to retrieve the top domain sales for a given time window

<br />
<h2 align="center">Contributing</h2>
<br />

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

<br />
<h2 align="center">License</h2>
<br />

SNS React is an open-source project licensed under [MIT](/LICENSE.md). Feel free to explore, expand, and improve!
