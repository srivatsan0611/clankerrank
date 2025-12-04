const BRAINTRUST_API_KEY = process.env.BRAINTRUST_API_KEY;
const NEXT_PUBLIC_POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (!BRAINTRUST_API_KEY) {
  throw new Error("BRAINTRUST_API_KEY is not set");
}

if (!NEXT_PUBLIC_POSTHOG_KEY) {
  throw new Error("NEXT_PUBLIC_POSTHOG_KEY is not set");
}

export const env = {
  BRAINTRUST_API_KEY,
  NEXT_PUBLIC_POSTHOG_KEY,
};
