import { PredictionResponse } from '@/types/prediction';

const API_BASE_URL = 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public isCorsError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function predictPest(file: File): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError(`Prediction failed: ${response.statusText}`, response.status);
    }

    const data = await response.json();
return {
  pest: data.predicted_class,
  confidence: data.confidence,
};

  } catch (error) {
    // Check for CORS or network errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new ApiError(
        'Unable to connect to the server. Please ensure the backend is running and CORS is configured.',
        undefined,
        true
      );
    }
    throw error;
  }
}

export function getSeverityFromConfidence(confidence: number): 'low' | 'medium' | 'high' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
