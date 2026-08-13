import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './controller/video.controller';
import { VideoService } from './service/video.service';

describe('VideoController', () => {
  let controller: VideoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [
        {
          provide: VideoService,
          useValue: {
            createRoom: jest.fn(),
            generateToken: jest.fn(),
            listRooms: jest.fn(),
            deleteRoom: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VideoController>(VideoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
