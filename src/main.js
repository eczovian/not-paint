/** @type HTMLCanvasElement */
const canvas = document.getElementById("drawing-board");
const wrapper_div = document.getElementById("wrapper-div");
canvas.width = wrapper_div.clientWidth;
canvas.height = wrapper_div.clientHeight;

const ctx = canvas.getContext("2d", { willReadFrequently: true });
ctx.lineWidth = 10;
ctx.strokeStyle = "#000";
const LINE_WIDTH = 10;

const log_thing = (identifier) => {
  return (event) => {
    console.log(identifier, event);
  };
};

/** @typedef {Object} EventCoords
 * @property {number} x
 * @property {number} y
 */

let is_tracking = false;
/** @type EventCoords[] */
let last_three_events;

/** @type (e: MouseEvent) => void */
const start_tracking = (event) => {
  last_three_events = [{ x: event.x, y: event.y }];
  is_tracking = true;
  draw_point(event.x, event.y, LINE_WIDTH);
};

const track = (event) => {
  if (is_tracking) {
    draw_point(event.x, event.y, LINE_WIDTH);
  }
};

const stop_tracking = (_event) => {
  is_tracking = false;
};

const draw_point = (x, y, width) => {
  const data = ctx.getImageData(
    x - Math.floor(0.5 * width),
    y - Math.floor(0.5 * width),
    width,
    width,
  );
  for (let i = 0; i < data.data.length; i = i + 4) {
    const relativeY = Math.floor(i / 4 / width) + (y - 0.5 * width);
    const relativeX = ((i / 4) % width) + (x - 0.5 * width);
    if (Math.sqrt((relativeX - x) ** 2 + (relativeY - y) ** 2) < width * 0.5) {
      data.data[i] = 0;
      data.data[i + 1] = 0;
      data.data[i + 2] = 0;
      data.data[i + 3] = 255;
    }
  }
  ctx.putImageData(
    data,
    x - Math.floor(0.5 * width),
    y - Math.floor(0.5 * width),
  );
};

canvas.onmousedown = start_tracking;
canvas.onmouseup = stop_tracking;
canvas.onmousemove = track;
canvas.onmouseout = stop_tracking;
