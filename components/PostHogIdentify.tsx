"use client";

import { useUser } from "@clerk/nextjs";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export default function PostHogIdentify() {
  const { user, isSignedIn } = useUser();
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;

    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      });
    } else {
      posthog.reset();
    }
  }, [posthog, isSignedIn, user]);

  return null;
}
