import type { Meta, StoryObj } from "@storybook/react-vite";
import { RecordingConsentBanner } from "./RecordingConsentBanner";

const meta: Meta<typeof RecordingConsentBanner> = {
  title: "Meeting/RecordingConsentBanner",
  component: RecordingConsentBanner,
  args: {
    open: true,
    recorderName: "Maya Chen",
    onAccept: () => undefined,
    onDecline: () => undefined,
  },
};
export default meta;
type Story = StoryObj<typeof RecordingConsentBanner>;

export const Dialog: Story = { args: { variant: "dialog" } };
export const ToastSwipeToDismiss: Story = {
  args: { variant: "toast", onDismiss: () => undefined },
};
export const Loading: Story = { args: { uiState: "loading" } };
