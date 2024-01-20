import { useDebugValue, useRef, useState } from "react";
import _cloneDeep from "lodash/cloneDeep";

// 组件
import Tree, { TreeRef } from "./components/Tree";
import Controller, { ControllerParams } from "./components/Controller";

// 样式
import "normalize.css";

function App() {
  // -------- 状态 --------
  const [controllerValue, setControllerValue] = useState<ControllerParams>({
    startBranch: {
      start: { x: 0, y: 0 },
      length: 10,
      theta: Math.PI / 4,
    },
    maxForksNum: 4,
    // 控制器支持的颜色的格式: rgba
    lineColor: "rgba(255,255,255,0.3)",
    renderingSpeed: 3,
  });
  const treeRef = useRef<TreeRef>(null);
  const [show, setShow] = useState(true);

  // ---------------- 方法 ----------------
  const handleRendering = (params: ControllerParams) => {
    console.log("重新渲染", params);
    setShow(false);
    setTimeout(() => setShow(true), 200);
  };

  const handleRenderingByTreeRef = (params: ControllerParams) => {
    // console.log("重新渲染", params);
    if (!treeRef.current) return;

    treeRef.current.stopDrawing();
    treeRef.current.clearCanvas();
    treeRef.current.init();
  };

  return (
    <>
      <Controller
        params={controllerValue}
        canvas={{
          width: window.innerWidth,
          height: window.innerHeight,
        }}
        onRendering={handleRendering}
        onChange={(controllerValue) => {
          setControllerValue(_cloneDeep(controllerValue));
          console.log("控制器", controllerValue);
        }}
      />
      {show && (
        <Tree
          ref={treeRef}
          canvas={{
            // width: window.innerWidth * 2,
            // height: window.innerHeight * 2,
            width: window.innerWidth,
            height: window.innerHeight,
          }}
          startBranch={controllerValue.startBranch}
          maxForksNum={controllerValue.maxForksNum}
          lineColor={controllerValue.lineColor}
          renderingSpeed={controllerValue.renderingSpeed}
        />
      )}
    </>
  );
}

export default App;
