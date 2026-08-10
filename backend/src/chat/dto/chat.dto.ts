import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @IsUUID('4')
  peerUserId: string;
}

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body: string;
}
