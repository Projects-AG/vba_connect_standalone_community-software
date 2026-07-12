# PreCallDeviceCheck

Lobby device picker before `generate-token` / join.

| Prop | Type | Description |
|------|------|-------------|
| `displayName` + `onDisplayNameChange` | controlled string | Participant identity |
| `cameras` / `microphones` / `speakers` | `DeviceInfo[]` | From `enumerateDevices` |
| `selected*Id` + `onSelect*` | string | Selected devices |
| `isCameraOff` / `isMuted` + toggles | boolean | Local preview state |
| `previewStreamUrl` | string \| null | Preview `<video>` |
| `connectivityState` | shared | `permission-denied` blocks join |
| `onJoin` | `() => void` | Parent: create room + token + navigate |
| `onCancel` | `() => void` | |

`DeviceInfo`: `{ deviceId, label, kind: 'audioinput'|'videoinput'|'audiooutput' }`
