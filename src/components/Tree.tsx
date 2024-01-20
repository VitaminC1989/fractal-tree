import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  ForwardedRef,
  useImperativeHandle,
} from "react";
import type { FC } from "react";

interface Point {
  x: number;
  y: number;
}

export interface Branch {
  start: Point;
  length: number;
  theta: number;
}

interface TreeProps {
  startBranch?: Branch;
  maxForksNum?: number;
  lineColor?: string;
  renderingSpeed?: number;
  canvas?: {
    width: number;
    height: number;
  };
}

export interface TreeRef {
  clearCanvas: () => void;
  stopDrawing: () => void;
  init: () => void;
}

const Tree = forwardRef<TreeRef, TreeProps>((props, ref) => {
  // -------- 属性 --------
  const {
    startBranch = {
      start: { x: 0, y: 0 },
      length: 10,
      theta: Math.PI / 4,
    },
    maxForksNum = 4,
    lineColor = "",
    renderingSpeed = 3,
    canvas = {
      width: 500,
      height: 500,
    },
  } = props;
  // -------- 状态 --------
  const el = useRef<HTMLCanvasElement>(null);
  let ctx: CanvasRenderingContext2D | null | undefined = null;

  let pendingTasks: Function[] = [];

  // ---------------- 暴露给父组件的方法 ----------------
  useImperativeHandle(ref, () => ({
    clearCanvas,
    stopDrawing,
    init,
  }));

  // ---------------- 方法 ----------------
  function getEndPoint(b: Branch): Point {
    return {
      x: b.start.x + b.length * Math.cos(b.theta),
      y: b.start.y + b.length * Math.sin(b.theta),
    };
  }

  // 根据给出的两点 画出线
  function lineTo(p1: Point, p2: Point) {
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  function drawBranch(b: Branch) {
    lineTo(b.start, getEndPoint(b));
  }

  function isPointOutsideCanvas(
    x: number,
    y: number,
    canvasWidth: number,
    canvasHeight: number
  ) {
    if (x < 0 || x > canvasWidth || y < 0 || y > canvasHeight) {
      return true; // 点超出了边界
    }
    return false; // 点在边界内
  }

  function step(b: Branch, depth = 0) {
    // console.log("开始绘制", b.start.x);
    const end = getEndPoint(b);
    drawBranch(b);

    if (isPointOutsideCanvas(end.x, end.y, canvas.width, canvas.height)) {
      //   console.log("超出边界");
      return;
    }

    if (depth < maxForksNum || Math.random() < 0.5) {
      pendingTasks.push(() =>
        step(
          {
            start: end,
            length: b.length + (Math.random() * 2 - 1), //  b.lengh - 1 <= length < b.lengh + 1
            theta: b.theta - 0.2 * Math.random(),
          },
          depth + 1
        )
      );
    }
    if (depth < maxForksNum || Math.random() < 0.5) {
      pendingTasks.push(() =>
        step(
          {
            start: end,
            length: b.length + (Math.random() * 2 - 1), //  b.lengh - 1 <= length < b.lengh + 1
            theta: b.theta + 0.2 * Math.random(),
          },
          depth + 1
        )
      );
    }
  }

  //  清空画布
  function clearCanvas() {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    console.log("清空画布", canvas.width, canvas.height);
  }

  // 停止绘画
  function stopDrawing() {
    pendingTasks = [];
    framesCount = 0;

    // console.log("animationId", animationId);
    // animationId && cancelAnimationFrame(animationId);
  }

  function frame() {
    const tasks: Function[] = [];
    pendingTasks = pendingTasks.filter((i) => {
      if (Math.random() > 0.4) {
        tasks.push(i);
        return false;
      }
      return true;
    });
    tasks.forEach((fn) => fn());
  }

  function init() {
    if (!ctx) return;
    // ctx.strokeStyle = "#fff5";

    ctx.strokeStyle = lineColor || "#fff5";
    // ctx.lineWidth = 1;
    step(startBranch);
  }

  let framesCount = 0;
  let animationId: null | number = null;
  function startFrame() {
    animationId = requestAnimationFrame(() => {
      framesCount += 1;
      if (framesCount % renderingSpeed === 0) frame();
      startFrame();
    });
  }

  startFrame();

  // ---------------- Hooks ----------------
  // 初始化
  useEffect(() => {
    ctx = el.current?.getContext("2d");
    init();
  }, []);

  // 重新设置ctx
  useEffect(() => {
    ctx = el.current?.getContext("2d");
  }, [startBranch, maxForksNum]);

  return (
    <div className="h-full w-full">
      <canvas
        ref={el}
        width={canvas.width}
        height={canvas.height}
        // className="scale-50 border-2 border-sky-500"
        className="scale-50 border-2 shadow-md"
        style={{ borderColor: "#fff5" }}
        // className="border-2 border-sky-500"
      />
    </div>
  );
});

export default Tree;
