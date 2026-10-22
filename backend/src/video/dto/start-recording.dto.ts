import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class StartRecordingDto {

    @ApiProperty({
        example: 'meeting-001',
        description: 'Existing LiveKit room name to record',
    })
    @IsString()
    @IsNotEmpty()
    @Length(3, 50)
    @Matches(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/, {
        message: 'Room name contains invalid characters',
    })
    roomName: string;

}
