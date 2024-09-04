import { ApiProperty } from '@nestjs/swagger';

export class MintTokenDto {
  @ApiProperty({ type: String, required: true, default: 'Wallet Address' })
  address: string;
  @ApiProperty({ type: Number, required: true, default: '3' })
  amount: number;
}
