/**
 * IMAGE RECOGNITION PAGE - PHASE 8
 */
import React from "react";
import { Helmet } from "react-helmet-async";
import { ImageRecognition } from "@/components/inspection/ImageRecognition";

const ImageRecognitionPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Reconhecimento de Imagem | Nautilus One</title>
        <meta name="description" content="IA para análise de fotos de inspeção - detecção de corrosão, danos e EPIs" />
      </Helmet>
      <div className="container mx-auto p-6 max-w-7xl">
        <ImageRecognition />
      </div>
    </>
  );
});

export default ImageRecognitionPage;
