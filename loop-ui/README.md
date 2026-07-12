# LOOP UI Kit — publishable `@projects-ag/loop-ui`

Fluent Velocity meeting UI for React. Integrates with Nest video APIs + LiveKit.

## Install

```bash
npm install @projects-ag/loop-ui livekit-client react react-dom
```

```tsx
import '@projects-ag/loop-ui/styles.css'
import {
  configureLoopUi,
  IntegratedMeetingApp,
  VideoTile,
  ControlBar,
} from '@projects-ag/loop-ui'

configureLoopUi({
  apiUrl: 'https://api.example.com',
  livekitUrl: 'wss://livekit.example.com',
})
```

## What's included (integrable)

- `PreCallDeviceCheck`, `VideoTile`, `ControlBar`, `ParticipantList`
- `ConnectionQualityBadge`, `ScreenShareBanner`
- `IntegratedMeetingApp`, `useIntegratedMeeting`, `videoApi`

Host env for the integrated app / hook:

```
VITE_API_URL=https://your-api.example.com
VITE_LIVEKIT_URL=wss://your-livekit.example.com
```

## Local development

```bash
npm install
npm run dev          # demo app on :5174
npm run storybook
npm run build:lib    # produce dist/ for publish
```

## Publish

```bash
npm run build:lib
npm publish --access restricted   # or public if you set publishConfig.access
```

For a dry run without registry:

```bash
npm pack
```

## Peer dependencies

| Package | Required |
|---------|----------|
| `react` / `react-dom` | Yes (^18 or ^19) |
| `livekit-client` | For `IntegratedMeetingApp` / `useIntegratedMeeting` |
