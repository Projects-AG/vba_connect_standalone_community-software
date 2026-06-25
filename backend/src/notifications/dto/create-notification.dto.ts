import {
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class CreateNotificationDto {

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    message: string;

}