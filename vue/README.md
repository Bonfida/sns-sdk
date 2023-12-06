<h1 align="center">SNS Vue</h1>
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
<a style="margin:0 5px" href="https://www.npmjs.com/package/@bonfida/sns-vue"><img src="https://img.shields.io/npm/v/@bonfida/sns-vue.svg?style=flat"></a>
<a style="margin:0 5px" href="https://www.npmjs.com/package/@bonfida/sns-vue"><img src="https://img.shields.io/npm/dm/@bonfida/sns-vue.svg"></a>
<a style="margin:0 5px" href="https://github.com/Bonfida/sns-sdk"><img src="https://img.shields.io/github/stars/Bonfida/sns-sdk"></a>
<a style="margin:0 5px" href="https://github.com/Bonfida/sns-sdk"><img src="https://img.shields.io/github/issues/Bonfida/sns-sdk"></a>
</div>

This library provides a set of reusable Vue composables to help make your components more efficient and easier to read.

<br />
<h2 align="center">Installation</h2>
<br />

```bash
npm install @bonfida/sns-vue
```

or

```bash
yarn add @bonfida/sns-vue
```

<br />
<h2 align="center">Available composables</h2>
<br />

Below is a brief description of the composables available in this library. Detailed usage and API guides are available in each composable's respective documentation.

- `useDomainOwner` - allows to resolve the owner of a domain name.
- `useDomainsForOwner` - allows to retrieve all the domains owned by a wallet
- `useDomainSize` - allows to retrive the size of a domain name account
- `useFavoriteDomain` - allows to retrieve the favorite domain of a wallet if it exists
- `useProfilePic` - allows to retrieve the profile picture of a domain name if it exists
- `useRecords` - allows to retrieve the content of multiple records
- `useReverseLookup` - allows to retrieve the reverse of domain name from this public key
- `useSubdomains` - allows to retrieve the subdomains of .sol domain name
- `useSearch` - enables searching for domains and subdomains. You can use it to look up specific domains and subdomains and see if they have been registered
- `useDomainSuggestions` - allows to load suggestions for the provided domain. It assists in finding related domains that are not registered
- `useTopDomainsSales` - displays the top domain sales for the specified period. It provides insight into the most popular domains and their pricing trends

<br />
<h2 align="center">Contributing</h2>
<br />

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

<br />
<h2 align="center">License</h2>
<br />

SNS Vue is an open-source project licensed under [MIT](/LICENSE.md). Feel free to explore, expand, and improve!
