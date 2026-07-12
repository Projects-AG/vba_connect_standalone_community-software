# ChatPanel

| Prop | Type | Description |
|------|------|-------------|
| `messages` | `ChatMessage[]` | Chronological |
| `onSend` | `(body: string) => void` | Parent posts to REST/WS then appends optimistic or confirmed message |
| `uiState` | shared | empty / loading / error / disabled |
| `disabled` | `boolean` | Force disable composer |
| `onClose` | `() => void` | |
| `asSheet` | `boolean` | Mobile sheet chrome |

## ChatMessage shape

```ts
{
  messageId: string;
  participantId: string;
  displayName: string;
  body: string;
  sentAt: string; // ISO-8601
  isLocal?: boolean;
}
```
