import { Controller, Get, Param, Post, Query, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { MintTokenDto } from './dtos/mintToken.dto';
import { SelfDelegate } from './dtos/selfDelegate.dto';
import { VoteDto } from './dtos/vote.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('contract-address')
  getContractAddress() {
    return { result: this.appService.getContractAddress() };
  }

  @Get('token-name')
  async getTokenName() {
    return { result: await this.appService.getTokenName() };
  }

  @Get('total-supply')
  async getTotalSupply() {
    return { result: await this.appService.getTotalSupply() };
  }

  //  curl "http://localhost:3001/token-balance?address=0xYourAddressHere"
  @Get('token-balance/:address')
  async getTokenBalance(@Param('address') address: string) {
    return { result: await this.appService.getTokenBalance(address) };
  }

  // curl "http://localhost:3001/transaction-receipt?hash=0xTransactionHashHere"
  @Get('transaction-receipt')
  async getTransactionReceipt(@Query('hash') hash: string) {
    return { result: await this.appService.getTransactionReceipt(hash) };
  }

  // curl http://localhost:3001/server-wallet-address
  @Get('server-wallet-address')
  getServerWalletAddress() {
    return { result: this.appService.getServerWalletAddress() };
  }

  // X curl http://localhost:3001/check-minter-role
  @Get('check-minter-role')
  async checkMinterRole(@Query('address') address: string) {
    return { result: await this.appService.checkMinterRole(address) };
  }

  // curl -X POST -H "Content-Type: application/json" -d '{"address":"0x0xYourAddressHere", "amount": 1}' http://localhost:3001/mint-tokens
  @Post('mint-tokens')
  async mintTokens(@Body() body: MintTokenDto) {
    return { result: await this.appService.mintTokens(body) };
  }

  @Get('check-votes')
  async checkVotes() {
    return { result: await this.appService.checkVotes() };
  }

  // curl -X POST -H "Content-Type: application/json" -d '{"address":"0xYourAddressHere"}' http://localhost:3001/delegate-tokens
  @Post('delegate-tokens')
  async selfDelegateTokens(@Body() body: SelfDelegate) {
    const response = await this.appService.selfDelegate(body);
    return { result: response };
  }

  // curl -X POST -H "Content-Type: application/json" -d '{"address":"0xYourAddressHere", "proposalId":1}' http://localhost:3001/vote
  @Post('vote')
  async vote(@Body() body: VoteDto) {
    const response = await this.appService.vote(body);
    return { result: response };
  }
}
