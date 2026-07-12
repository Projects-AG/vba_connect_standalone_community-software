import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ConnectionQuality as LkQuality,
  ConnectionState,
  Room,
  RoomEvent,
  Track,
  type LocalTrack,
  type Participant,
  type RemoteParticipant,
} from "livekit-client";
import type {
  ConnectionQuality,
  MeetingParticipant,
} from "../types/meeting";
import { getLivekitUrl, videoApi } from "./videoApi";

function mapQuality(q: LkQuality): ConnectionQuality {
  switch (q) {
    case LkQuality.Excellent:
      return "excellent";
    case LkQuality.Good:
      return "good";
    case LkQuality.Poor:
      return "poor";
    case LkQuality.Lost:
      return "lost";
    default:
      return "good";
  }
}

function participantToModel(
  participant: Participant,
  isLocal: boolean,
  pinnedId: string | null,
  speakingIds: Set<string>,
): MeetingParticipant {
  const camPub = participant.getTrackPublication(Track.Source.Camera);
  const screenPub = participant.getTrackPublication(Track.Source.ScreenShare);
  const micPub = participant.getTrackPublication(Track.Source.Microphone);

  const camTrack = camPub?.track;
  const screenTrack = screenPub?.track;
  const activeTrack = screenTrack ?? camTrack;
  const mediaStream =
    activeTrack?.mediaStream ??
    (activeTrack?.mediaStreamTrack
      ? new MediaStream([activeTrack.mediaStreamTrack])
      : null);

  return {
    participantId: participant.identity,
    displayName: participant.name || participant.identity,
    isMuted: micPub ? micPub.isMuted : true,
    isCameraOff: !camPub || camPub.isMuted || !camTrack,
    isSpeaking: speakingIds.has(participant.identity),
    isPinned: pinnedId === participant.identity,
    isScreenSharing: Boolean(screenTrack),
    isLocal,
    connectionQuality: mapQuality(participant.connectionQuality),
    mediaStream,
    streamUrl: null,
  };
}

export type MeetingPhase = "precall" | "connecting" | "in-call" | "error";

