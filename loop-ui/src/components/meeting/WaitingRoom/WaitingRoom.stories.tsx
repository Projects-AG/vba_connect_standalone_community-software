import type { Meta, StoryObj } from "@storybook/react-vite";
import { WaitingRoom } from "./WaitingRoom";

const meta: Meta<typeof WaitingRoom> = {
  title: "Meeting/WaitingRoom",
  component: WaitingRoom,
  args: {
    open: true,
    meetingTitle: "Weekly Alignment: Q4 Roadmap",
    hostName: "Maya Chen",
    waitingCount: 2,
    onCancel: () => undefined,
  },
};
export default meta;
type Story = StoryObj<typeof WaitingRoom>;

export const Waiting: Story = {};
export const Error: Story = {
  args: { uiState: "error", onRetry: () => undefined },
};
export const Loading: Story = { args: { uiState: "loading" } };
