import type { MeetingParticipant, ChatMessage, DeviceInfo, CaptionLine } from "../../types/meeting";

export const sampleParticipants: MeetingParticipant[] = [
  {
    participantId: "p1",
    displayName: "Sarah Jenkins",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    isMuted: false,
    isCameraOff: false,
    isSpeaking: false,
    isPinned: false,
    isScreenSharing: false,
    connectionQuality: "excellent",
    streamUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&h=360&fit=crop",
  },
  {
    participantId: "p2",
    displayName: "Marcus Bell",
    isMuted: true,
    isCameraOff: true,
    isSpeaking: false,
    isPinned: false,
    isScreenSharing: false,
    connectionQuality: "good",
    isLocal: true,
  },
  {
    participantId: "p3",
    displayName: "Jordan Smith",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    isMuted: false,
    isCameraOff: false,
    isSpeaking: true,
    isPinned: true,
    isScreenSharing: false,
    connectionQuality: "poor",
    streamUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=640&h=360&fit=crop",
  },
];

export const sampleMessages: ChatMessage[] = [
  {
    messageId: "m1",
    participantId: "p3",
    displayName: "Elena Rodriguez",
    body: "Can someone drop the Figma link?",
    sentAt: new Date().toISOString(),
  },
  {
    messageId: "m2",
    participantId: "local",
    displayName: "You",
    body: "Checking the design channel now.",
    sentAt: new Date().toISOString(),
    isLocal: true,
  },
];

export const sampleDevices = {
  cameras: [
    { deviceId: "cam1", label: "FaceTime HD Camera", kind: "videoinput" as const },
    { deviceId: "cam2", label: "USB Camera", kind: "videoinput" as const },
  ] satisfies DeviceInfo[],
  mics: [
    { deviceId: "mic1", label: "Default Microphone", kind: "audioinput" as const },
    { deviceId: "mic2", label: "Headset Mic", kind: "audioinput" as const },
  ] satisfies DeviceInfo[],
  speakers: [
    { deviceId: "spk1", label: "Speakers", kind: "audiooutput" as const },
  ] satisfies DeviceInfo[],
};

export const sampleCaptions: CaptionLine[] = [
  {
    captionId: "c1",
    participantId: "p1",
    displayName: "Sarah",
    text: "Let's move the launch to November 15th.",
    isFinal: true,
  },
  {
    captionId: "c2",
    participantId: "p3",
    displayName: "Jordan",
    text: "Agreed — security audit needs the buffer.",
    isFinal: false,
  },
];
