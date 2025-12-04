window.addEventListener('message', (event) => {
  const data = event.data;

  // Example:
  // data = {
  //   userid: "abc123",
  //   username: "playerOne",
  //   score: [5, 42],
  //   replay: "https://websim-storage-url.../replay.json"
  // }
});

window.addEventListener('message', async (event) => {
  const { replay } = event.data || {};
  if (!replay) return;

  const replayData = await loadReplayData(replay);
  startExternalReplay(replayData);
});

function startExternalReplay({ frames, config }) {
  const normalizedFrames = normalizeTimestamps(frames);
  const startWallTime = performance.now();
  const duration = normalizedFrames[normalizedFrames.length - 1].relTime;

  function tick() {
    const now = performance.now();
    const elapsedSeconds = (now - startWallTime) / 1000;
    const playbackTime = Math.min(elapsedSeconds, duration);

    renderReplayFrame(normalizedFrames, config, playbackTime);

    if (playbackTime < duration) {
      requestAnimationFrame(tick);
    } else {
      // Optionally hold on last frame, loop, or show end screen.
    }
  }

  requestAnimationFrame(tick);
}

function getFrameAtTime(frames, playbackTime) {
  // frames must be sorted by relTime ascending
  let low = 0;
  let high = frames.length - 1;

  while (low < high) {
    const mid = ((low + high + 1) / 2) | 0; // biased upward
    if (frames[mid].relTime <= playbackTime) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return frames[low];
}

function renderReplayFrame(frames, config, playbackTime) {
  if (!frames.length) return;
  const frameData = getFrameAtTime(frames, playbackTime);
  drawFrameToCanvas(frameData, config);
}

function drawFrameToCanvas(frame, config) {
  const canvas = document.getElementById('external-replay-canvas');
  const ctx = canvas.getContext('2d');

  const size = Math.min(canvas.width, canvas.height);
  const radius = size * 0.4; // 40% of canvas width/height
  const trackWidthFactor = config.difficulties[config.difficulty].trackWidthFactor;
  const lineWidth = size * trackWidthFactor;

  const colors = config.colors;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // Center the coordinate system
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // 1. Draw track (full circle)
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'butt';
  ctx.stroke();

  // 2. Draw the colored target arc
  if (frame.targetSize > 0) {
    ctx.beginPath();
    ctx.arc(
      0,
      0,
      radius,
      frame.targetStartAngle,
      frame.targetStartAngle + frame.targetSize
    );
    ctx.strokeStyle = frame.targetColor;
    ctx.lineWidth = lineWidth * 0.95;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // 3. Draw the rotating line (cursor)
  ctx.save();
  ctx.rotate(frame.angle); // rotate context by angle

  ctx.beginPath();
  ctx.moveTo(radius - lineWidth / 2, 0);
  ctx.lineTo(radius + lineWidth / 2, 0);
  ctx.strokeStyle = colors.fail;
  ctx.lineWidth = lineWidth / 2.5;
  ctx.lineCap = 'butt';
  ctx.stroke();

  ctx.restore(); // undo rotation
  ctx.restore(); // restore original transform
}

