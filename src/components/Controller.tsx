import React, { useRef, useEffect } from "react";
import type { FC } from "react";
import * as dat from "dat.gui";

import type { Branch } from "./Tree";

export type ControllerParams = {
  startBranch: Branch;
  maxForksNum: number;
  lineColor?: string;
  renderingSpeed?: number;
};

interface ControllerProps {
  params?: ControllerParams;
  canvas: { width: number; height: number };
  onChange?: (value: ControllerParams) => void;
  onRendering?: (params: ControllerParams) => void;
}

const Controller: FC<ControllerProps> = (props) => {
  // -------- 属性 --------
  const {
    params = {
      startBranch: {
        start: { x: 0, y: 0 },
        length: 10,
        theta: Math.PI / 4,
      },
      maxForksNum: 4,
      // reRender: (params: ControllerParams) => {},
    },
    canvas,
    onRendering = () => {},
    onChange = () => {},
  } = props;
  //   const elRef = useRef<HTMLElement | null | undefined>(null);
  const controllersRef = useRef<any>({});
  const guiRef = useRef<dat.GUI | null>(null);
  const paramsRef = useRef<ControllerParams>(params);

  function handleChange(key: string, value: string | number) {
    console.log(key, value);

    // onChange(key, value);
  }

  // 更新Controller的值
  function updateControllers(newParams: ControllerParams) {
    if (Object.keys(controllersRef.current).length === 0) return;

    console.log("开始更新值");
    controllersRef.current.startX.setValue(newParams.startBranch.start.x);
    controllersRef.current.startY.setValue(newParams.startBranch.start.y);
    controllersRef.current.length.setValue(newParams.startBranch.length);
    controllersRef.current.angle.setValue(newParams.startBranch.theta);
    controllersRef.current.maxForksNum.setValue(newParams.maxForksNum);
    controllersRef.current.lineColor.setValue(newParams.lineColor);
    controllersRef.current.renderingSpeed.setValue(newParams.renderingSpeed);
  }

  function initDatGUI() {
    const gui = new dat.GUI({ name: "My GUI" });
    // gui.domElement = document.getElementById("controller") as HTMLElement;
    guiRef.current = gui;

    // const params = paramsRef.current;
    // const options = {
    //   startX: 0,
    //   startY: 0,
    //   length: 10,
    //   angle: Math.PI / 4,
    //   maxForksNum: 4,
    //   speed: 0.8,
    //   displayOutline: false,
    //   reRender: function () {},
    // };

    console.log("-------- 颜色 --------", params.lineColor);
    const options = {
      startX: params?.startBranch?.start?.x || 0,
      startY: params?.startBranch?.start?.y || 0,
      length: params?.startBranch?.length || 10,
      angle: params?.startBranch?.theta || Math.PI / 4,
      maxForksNum: params?.maxForksNum || 4,
      lineColor: params?.lineColor || "rgba(255,255,255,0.3)",
      renderingSpeed: 3,
      reRender: (params: ControllerParams) => onRendering(params),
    };

    const controllers: { [key in keyof typeof options]?: any } = {};

    controllers.startX = gui
      .add(options, "startX", 0, 500)
      .name("起点的X坐标")
      .onFinishChange((val) => {
        params.startBranch.start.x = val;
        onChange(params);
      });
    controllers.startY = gui
      .add(options, "startY", 0, 500)
      .name("起点的Y坐标")
      .onFinishChange((val) => {
        params.startBranch.start.y = val;
        onChange(params);
      });
    controllers.length = gui
      .add(options, "length", 0, 100)
      .name("树枝的长度")
      .onFinishChange((val) => {
        params.startBranch.length = val;
        onChange(params);
      });
    controllers.angle = gui
      .add(options, "angle", 0, Math.PI * 2)
      .name("树枝的生长的角度")
      .onFinishChange((val) => {
        params.startBranch.theta = val;
        onChange(params);
      });
    controllers.maxForksNum = gui
      .add(options, "maxForksNum", 4)
      .name("树枝的最大分叉数")
      .min(1)
      .max(10)
      .step(1)
      .onFinishChange((val) => {
        params.maxForksNum = val;
        onChange(params);
      });
    controllers.renderingSpeed = gui
      .add(options, "renderingSpeed", 4)
      .name("渲染间隔（速度）")
      .min(1)
      .max(1000)
      .step(1)
      .onFinishChange((val) => {
        params.renderingSpeed = val;
        onChange(params);
      });
    controllers.lineColor = gui
      .addColor(options, "lineColor")
      .name("线条颜色")
      .onFinishChange((val) => {
        params.lineColor = val;
        console.log("顏色", val, params.lineColor);
        onChange(params);
      });

    controllers.reRender = gui.add(options, "reRender").name("[重新渲染]");

    controllersRef.current = controllers;

    // -------- 子项 --------
    const options2 = {
      // 神经突触动画
      neurosynapses: () => {
        const newParams = {
          startBranch: {
            start: { x: canvas.width / 2, y: canvas.height / 2 },
            length: 1,
            theta: Math.PI / 4,
          },
          maxForksNum: 8,
          lineColor: "rgba(255,255,255,0.3)",
          renderingSpeed: 3,
        };
        onChange(newParams);
      },

      reRender: (params: ControllerParams) => onRendering(params),
    };
    const folder = gui.addFolder("-------- 预设值 --------");
    folder.add(options2, "neurosynapses").name("神经突触");
    folder.add(options2, "reRender").name("[重新渲染]");
    folder.open();
  }

  // ---------------- Hooks ----------------
  useEffect(() => {
    initDatGUI();
  }, []);

  useEffect(() => {
    if (guiRef.current) {
      guiRef.current.destroy();
      initDatGUI();
    }
  }, [params]);

  return <div id="controller"></div>;
};

export default Controller;
