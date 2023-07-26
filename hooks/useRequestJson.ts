import { useEffect, useState } from "react";
import { RequestConfig, requestJson } from "../lib/request";

type Status =
  | { readonly stage: "idle" | "loading"; readonly data?: never; readonly error?: never }
  | { readonly stage: "resolved"; readonly data: unknown; readonly error?: never }
  | { readonly stage: "rejected"; readonly data?: never; readonly error: string };

export default function useRequestJson(endpoint: string, config: RequestConfig = {}) {
  const [status, setStatus] = useState<Status>({ stage: "idle" });
  const { stage, data, error } = status;

  useEffect(() => {
    (async function () {
      if (stage === "idle") {
        setStatus({ stage: "loading" });
      }

      if (stage === "loading") {
        try {
          const newData = await requestJson(endpoint, config);
          setStatus({ stage: "resolved", data: newData });
        } catch (e) {
          setStatus({ stage: "rejected", error: e instanceof Error ? e.message : String(e) });
        }
      }
    })();
  }, [config, endpoint, stage]);

  return { loading: stage === "idle" || stage === "loading", data, error };
}
