# Circle Tap Challenge - Replay System & Integration Guide

This document outlines how the **Instant Replay** system works, from data capture and storage to rendering, and provides integration details for external clients (e.g., iframing this game).

## 1. Data Capture & Storage

### Capture (Game Loop)

During gameplay (`game.js`), the state is recorded every animation frame into a `replayFrames` array.

**Recorded State per Frame:**
- `timestamp`: High-precision timestamp (`performance.now()`).
- `angle`: Current rotation of the player's cursor (radians).
- `targetStartAngle`: Starting angle of the target zone (radians).
- `targetSize`: Arc length of the target zone (radians).
- `targetColor`: Current HSL color string of the target (changes over time).
- `score`: Current score.
- `level`: Current level.
- `pulseAmount`: Audio visualizer intensity (0-1) for background effects.
- `success`: Boolean flag present only on frames where a successful tap occurred.

### Storage & Upload

When a user submits a high score (`leaderboard.js`):
1. The `replayFrames` array and `replayConfig` (difficulty settings) are bundled into a JSON object.
2. This JSON is converted to a `Blob` and uploaded to Websim's blob storage via `window.websim.upload()`.
3. The resulting URL is stored in the database record alongside the score.

## 2. Rendering (Remotion)

The internal replay viewer uses **Remotion** (`composition.jsx`) to render the game deterministically from the JSON data.

**Rendering Logic:**
1. **Frame Matching**: Remotion provides the current video frame number. We calculate the corresponding game time.
2. **Search**: We find the recorded state index where `recorded_timestamp <= current_time`.
3. **Reactivity**: Since the game logic is linear, we don't need complex simulation; we simply draw the canvas based on the state snapshots (angle, target position) recorded in that specific frame.
4. **Audio**: We scan the frames for `success: true` flags to trigger sound effects at specific timestamps on the timeline.

## 3. External Integration (Iframe)

External clients can embed this game and receive score/replay data via `postMessage`.

### `postMessage` API

When a user clicks "Submit Highscore", the game sends the following message to the parent window:

```javascript
{
  userid: "user_id_string",
  username: "username_string",
  score: [level_number, score_number], // e.g. [5, 42]
  replay: "https://websim-storage-url.../replay.json"
}