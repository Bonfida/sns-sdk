<h1 align="center">Solana name service</h1>
<br />
<p align="center">
<img width="250" src="https://i.imgur.com/nn7LMNV.png"/>
</p>
<br />
<p align="center">
<a href="https://badge.fury.io/js/@bonfida%2Fspl-name-service"><img src="https://badge.fury.io/js/@bonfida%2Fspl-name-service.svg" alt="npm version" height="18"></a>
</p>
<br />

User guide can be found [here](https://bonfida.github.io/solana-name-service-guide)

Resolution test cases:

| Domain             | Is Domain Tokenized? | SOL Record V2 Exists? | Staleness ID | RoA Valid? | SOL Record V1 Exists? | Signature Valid? | Registry Owner PDA? | User Allows PDA? | Owner          |                  Public key                  |
| ------------------ | -------------------- | --------------------- | ------------ | ---------- | --------------------- | ---------------- | ------------------- | ---------------- | -------------- | :------------------------------------------: |
| sns-ip-5-wallet-1  | Yes                  | -                     | -            | -          | -                     | -                | -                   | -                | NFT Owner      | ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs |
| sns-ip-5-wallet-2  | No                   | Yes                   | Not Stale    | Valid      | -                     | -                | -                   | -                | Record Content | AxwzQXhZNJb9zLyiHUQA12L2GL7CxvUNrp6neee6r3cA |
| sns-ip-5-wallet-3  | No                   | Yes                   | Not Stale    | Invalid    | -                     | -                | -                   | -                | Throw Error    |                      -                       |
| sns-ip-5-wallet-4  | No                   | Yes                   | Stale        | -          | -                     | -                | No                  | -                | Registry Owner | 7PLHHJawDoa4PGJUK3mUnusV7SEVwZwEyV5csVzm86J4 |
| sns-ip-5-wallet-5  | No                   | Yes                   | Stale        | -          | -                     | -                | Yes                 | Yes              | Registry Owner | 96GKJgm2W3P8Bae78brPrJf4Yi9AN1wtPJwg2XVQ2rMr |
| sns-ip-5-wallet-6  | No                   | Yes                   | Stale        | -          | -                     | -                | Yes                 | No               | Throw Error    |                      -                       |
| sns-ip-5-wallet-7  | No                   | No                    | -            | -          | Yes                   | Valid            | -                   | -                | Record Content | 53Ujp7go6CETvC7LTyxBuyopp5ivjKt6VSfixLm1pQrH |
| sns-ip-5-wallet-8  | No                   | No                    | -            | -          | Yes                   | Invalid          | -                   | -                | Registry Owner | ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs |
| sns-ip-5-wallet-9  | No                   | No                    | -            | -          | No                    | -                | No                  | -                | Registry Owner | ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs |
| sns-ip-5-wallet-10 | No                   | No                    | -            | -          | No                    | -                | Yes                 | Yes              | Registry Owner | 96GKJgm2W3P8Bae78brPrJf4Yi9AN1wtPJwg2XVQ2rMr |
| sns-ip-5-wallet-11 | No                   | No                    | -            | -          | No                    | -                | Yes                 | No               | Throw Error    |                      -                       |
| sns-ip-5-wallet-12 | No                   | Yes                   | Not Stale    | Invalid    | Yes                   | -                | -                   | -                | Throw Error    |                      -                       |
