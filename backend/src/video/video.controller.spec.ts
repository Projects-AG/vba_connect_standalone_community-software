import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './controller/video.controller';
import { VideoService } from './service/video.service';
import { MeetingRecordingService } from '../meeting/service/meeting-recording.service';

describe('VideoController', () => {
  let controller: VideoController;
  let videoService: {
    createRoom: jest.Mock;
    generateToken: jest.Mock;
    listRooms: jest.Mock;
    deleteRoom: jest.Mock;
    startRecording: jest.Mock;
    stopRecording: jest.Mock;
    getRecording: jest.Mock;
    generatePlaybackToken: jest.Mock;
  };
  let meetingRecordingService: {
    findByRecordingId: jest.Mock;
    findByEgressId: jest.Mock;
    updateProcessingStatus: jest.Mock;
    upsertForRoom: jest.Mock;
    findByMeetingId: jest.Mock;
  };

  beforeEach(async () => {
    videoService = {
      createRoom: jest.fn(),
      generateToken: jest.fn(),
      listRooms: jest.fn(),
      deleteRoom: jest.fn(),
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      getRecording: jest.fn(),
      generatePlaybackToken: jest.fn(),
    };
    meetingRecordingService = {
      findByRecordingId: jest.fn(),
      findByEgressId: jest.fn(),
      updateProcessingStatus: jest.fn(),
      upsertForRoom: jest.fn(),
      findByMeetingId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [
        {
          provide: VideoService,
          useValue: videoService,
        },
        {
          provide: MeetingRecordingService,
          useValue: meetingRecordingService,
        },
      ],
    }).compile();

    controller = module.get<VideoController>(VideoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('calls the recording service start endpoint with a room name', async () => {
    const egress = {
      egressId: 'egress-1',
      roomName: 'meeting-001',
    };
    videoService.startRecording.mockResolvedValue({ success: true, egress });

    await expect(
      controller.startRecording({ roomName: 'meeting-001' }),
    ).resolves.toMatchObject({
      success: true,
      egress,
    });
  });

  it('generates a playback token with authenticated user id', async () => {
    videoService.generatePlaybackToken.mockResolvedValue('abc123');

    const result = await controller.generatePlaybackToken('rec-1', {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    } as any);

    expect(videoService.generatePlaybackToken).toHaveBeenCalledWith(
      'rec-1',
      'user-123',
    );
    expect(result).toMatchObject({ token: 'abc123' });
  });
});
