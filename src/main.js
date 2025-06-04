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

/** @typedef {Object} vec2
 * @property {number} x
 * @property {number} y
 */

let is_tracking = false;
/** @type vec2[] */
let last_four_points = [];

const start_tracking = (event) => {
  is_tracking = true;
  draw_point(event, LINE_WIDTH);
};

/** @type (event:vec2)=> void */
const track = (event) => {
  if (is_tracking) {
    if (last_four_points.length < 4) {
      last_four_points.unshift(event);
      return;
    } else {
      for (let t = 0; t < 1; t = t + 0.03) {
        draw_point(
          {
            x: calculate_bezier_x(
              last_four_points[0],
              last_four_points[1],
              last_four_points[2],
              last_four_points[3],
              t,
            ),
            y: calculate_bezier_y(
              last_four_points[0],
              last_four_points[1],
              last_four_points[2],
              last_four_points[3],
              t,
            ),
          },
          LINE_WIDTH,
        );
      }
      last_four_points.pop();
    }
  }
};

/** @type (a:vec2, b:vec2) => number */
const distBetween = (a, b) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

const stop_tracking = (_event) => {
  is_tracking = false;
  last_four_points = [];
};

const draw_point = (point, width) => {
  const x = Math.round(point.x);
  const y = Math.round(point.y);
  const data = ctx.getImageData(
    x - Math.floor(0.5 * width),
    y - Math.floor(0.5 * width),
    width,
    width,
  );
  for (let i = 0; i < data.data.length; i = i + 4) {
    const relativeY = Math.floor(i / 4 / width) + (y - 0.5 * width);
    const relativeX = ((i / 4) % width) + (x - 0.5 * width);
    if (
      distBetween({ x: x, y: y }, { x: relativeX, y: relativeY }) <
      width * 0.5
    ) {
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

/** @type (P1:vec2, P2:vec2, P3:vec2, P4:vec2, t:number)=> number */
const calculate_bezier_y = (P1, P2, P3, P4, t) => {
  return (
    (1 - t) ** 3 * P1.y +
    3 * (1 - t) ** 2 * t * P2.y +
    3 * (1 - t) * t ** 2 * P3.y +
    t ** 3 * P4.y
  );
};

const calculate_bezier_x = (P1, P2, P3, P4, t) => {
  return (
    (1 - t) ** 3 * P1.x +
    3 * (1 - t) ** 2 * t * P2.x +
    3 * (1 - t) * t ** 2 * P3.x +
    t ** 3 * P4.x
  );
};

/** @type (a:vec2,b:vec2)=> vec2
 * @return the vector resulting from a - b
 */
const vec2_subtract = (a, b) => {
  return { x: a.x - b.x, y: a.y - b.y };
};

/** @type (a:vec2,b:vec2)=> vec2
 * @description returns the vector resulting from a + b
 */
const vec2_add = (a, b) => {
  return { x: a.x + b.x, y: a.y + b.y };
};

canvas.addEventListener("pointerrawupdate", track);
canvas.addEventListener("pointerdown", start_tracking);
canvas.addEventListener("pointerup", stop_tracking);
canvas.addEventListener("pointerout", stop_tracking);
