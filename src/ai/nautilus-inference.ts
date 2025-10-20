import * as ort from "onnxruntime-web";

export class NautilusInference {
  private session: any = null;

  async loadModel(modelUrl: string) {
    try {
      this.session = await ort.InferenceSession.create(modelUrl);
      console.log("🧠 Modelo ONNX carregado:", modelUrl);
    } catch (error) {
      console.error("Erro ao carregar modelo:", error);
    }
  }

  async analyze(input: string) {
    if (!this.session) return "Modelo não carregado.";
    const tensor = new ort.Tensor("float32", new Float32Array([0]), [1, 1]);
    const output = await this.session.run({ input: tensor });
    return output.output ? output.output.toString() : "Sem saída.";
  }
}
