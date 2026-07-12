# WaitingRoom

Modal while host admits participant.

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Controlled visibility |
| `meetingTitle` | `string` | Room / meeting name |
| `hostName` | `string` | Optional |
| `waitingCount` | `number` | Others in lobby |
| `message` | `string` | Status copy |
| `uiState` | `default\|loading\|error` | Admission failure → error + `onRetry` |
| `onCancel` | `() => void` | Leave lobby |
| `onRetry` | `() => void` | Re-request admit |

Focus trapped via Radix Dialog.
