"use client";

import { useEffect, useState } from "react";
import {
  runCoreEngine,
  type CoreEngineResult,
} from "@/core/engine/CoreEngine";

export function useCoreEngine() {
  const [data, setData] = useState<CoreEngineResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await runCoreEngine();

      setData(result);
      setLoading(false);
    }

    load();
  }, []);

  return {
    data,
    loading,
  };
}