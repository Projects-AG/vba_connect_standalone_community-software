import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

// Prevent loading the real typeorm module chain (typeorm -> glob ->
// path-scurry), which is incompatible with this environment's Node version.
// MeetNoteIntegrationService is constructed directly with mock repos, so only
// the type decorator imports need mocking.
const noopDecorator = () => () => {};
jest.mock('@nestjs/typeorm', () => ({
  Injectable: () => (_target: unknown) => {},
  InjectRepository: () => (_target: unknown, _key: string) => {},
  Repository: class {},
  Entity: noopDecorator,
  PrimaryColumn: noopDecorator,
  PrimaryGeneratedColumn: noopDecorator,
  Column: noopDecorator,
  CreateDateColumn: noopDecorator,
  UpdateDateColumn: noopDecorator,
  JoinColumn: noopDecorator,
  ManyToOne: noopDecorator,
  OneToMany: noopDecorator,
  Index: noopDecorator,
  getRepository: jest.fn(),
  createRepository: jest.fn(),
}));
jest.mock('typeorm', () => ({
  Repository: class {},
  Entity: noopDecorator,
  PrimaryColumn: noopDecorator,
  PrimaryGeneratedColumn: noopDecorator,
  Column: noopDecorator,
  CreateDateColumn: noopDecorator,
  UpdateDateColumn: noopDecorator,
  JoinColumn: noopDecorator,
  ManyToOne: noopDecorator,
  OneToMany: noopDecorator,
  Index: noopDecorator,
  getRepository: jest.fn(),
  createRepository: jest.fn(),
}));

// Node's fs module exports are non-configurable, so jest.spyOn(fs, ...)
// cannot redefine them. Mock the module at the factory level instead.
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

const existsSyncMock = fs.existsSync as jest.Mock;
const readFileSyncMock = fs.readFileSync as jest.Mock;
const unlinkSyncMock = fs.unlinkSync as jest.Mock;

import { MeetNoteIntegrationService } from './service/meetnote-integration.service';

