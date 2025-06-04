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

/** @type (event:PointerEvent)=> void */
const track = (event) => {
  if (is_tracking) {
    for (let e of event.getCoalescedEvents())
      if (last_four_points.length < 4) {
        last_four_points.unshift(e);
        continue;
      } else {
        calculate_bezier_de_cateljau(
          last_four_points[0],
          last_four_points[1],
          last_four_points[2],
          last_four_points[3],
          5,
        );
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
const calculate_bezier_y = (p1, p2, p3, p4, t) => {
  return (
    (1 - t) ** 3 * p1.y +
    3 * (1 - t) ** 2 * t * p2.y +
    3 * (1 - t) * t ** 2 * p3.y +
    t ** 3 * p4.y
  );
};

const calculate_bezier_x = (p1, p2, p3, p4, t) => {
  return (
    (1 - t) ** 3 * p1.x +
    3 * (1 - t) ** 2 * t * p2.x +
    3 * (1 - t) * t ** 2 * p3.x +
    t ** 3 * p4.x
  );
};

/** @type (P1:vec2, P2:vec2, P3:vec2, P4:vec2)=> number */
const calculate_bezier_de_cateljau = (p1, p2, p3, p4, i) => {
  const x12 = (p1.x + p2.x) / 2;
  const y12 = (p1.y + p2.y) / 2;
  const x23 = (p2.x + p3.x) / 2;
  const y23 = (p2.y + p3.y) / 2;
  const x34 = (p3.x + p4.x) / 2;
  const y34 = (p3.y + p4.y) / 2;
  const x123 = (x12 + x23) / 2;
  const y123 = (y12 + y23) / 2;
  const x234 = (x23 + x34) / 2;
  const y234 = (y23 + y34) / 2;
  const x1234 = (x123 + x234) / 2;
  const y1234 = (y123 + y234) / 2;
  if (i == 0) {
    draw_point({ x: x1234, y: y1234 }, LINE_WIDTH);
  } else {
    calculate_bezier_de_cateljau(
      { x: p1.x, y: p1.y },
      { x: x12, y: y12 },
      { x: x123, y: y123 },
      { x: x1234, y: y1234 },
      i - 1,
    );
    calculate_bezier_de_cateljau(
      { x: x1234, y: y1234 },
      { x: x234, y: y234 },
      { x: x34, y: y34 },
      { x: p4.x, y: p4.y },
      i - 1,
    );
  }
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

canvas.addEventListener("pointermove", track);
canvas.addEventListener("pointerdown", start_tracking);
canvas.addEventListener("pointerup", stop_tracking);
canvas.addEventListener("pointerout", stop_tracking);
