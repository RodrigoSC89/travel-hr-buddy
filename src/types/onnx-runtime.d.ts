/**
 * PATCH 612 - ONNX Runtime Type Definitions
 * Type definitions for ONNX Runtime Web used in AI inference engines
 */

declare module 'onnxruntime-web' {
  export interface InferenceSession {
    loadModel(modelPath: string | ArrayBuffer, options?: SessionOptions): Promise<InferenceSession>;
    run(feeds: FeedsType, options?: RunOptions): Promise<ReturnType>;
    run(feeds: FeedsType, fetches: FetchesType, options?: RunOptions): Promise<ReturnType>;
    release(): Promise<void>;
    
    readonly inputNames: readonly string[];
    readonly outputNames: readonly string[];
  }

  export interface SessionOptions {
    executionProviders?: ExecutionProviderConfig[];
    intraOpNumThreads?: number;
    interOpNumThreads?: number;
    graphOptimizationLevel?: 'disabled' | 'basic' | 'extended' | 'all';
    enableCpuMemArena?: boolean;
    enableMemPattern?: boolean;
    executionMode?: 'sequential' | 'parallel';
    logId?: string;
    logSeverityLevel?: 0 | 1 | 2 | 3 | 4;
    logVerbosityLevel?: number;
    enableProfiling?: boolean;
    profileFilePrefix?: string;
    extra?: Record<string, unknown>;
  }

  export type ExecutionProviderConfig =
    | 'cpu'
    | 'webgl'
    | 'wasm'
    | 'webgpu'
    | ExecutionProviderOption;

  export interface ExecutionProviderOption {
    name: string;
    [key: string]: unknown;
  }

  export interface RunOptions {
    logSeverityLevel?: 0 | 1 | 2 | 3 | 4;
    logVerbosityLevel?: number;
    terminate?: boolean;
    tag?: string;
  }

  export interface Tensor {
    readonly type: Tensor.Type;
    readonly dims: readonly number[];
    readonly data: Tensor.DataType;
    readonly size: number;
    reshape(dims: readonly number[]): Tensor;
    getData(): Tensor.DataType;
    dispose(): void;
  }

  export namespace Tensor {
    export type Type =
      | 'float32'
      | 'uint8'
      | 'int8'
      | 'uint16'
      | 'int16'
      | 'int32'
      | 'int64'
      | 'string'
      | 'bool'
      | 'float16'
      | 'float64'
      | 'uint32'
      | 'uint64';

    export type DataType =
      | Float32Array
      | Uint8Array
      | Int8Array
      | Uint16Array
      | Int16Array
      | Int32Array
      | BigInt64Array
      | string[]
      | Uint8Array
      | Float64Array
      | Uint32Array
      | BigUint64Array;

    export interface DataTypeMap {
      float32: Float32Array;
      uint8: Uint8Array;
      int8: Int8Array;
      uint16: Uint16Array;
      int16: Int16Array;
      int32: Int32Array;
      int64: BigInt64Array;
      string: string[];
      bool: Uint8Array;
      float16: Uint16Array;
      float64: Float64Array;
      uint32: Uint32Array;
      uint64: BigUint64Array;
    }

    interface ConstructorParameters<T extends Tensor.Type> {
      type: T;
      data: Tensor.DataTypeMap[T] | readonly number[] | readonly string[] | readonly bigint[] | readonly boolean[];
      dims?: readonly number[];
    }

    export function new<T extends Tensor.Type>(
      type: T,
      data: Tensor.DataTypeMap[T] | readonly number[] | readonly string[] | readonly bigint[] | readonly boolean[],
      dims?: readonly number[]
    ): Tensor;

    export function new(data: Tensor.DataType, dims?: readonly number[]): Tensor;
  }

  export type FeedsType = { [name: string]: Tensor };
  export type FetchesType = { [name: string]: Tensor | null };
  export type ReturnType = { [name: string]: Tensor };

  export namespace InferenceSession {
    export function create(
      modelPath: string | ArrayBuffer,
      options?: SessionOptions
    ): Promise<InferenceSession>;

    export function create(
      modelPath: Uint8Array,
      options?: SessionOptions
    ): Promise<InferenceSession>;
  }

  export namespace env {
    export let wasm: {
      wasmPaths?: string | { [key: string]: string };
      numThreads?: number;
      simd?: boolean;
      proxy?: boolean;
    };

    export let webgl: {
      contextId?: 'webgl' | 'webgl2';
      matmulMaxBatchSize?: number;
      textureCacheMode?: 'initializerOnly' | 'full';
      pack?: boolean;
      async?: boolean;
    };

    export let webgpu: {
      profilingMode?: 'off' | 'default';
      validateInputContent?: boolean;
    };

    export let logLevel: 'verbose' | 'info' | 'warning' | 'error' | 'fatal';
    export let debug: boolean;
  }

  export class Tensor {
    constructor(type: Tensor.Type, data: Tensor.DataType, dims?: readonly number[]);
    constructor(data: Tensor.DataType, dims?: readonly number[]);
    
    readonly type: Tensor.Type;
    readonly dims: readonly number[];
    readonly data: Tensor.DataType;
    readonly size: number;
    
    reshape(dims: readonly number[]): Tensor;
    getData(): Tensor.DataType;
    dispose(): void;
  }

  export interface OnnxValue {
    type: 'tensor' | 'sequence' | 'map';
    data: unknown;
  }

  export interface OrtTensor {
    dims: number[];
    type: string;
    data: Float32Array | Int32Array | Uint8Array | BigInt64Array;
  }

  export interface Backend {
    initialize(): Promise<void>;
    dispose(): Promise<void>;
    createSessionHandler(
      pathOrBuffer: string | Uint8Array,
      options?: SessionOptions
    ): Promise<SessionHandler>;
  }

  export interface SessionHandler {
    dispose(): Promise<void>;
    run(
      feeds: FeedsType,
      fetches: string[],
      options: RunOptions
    ): Promise<ReturnType>;
    readonly inputNames: readonly string[];
    readonly outputNames: readonly string[];
  }

  export const backend: Backend;
}

export { };