export function useIntegratedMeeting() {
  const roomRef = useRef<Room | null>(null);
  const localTracksRef = useRef<LocalTrack[]>([]);
  const [phase, setPhase] = useState<MeetingPhase>("precall");
  const [error, setError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [speakingIds, setSpeakingIds] = useState<Set<string>>(new Set());
  const [tick, setTick] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[];
    mics: MediaDeviceInfo[];
  }>({ cameras: [], mics: [] });
  const [selectedCameraId, setSelectedCameraId] = useState<string>();
  const [selectedMicId, setSelectedMicId] = useState<string>();
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);

  const bump = useCallback(() => setTick((t) => t + 1), []);

  const refreshParticipants = useCallback(() => {
    bump();
  }, [bump]);

  const participants: MeetingParticipant[] = useMemo(() => {
    const room = roomRef.current;
    if (!room || phase !== "in-call") return [];
    const list: MeetingParticipant[] = [
      participantToModel(room.localParticipant, true, pinnedId, speakingIds),
    ];
    room.remoteParticipants.forEach((p: RemoteParticipant) => {
      list.push(participantToModel(p, false, pinnedId, speakingIds));
    });
    return list.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick forces re-read of room tracks
  }, [phase, pinnedId, speakingIds, tick]);

  const screenSharer = participants.find((p) => p.isScreenSharing) ?? null;

  const stopPreview = useCallback(() => {
    previewStreamRef.current?.getTracks().forEach((t) => t.stop());
    previewStreamRef.current = null;
    setPreviewStream(null);
  }, []);

  const startPreview = useCallback(
    async (cameraId?: string, micId?: string, cameraOff = false, muted = false) => {
      try {
        stopPreview();
        if (cameraOff && muted) {
          setPermissionDenied(false);
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: cameraOff
            ? false
            : cameraId
              ? { deviceId: { exact: cameraId } }
              : true,
          audio: muted
            ? false
            : micId
              ? { deviceId: { exact: micId } }
              : true,
        });
        previewStreamRef.current = stream;
        setPreviewStream(stream);
        setPermissionDenied(false);
      } catch {
        setPermissionDenied(true);
        setPreviewStream(null);
      }
    },
    [stopPreview],
  );

  const loadDevices = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch {
      setPermissionDenied(true);
    }
    const all = await navigator.mediaDevices.enumerateDevices();
    const cameras = all.filter((d) => d.kind === "videoinput");
    const mics = all.filter((d) => d.kind === "audioinput");
    setDevices({ cameras, mics });
    if (!selectedCameraId && cameras[0]) setSelectedCameraId(cameras[0].deviceId);
    if (!selectedMicId && mics[0]) setSelectedMicId(mics[0].deviceId);
  }, [selectedCameraId, selectedMicId]);

  useEffect(() => {
    void loadDevices().then(() =>
      startPreview(selectedCameraId, selectedMicId, isCameraOff, isMuted),
    );
    return () => stopPreview();
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "precall") return;
    void startPreview(selectedCameraId, selectedMicId, isCameraOff, isMuted);
  }, [
    phase,
    selectedCameraId,
    selectedMicId,
    isCameraOff,
    isMuted,
    startPreview,
  ]);

  const attachRoomListeners = useCallback(
    (room: Room) => {
      const refresh = () => refreshParticipants();
      room.on(RoomEvent.ParticipantConnected, refresh);
      room.on(RoomEvent.ParticipantDisconnected, refresh);
      room.on(RoomEvent.TrackSubscribed, refresh);
      room.on(RoomEvent.TrackUnsubscribed, refresh);
      room.on(RoomEvent.TrackMuted, refresh);
      room.on(RoomEvent.TrackUnmuted, refresh);
      room.on(RoomEvent.LocalTrackPublished, refresh);
      room.on(RoomEvent.LocalTrackUnpublished, refresh);
      room.on(RoomEvent.ConnectionQualityChanged, refresh);
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        setSpeakingIds(new Set(speakers.map((s) => s.identity)));
        refresh();
      });
      room.on(RoomEvent.Disconnected, () => {
        setPhase("precall");
        roomRef.current = null;
      });
    },
    [refreshParticipants],
  );

  const leave = useCallback(async () => {
    const room = roomRef.current;
    localTracksRef.current.forEach((t) => t.stop());
    localTracksRef.current = [];
    if (room) {
      await room.disconnect();
      roomRef.current = null;
    }
    setIsSharing(false);
    setPinnedId(null);
    setPhase("precall");
    void startPreview(selectedCameraId, selectedMicId, isCameraOff, isMuted);
  }, [isCameraOff, isMuted, selectedCameraId, selectedMicId, startPreview]);

  const join = useCallback(
    async (name: string, room: string) => {
      setError(null);
      setPhase("connecting");
      setDisplayName(name);
      setRoomName(room);
      stopPreview();

      try {
        await videoApi.createRoom(room);
        const { token } = await videoApi.generateToken(room, name);

        const livekitRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        roomRef.current = livekitRoom;
        attachRoomListeners(livekitRoom);

        await livekitRoom.connect(getLivekitUrl(), token);

        await livekitRoom.localParticipant.setCameraEnabled(!isCameraOff);
        await livekitRoom.localParticipant.setMicrophoneEnabled(!isMuted);

        if (selectedCameraId) {
          await livekitRoom.switchActiveDevice("videoinput", selectedCameraId);
        }
        if (selectedMicId) {
          await livekitRoom.switchActiveDevice("audioinput", selectedMicId);
        }

        setPhase("in-call");
        bump();
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to join meeting";
        if (roomRef.current) {
          await roomRef.current.disconnect();
          roomRef.current = null;
        }
        setError(message);
        setPhase("error");
      }
    },
    [
      attachRoomListeners,
      bump,
      isCameraOff,
      isMuted,
      selectedCameraId,
      selectedMicId,
      stopPreview,
    ],
  );

  const toggleMute = useCallback(async () => {
    const next = !isMuted;
    setIsMuted(next);
    const room = roomRef.current;
    if (room?.state === ConnectionState.Connected) {
      await room.localParticipant.setMicrophoneEnabled(!next);
      bump();
    }
  }, [bump, isMuted]);

  const toggleCamera = useCallback(async () => {
    const next = !isCameraOff;
    setIsCameraOff(next);
    const room = roomRef.current;
    if (room?.state === ConnectionState.Connected) {
      await room.localParticipant.setCameraEnabled(!next);
      bump();
    }
  }, [bump, isCameraOff]);

  const toggleShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room || room.state !== ConnectionState.Connected) return;
    if (isSharing) {
      await room.localParticipant.setScreenShareEnabled(false);
      setIsSharing(false);
    } else {
      await room.localParticipant.setScreenShareEnabled(true);
      setIsSharing(true);
    }
    bump();
  }, [bump, isSharing]);

  const endMeetingForAll = useCallback(async () => {
    if (roomName) {
      try {
        await videoApi.endRoom(roomName);
      } catch {
        // still leave locally
      }
    }
    await leave();
  }, [leave, roomName]);

  return {
    phase,
    error,
    roomName,
    displayName,
    setDisplayName,
    participants,
    screenSharer,
    isMuted,
    isCameraOff,
    isSharing,
    permissionDenied,
    devices,
    selectedCameraId,
    selectedMicId,
    setSelectedCameraId,
    setSelectedMicId,
    previewStream,
    pinnedId,
    setPinnedId,
    join,
    leave,
    endMeetingForAll,
    toggleMute,
    toggleCamera,
    toggleShare,
    livekitUrl: getLivekitUrl(),
    apiBaseUrl: videoApi.baseUrl,
    clearError: () => {
      setError(null);
      setPhase("precall");
      void startPreview(selectedCameraId, selectedMicId, isCameraOff, isMuted);
    },
  };
}
