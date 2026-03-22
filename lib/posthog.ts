import { usePostHog as usePostHogOriginal } from "posthog-js/react";
import { useCallback } from "react";

export function usePostHog() {
  const posthog = usePostHogOriginal();

  const capture = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      posthog?.capture(event, properties);
    },
    [posthog]
  );

  return { capture };
}
