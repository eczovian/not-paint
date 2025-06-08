//typedefs

/** @typedef {Object} Vec2
 * @property {number} x
 * @property {number} y
 */

/** @typedef {Object} Line
 * @property {Vec2[]} points
 * @property {Tool} tool
 */

/** @typedef {'selected_tool'} StoreName */

/** @typedef {'brush'|'eraser'} ToolName */

//imports
import Alpine from "alpinejs";

//code
window.Alpine = Alpine;

const brush = { r: 0, g: 0, b: 0, a: 255, width: 10 };
const eraser = { r: 255, g: 255, b: 255, a: 0, width: 25 };

Alpine.store("selected_tool", {
  /** @type ToolName */
  tool_name: "brush",

  /** @type (tool:ToolName) => void */
  set_tool(tool) {
    this.tool_name = tool;
  },
});
Alpine.store("erase_type", "point");

Alpine.start();

/** @type HTMLCanvasElement */
const canvas = document.getElementById("drawing-board");
const wrapper_div = document.getElementById("wrapper-div");
canvas.width = wrapper_div.clientWidth;
canvas.height = wrapper_div.clientHeight;

const ctx = canvas.getContext("2d", { willReadFrequently: true });

let is_tracking = false;
/** @type Vec2[] */
let last_four_points = [];
/** @type Line[] */
let lines = [];
/** @type Line */
let current_line = {};

const begin = (event) => {
  current_line = {};
  is_tracking = true;
  last_four_points = [event];
  switch (Alpine.store("selected_tool").tool_name) {
    case "brush":
      current_line.points = [{ x: event.x, y: event.y }];
      current_line.tool = brush;
      draw_point(event);
      break;
    case "eraser":
      if (Alpine.store("erase_type") == "line") {
        erase_line(event);
      } else if (Alpine.store("erase_type") == "point") {
        erase_point(event);
      }
      break;
  }
};

/** @type (event:PointerEvent)=> Vec2[] */
const track = (event) => {
  let interpolated_points = [];
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
        interpolated_points,
      );
      last_four_points.pop();
    }
  return interpolated_points;
};

const stop_tracking = (_event) => {
  is_tracking = false;
  if (Alpine.store("selected_tool").tool_name == "brush") {
    lines.push(current_line);
  }
};

/** @typedev (point: vec2) => void */
const dispatch = (point) => {
  const tool_name = Alpine.store("selected_tool").tool_name;
  if (is_tracking) {
    let interp = track(point);
    switch (tool_name) {
      case "brush":
        current_line.points = current_line.points.concat(interp);
        invoke_tool_function(interp, draw_point);
        break;
      case "eraser":
        if (Alpine.store("erase_type") == "line") {
          invoke_tool_function(interp, erase_line);
        } else if (Alpine.store("erase_type") == "point") {
          invoke_tool_function(interp, erase_point);
        }
        break;
    }
  }
};

canvas.addEventListener("pointermove", dispatch);
canvas.addEventListener("pointerdown", begin);
canvas.addEventListener("pointerup", stop_tracking);

const erase_line = (point) => {
  let found_lines = lines.filter((line) =>
    line.points.some((p) =>
      do_circles_intersect(point, eraser.width, p, brush.width),
    ),
  );
  lines = lines.filter(
    (line) =>
      !line.points.some((p) =>
        do_circles_intersect(point, eraser.width, p, brush.width),
      ),
  );
  if (found_lines !== undefined) {
    for (let coord of found_lines
      .map((line) => line.points)
      .reduce((prev, curr) => prev.concat(curr), [])) {
      erase_point(coord);
    }
  }
};

/** @type (point:Vec2)=> void */
const draw_point = (point) => {
  const width = brush.width;
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
      is_point_in_circle(
        { x: x, y: y },
        { x: relativeX, y: relativeY },
        width * 0.5,
      )
    ) {
      data.data[i] = brush.r;
      data.data[i + 1] = brush.g;
      data.data[i + 2] = brush.b;
      data.data[i + 3] = brush.a;
    }
  }
  ctx.putImageData(
    data,
    x - Math.floor(0.5 * width),
    y - Math.floor(0.5 * width),
  );
};

/** @type (point:Vec2)=> void */
const erase_point = (point) => {
  const width = eraser.width;
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
      is_point_in_circle(
        { x: x, y: y },
        { x: relativeX, y: relativeY },
        width * 0.5,
      )
    ) {
      data.data[i] = eraser.r;
      data.data[i + 1] = eraser.g;
      data.data[i + 2] = eraser.b;
      data.data[i + 3] = eraser.a;
    }
  }
  ctx.putImageData(
    data,
    x - Math.floor(0.5 * width),
    y - Math.floor(0.5 * width),
  );
};

const invoke_tool_function = (points, func) => {
  for (let point of points) {
    func(point);
  }
};

/** @type (p1:Vec2, p2:Vec2, p3:Vec2, p4:Vec2, i:number, arr:Vec2[])=> void */
const calculate_bezier_de_cateljau = (p1, p2, p3, p4, i, arr) => {
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
    arr.push({ x: x1234, y: y1234 });
  } else {
    calculate_bezier_de_cateljau(
      { x: p1.x, y: p1.y },
      { x: x12, y: y12 },
      { x: x123, y: y123 },
      { x: x1234, y: y1234 },
      i - 1,
      arr,
    );
    calculate_bezier_de_cateljau(
      { x: x1234, y: y1234 },
      { x: x234, y: y234 },
      { x: x34, y: y34 },
      { x: p4.x, y: p4.y },
      i - 1,
      arr,
    );
  }
};

/** @type (a:Vec2,b:Vec2)=> Vec2
 * @return the vector resulting from a - b
 */
const vec2_subtract = (a, b) => {
  return { x: a.x - b.x, y: a.y - b.y };
};

/** @type (a:Vec2,b:Vec2)=> Vec2
 * @description returns the vector resulting from a + b
 */
const vec2_add = (a, b) => {
  return { x: a.x + b.x, y: a.y + b.y };
};

/** @type (a:Vec2, b:Vec2) => number */
const dist_between = (a, b) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

const is_point_in_circle = (point, circle_center, radius) => {
  return dist_between(point, circle_center) < radius;
};

const do_circles_intersect = (
  center_one,
  radius_one,
  center_two,
  radius_two,
) => {
  return dist_between(center_one, center_two) < radius_one + radius_two;
};
