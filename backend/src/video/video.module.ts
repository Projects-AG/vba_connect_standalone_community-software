// import { Module } from '@nestjs/common';
// import { VideoController } from './video.controller';
// import { VideoService } from './video.service';

// @Module({
//   controllers: [VideoController],
//   providers: [VideoService]
// })
// export class VideoModule { }

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { VideoController } from './controller/video.controller';
import { VideoService } from './service/video.service';
import { LivekitModel } from './model/livekit.model';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [
    VideoController,
  ],
  providers: [
    VideoService,
    LivekitModel,
  ],
})
export class VideoModule { }