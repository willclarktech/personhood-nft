# Personhood NFT

Proof of concept for a token representing personhood.

## Prerequisites

This project uses a monorepo structure with `lerna`. The npm client is `yarn`, because of its workspaces integration with `lerna`.

## Install

```
yarn
```

## Test

_Step 1:_ Deploy an Ethereum blockchain instance and the `PersonhoodNFT` contract:

```
yarn lerna run serve --stream --scope personhood-nft-contracts
```

_Step 2:_ Deploy a market rate API server:

```
yarn lerna run serve --stream --scope market-api
```

_Step 3:_ Deploy a kitten server:

```
yarn lerna run serve --stream --scope kitten-as-a-service
```

_Step 4:_ Run tests:

```
yarn lerna run test --stream --scope personhood-nft-contracts
```
