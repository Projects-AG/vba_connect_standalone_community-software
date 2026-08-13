import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './service/video.service';
import { LivekitModel } from './model/livekit.model';

describe('VideoService', () => {
  let service: VideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: LivekitModel,
          useValue: {
            createRoom: jest.fn(),
            generateToken: jest.fn(),
            listRooms: jest.fn(),
            deleteRoom: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
