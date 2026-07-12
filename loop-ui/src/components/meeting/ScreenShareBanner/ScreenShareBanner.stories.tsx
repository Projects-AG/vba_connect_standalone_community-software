import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScreenShareBanner } from "./ScreenShareBanner";

const meta: Meta<typeof ScreenShareBanner> = {
  title: "Meeting/ScreenShareBanner",
  component: ScreenShareBanner,
  args: {
    sharerId: "p1",
    sharerName: "Sarah Jenkins",
    onStopShare: () => undefined,
    onViewShare: () => undefined,
  },
};
export default meta;
type Story = StoryObj<typeof ScreenShareBanner>;

export const RemoteShare: Story = {};
export const LocalShare: Story = {
  args: { isLocalShare: true, sharerName: "You" },
};
export const Loading: Story = { args: { uiState: "loading" } };
export const Disabled: Story = { args: { uiState: "disabled" } };
