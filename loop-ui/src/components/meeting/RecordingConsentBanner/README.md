# RecordingConsentBanner

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Show consent UI |
| `recorderName` | `string` | Who started recording |
| `variant` | `dialog \| toast` | Dialog = focus trap; toast = swipe-to-dismiss |
| `onAccept` | `() => void` | Consent / stay |
| `onDecline` | `() => void` | Leave meeting |
| `onDismiss` | `() => void` | Toast swipe dismiss |
| `uiState` | shared | |

Wire to WS event `recording.started`.
