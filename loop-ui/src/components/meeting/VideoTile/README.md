# VideoTile — API contract

Feed this component from REST room/participant payloads or LiveKit track events.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `participantId` | `string` | yes | Stable participant id from backend |
| `displayName` | `string` | yes | Display name |
| `streamUrl` | `string \| null` | no | `<video src>` URL / object URL |
| `mediaStream` | `MediaStream \| null` | no | Prefer for WebRTC attach (`srcObject`) |
| `avatarUrl` | `string \| null` | no | Fallback when camera off |
| `isMuted` | `boolean` | yes | Mic muted |
| `isCameraOff` | `boolean` | no | Camera disabled (avatar fallback) |
| `isSpeaking` | `boolean` | yes | Active speaker |
| `isPinned` | `boolean` | yes | Pinned in layout |
| `isScreenSharing` | `boolean` | yes | Sharing screen |
| `connectionQuality` | `excellent \| good \| poor \| lost` | yes | From SFU stats |
| `connectivityState` | `online \| offline \| reconnecting \| degraded-bandwidth \| permission-denied` | no | Transport / permission |
| `uiState` | `default \| loading \| error \| disabled \| empty` | no | Presentational state |
| `onPinToggle` | `(id, pinned) => void` | no | Emit pin change to backend |
| `onFocus` | `(id) => void` | no | Focus / keyboard focus |

## Events to emit upstream

- Pin/unpin → `POST /rooms/:id/participants/:pid/pin` or WS `participant.pin`
- Speaking / quality are **inputs** from SFU; do not invent client-side
