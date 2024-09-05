import { Injectable } from '@nestjs/common';
import {
  createPublicClient,
  http,
  Address,
  formatEther,
  parseEther,
  createWalletClient,
  hexToString,
} from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { MintTokenDto } from './dtos/mintToken.dto';
import { SelfDelegate } from './dtos/selfDelegate.dto';
import { VoteDto } from './dtos/vote.dto';
import * as tokenJson from './assets/MyToken.json';
import * as ballotJson from './assets/TokenizedBallot.json';

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

  async checkVotes() {
    try {
      const proposals: { name: string; voteCount: string }[] = [];
      for (let index = 0; index < 3; index++) {
        console.log(`Fetching proposal at index ${index}`);
        const proposal = await this.publicClient.readContract({
          address: this.getBallotAddress(),
          abi: ballotJson.abi,
          functionName: 'proposals',
          args: [BigInt(index)],
        });
        const name = hexToString(proposal[0], { size: 32 });
        const voteCount = formatEther(proposal[1].toString());
        // const formattedProposal = JSON.parse(
        //   JSON.stringify(proposal, (k, v) =>
        //     typeof v !== null || typeof v !== undefined ? v.toString() : v,
        //   ),
        // );
        // console.log('Format ether: ', formatEther(proposal[1]));
        // console.log(
        //   'Format ether with Number: ',
        //   Number(formatEther(proposal[1])),
        // );
        // console.log(
        //   'Format ether with Number * 1: ',
        //   Number(formatEther(proposal[1])) * 1000000000000000000,
        // );

        console.log('Proposal:', { name, voteCount });
        proposals.push({ name, voteCount });
      }
      return proposals;
    } catch (error) {
      console.error('Error in checkVotes:', error.message);
      throw new Error(`Failed to fetch proposals: ${error.message}`);
    }
  }

  async selfDelegate(body: SelfDelegate) {
    const address = body.address;
    try {
      const delegateTx = await this.walletClient.writeContract({
        address: this.getContractAddress(),
        abi: tokenJson.abi,
        functionName: 'delegate',
        args: [address],
      });

      if (await this.getTransactionReceipt(delegateTx)) {
        console.log(`Delegated ${address}`);
        return {
          result: true,
          message: `Successfully delegated for ${address}`,
          transactionHash: delegateTx,
        };
      } else {
        return {
          result: false,
          message: `Failed to delegate for ${address}`,
          transactionHash: delegateTx,
        };
      }
    } catch (error) {
      console.error('Error in selfDelegate:', error);
      return {
        result: false,
        message: `Error delegating: ${error.message}`,
      };
    }
  }

  async vote(body: VoteDto) {
    const { address, proposalId, amount } = body;
    try {
      const voteTx = await this.walletClient.writeContract({
        address: this.getBallotAddress(),
        abi: ballotJson.abi,
        functionName: 'vote',
        args: [BigInt(proposalId), parseEther(amount)],
      });

      if (await this.getTransactionReceipt(voteTx)) {
        console.log(
          `Vote cast for proposal ${proposalId} by ${address} with ${amount} votes`,
        );
        return {
          result: true,
          message: `Successfully cast ${amount} votes for proposal ${proposalId} by ${address}`,
          transactionHash: voteTx,
        };
      } else {
        return {
          result: false,
          message: `Failed to cast vote for proposal ${proposalId} by ${address}`,
          transactionHash: voteTx,
        };
      }
    } catch (error) {
      console.error('Error in vote:', error);
      return {
        result: false,
        message: `Error casting vote: ${error.message}`,
      };
    }
  }
}
