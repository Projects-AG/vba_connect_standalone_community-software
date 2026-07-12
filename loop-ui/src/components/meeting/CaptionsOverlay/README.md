# CaptionsOverlay

| Prop | Type | Description |
|------|------|-------------|
| `lines` | `CaptionLine[]` | Newest last; shows last `maxLines` |
| `visible` | `boolean` | Toggle captions |
| `maxLines` | `number` | Default 3 |
| `uiState` | shared | loading / error / empty |

`CaptionLine`: `{ captionId, participantId, displayName, text, isFinal }`

Uses `overlay-material` over video. `aria-live="polite"`.
