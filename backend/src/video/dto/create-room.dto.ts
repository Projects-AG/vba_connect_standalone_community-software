import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateRoomDto {

    @ApiProperty({
        example: 'meeting-001',
        description: 'Unique Room Name',
    })
    @IsString()
    @IsNotEmpty()
    @Length(3, 50)
    roomName: string;

}