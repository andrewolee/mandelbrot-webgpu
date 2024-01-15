import "./style.css";
import shader from "./shaders/shader.wgsl?raw";

async function getDevice(): Promise<GPUDevice> {
  const adapter = await navigator.gpu?.requestAdapter();
  if (!adapter) {
    throw Error("Your browser does not support WebGPU!");
  }

  return adapter.requestDevice();
}

async function main() {
  const device = await getDevice();
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
  });

  const vertices = new Float32Array([
    0.0, 0.6, 0, 1, 1, 0, 0, 1, -0.5, -0.6, 0, 1, 0, 1, 0, 1, 0.5, -0.6, 0, 1,
    0, 0, 1, 1,
  ]);

  const clearColor = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };

  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(vertexBuffer, 0, vertices, 0, vertices.length);

  const vertexBuffers = [
    {
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x4",
        },
        {
          shaderLocation: 1,
          offset: 16,
          format: "float32x4",
        },
      ],
      arrayStride: 32,
      stepMode: "vertex",
    },
  ];

  const pipelineDescriptor = {
    vertex: {
      module: shaderModule,
      entryPoint: "vertex_main",
      buffers: vertexBuffers,
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragment_main",
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
    layout: "auto",
  } as GPURenderPipelineDescriptor;

  const renderPipeline = device.createRenderPipeline(pipelineDescriptor);

  const commandEncoder = device.createCommandEncoder();

  const renderPassDescriptor = {
    colorAttachments: [
      {
        clearValue: clearColor,
        loadOp: "clear",
        storeOp: "store",
        view: context.getCurrentTexture().createView(),
      },
    ],
  } as GPURenderPassDescriptor;

  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

  passEncoder.setPipeline(renderPipeline);
  passEncoder.setVertexBuffer(0, vertexBuffer);
  passEncoder.draw(3);
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);
}

main();
