/**
 * Search weight configuration for pagefind ranking.
 *
 * Weights must be between 0.0 and 10.0:
 * - 10.0 = Highest priority
 * - 5.0 = Medium priority
 * - 1.0 = Low priority
 * - 0.1 = Minimal priority
 *
 * Configure weights for different documentation sections to control
 * their prominence in search results.
 */

export interface SearchWeightConfig {
  /** Path pattern to match against */
  pattern: string;
  /** Weight for the page (must be between 0.0 and 10.0) */
  weight: number;
  /** Metadata for search result categorization/filtering */
  metadata?: {
    /** Document type for search result badges */
    type: string;
  };
}

/**
 * Search weight configurations in priority order.
 * First matching pattern wins.
 */
export const searchWeights: SearchWeightConfig[] = [
  // Operator reference pages - highest priority
  {
    pattern: "reference/operators/",
    weight: 10.0,
    metadata: { type: "Operator" },
  },

  // Function reference pages
  {
    pattern: "reference/functions/",
    weight: 9.5,
    metadata: { type: "Function" },
  },

  // API reference pages
  {
    pattern: "reference/platform/api/",
    weight: 8.5,
    metadata: { type: "API" },
  },
  {
    pattern: "reference/node/api/",
    weight: 8.5,
    metadata: { type: "API" },
  },

  // General reference pages
  {
    pattern: "reference/",
    weight: 7.0,
    metadata: { type: "Reference" },
  },

  // Guide pages - medium priority
  {
    pattern: "guides/",
    weight: 5.0,
    metadata: { type: "Guide" },
  },

  // Integration pages
  {
    pattern: "integrations/",
    weight: 4.5,
    metadata: { type: "Integration" },
  },

  // Tutorial pages
  {
    pattern: "tutorials/",
    weight: 4.0,
    metadata: { type: "Tutorial" },
  },

  // Explanation pages
  {
    pattern: "explanations/",
    weight: 3.0,
    metadata: { type: "Explanation" },
  },

  // Changelog pages - lowest priority
  {
    pattern: "changelog/",
    weight: 1.0,
    metadata: { type: "Changelog" },
  },
];

/**
 * Get search weights for a given path.
 * Returns the first matching configuration or undefined if no match.
 */
export function getSearchWeight(path: string): SearchWeightConfig | undefined {
  return searchWeights.find((config) => path.includes(config.pattern));
}
