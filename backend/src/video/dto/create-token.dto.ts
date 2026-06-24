import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateTokenDto {

    @ApiProperty({
        example: 'meeting-001',
        description: 'Room Name',
    })
    @IsString()
    @IsNotEmpty()
    @Length(3, 50)
    roomName: string;

    @ApiProperty({
        example: 'Nityam',
        description: 'Participant Name',
    })
    @IsString()
    @IsNotEmpty()
    @Length(2, 50)
    participantName: string;

}