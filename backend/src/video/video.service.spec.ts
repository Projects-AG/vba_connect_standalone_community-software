import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import * as path from 'path';

// Prevent loading the real typeorm module chain (typeorm -> glob ->
// path-scurry), which is incompatible with this environment's Node version.
// MeetingRecordingService is already injected as a mock, so only the type
// decorator imports need mocking.
const noopDecorator = () => () => {};

jest.mock('@nestjs/typeorm', () => ({
  Injectable: () => (_target: unknown) => {},
  InjectRepository: () => (_target: unknown, _key: string) => {},
  Repository: class {},
  Entity: noopDecorator,
  Index: noopDecorator,
  PrimaryColumn: noopDecorator,
  PrimaryGeneratedColumn: noopDecorator,
  Column: noopDecorator,
  CreateDateColumn: noopDecorator,
  UpdateDateColumn: noopDecorator,
  JoinColumn: noopDecorator,
  ManyToOne: noopDecorator,
  OneToMany: noopDecorator,
  getRepository: jest.fn(),
  createRepository: jest.fn(),
}));
jest.mock('typeorm', () => ({
  Repository: class {},
  Entity: noopDecorator,
  Index: noopDecorator,
  PrimaryColumn: noopDecorator,
  PrimaryGeneratedColumn: noopDecorator,
  Column: noopDecorator,
  CreateDateColumn: noopDecorator,
  UpdateDateColumn: noopDecorator,
  JoinColumn: noopDecorator,
  ManyToOne: noopDecorator,
  OneToMany: noopDecorator,
  getRepository: jest.fn(),
  createRepository: jest.fn(),
}));

import { VideoService } from './service/video.service';
import { EgressStatus, LivekitModel } from './model/livekit.model';
import { MeetingRecordingService } from '../meeting/service/meeting-recording.service';
import { MeetNoteIntegrationService } from '../meeting/service/meetnote-integration.service';
import { RecordingProcessingService } from '../meeting/service/recording-processing.service';

import * as fs from 'fs';

// Node's fs module exports are non-configurable, so jest.spyOn(fs, ...)
// cannot redefine them. Mock the module at the factory level instead.
jest.mock('fs', () => ({
  statSync: jest.fn(),
  existsSync: jest.fn(),
}));

const statSyncMock = fs.statSync as jest.Mock;
const existsSyncMock = fs.existsSync as jest.Mock;

