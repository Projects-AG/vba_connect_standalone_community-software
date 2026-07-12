import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PreCallDeviceCheck } from "./PreCallDeviceCheck";
import { sampleDevices } from "../fixtures";

const meta: Meta<typeof PreCallDeviceCheck> = {
  title: "Meeting/PreCallDeviceCheck",
  component: PreCallDeviceCheck,
};
export default meta;
type Story = StoryObj<typeof PreCallDeviceCheck>;

export const Default: Story = {
  render: function Render() {
    const [name, setName] = useState("Maya Chen");
    const [cameraOff, setCameraOff] = useState(false);
    const [muted, setMuted] = useState(false);
    const [cam, setCam] = useState("cam1");
    const [mic, setMic] = useState("mic1");

    return (
      <PreCallDeviceCheck
        displayName={name}
        onDisplayNameChange={setName}
        cameras={sampleDevices.cameras}
        microphones={sampleDevices.mics}
        speakers={sampleDevices.speakers}
        selectedCameraId={cam}
        selectedMicId={mic}
        selectedSpeakerId="spk1"
        isCameraOff={cameraOff}
        isMuted={muted}
        previewStreamUrl={
          cameraOff
            ? null
            : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&h=360&fit=crop"
        }
        onSelectCamera={setCam}
        onSelectMic={setMic}
        onSelectSpeaker={() => undefined}
        onToggleCamera={() => setCameraOff((v) => !v)}
        onToggleMute={() => setMuted((v) => !v)}
        onJoin={() => undefined}
        onCancel={() => undefined}
      />
    );
  },
};

export const PermissionDenied: Story = {
  args: {
    displayName: "Maya",
    onDisplayNameChange: () => undefined,
    cameras: [],
    microphones: [],
    isCameraOff: true,
    isMuted: true,
    connectivityState: "permission-denied",
    onSelectCamera: () => undefined,
    onSelectMic: () => undefined,
    onToggleCamera: () => undefined,
    onToggleMute: () => undefined,
    onJoin: () => undefined,
  },
};

export const Loading: Story = {
  args: {
    displayName: "Maya",
    onDisplayNameChange: () => undefined,
    cameras: sampleDevices.cameras,
    microphones: sampleDevices.mics,
    isCameraOff: false,
    isMuted: false,
    uiState: "loading",
    onSelectCamera: () => undefined,
    onSelectMic: () => undefined,
    onToggleCamera: () => undefined,
    onToggleMute: () => undefined,
    onJoin: () => undefined,
  },
};

export const Error: Story = {
  args: {
    displayName: "Maya",
    onDisplayNameChange: () => undefined,
    cameras: sampleDevices.cameras,
    microphones: sampleDevices.mics,
    isCameraOff: false,
    isMuted: false,
    uiState: "error",
    onSelectCamera: () => undefined,
    onSelectMic: () => undefined,
    onToggleCamera: () => undefined,
    onToggleMute: () => undefined,
    onJoin: () => undefined,
  },
};
