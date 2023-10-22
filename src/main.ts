import "./style.css";
import vertexShader from "./shaders/vertexshader.wgsl?raw";

async function init() {
  if (!navigator.gpu) {
    throw Error("WebGPU not supported!");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw Error("Couldn't request WebGPU adapter!");
  }

  const device = await adapter.requestDevice();
}
