import type { Meta, StoryObj } from "@storybook/react-vite";
import { CaptionsOverlay } from "./CaptionsOverlay";
import { sampleCaptions } from "../fixtures";

const meta: Meta<typeof CaptionsOverlay> = {
  title: "Meeting/CaptionsOverlay",
  component: CaptionsOverlay,
  decorators: [
    (Story) => (
      <div className="relative h-64 w-[480px] overflow-hidden rounded-xl bg-on-surface">
        <Story />
      </div>
    ),
  ],
  args: { lines: sampleCaptions, visible: true },
};
export default meta;
type Story = StoryObj<typeof CaptionsOverlay>;

export const Default: Story = {};
export const Empty: Story = { args: { lines: [], uiState: "empty" } };
export const Loading: Story = { args: { uiState: "loading", lines: [] } };
export const Error: Story = { args: { uiState: "error", lines: [] } };
export const Hidden: Story = { args: { visible: false } };