describe('MeetNoteIntegrationService', () => {
  let service: MeetNoteIntegrationService;
  let configService: ConfigService;
  let meetingRepo: { findOne: jest.Mock };
  let recordingRepo: { update: jest.Mock };
  let transcriptRepo: { delete: jest.Mock; save: jest.Mock };
  let actionItemRepo: { delete: jest.Mock; save: jest.Mock };
  let decisionRepo: { delete: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          MEETNOTE_BASE_URL: 'http://localhost:8000',
          LOOP_RECORDINGS_PATH: 'D:/LoopRecordings',
          MEETNOTE_SERVICE_EMAIL: 'sakshi.integration@example.com',
          MEETNOTE_SERVICE_PASSWORD: 'meetnote-pass',
        };
        return values[key] ?? null;
      }),
    } as unknown as ConfigService;

    meetingRepo = { findOne: jest.fn() };
    recordingRepo = { update: jest.fn() };
    transcriptRepo = { delete: jest.fn(), save: jest.fn() };
    actionItemRepo = { delete: jest.fn(), save: jest.fn() };
    decisionRepo = { delete: jest.fn(), save: jest.fn() };

    service = new MeetNoteIntegrationService(
      configService,
      meetingRepo as any,
      recordingRepo as any,
      transcriptRepo as any,
      actionItemRepo as any,
      decisionRepo as any,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('converts mp4 recordings to webm before uploading to MeetNote', async () => {
    const recording = {
      recordingId: 42,
      meetingId: 'meeting-123',
      roomName: 'room-abc',
      filePath: 'D:/LoopRecordings/room-abc.mp4',
      fileName: 'room-abc.mp4',
      durationSeconds: 12,
    } as any;

    meetingRepo.findOne.mockResolvedValue({ meetingId: 'meeting-123' });
    jest.spyOn(service as any, 'getAuthHeaders').mockResolvedValue({ Authorization: 'Bearer token' });
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(Buffer.from('converted-webm'));
    const convertSpy = jest
      .spyOn(service as any, 'convertRecordingToWebm')
      .mockResolvedValue('D:/LoopRecordings/room-abc.webm');

    const fetchSpy = jest.spyOn(global as any, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ meeting_id: 99 }),
      text: async () => '',
    });

    await service.submitRecording(recording);

    expect(convertSpy).toHaveBeenCalledWith('D:/LoopRecordings/room-abc.mp4');
    const request = fetchSpy.mock.calls[0][1] as any;
    const uploadedFile = request.body.get('file') as File;
    expect(uploadedFile.type).toBe('video/webm');
    expect(uploadedFile.name).toBe('room-abc.webm');
    expect(recordingRepo.update).toHaveBeenCalledWith(
      { recordingId: 42 },
      expect.objectContaining({ meetnoteStatus: 'uploaded', status: 'uploaded' }),
    );
  });

  it('skips upload when meetnoteMeetingId is already set (idempotency)', async () => {
    const recording = {
      recordingId: 42,
      meetingId: 'meeting-123',
      roomName: 'room-abc',
      filePath: 'D:/LoopRecordings/room-abc.mp4',
      fileName: 'room-abc.mp4',
      durationSeconds: 12,
      meetnoteMeetingId: 'mn-99',
      meetnoteStatus: 'uploaded',
    } as any;

    const fetchSpy = jest.spyOn(global as any, 'fetch');

    const result = await service.submitRecording(recording);

    expect(result.skipped).toBe(true);
    expect(result.meetnoteMeetingId).toBe('mn-99');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('builds a lowercase slug meeting_code within the 64-char limit', async () => {
    const recording = {
      recordingId: 42,
      meetingId: '550e8400-e29b-41d4-a716-446655440000',
      roomName: 'My Meeting Room!',
      filePath: 'D:/LoopRecordings/meeting.mp4',
      fileName: 'meeting.mp4',
      durationSeconds: 12,
    } as any;

    meetingRepo.findOne.mockResolvedValue({ meetingId: '550e8400-e29b-41d4-a716-446655440000' });
    jest.spyOn(service as any, 'getAuthHeaders').mockResolvedValue({ Authorization: 'Bearer token' });
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(Buffer.from('converted-webm'));
    jest
      .spyOn(service as any, 'convertRecordingToWebm')
      .mockResolvedValue('D:/LoopRecordings/meeting.webm');

    const fetchSpy = jest.spyOn(global as any, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ meeting_id: 99 }),
      text: async () => '',
    });

    await service.submitRecording(recording);

    const request = fetchSpy.mock.calls[0][1] as any;
    expect(request.body.get('meeting_code')).toBe('my-meeting-room');
  });

  // --------------------------------------------------------------------------
  // MeetNote /auth/login request format
  // --------------------------------------------------------------------------

  it('login sends JSON body with email and password to /auth/login', async () => {
    const fetchSpy = jest
      .spyOn(global as any, 'fetch')
      .mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 'token-123', token_type: 'bearer' }),
        text: async () => '',
      });

    const headers = await (service as any).getAuthHeaders();

    expect(headers).toEqual({ Authorization: 'Bearer token-123' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const call = fetchSpy.mock.calls[0] as [string, any];
    const [url, init] = call;
    expect(url).toBe('http://localhost:8000/auth/login');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(init.body as string);
    expect(body.email).toBe('sakshi.integration@example.com');
    expect(body.password).toBe('meetnote-pass');
  });

  it('login on HTTP 422 throws error with sanitized Pydantic validation detail', async () => {
    jest
      .spyOn(global as any, 'fetch')
      .mockResolvedValue({
        ok: false,
        status: 422,
        text: async () =>
          JSON.stringify({
            detail: [
              {
                type: 'value_error',
                loc: ['body', 'email'],
                msg: 'value is not a valid email address',
                input: 'not-an-email',
              },
            ],
          }),
      });

    let error: Error | null = null;
    try {
      await (service as any).getAuthHeaders();
    } catch (e) {
      error = e as Error;
    }
    expect(error).not.toBeNull();
    expect(error!.message).toContain('MeetNote login failed with status 422');
    expect(error!.message).toContain('value is not a valid email address');
    // The Pydantic `input` value (which may contain the submitted email)
    // must NOT be included in the error message.
    expect(error!.message).not.toContain('not-an-email');
  });

  it('login on HTTP 422 never exposes the password in the error message', async () => {
    jest
      .spyOn(global as any, 'fetch')
      .mockResolvedValue({
        ok: false,
        status: 422,
        text: async () =>
          JSON.stringify({
            detail: [
              {
                type: 'missing',
                loc: ['body', 'password'],
                msg: 'field required',
                input: 'super-secret-password',
              },
            ],
          }),
      });

    let error: Error | null = null;
    try {
      await (service as any).getAuthHeaders();
    } catch (e) {
      error = e as Error;
    }
    expect(error).not.toBeNull();
    expect(error!.message).toContain('422');
    // The password submitted in the request must never appear in the error.
    expect(error!.message).not.toContain('super-secret-password');
  });

  it('login on HTTP 401 throws error with MeetNote detail', async () => {
    jest
      .spyOn(global as any, 'fetch')
      .mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ detail: 'Incorrect email or password' }),
      });

    let error: Error | null = null;
    try {
      await (service as any).getAuthHeaders();
    } catch (e) {
      error = e as Error;
    }
    expect(error).not.toBeNull();
    expect(error!.message).toContain('MeetNote login failed with status 401');
    expect(error!.message).toContain('Incorrect email or password');
  });

  it('login on non-JSON error body throws error with status only', async () => {
    jest
      .spyOn(global as any, 'fetch')
      .mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

    let error: Error | null = null;
    try {
      await (service as any).getAuthHeaders();
    } catch (e) {
      error = e as Error;
    }
    expect(error).not.toBeNull();
    expect(error!.message).toContain('MeetNote login failed with status 500');
  });
});
