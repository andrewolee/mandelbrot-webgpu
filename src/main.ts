import "./style.css";
import shader from "./shaders/shader.wgsl?raw";

async function init() {
  if (!navigator.gpu) {
    throw Error("WebGPU not supported!");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw Error("Couldn't request WebGPU adapter!");
  }

  const device = await adapter.requestDevice();

  const shaderModule = device.createShaderModule({
    code: shader,
  });

  const canvas = document.getElementById("mandelbrot") as HTMLCanvasElement;
  const context = canvas.getContext("webgpu");
  if (!context) {
    throw Error("No WebGPU for you!");
  }

  context.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: "premultiplied",
  });
}

init();
