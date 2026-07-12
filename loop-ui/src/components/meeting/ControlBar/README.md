# ControlBar — API contract

Floating in-call toolbar. Use `overlayMaterial` when rendered over live video.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isMuted` | `boolean` | yes | Local mic |
| `isCameraOff` | `boolean` | yes | Local camera |
| `isSharing` | `boolean` | no | Local screen share |
| `chatOpen` / `participantsOpen` | `boolean` | no | Panel toggles |
| `connectivityState` | see shared types | no | Offline / reconnecting / permission-denied |
| `uiState` | shared | no | loading / disabled / error |
| `overlayMaterial` | `boolean` | no | Part 3 blur overlay (default true) |
| `disabledActions` | `ControlBarAction[]` | no | Disable subset |
| `onAction` | `(action) => void` | yes | Handle: `mute` `camera` `share` `chat` `participants` `copilot` `leave` |

## Backend mapping

| Action | Suggested API |
|--------|----------------|
| mute / camera | Local track mute; optional WS presence update |
| share | `getDisplayMedia` + publish track |
| leave | `DELETE /video/end-room/:room` or leave room token revoke |
| chat / participants | UI only (open panels) |
