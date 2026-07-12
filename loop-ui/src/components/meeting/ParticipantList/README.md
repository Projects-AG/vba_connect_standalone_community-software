# ParticipantList

| Prop | Type | Description |
|------|------|-------------|
| `participants` | `MeetingParticipant[]` | Full roster from WS `room.participants` |
| `uiState` | shared | empty / loading / error |
| `onMuteParticipant` | `(id) => void` | Host mute remote |
| `onPinParticipant` | `(id, pinned) => void` | Layout pin |
| `onClose` | `() => void` | Close panel |
| `asSheet` | `boolean` | Use with `MobileBottomSheet` |

Join/leave animations use spring motion (respects `prefers-reduced-motion`).
