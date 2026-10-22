import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { MeetingService } from './service/meeting.service';
import { MeetingModel } from './model/meeting.model';
import { LivekitModel } from '../video/model/livekit.model';
import { MeetingRecordingService } from './service/meeting-recording.service';
import { MeetNoteIntegrationService } from './service/meetnote-integration.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MeetingRecordingEntity } from './entities/meeting-recording.entity';
import { TranscriptSegmentEntity } from './entities/transcript-segment.entity';
import { ActionItemEntity } from './entities/action-item.entity';
import { DecisionEntity } from './entities/decision.entity';

describe('MeetingService', () => {
  let service: MeetingService;

  const meetingModel = {
    findById: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const livekitModel = {
    createRoom: jest.fn(),
    generateToken: jest.fn(),
  };
  const meetingRecordingService = {
    findByMeetingId: jest.fn(),
  };
  const meetNoteIntegrationService = {
    getMeetingInsights: jest.fn().mockResolvedValue({
      success: true,
      data: {
        meetingId: 'meeting-123',
        insights: [],
      },
    }),
    exportMeeting: jest.fn().mockResolvedValue({
      data: Buffer.from('export-content'),
      headers: { 'content-type': 'application/pdf' },
    }),
  };
  const recordingRepo = {
    findOne: jest.fn(),
  };
  const transcriptRepo = {
    find: jest.fn(),
  };
  const actionItemRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const decisionRepo = {
    find: jest.fn(),
  };

  const USER_ID = 'user-123';
  const OTHER_USER_ID = 'user-456';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingService,
        { provide: MeetingModel, useValue: meetingModel },
        { provide: LivekitModel, useValue: livekitModel },
        { provide: MeetingRecordingService, useValue: meetingRecordingService },
        { provide: MeetNoteIntegrationService, useValue: meetNoteIntegrationService },
        { provide: getRepositoryToken(MeetingRecordingEntity), useValue: recordingRepo },
        { provide: getRepositoryToken(TranscriptSegmentEntity), useValue: transcriptRepo },
        { provide: getRepositoryToken(ActionItemEntity), useValue: actionItemRepo },
        { provide: getRepositoryToken(DecisionEntity), useValue: decisionRepo },
      ],
    }).compile();

    service = module.get(MeetingService);
  });

  // --------------------------------------------------------------------------
  // createMeeting
  // --------------------------------------------------------------------------

  it('persists userId from authenticated user when creating a meeting', async () => {
    const dto = {
      roomName: 'room-123',
      meetingTitle: 'Demo',
      meetingType: 'instant',
      callType: '1:1',
      participants: [],
    };
    const created = { meetingId: 'meeting-123', ...dto, userId: USER_ID };
    meetingModel.create.mockResolvedValue(created);
    livekitModel.createRoom.mockResolvedValue(undefined);

    const result = await service.createMeeting(dto, USER_ID);

    expect(result.data.userId).toBe(USER_ID);
    expect(meetingModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: USER_ID }),
    );
  });

  // --------------------------------------------------------------------------
  // getMeetings
  // --------------------------------------------------------------------------

  it('filters meetings by authenticated user id', async () => {
    const meetings = [
      { meetingId: 'm-1', userId: USER_ID },
      { meetingId: 'm-2', userId: OTHER_USER_ID },
    ];
    meetingModel.findAll.mockResolvedValue(meetings);
    meetingRecordingService.findByMeetingId.mockResolvedValue([]);

    const result = await service.getMeetings(USER_ID);

    expect(meetingModel.findAll).toHaveBeenCalledWith(USER_ID);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].recordings).toEqual([]);
  });

  // --------------------------------------------------------------------------
  // getMeeting
  // --------------------------------------------------------------------------

  it('returns a meeting owned by the authenticated user', async () => {
    const meeting = {
      meetingId: 'meeting-123',
      roomName: 'room-123',
      meetingTitle: 'Demo',
      userId: USER_ID,
    };
    meetingModel.findById.mockResolvedValue(meeting);
    meetingRecordingService.findByMeetingId.mockResolvedValue([]);

    const result = await service.getMeeting('meeting-123', USER_ID);

    expect(meetingModel.findById).toHaveBeenCalledWith('meeting-123', USER_ID);
    expect(result.data.meetingId).toBe('meeting-123');
  });

  it('throws NotFoundException when another user requests the meeting', async () => {
    const meeting = {
      meetingId: 'meeting-123',
      roomName: 'room-123',
      userId: OTHER_USER_ID,
    };
    meetingModel.findById.mockResolvedValue(null); // userId mismatch -> null

    await expect(
      service.getMeeting('meeting-123', USER_ID),
    ).rejects.toThrow(NotFoundException);
  });

  // --------------------------------------------------------------------------
  // getMeetingInsights
  // --------------------------------------------------------------------------

  it('returns insights for a meeting owned by the authenticated user', async () => {
    const meeting = {
      meetingId: 'meeting-123',
      roomName: 'room-123',
      userId: USER_ID,
    };
    meetingModel.findById.mockResolvedValue(meeting);
    meetNoteIntegrationService.getMeetingInsights.mockResolvedValue({
      success: true,
      data: { meetingId: 'meeting-123', insights: [] },
    });

    await expect(
      service.getMeetingInsights('meeting-123', USER_ID),
    ).resolves.toMatchObject({ success: true });
    expect(meetingModel.findById).toHaveBeenCalledWith('meeting-123', USER_ID);
  });

  it('throws NotFoundException when another user requests insights', async () => {
    meetingModel.findById.mockResolvedValue(null);

    await expect(
      service.getMeetingInsights('meeting-123', USER_ID),
    ).rejects.toThrow(NotFoundException);
  });

  // --------------------------------------------------------------------------
  // getMeetingExport
  // --------------------------------------------------------------------------

  it('returns export for a meeting owned by the authenticated user', async () => {
    const meeting = {
      meetingId: 'meeting-123',
      roomName: 'room-123',
      userId: USER_ID,
    };
    const recording = {
      recordingId: 'rec-1',
      meetingId: 'meeting-123',
      meetnoteMeetingId: 'mn-1',
      meetnoteStatus: 'uploaded',
    };
    meetingModel.findById.mockResolvedValue(meeting);
    meetingRecordingService.findByMeetingId.mockResolvedValue([recording]);
    meetNoteIntegrationService.exportMeeting = jest.fn().mockResolvedValue({
      data: Buffer.from('export-content'),
      headers: { 'content-type': 'application/pdf' },
    });

    const result = await service.getMeetingExport(
      'meeting-123',
      'pdf',
      { details: true, summary: true },
      USER_ID,
    );

    expect(meetingModel.findById).toHaveBeenCalledWith('meeting-123', USER_ID);
    expect(meetNoteIntegrationService.exportMeeting).toHaveBeenCalledWith(
      'mn-1',
      'pdf',
      { details: true, summary: true },
    );
    expect(result.data).toBeInstanceOf(Buffer);
  });

  it('throws NotFoundException when another user requests export', async () => {
    meetingModel.findById.mockResolvedValue(null);

    await expect(
      service.getMeetingExport('meeting-123', 'pdf', {}, USER_ID),
    ).rejects.toThrow(NotFoundException);
  });

  // --------------------------------------------------------------------------
  // updateActionItemStatus
  // --------------------------------------------------------------------------

  it('updates action item status from pending to completed for the owner', async () => {
    const meeting = { meetingId: 'meeting-123', roomName: 'room-123', userId: USER_ID };
    const recording = { recordingId: 'rec-1', meetingId: 'meeting-123' };
    const existingItem = {
      actionItemId: 'item-1',
      recordingId: 'rec-1',
      originKey: 'origin-key-1',
      task: 'Review the draft',
      status: 'pending',
    };

    meetingModel.findById.mockResolvedValue(meeting);
    meetingRecordingService.findByMeetingId.mockResolvedValue([recording]);
    actionItemRepo.findOne.mockResolvedValue(existingItem);
    actionItemRepo.save.mockResolvedValue({ ...existingItem, status: 'completed' });

    const result = await service.updateActionItemStatus(
      'meeting-123',
      'origin-key-1',
      'completed',
      USER_ID,
    );

    expect(result.success).toBe(true);
    expect(result.data.status).toBe('completed');
    expect(meetingModel.findById).toHaveBeenCalledWith('meeting-123', USER_ID);
    expect(actionItemRepo.findOne).toHaveBeenCalledWith({
      where: { recordingId: 'rec-1', originKey: 'origin-key-1' },
    });
  });

  it('updates action item status from completed back to pending for the owner', async () => {
    const meeting = { meetingId: 'meeting-123', roomName: 'room-123', userId: USER_ID };
    const recording = { recordingId: 'rec-1', meetingId: 'meeting-123' };
    const existingItem = {
      actionItemId: 'item-1',
      recordingId: 'rec-1',
      originKey: 'origin-key-1',
      task: 'Review the draft',
      status: 'completed',
    };

    meetingModel.findById.mockResolvedValue(meeting);
    meetingRecordingService.findByMeetingId.mockResolvedValue([recording]);
    actionItemRepo.findOne.mockResolvedValue(existingItem);
    actionItemRepo.save.mockResolvedValue({ ...existingItem, status: 'pending' });

    const result = await service.updateActionItemStatus(
      'meeting-123',
      'origin-key-1',
      'pending',
      USER_ID,
    );

    expect(result.success).toBe(true);
    expect(result.data.status).toBe('pending');
  });

  it('persists status so it is returned on subsequent insight fetch', async () => {
    const meeting = { meetingId: 'meeting-123', roomName: 'room-123', userId: USER_ID };
    const recording = { recordingId: 'rec-1', meetingId: 'meeting-123' };

    meetingModel.findById.mockResolvedValue(meeting);
    meetingRecordingService.findByMeetingId.mockResolvedValue([recording]);
    actionItemRepo.findOne.mockResolvedValue({
      actionItemId: 'item-1',
      recordingId: 'rec-1',
      originKey: 'origin-key-1',
      task: 'Review the draft',
      status: 'pending',
    });
    actionItemRepo.save.mockResolvedValue({
      actionItemId: 'item-1',
      recordingId: 'rec-1',
      originKey: 'origin-key-1',
      task: 'Review the draft',
      status: 'completed',
    });

    await service.updateActionItemStatus('meeting-123', 'origin-key-1', 'completed', USER_ID);

    meetingModel.findById.mockResolvedValue(meeting);
    meetingRecordingService.findByMeetingId.mockResolvedValue([recording]);
    actionItemRepo.find.mockResolvedValue([
      {
        actionItemId: 'item-1',
        recordingId: 'rec-1',
        originKey: 'origin-key-1',
        task: 'Review the draft',
        status: 'completed',
      },
    ]);
    meetNoteIntegrationService.getMeetingInsights.mockResolvedValueOnce({
      success: true,
      data: {
        meetingId: 'meeting-123',
        insights: [
          {
            recordingId: 'rec-1',
            meetnoteMeetingId: 'mn-1',
            actionItems: [
              {
                id: 1,
                originKey: 'origin-key-1',
                task: 'Review the draft',
                status: 'completed',
              },
            ],
            decisions: [],
            transcript: [],
            intelligence: null,
            error: null,
          },
        ],
      },
    });

    const result = await service.getMeetingInsights('meeting-123', USER_ID);
    const insight = result.data.insights[0];
    expect(insight.actionItems[0].status).toBe('completed');
  });

  it('rejects invalid status values', async () => {
    const meeting = { meetingId: 'meeting-123', roomName: 'room-123', userId: USER_ID };

    meetingModel.findById.mockResolvedValue(meeting);
    meetingRecordingService.findByMeetingId.mockResolvedValue([]);

    await expect(
      service.updateActionItemStatus('meeting-123', 'origin-key-1', 'invalid', USER_ID),
    ).rejects.toThrow();
  });

  it('throws NotFoundException when meeting does not exist for the user', async () => {
    meetingModel.findById.mockResolvedValue(null);

    await expect(
      service.updateActionItemStatus('meeting-999', 'origin-key-1', 'completed', USER_ID),
    ).rejects.toThrow('Meeting not found');
  });

  it('throws NotFoundException when action item is not found', async () => {
    const meeting = { meetingId: 'meeting-123', roomName: 'room-123', userId: USER_ID };

    meetingModel.findById.mockResolvedValue(meeting);
    meetingRecordingService.findByMeetingId.mockResolvedValue([]);
    actionItemRepo.findOne.mockResolvedValue(null);

    await expect(
      service.updateActionItemStatus('meeting-123', 'nonexistent-key', 'completed', USER_ID),
    ).rejects.toThrow('Action item not found');
  });

  it('throws NotFoundException when another user tries to update action item', async () => {
    const meeting = { meetingId: 'meeting-123', roomName: 'room-123', userId: OTHER_USER_ID };
    meetingModel.findById.mockResolvedValue(null); // USER_ID != OTHER_USER_ID

    await expect(
      service.updateActionItemStatus('meeting-123', 'origin-key-1', 'completed', USER_ID),
    ).rejects.toThrow(NotFoundException);
  });
});
