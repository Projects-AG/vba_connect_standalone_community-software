import type { Meta, StoryObj } from "@storybook/react-vite";
import { ParticipantList } from "./ParticipantList";
import { sampleParticipants } from "../fixtures";

const meta: Meta<typeof ParticipantList> = {
  title: "Meeting/ParticipantList",
  component: ParticipantList,
  parameters: { layout: "padded" },
  args: {
    participants: sampleParticipants,
    className: "h-[420px] w-80",
  },
};
export default meta;
type Story = StoryObj<typeof ParticipantList>;

export const Default: Story = {};
export const Empty: Story = { args: { participants: [], uiState: "empty" } };
export const Loading: Story = { args: { uiState: "loading" } };
export const Error: Story = { args: { uiState: "error" } };
