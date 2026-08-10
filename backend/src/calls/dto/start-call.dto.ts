import { IsString, IsNotEmpty } from 'class-validator';

export class StartCallDto {
  @IsString()
  @IsNotEmpty()
  peerUserId: string;
}
