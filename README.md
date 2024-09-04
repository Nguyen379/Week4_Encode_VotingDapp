### Week 4 Encode: Voting dApp
```
Create a voting dApp to cast votes, delegate and query results on chain
Request voting tokens to be minted using the API
(bonus) Store a list of recent votes in the backend and display that on frontend
(bonus) Use an oracle to fetch off-chain data
Use an oracle to fetch information from a data source of your preference
Use the data fetched to create the proposals in the constructor of the ballot
```
### Voting dApp integration guidelines
- [x] Build the frontend using Scaffold ETH 2 as a base
- [x] Build the backend using NestJS to provide the Mint method
- [x] Implement a single POST method
- [x] Request voting tokens from API
- [x] Use these tokens to interact with the tokenized ballot
- [x] All other interactions must be made directly on-chain



### Getting Started
Make sure you have your .env file up-to-date. 
1. Run in root dir
```shell 
corepack enable
```

2. Run backend dir
```shell 
cd backend
npm install
npm i viem
npm i --save dotenv
npm i --save @nestjs/config
npm install --save @nestjs/swagger
npm run start:dev
```
3. Run frontend folder:
```shell 
cd frontend
npm install usingtellor // inside hardhat folder
yarn install
yarn start
```

## Group 1 Information
| Unique id | Discord username           |
| --------- | -------------------------- |
| ZvieX3    | @Dennis Kim                |
| 64tSCL    | @Zarq                      |
| zAY7H0    | @Juan_Gomez                |
| sS1JR2    | @intentions                |
| WPQzqk    | @Nguyen                    |
| CSNhKJ    | @Rita Alfonso / Alfonso Tech |


## References: 

```shell 
TOKEN_ADDRESS="0x2b168b730786420892a8a575823e5fa9e7797983"
BALLOT_ADDRESS="0x2bd6a1160bb05d2ea9ac57cb4584fca3c32e5d52"
```
