import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class StopRecordingDto {

    @ApiProperty({
        example: 'egress_01H...',
        description: 'LiveKit egress ID to stop',
    })
    @IsString()
    @IsNotEmpty()
    @Length(3, 255)
    @Matches(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/, {
        message: 'Egress ID contains invalid characters',
    })
    egressId: string;

}
