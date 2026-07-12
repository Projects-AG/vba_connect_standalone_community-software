import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectionQualityBadge } from "./ConnectionQualityBadge";

const meta: Meta<typeof ConnectionQualityBadge> = {
  title: "Meeting/ConnectionQualityBadge",
  component: ConnectionQualityBadge,
};
export default meta;
type Story = StoryObj<typeof ConnectionQualityBadge>;

export const Excellent: Story = { args: { quality: "excellent", iconOnly: false } };
export const Good: Story = { args: { quality: "good", iconOnly: false } };
export const Poor: Story = { args: { quality: "poor", iconOnly: false } };
export const Lost: Story = { args: { quality: "lost", iconOnly: false } };
export const IconOnly: Story = { args: { quality: "excellent", iconOnly: true } };
