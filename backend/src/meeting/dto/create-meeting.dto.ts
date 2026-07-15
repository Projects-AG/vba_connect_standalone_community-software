import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  roomName: string;

  @IsString()
  meetingTitle: string;

  @IsString()
  meetingType: string;

  @IsString()
  callType: string;

  @IsOptional()
  @IsString()
  meetingDate?: string;

  @IsOptional()
  @IsString()
  meetingTime?: string;

  @IsString()
  host: string;

  @IsOptional()
  @IsString()
  leaderId?: string;

  @IsOptional()
  @IsString()
  leaderName?: string;

  @IsArray()
  participants: string[];
}