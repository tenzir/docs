import { openAPISidebarGroups } from "starlight-openapi";

export const guides = [
  "guides/quickstart",
  {
    label: "Setup",
    items: [
      "guides/setup/create-an-account",
      {
        label: "Node",
        collapsed: true,
        items: [
          "guides/setup/node/provision-a-node",
          "guides/setup/node/size-a-node",
          {
            label: "Deploy a node",
            autogenerate: { directory: "guides/setup/node/deploy-a-node" },
          },
          "guides/setup/node/configure-a-node",
          "guides/setup/node/start-the-node-api",
          "guides/setup/node/tune-performance",
        ],
      },
      {
        label: "Platform",
        collapsed: true,
        items: [
          "guides/setup/platform",
          "guides/setup/platform/choose-a-scenario",
          {
            label: "Configure the Services",
            items: [
              "guides/setup/platform/configure-the-services/reverse-proxy",
              "guides/setup/platform/configure-the-services/database",
              "guides/setup/platform/configure-the-services/blob-storage",
              "guides/setup/platform/configure-the-services/identity-provider",
            ],
          },
          "guides/setup/platform/adjust-tls-settings",
          "guides/setup/platform/run-the-platform",
        ],
      },
    ],
  },
  {
    label: "Usage",
    items: [
      {
        label: "Basics",
        items: [
          "guides/usage/basics/run-pipelines",
          "guides/usage/basics/manage-a-pipeline",
          "guides/usage/basics/install-a-package",
          "guides/usage/basics/collect-metrics",
        ],
      },
      {
        label: "Data",
        items: [
          "guides/usage/data/shape-data",
          "guides/usage/data/parse-nested-data",
          "guides/usage/data/deduplicate-events",
        ],
      },
      {
        label: "Storage",
        items: [
          "guides/usage/storage/import-into-a-node",
          "guides/usage/storage/export-from-a-node",
          "guides/usage/storage/show-available-schemas",
          "guides/usage/storage/transform-data-at-rest",
        ],
      },
      {
        label: "Security",
        items: [
          "guides/usage/security/enrich-with-network-inventory",
          "guides/usage/security/enrich-with-threat-intel",
          "guides/usage/security/execute-sigma-rules",
        ],
      },
      {
        label: "Management",
        items: [
          "guides/usage/management/use-the-platform-cli",
          "guides/usage/management/define-static-workspaces",
        ],
      },
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
      "guides/contribution/changelog",
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
  "tutorials/map-data-to-ocsf",
  "tutorials/plot-data-with-charts",
  "tutorials/write-a-package",
];

export const explanations = [
  {
    label: "Architecture",
    autogenerate: { directory: "explanations/architecture" },
  },
  "explanations/configuration",
  "explanations/enrichment",
  "explanations/packages",
  "explanations/glossary",
  "explanations/faqs",
];

export const reference = [
  "reference/operators",
  "reference/functions",
  {
    label: "Language",
    items: [
      "reference/language/statements",
      "reference/language/expressions",
      "reference/language/types",
    ],
  },
  "reference/configuration",
  "reference/platform-cli",
  {
    label: "API",
    items: openAPISidebarGroups,
  },
];

export const integrations = [
  {
    label: "Integrations",
    items: [
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
          "integrations/google/pubsub",
          "integrations/google/secops",
        ],
      },
      {
        label: "Microsoft",
        items: [
          {
            label: "Azure",
            items: [
              "integrations/microsoft/azure/blob-storage",
              "integrations/microsoft/azure/log-analytics",
            ],
          },
          "integrations/microsoft/defender",
          "integrations/microsoft/windows-event-logs",
        ],
      },
      "integrations/amqp",
      "integrations/elasticsearch",
      "integrations/email",
      "integrations/file",
      "integrations/fluent-bit",
      "integrations/ftp",
      "integrations/graylog",
      "integrations/http",
      "integrations/kafka",
      "integrations/nic",
      "integrations/opensearch",
      "integrations/snowflake",
      "integrations/splunk",
      "integrations/suricata",
      "integrations/syslog",
      "integrations/tcp",
      "integrations/udp",
      "integrations/velociraptor",
      "integrations/zeek",
      "integrations/zeromq",
      "integrations/zscaler",
    ],
  },
];
