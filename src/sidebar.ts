import {
  nodeAPISidebarGroup,
  platformAPISidebarGroup,
} from "./sidebar-shared-groups.js";

export const guides = [
  "guides/quickstart",
  "guides/account-creation",
  {
    label: "Node Setup",
    collapsed: true,
    items: [
      "guides/node-setup",
      "guides/node-setup/provision-a-node",
      "guides/node-setup/size-a-node",
      "guides/node-setup/deploy-a-node",
      "guides/node-setup/configure-a-node",
      "guides/node-setup/start-the-api",
      "guides/node-setup/tune-performance",
    ],
  },
  {
    label: "Platform Setup",
    collapsed: true,
    items: [
      "guides/platform-setup",
      "guides/platform-setup/choose-a-scenario",
      "guides/platform-setup/configure-reverse-proxy",
      "guides/platform-setup/configure-internal-services",
      "guides/platform-setup/configure-identity-provider",
      "guides/platform-setup/configure-database",
      "guides/platform-setup/configure-blob-storage",
      "guides/platform-setup/configure-secret-store",
      "guides/platform-setup/run-the-platform",
    ],
  },
  {
    label: "MCP Setup",
    collapsed: true,
    items: ["guides/mcp-setup/install-mcp-server"],
  },
  {
    label: "Basic Usage",
    collapsed: true,
    items: [
      "guides/basic-usage/run-pipelines",
      "guides/basic-usage/manage-a-pipeline",
      "guides/basic-usage/install-a-package",
      "guides/basic-usage/collect-metrics",
    ],
  },
  {
    label: "Data Loading",
    collapsed: true,
    items: [
      "guides/data-loading/read-and-watch-files",
      "guides/data-loading/fetch-data-from-apis",
    ],
  },
  {
    label: "Data Shaping",
    collapsed: true,
    items: [
      "guides/data-shaping/shape-data",
      "guides/data-shaping/filter-and-select-data",
      "guides/data-shaping/transform-basic-values",
      "guides/data-shaping/manipulate-strings",
      "guides/data-shaping/work-with-time",
      "guides/data-shaping/transform-collections",
      "guides/data-shaping/aggregate-and-summarize",
      "guides/data-shaping/slice-and-sample-data",
      "guides/data-shaping/extract-structured-data-from-text",
      "guides/data-shaping/convert-data-formats",
      "guides/data-shaping/reshape-complex-data",
      "guides/data-shaping/deduplicate-events",
    ],
  },
  {
    label: "Edge Storage",
    collapsed: true,
    items: [
      "guides/edge-storage/import-into-a-node",
      "guides/edge-storage/export-from-a-node",
      "guides/edge-storage/show-available-schemas",
      "guides/edge-storage/transform-data-at-rest",
    ],
  },
  {
    label: "Enrichment",
    collapsed: true,
    items: [
      "guides/enrichment/work-with-lookup-tables",
      "guides/enrichment/enrich-with-network-inventory",
      "guides/enrichment/enrich-with-threat-intel",
      "guides/enrichment/execute-sigma-rules",
    ],
  },
  {
    label: "Platform Management",
    collapsed: true,
    items: [
      "guides/platform-management/configure-workspaces",
      "guides/platform-management/configure-dashboards",
      "guides/platform-management/use-ephemeral-nodes",
    ],
  },
  {
    label: "Testing",
    collapsed: true,
    items: [
      "guides/testing/write-tests",
      "guides/testing/create-fixtures",
      "guides/testing/add-custom-runners",
    ],
  },
  {
    label: "Contribution",
    collapsed: true,
    items: [
      "guides/contribution/code-of-conduct",
      "guides/contribution/workflow",
      "guides/contribution/coding-style",
      "guides/contribution/build-environment",
      "guides/contribution/documentation",
      "guides/contribution/security",
    ],
  },
  {
    label: "Development",
    collapsed: true,
    items: [
      "guides/development/build-from-source",
      "guides/development/build-the-docker-image",
      "guides/development/write-a-node-plugin",
    ],
  },
];

export const tutorials = [
  "tutorials/learn-idiomatic-tql",
  "tutorials/map-data-to-ocsf",
  "tutorials/plot-data-with-charts",
  "tutorials/write-a-package",
];

export const explanations = [
  {
    label: "Architecture",
    items: [
      "explanations/architecture",
      "explanations/architecture/pipeline",
      "explanations/architecture/node",
      "explanations/architecture/platform",
    ],
  },
  {
    label: "Language (TQL)",
    items: [
      "explanations/language",
      "explanations/language/types",
      "explanations/language/expressions",
      "explanations/language/statements",
      "explanations/language/programs",
    ],
  },
  "explanations/configuration",
  "explanations/secrets",
  "explanations/enrichment",
  "explanations/packages",
  "explanations/glossary",
  "explanations/faqs",
];

export const reference = [
  {
    label: "Operators",
    link: "reference/operators",
  },
  {
    label: "Functions",
    link: "reference/functions",
  },
  {
    label: "MCP Server",
    link: "reference/mcp-server",
  },
  {
    label: "Node",
    items: ["reference/node/configuration", nodeAPISidebarGroup],
  },
  {
    label: "Platform",
    items: [
      "reference/platform/configuration",
      "reference/platform/command-line-interface",
      platformAPISidebarGroup,
    ],
  },
  {
    label: "Test Framework",
    link: "reference/test-framework",
  },
];

export const integrations = [
  {
    label: "Amazon",
    items: [
      "integrations/amazon",
      "integrations/amazon/msk",
      "integrations/amazon/s3",
      "integrations/amazon/security-lake",
      "integrations/amazon/sqs",
    ],
  },
  {
    label: "Google",
    items: [
      "integrations/google/cloud-logging",
      "integrations/google/cloud-storage",
      "integrations/google/cloud-pubsub",
      "integrations/google/secops",
    ],
  },
  {
    label: "Microsoft",
    items: [
      "integrations/microsoft/azure-blob-storage",
      "integrations/microsoft/azure-log-analytics",
      "integrations/microsoft/defender",
      "integrations/microsoft/windows-event-logs",
    ],
  },
  {
    label: "Message Brokers",
    items: [
      "integrations/amqp",
      "integrations/fluent-bit",
      "integrations/kafka",
      "integrations/zeromq",
    ],
  },
  {
    label: "Protocols",
    items: [
      "integrations/email",
      "integrations/file",
      "integrations/ftp",
      "integrations/http",
      "integrations/nic",
      "integrations/syslog",
      "integrations/tcp",
      "integrations/udp",
    ],
  },
  {
    label: "Data Tools",
    items: [
      "integrations/clickhouse",
      "integrations/elasticsearch",
      "integrations/graylog",
      "integrations/opensearch",
      "integrations/snowflake",
      "integrations/splunk",
    ],
  },
  {
    label: "Security Tools",
    items: [
      "integrations/sentinelone-data-lake",
      "integrations/suricata",
      "integrations/velociraptor",
      "integrations/zeek",
      "integrations/zscaler",
    ],
  },
];
