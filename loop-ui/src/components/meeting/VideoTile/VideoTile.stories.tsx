import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { VideoTile } from "./VideoTile";
import { sampleParticipants } from "../fixtures";

const meta: Meta<typeof VideoTile> = {
  title: "Meeting/VideoTile",
  component: VideoTile,
  parameters: { layout: "padded" },
  args: {
    ...sampleParticipants[0],
    className: "h-64 w-96",
  },
};

export default meta;
type Story = StoryObj<typeof VideoTile>;

export const Default: Story = {};

export const Speaking: Story = {
  args: { isSpeaking: true, connectionQuality: "excellent" },
};

export const MutedCameraOff: Story = {
  args: {
    isMuted: true,
    isCameraOff: true,
    streamUrl: null,
    displayName: "Marcus Bell",
  },
};

export const Pinned: Story = {
  args: { isPinned: true, isSpeaking: true },
};

export const ScreenSharing: Story = {
  args: { isScreenSharing: true },
};

export const Loading: Story = { args: { uiState: "loading" } };

export const ErrorOffline: Story = {
  args: { uiState: "error", connectivityState: "offline" },
};

export const Reconnecting: Story = {
  args: { connectivityState: "reconnecting" },
};

export const DegradedBandwidth: Story = {
  args: { connectivityState: "degraded-bandwidth", connectionQuality: "poor" },
};

export const PermissionDenied: Story = {
  args: { connectivityState: "permission-denied", uiState: "error" },
};

export const Disabled: Story = { args: { uiState: "disabled" } };

export const InteractivePin: Story = {
  render: function Render(args) {
    const [pinned, setPinned] = useState(false);
    return (
      <VideoTile
        {...args}
        isPinned={pinned}
        onPinToggle={(_, next) => setPinned(next)}
        className="h-64 w-96"
      />
    );
  },
};