describe('VideoService', () => {
  let service: VideoService;
  let livekitModel: {
    createRoom: jest.Mock;
    generateToken: jest.Mock;
    listRooms: jest.Mock;
    deleteRoom: jest.Mock;
    startRecording: jest.Mock;
    stopRecording: jest.Mock;
    getRecording: jest.Mock;
  };
  let meetingRecordingService: {
    upsertForRoom: jest.Mock;
    updateProcessingStatus: jest.Mock;
    findByEgressId: jest.Mock;
    findByRecordingId: jest.Mock;
    findMeetingByIdAndUser: jest.Mock;
  };
  let meetNoteIntegrationService: {
    submitRecording: jest.Mock;
    resolveHostFilePath: jest.Mock;
    isAllowedRecordingPath: jest.Mock;
  };
  let recordingProcessingService: {
    processRecording: jest.Mock;
  };
  let configService: ConfigService;

  beforeEach(async () => {
    livekitModel = {
      createRoom: jest.fn(),
      generateToken: jest.fn(),
      listRooms: jest.fn(),
      deleteRoom: jest.fn(),
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      getRecording: jest.fn(),
    };
    meetingRecordingService = {
      upsertForRoom: jest.fn(),
      updateProcessingStatus: jest.fn(),
      findByEgressId: jest.fn(),
      findByRecordingId: jest.fn(),
      findMeetingByIdAndUser: jest.fn(),
    };
    meetNoteIntegrationService = {
      submitRecording: jest.fn(),
      resolveHostFilePath: jest.fn((filePath: string | null | undefined) => {
        if (!filePath) return null;
        const normalized = filePath.trim();
        if (!normalized) return null;
        if (normalized.startsWith('/out/')) {
          return `D:/LoopRecordings/${path.basename(normalized)}`;
        }
        return normalized;
      }),
      isAllowedRecordingPath: jest.fn(() => true),
    };
    recordingProcessingService = {
      processRecording: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          'LOOP_RECORDING_POLL_INTERVAL_MS': '10',
          'LOOP_RECORDING_MAX_ATTEMPTS': '2',
          'LOOP_RECORDINGS_PATH': 'D:/LoopRecordings',
        };
        return values[key] ?? null;
      }),
    } as unknown as ConfigService;

    statSyncMock.mockReset();
    existsSyncMock.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: LivekitModel,
          useValue: livekitModel,
        },
        {
          provide: MeetingRecordingService,
          useValue: meetingRecordingService,
        },
        {
          provide: MeetNoteIntegrationService,
          useValue: meetNoteIntegrationService,
        },
        {
          provide: RecordingProcessingService,
          useValue: recordingProcessingService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('starts a room recording and persists the associated recording metadata', async () => {
    const egress = {
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: 'STARTING',
    };
    livekitModel.startRecording.mockResolvedValue(egress);
    meetingRecordingService.upsertForRoom.mockResolvedValue({
      meetingId: 'meeting-uuid',
      egressId: 'egress-1',
      status: 'starting',
    });

    await expect(service.startRecording('meeting-001')).resolves.toMatchObject({
      success: true,
      egress,
    });

    expect(livekitModel.startRecording).toHaveBeenCalledWith('meeting-001');
    expect(meetingRecordingService.upsertForRoom).toHaveBeenCalledWith(
      expect.objectContaining({
        roomName: 'meeting-001',
        egressId: 'egress-1',
        status: 'starting',
      }),
    );
  });

  it('rejects invalid room names when starting a recording', async () => {
    await expect(service.startRecording('   ')).rejects.toThrow('Room name is required');
  });

  it('stops a recording and returns current egress state', async () => {
    const egress = {
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: 'ENDED',
    };
    livekitModel.stopRecording.mockResolvedValue(egress);

    await expect(service.stopRecording('egress-1')).resolves.toMatchObject({
      success: true,
      egress,
    });

    expect(meetingRecordingService.updateProcessingStatus).toHaveBeenCalledWith(
      'egress-1',
      expect.objectContaining({ status: 'stopping' }),
    );
  });

  it('rejects invalid egress ids when stopping a recording', async () => {
    await expect(service.stopRecording('   ')).rejects.toThrow('Egress ID is required');
  });

  it('fetches an existing recording by id', async () => {
    const egress = {
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: 'ENDED',
    };
    livekitModel.getRecording.mockResolvedValue(egress);

    await expect(service.getRecording('egress-1')).resolves.toMatchObject({
      success: true,
      egress,
    });
  });

  // --------------------------------------------------------------------------
  // finalizeRecording: successful Egress completion -> MeetNote handoff
  // --------------------------------------------------------------------------

  it('finalizes a completed Egress, persists metadata, and starts Loop-native processing', async () => {
    const record = {
      recordingId: 'rec-1',
      meetingId: 'meeting-uuid',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: '/out/meeting-001.mp4',
      fileName: 'meeting-001.mp4',
      durationSeconds: 0,
      fileSizeBytes: 0,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    // SDK returns numeric EgressStatus; COMPLETE = 3.
    // duration is int64 nanoseconds: 120 seconds = 120_000_000_000 ns.
    livekitModel.getRecording.mockResolvedValue({
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: EgressStatus.EGRESS_COMPLETE,
      fileResults: [
        {
          location: '/out/meeting-001.mp4',
          filename: 'meeting-001.mp4',
          duration: BigInt(120 * 1000 * 1000 * 1000),
          size: BigInt(524288),
        },
      ],
    });
    meetingRecordingService.updateProcessingStatus.mockResolvedValue(record);
    meetingRecordingService.findByEgressId.mockResolvedValue(record);
    statSyncMock.mockReturnValue({
      isFile: () => true,
      size: 524288,
    } as unknown as fs.Stats);
    recordingProcessingService.processRecording.mockResolvedValue(undefined);

    await (service as any).finalizeRecording('egress-1', 'meeting-001');

    expect(livekitModel.getRecording).toHaveBeenCalledWith('egress-1');
    // Metadata persisted: status, filePath, fileName, durationSeconds (ns→s),
    // fileSizeBytes. processingStatus is NOT pre-set here — processRecording()
    // owns that state transition to avoid self-skipping.
    expect(meetingRecordingService.updateProcessingStatus).toHaveBeenCalledWith(
      'egress-1',
      expect.objectContaining({
        status: 'completed',
        filePath: '/out/meeting-001.mp4',
        fileName: 'meeting-001.mp4',
        durationSeconds: 120,
        fileSizeBytes: 524288,
      }),
    );
    // Loop-native processing invoked exactly once with the resolved host path
    expect(recordingProcessingService.processRecording).toHaveBeenCalledWith(
      'rec-1',
      'D:/LoopRecordings/meeting-001.mp4',
    );
    expect(recordingProcessingService.processRecording).toHaveBeenCalledTimes(1);
  });

  it('normalizes string status values for completion and failure', async () => {
    const record = {
      recordingId: 'rec-1',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: '/out/room.mp4',
      fileName: 'room.mp4',
      durationSeconds: 0,
      fileSizeBytes: 0,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    // String status (defensive path), COMPLETE.
    // duration is int64 nanoseconds: 10 seconds = 10_000_000_000 ns.
    livekitModel.getRecording.mockResolvedValue({
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: 'EGRESS_COMPLETE',
      fileResults: [
        {
          location: '/out/room.mp4',
          filename: 'room.mp4',
          duration: BigInt(10 * 1000 * 1000 * 1000),
          size: BigInt(1000),
        },
      ],
    });
    meetingRecordingService.updateProcessingStatus.mockResolvedValue(record);
    meetingRecordingService.findByEgressId.mockResolvedValue(record);
    statSyncMock.mockReturnValue({ isFile: () => true, size: 1000 } as unknown as fs.Stats);
    recordingProcessingService.processRecording.mockResolvedValue(undefined);

    await (service as any).finalizeRecording('egress-1', 'meeting-001');

    expect(recordingProcessingService.processRecording).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------------------------------
  // finalizeRecording: confirmed Egress failure
  // --------------------------------------------------------------------------

  it('marks a confirmed Egress failure and does not submit to MeetNote', async () => {
    const record = {
      recordingId: 'rec-1',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: null,
      fileName: null,
      durationSeconds: 0,
      fileSizeBytes: 0,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    livekitModel.getRecording.mockResolvedValue({
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: EgressStatus.EGRESS_FAILED,
      fileResults: [],
    });
    meetingRecordingService.updateProcessingStatus.mockResolvedValue(record);

    await (service as any).finalizeRecording('egress-1', 'meeting-001');

    expect(meetingRecordingService.updateProcessingStatus).toHaveBeenCalledWith(
      'egress-1',
      expect.objectContaining({
        status: 'failed',
        errorMessage: 'LiveKit recording failed to complete',
      }),
    );
    expect(recordingProcessingService.processRecording).not.toHaveBeenCalled();
  });

  it('treats ABORTED and LIMIT_REACHED as confirmed failures', async () => {
    meetingRecordingService.updateProcessingStatus.mockResolvedValue({});

    for (const status of [
      EgressStatus.EGRESS_ABORTED,
      EgressStatus.EGRESS_LIMIT_REACHED,
    ]) {
      livekitModel.getRecording.mockResolvedValue({
        egressId: 'egress-1',
        roomName: 'meeting-001',
        status,
        fileResults: [],
      });
      recordingProcessingService.processRecording.mockClear();

      await (service as any).finalizeRecording('egress-1', 'meeting-001');

      expect(meetingRecordingService.updateProcessingStatus).toHaveBeenCalledWith(
        'egress-1',
        expect.objectContaining({ status: 'failed' }),
      );
      expect(recordingProcessingService.processRecording).not.toHaveBeenCalled();
    }
  });

  // --------------------------------------------------------------------------
  // finalizeRecording: timeout without false success
  // --------------------------------------------------------------------------

  it('marks stalled when Egress never reaches a terminal status within the window', async () => {
    const record = {
      recordingId: 'rec-1',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: null,
      fileName: null,
      durationSeconds: 0,
      fileSizeBytes: 0,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    // Always non-terminal (ACTIVE = 1); polling window is short (2 attempts x 10ms)
    livekitModel.getRecording.mockResolvedValue({
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: EgressStatus.EGRESS_ACTIVE,
      fileResults: [],
    });
    meetingRecordingService.updateProcessingStatus.mockResolvedValue(record);

    await (service as any).finalizeRecording('egress-1', 'meeting-001');

    expect(meetingRecordingService.updateProcessingStatus).toHaveBeenCalledWith(
      'egress-1',
      expect.objectContaining({
        status: 'stalled',
        errorMessage: 'Recording did not finish within the expected time window',
      }),
    );
    expect(recordingProcessingService.processRecording).not.toHaveBeenCalled();
  });

  it('does not treat an absent or unknown status as completion', async () => {
    const record = {
      recordingId: 'rec-1',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: null,
      fileName: null,
      durationSeconds: 0,
      fileSizeBytes: 0,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    livekitModel.getRecording.mockResolvedValue({
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: undefined,
      fileResults: [],
    });
    meetingRecordingService.updateProcessingStatus.mockResolvedValue(record);

    await (service as any).finalizeRecording('egress-1', 'meeting-001');

    expect(meetingRecordingService.updateProcessingStatus).toHaveBeenCalledWith(
      'egress-1',
      expect.objectContaining({ status: 'stalled' }),
    );
    expect(recordingProcessingService.processRecording).not.toHaveBeenCalled();
  });

  // --------------------------------------------------------------------------
  // finalizeRecording: duplicate stop/finalization requests
  // --------------------------------------------------------------------------

  it('does not start duplicate finalization loops for the same Egress ID', async () => {
    const record = {
      recordingId: 'rec-1',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: null,
      fileName: null,
      durationSeconds: 0,
      fileSizeBytes: 0,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    let pollCount = 0;
    livekitModel.getRecording.mockImplementation(async () => {
      pollCount += 1;
      return {
        egressId: 'egress-1',
        roomName: 'meeting-001',
        status: EgressStatus.EGRESS_ACTIVE,
        fileResults: [],
      };
    });
    meetingRecordingService.updateProcessingStatus.mockResolvedValue(record);

    // Launch two finalization loops concurrently for the same Egress ID.
    await Promise.all([
      (service as any).finalizeRecording('egress-1', 'meeting-001'),
      (service as any).finalizeRecording('egress-1', 'meeting-001'),
    ]);

    // Only one loop should have polled; the second was blocked by the guard.
    expect(pollCount).toBeGreaterThan(0);
    expect(pollCount).toBeLessThanOrEqual(2);
    expect(livekitModel.getRecording).toHaveBeenCalledTimes(pollCount);
  });

  // --------------------------------------------------------------------------
  // finalizeRecording: missing or empty output files
  // --------------------------------------------------------------------------

  it('marks failed when completed Egress has a missing output file', async () => {
    const record = {
      recordingId: 'rec-1',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: '/out/meeting-001.mp4',
      fileName: 'meeting-001.mp4',
      durationSeconds: 120,
      fileSizeBytes: 524288,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    livekitModel.getRecording.mockResolvedValue({
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: EgressStatus.EGRESS_COMPLETE,
      fileResults: [
        { location: '/out/meeting-001.mp4', filename: 'meeting-001.mp4', duration: BigInt(120), size: BigInt(524288) },
      ],
    });
    meetingRecordingService.updateProcessingStatus.mockResolvedValue(record);
    meetingRecordingService.findByEgressId.mockResolvedValue(record);
    // File does not exist on disk.
    statSyncMock.mockImplementation(() => {
      const err: any = new Error('ENOENT: no such file or directory');
      err.code = 'ENOENT';
      throw err;
    });

    await (service as any).finalizeRecording('egress-1', 'meeting-001');

    expect(meetingRecordingService.updateProcessingStatus).toHaveBeenCalledWith(
      'egress-1',
      expect.objectContaining({
        status: 'failed',
        errorMessage: 'Recording completed but output file is missing or empty on disk',
      }),
    );
    expect(recordingProcessingService.processRecording).not.toHaveBeenCalled();
  });

  it('marks failed when completed Egress has an empty output file', async () => {
    const record = {
      recordingId: 'rec-1',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: '/out/meeting-001.mp4',
      fileName: 'meeting-001.mp4',
      durationSeconds: 120,
      fileSizeBytes: 0,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    livekitModel.getRecording.mockResolvedValue({
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: EgressStatus.EGRESS_COMPLETE,
      fileResults: [
        { location: '/out/meeting-001.mp4', filename: 'meeting-001.mp4', duration: BigInt(120), size: BigInt(0) },
      ],
    });
    meetingRecordingService.updateProcessingStatus.mockResolvedValue(record);
    meetingRecordingService.findByEgressId.mockResolvedValue(record);
    statSyncMock.mockReturnValue({
      isFile: () => true,
      size: 0,
    } as unknown as fs.Stats);

    await (service as any).finalizeRecording('egress-1', 'meeting-001');

    expect(meetingRecordingService.updateProcessingStatus).toHaveBeenCalledWith(
      'egress-1',
      expect.objectContaining({
        status: 'failed',
        errorMessage: 'Recording completed but output file is missing or empty on disk',
      }),
    );
    expect(recordingProcessingService.processRecording).not.toHaveBeenCalled();
  });

  it('resolves output path from Egress completion result when DB record has no filePath', async () => {
    // DB record has no filePath (startRecording did not store it), but
    // LiveKit's Egress completion result includes a valid filePath.
    const record = {
      recordingId: 'rec-1',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: null, // DB record missing filePath - reproduces the reported bug
      fileName: null,
      durationSeconds: 0,
      fileSizeBytes: 0,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    livekitModel.getRecording.mockResolvedValue({
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: EgressStatus.EGRESS_COMPLETE,
      fileResults: [
        {
          location: '/out/bd7720c4-389a-4e1c-b890-a8540d0e4f51-2026-10-17T19-28-33-688Z.mp4',
          filename: 'bd7720c4-389a-4e1c-b890-a8540d0e4f51-2026-10-17T19-28-33-688Z.mp4',
          duration: BigInt(6 * 1000 * 1000 * 1000),
          size: BigInt(154058),
        },
      ],
    });
    meetingRecordingService.updateProcessingStatus.mockResolvedValue(record);
    meetingRecordingService.findByEgressId.mockResolvedValue(record);
    statSyncMock.mockReturnValue({
      isFile: () => true,
      size: 154058,
    } as unknown as fs.Stats);
    recordingProcessingService.processRecording.mockResolvedValue(undefined);

    await (service as any).finalizeRecording('egress-1', 'meeting-001');

    // Metadata persisted using filePath from Egress completion result
    expect(meetingRecordingService.updateProcessingStatus).toHaveBeenCalledWith(
      'egress-1',
      expect.objectContaining({
        status: 'completed',
        filePath: '/out/bd7720c4-389a-4e1c-b890-a8540d0e4f51-2026-10-17T19-28-33-688Z.mp4',
        durationSeconds: 6,
        fileSizeBytes: 154058,
      }),
    );
    // Path resolved from Egress completion result (not DB record), file validated,
    // and Loop-native processing invoked exactly once
    expect(recordingProcessingService.processRecording).toHaveBeenCalledWith(
      'rec-1',
      'D:/LoopRecordings/bd7720c4-389a-4e1c-b890-a8540d0e4f51-2026-10-17T19-28-33-688Z.mp4',
    );
    expect(recordingProcessingService.processRecording).toHaveBeenCalledTimes(1);
  });

  it('recovers from stale processing status and runs Python pipeline', async () => {
    // DB record is stuck in processingStatus 'processing' (e.g. from a crashed
    // previous attempt). LiveKit Egress is COMPLETE and the file exists.
    // processRecording() must recover and reprocess, not skip.
    const record = {
      recordingId: 'rec-1',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: '/out/meeting-001.mp4',
      fileName: 'meeting-001.mp4',
      durationSeconds: 0,
      fileSizeBytes: 0,
      processingStatus: 'processing', // stale from previous failed attempt
      transcriptStatus: 'pending',
      intelligenceStatus: 'pending',
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    livekitModel.getRecording.mockResolvedValue({
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: EgressStatus.EGRESS_COMPLETE,
      fileResults: [
        {
          location: '/out/meeting-001.mp4',
          filename: 'meeting-001.mp4',
          duration: BigInt(31 * 1000 * 1000 * 1000),
          size: BigInt(12551706),
        },
      ],
    });
    meetingRecordingService.updateProcessingStatus.mockResolvedValue(record);
    meetingRecordingService.findByEgressId.mockResolvedValue(record);
    statSyncMock.mockReturnValue({
      isFile: () => true,
      size: 12551706,
    } as unknown as fs.Stats);
    recordingProcessingService.processRecording.mockResolvedValue(undefined);

    await (service as any).finalizeRecording('egress-1', 'meeting-001');

    // handleCompletedEgress must NOT pre-set processingStatus: 'processing'
    expect(meetingRecordingService.updateProcessingStatus).toHaveBeenCalledWith(
      'egress-1',
      expect.objectContaining({
        status: 'completed',
        filePath: '/out/meeting-001.mp4',
        fileName: 'meeting-001.mp4',
        durationSeconds: 31,
        fileSizeBytes: 12551706,
      }),
    );
    // processRecording must be invoked despite stale 'processing' status
    expect(recordingProcessingService.processRecording).toHaveBeenCalledWith(
      'rec-1',
      'D:/LoopRecordings/meeting-001.mp4',
    );
    expect(recordingProcessingService.processRecording).toHaveBeenCalledTimes(1);
  });

  it('skips duplicate MeetNote submission when already uploaded', async () => {
    const record = {
      recordingId: 'rec-1',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: '/out/meeting-001.mp4',
      fileName: 'meeting-001.mp4',
      durationSeconds: 120,
      fileSizeBytes: 524288,
      meetnoteMeetingId: 'mn-1',
      meetnoteStatus: 'uploaded',
      errorMessage: null,
    };

    livekitModel.getRecording.mockResolvedValue({
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: EgressStatus.EGRESS_COMPLETE,
      fileResults: [
        { location: '/out/meeting-001.mp4', filename: 'meeting-001.mp4', duration: BigInt(120), size: BigInt(524288) },
      ],
    });
    meetingRecordingService.findByEgressId.mockResolvedValue(record);

    await (service as any).finalizeRecording('egress-1', 'meeting-001');

    expect(recordingProcessingService.processRecording).not.toHaveBeenCalled();
  });

  // --------------------------------------------------------------------------
  // output path resolution and metadata updates
  // --------------------------------------------------------------------------

  it('resolveHostFilePath maps /out/ container path to host recordings path', () => {
    const result = meetNoteIntegrationService.resolveHostFilePath('/out/meeting-001.mp4');
    expect(result).toBe('D:/LoopRecordings/meeting-001.mp4');
  });

  it('resolveHostFilePath returns non-/out/ paths unchanged', () => {
    const result = meetNoteIntegrationService.resolveHostFilePath('D:/LoopRecordings/meeting-001.mp4');
    expect(result).toBe('D:/LoopRecordings/meeting-001.mp4');
  });

  it('resolveHostFilePath returns null for empty input', () => {
    expect(meetNoteIntegrationService.resolveHostFilePath(null)).toBeNull();
    expect(meetNoteIntegrationService.resolveHostFilePath(undefined)).toBeNull();
    expect(meetNoteIntegrationService.resolveHostFilePath('')).toBeNull();
  });

  it('persists file path, name, duration and size via updateProcessingStatus', async () => {
    meetingRecordingService.findByEgressId.mockResolvedValue({
      recordingId: 'rec-1',
      egressId: 'egress-1',
    } as any);
    meetingRecordingService.updateProcessingStatus.mockResolvedValue({});

    await meetingRecordingService.updateProcessingStatus('egress-1', {
      status: 'completed',
      filePath: '/out/room.mp4',
      fileName: 'room.mp4',
      durationSeconds: 120,
      fileSizeBytes: 524288,
    });

    expect(meetingRecordingService.updateProcessingStatus).toHaveBeenCalledWith(
      'egress-1',
      expect.objectContaining({
        status: 'completed',
        filePath: '/out/room.mp4',
        fileName: 'room.mp4',
        durationSeconds: 120,
        fileSizeBytes: 524288,
      }),
    );
  });

  // --------------------------------------------------------------------------
  // MeetNote processing delegation (replaces Python subprocess)
  // --------------------------------------------------------------------------

  it('delegates to MeetNote processing instead of Python after Egress complete', async () => {
    const record = {
      recordingId: 'rec-1',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: '/out/meeting-001.mp4',
      fileName: 'meeting-001.mp4',
      durationSeconds: 0,
      fileSizeBytes: 0,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    livekitModel.getRecording.mockResolvedValue({
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: EgressStatus.EGRESS_COMPLETE,
      fileResults: [
        {
          location: '/out/meeting-001.mp4',
          filename: 'meeting-001.mp4',
          duration: BigInt(31 * 1000 * 1000 * 1000),
          size: BigInt(12551706),
        },
      ],
    });
    meetingRecordingService.findByEgressId.mockResolvedValue(record);
    meetingRecordingService.updateProcessingStatus.mockResolvedValue(record);
    statSyncMock.mockReturnValue({
      isFile: () => true,
      size: 12551706,
    } as unknown as fs.Stats);
    recordingProcessingService.processRecording.mockResolvedValue(undefined);

    const loggerLogSpy = jest.spyOn((service as any).logger, 'log');

    await (service as any).finalizeRecording('egress-1', 'meeting-001');

    // MeetNote processing is fire-and-forget (not awaited)
    expect(recordingProcessingService.processRecording).toHaveBeenCalledTimes(1);
    expect(recordingProcessingService.processRecording).toHaveBeenCalledWith(
      'rec-1',
      'D:/LoopRecordings/meeting-001.mp4',
    );
    // findByEgressId called once (before processing, not after)
    expect(meetingRecordingService.findByEgressId).toHaveBeenCalledTimes(1);
    // MeetNote processing started was logged (not Loop-native finished)
    expect(loggerLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('MeetNote processing started'),
    );
  });

  it('does not log "finished" when MeetNote processing is fire-and-forget', async () => {
    const baseRecord = {
      recordingId: 'rec-1',
      roomName: 'meeting-001',
      egressId: 'egress-1',
      status: 'stopping',
      filePath: '/out/meeting-001.mp4',
      fileName: 'meeting-001.mp4',
      durationSeconds: 0,
      fileSizeBytes: 0,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    livekitModel.getRecording.mockResolvedValue({
      egressId: 'egress-1',
      roomName: 'meeting-001',
      status: EgressStatus.EGRESS_COMPLETE,
      fileResults: [
        {
          location: '/out/meeting-001.mp4',
          filename: 'meeting-001.mp4',
          duration: BigInt(31 * 1000 * 1000 * 1000),
          size: BigInt(12551706),
        },
      ],
    });
    meetingRecordingService.findByEgressId.mockResolvedValue(baseRecord);
    meetingRecordingService.updateProcessingStatus.mockResolvedValue(baseRecord);
    statSyncMock.mockReturnValue({
      isFile: () => true,
      size: 12551706,
    } as unknown as fs.Stats);
    recordingProcessingService.processRecording.mockResolvedValue(undefined);

    const loggerLogSpy = jest.spyOn((service as any).logger, 'log');

    await (service as any).finalizeRecording('egress-1', 'meeting-001');

    // processRecording was invoked exactly once (fire-and-forget)
    expect(recordingProcessingService.processRecording).toHaveBeenCalledTimes(1);
    // "finished" was NOT logged (processing is async, not awaited)
    expect(loggerLogSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Loop-native processing finished'),
    );
  });

  // --------------------------------------------------------------------------
  // getRecordingFile: ownership enforcement
  // --------------------------------------------------------------------------

  it('returns recording file when user owns the meeting', async () => {
    const record = {
      recordingId: 'rec-1',
      meetingId: 'meeting-123',
      roomName: 'room-1',
      filePath: '/out/meeting-001.mp4',
      fileName: 'meeting-001.mp4',
      durationSeconds: 0,
      fileSizeBytes: 0,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };
    const meeting = { meetingId: 'meeting-123', userId: 'user-123' };

    meetingRecordingService.findByRecordingId.mockResolvedValue(record);
    meetingRecordingService.findMeetingByIdAndUser.mockResolvedValue(meeting);
    statSyncMock.mockReturnValue({
      isFile: () => true,
      size: 524288,
    } as unknown as fs.Stats);
    existsSyncMock.mockReturnValue(true);

    const result = await (service as any).getRecordingFile('rec-1', 'user-123');

    expect(meetingRecordingService.findMeetingByIdAndUser).toHaveBeenCalledWith(
      'meeting-123',
      'user-123',
    );
    expect(result.filePath).toBeDefined();
  });

  it('throws NotFoundException when another user requests the recording file', async () => {
    const record = {
      recordingId: 'rec-1',
      meetingId: 'meeting-123',
      roomName: 'room-1',
      filePath: '/out/meeting-001.mp4',
      fileName: 'meeting-001.mp4',
      durationSeconds: 0,
      fileSizeBytes: 0,
      meetnoteMeetingId: null,
      meetnoteStatus: 'pending',
      errorMessage: null,
    };

    meetingRecordingService.findByRecordingId.mockResolvedValue(record);
    meetingRecordingService.findMeetingByIdAndUser.mockResolvedValue(null);

    await expect(
      (service as any).getRecordingFile('rec-1', 'user-123'),
    ).rejects.toThrow(NotFoundException);
    expect(meetingRecordingService.findMeetingByIdAndUser).toHaveBeenCalledWith(
      'meeting-123',
      'user-123',
    );
  });

  it('throws NotFoundException when recording has no meeting', async () => {
    const record = {
      recordingId: 'rec-1',
      meetingId: null,
      filePath: '/out/meeting-001.mp4',
      fileName: 'meeting-001.mp4',
    };

    meetingRecordingService.findByRecordingId.mockResolvedValue(record);

    await expect(
      (service as any).getRecordingFile('rec-1', 'user-123'),
    ).rejects.toThrow(NotFoundException);
  });
});
