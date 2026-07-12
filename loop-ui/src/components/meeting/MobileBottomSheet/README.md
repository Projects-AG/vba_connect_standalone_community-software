# MobileBottomSheet

Mobile-only (hidden `md+`) peek / half / full sheet for ChatPanel / ParticipantList.

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | |
| `snap` | `peek \| half \| full` | Controlled snap |
| `onSnapChange` | `(snap) => void` | |
| `onClose` | `() => void` | Backdrop / drag-down from peek |
| `children` | `ReactNode` | Embed ChatPanel/ParticipantList with `asSheet` |

Spring height animation; reduced-motion → linear 150ms.
