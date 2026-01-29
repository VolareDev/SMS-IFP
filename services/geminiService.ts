
import { GoogleGenAI, Type } from "@google/genai";
import { IFPStage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeRiskWithAI = async (title: string, description: string, stage: IFPStage) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza el siguiente peligro identificado en el diseño de procedimientos de vuelo (Doc 8168) durante la etapa de ${stage}.
      
      Título: ${title}
      Descripción: ${description}
      
      Proporciona una evaluación de seguridad (SMS) que incluya:
      1. Posibles consecuencias.
      2. Una mitigación recomendada basada en normativa OACI.
      3. Sugerencia de Probabilidad (1-5) y Gravedad (A-E).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            consequences: { type: Type.STRING },
            suggestedMitigation: { type: Type.STRING },
            suggestedLikelihood: { type: Type.NUMBER, description: "1 to 5" },
            suggestedSeverity: { type: Type.STRING, description: "A to E" }
          },
          required: ["consequences", "suggestedMitigation", "suggestedLikelihood", "suggestedSeverity"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return null;
  }
};
