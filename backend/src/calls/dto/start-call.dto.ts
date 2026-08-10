import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StartCallDto {
  @IsString()
  @IsNotEmpty()
  peerUserId: string;

  @IsOptional()
  @IsString()
  @IsIn(['audio', 'video'])
  mediaType?: 'audio' | 'video';
}
