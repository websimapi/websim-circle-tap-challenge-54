const size = canvas.width;
const radius = size * 0.4; // 40% of canvas width
const lineWidth = size * config.difficulties[config.difficulty].trackWidthFactor;

ctx.translate(size / 2, size / 2);

ctx.beginPath();
ctx.arc(0, 0, radius, 0, Math.PI * 2);
ctx.strokeStyle = config.colors.secondary;
ctx.lineWidth = lineWidth;
ctx.stroke();

if (frame.targetSize > 0) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, frame.targetStartAngle, frame.targetStartAngle + frame.targetSize);
    ctx.strokeStyle = frame.targetColor; // e.g. "hsl(120, 100%, 60%)"
    ctx.lineWidth = lineWidth * 0.95; // Slightly thinner than track
    ctx.lineCap = 'round'; // Important for visual match
    ctx.stroke();
}

ctx.save();
ctx.rotate(frame.angle); // Rotate context to player's angle

// Draw a line perpendicular to the radius at the current angle
// The game draws it centered on the X-axis after rotation
ctx.beginPath();
ctx.moveTo(radius - lineWidth / 2, 0);
ctx.lineTo(radius + lineWidth / 2, 0);
ctx.strokeStyle = config.colors.fail;
ctx.lineWidth = lineWidth / 2.5;
ctx.stroke();

ctx.restore();

