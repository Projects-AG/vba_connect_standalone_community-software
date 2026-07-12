import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ControlBar, type ControlBarAction } from "./ControlBar";

const meta: Meta<typeof ControlBar> = {
  title: "Meeting/ControlBar",
  component: ControlBar,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="relative flex min-h-[240px] items-end justify-center bg-on-surface p-fv-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ControlBar>;

export const Default: Story = {
  render: function Render() {
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    const onAction = (action: ControlBarAction) => {
      if (action === "mute") setMuted((v) => !v);
      if (action === "camera") setCameraOff((v) => !v);
      if (action === "share") setSharing((v) => !v);
      if (action === "chat") setChatOpen((v) => !v);
    };

    return (
      <ControlBar
        isMuted={muted}
        isCameraOff={cameraOff}
        isSharing={sharing}
        chatOpen={chatOpen}
        onAction={onAction}
      />
    );
  },
};

export const MutedCameraOff: Story = {
  args: {
    isMuted: true,
    isCameraOff: true,
    onAction: () => undefined,
  },
};

export const Reconnecting: Story = {
  args: {
    isMuted: false,
    isCameraOff: false,
    connectivityState: "reconnecting",
    onAction: () => undefined,
  },
};

export const PermissionDenied: Story = {
  args: {
    isMuted: true,
    isCameraOff: true,
    connectivityState: "permission-denied",
    onAction: () => undefined,
  },
};

export const OfflineDisabled: Story = {
  args: {
    isMuted: false,
    isCameraOff: false,
    connectivityState: "offline",
    uiState: "disabled",
    onAction: () => undefined,
  },
};

export const Loading: Story = {
  args: {
    isMuted: false,
    isCameraOff: false,
    uiState: "loading",
    onAction: () => undefined,
  },
};

export const WithoutOverlayMaterial: Story = {
  args: {
    isMuted: false,
    isCameraOff: false,
    overlayMaterial: false,
    onAction: () => undefined,
  },
};
