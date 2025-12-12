import { useState, useEffect, useCallback } from 'react';
import { Prediction } from '@/types/prediction';

const STORAGE_KEY = 'pest-predictions';
const MAX_STORED_PREDICTIONS = 50;

export function useLocalStorage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const withDates = parsed.map((p: Prediction) => ({
          ...p,
          timestamp: new Date(p.timestamp),
        }));
        setPredictions(withDates);
      } catch (e) {
        console.error('Failed to parse stored predictions', e);
      }
    }
  }, []);

  const addPrediction = useCallback((prediction: Prediction) => {
    setPredictions((prev) => {
      const updated = [prediction, ...prev].slice(0, MAX_STORED_PREDICTIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearPredictions = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPredictions([]);
  }, []);

  const getRecentPredictions = useCallback((count: number = 10) => {
    return predictions.slice(0, count);
  }, [predictions]);

  const getStats = useCallback(() => {
    const highRisk = predictions.filter((p) => p.severity === 'high').length;
    const mediumRisk = predictions.filter((p) => p.severity === 'medium').length;
    const lowRisk = predictions.filter((p) => p.severity === 'low').length;

    return {
      totalDetections: predictions.length,
      highRiskCount: highRisk,
      mediumRiskCount: mediumRisk,
      lowRiskCount: lowRisk,
      lastUpdated: predictions[0]?.timestamp || new Date(),
    };
  }, [predictions]);

  return {
    predictions,
    addPrediction,
    clearPredictions,
    getRecentPredictions,
    getStats,
  };
}
