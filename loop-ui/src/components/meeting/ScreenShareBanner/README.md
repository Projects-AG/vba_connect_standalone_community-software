# ScreenShareBanner

| Prop | Type | Description |
|------|------|-------------|
| `sharerId` | `string` | Participant id publishing screen |
| `sharerName` | `string` | Display |
| `isLocalShare` | `boolean` | Shows Stop vs View |
| `onStopShare` | `() => void` | Unpublish display track |
| `onViewShare` | `() => void` | Focus screen tile |
| `uiState` | shared | loading / disabled / empty(hides) |
