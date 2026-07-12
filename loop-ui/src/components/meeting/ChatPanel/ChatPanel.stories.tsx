import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ChatPanel } from "./ChatPanel";
import { sampleMessages } from "../fixtures";
import type { ChatMessage } from "../../../types/meeting";

const meta: Meta<typeof ChatPanel> = {
  title: "Meeting/ChatPanel",
  component: ChatPanel,
  args: { className: "h-[480px]" },
};
export default meta;
type Story = StoryObj<typeof ChatPanel>;

export const Default: Story = {
  render: function Render() {
    const [messages, setMessages] = useState<ChatMessage[]>(sampleMessages);
    return (
      <ChatPanel
        messages={messages}
        className="h-[480px]"
        onSend={(body) =>
          setMessages((prev) => [
            ...prev,
            {
              messageId: `m-${Date.now()}`,
              participantId: "local",
              displayName: "You",
              body,
              sentAt: new Date().toISOString(),
              isLocal: true,
            },
          ])
        }
        onClose={() => undefined}
      />
    );
  },
};

export const Empty: Story = {
  args: { messages: [], uiState: "empty", onSend: () => undefined },
};
export const Loading: Story = {
  args: { messages: [], uiState: "loading", onSend: () => undefined },
};
export const Error: Story = {
  args: { messages: [], uiState: "error", onSend: () => undefined },
};
export const Disabled: Story = {
  args: { messages: sampleMessages, uiState: "disabled", onSend: () => undefined },
};
