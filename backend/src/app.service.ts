import { Injectable } from '@nestjs/common';
import {
  createPublicClient,
  http,
  Address,
  formatEther,
  parseEther,
  createWalletClient,
} from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { MintTokenDto } from './dtos/mintToken.dto';
import * as tokenJson from './assets/MyToken.json';
// import * as ballotJson from './assets/TokenizedBallot.json';

@Injectable()
export class AppService {
  publicClient;
  account;
  walletClient;

  constructor() {
    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.RPC_ENDPOINT_URL),
    });
    this.walletClient = createWalletClient({
      transport: http(process.env.RPC_ENDPOINT_URL),
      chain: sepolia,
      account: account,
    });
  }

  getHello(): string {
    return 'Hello World!';
  }

  getContractAddress(): string {
    return process.env.TOKEN_ADDRESS as Address;
  }

  getBallotAddress(): string {
    return process.env.BALLOT_ADDRESS as Address;
  }

  getServerWalletAddress(): string {
    return this.walletClient.account.address;
  }

  async getTokenName(): Promise<string> {
    const name = await this.publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: 'name',
    });
    return name as string;
  }

  async getTotalSupply(): Promise<string> {
    const totalSupplyBN = await this.publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: 'totalSupply',
    });
    return formatEther(totalSupplyBN as bigint);
  }

  async getTokenBalance(address: string): Promise<string> {
    const balanceBN = await this.publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: 'balanceOf',
      args: [address],
    });
    return formatEther(balanceBN as bigint);
  }

  async getTransactionReceipt(hash: string) {
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: hash as `0x${string}`,
    });

    if (!receipt || receipt.status !== 'success') {
      throw new Error(`Transaction failed. Hash: ${hash}`);
    }

    return JSON.parse(
      JSON.stringify(receipt, (k, v) =>
        typeof v === 'bigint' ? v.toString() : v,
      ),
    );
  }

  async checkMinterRole(address: string): Promise<boolean> {
    const MINTER_ROLE = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'MINTER_ROLE',
    });
    const hasRole = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'hasRole',
      args: [MINTER_ROLE, address],
    });
    return hasRole;
  }

  async mintTokens(body: MintTokenDto) {
    const address = body.address;
    const amount = body.amount;
    try {
      const mintTx = await this.walletClient.writeContract({
        address: this.getContractAddress(),
        abi: tokenJson.abi,
        functionName: 'mint',
        args: [address, parseEther(amount.toString())],
      });

      if (await this.getTransactionReceipt(mintTx)) {
        console.log(`Minted ${amount} tokens to ${address}`);
        return {
          result: true,
          message: `Minted  ${amount} tokens to ${address}`,
          transactionHash: mintTx,
        };
      } else {
        return {
          result: false,
          message: `Failed to mint tokens to ${address}`,
          transactionHash: mintTx,
        };
      }
    } catch (error) {
      console.error('Error in mintTokens:', error);
      return {
        result: false,
        message: `Error minting tokens: ${error.message}`,
      };
    }
  }
}
