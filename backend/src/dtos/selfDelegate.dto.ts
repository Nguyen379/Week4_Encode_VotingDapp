import { ApiProperty } from '@nestjs/swagger';

export class SelfDelegate {
  @ApiProperty({ type: String, required: true })
  address: string;
}
