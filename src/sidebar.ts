import { openAPISidebarGroups } from 'starlight-openapi'

export const docs_sidebar = [
  {
    label: 'Guides',
    items: [
      'guides/quickstart',
      {
        label: 'Setup',
        collapsed: true,
        items: [
          'guides/setup/create-an-account',
          {
            label: 'Node',
            collapsed: true,
            items: [
              'guides/setup/node/provision-a-node',
              'guides/setup/node/size-a-node',
              {
                label: "Deploy a node",
                autogenerate: { directory: 'guides/setup/node/deploy-a-node' },
              },
              'guides/setup/node/configure-a-node',
              'guides/setup/node/start-the-node-api',
              'guides/setup/node/tune-node-performance',
            ],
          },
          {
            label: 'Platform',
            collapsed: true,
            items: [
              'guides/setup/platform/deploy-the-platform',
              'guides/setup/platform/manage-the-platform',
              {
                label: 'Configure the IdP',
                items: [
                  'guides/setup/platform/configure-the-idp/keycloak',
                  'guides/setup/platform/configure-the-idp/microsoft-entra-id',
                ],
              },
            ],
          },
        ],
      },
      {
        label: 'Usage',
        collapsed: true,
        items: [
          {
            label: 'Basics',
            collapsed: true,
            items: [
              {
                label: 'Basics',
                items: [
                  'guides/usage/basics/run-pipelines',
                  'guides/usage/basics/manage-a-pipeline',
                  'guides/usage/basics/install-a-package',
                  'guides/usage/basics/collect-metrics',
                ]
              },
              {
                label: 'Data',
                items: [
                  'guides/usage/data/shape-data',
                  'guides/usage/data/parse-nested-data',
                  'guides/usage/data/deduplicate-events',
                ]
              },
              {
                label: 'Storage',
                items: [
                  'guides/usage/storage/import-into-a-node',
                  'guides/usage/storage/export-from-a-node',
                  'guides/usage/storage/show-available-schemas',
                  'guides/usage/storage/transform-data-at-rest',
                ]
              },
              {
                label: 'Security',
                items: [
                  'guides/usage/security/enrich-with-network-inventory',
                  'guides/usage/security/enrich-with-threat-intel',
                  'guides/usage/security/execute-sigma-rules',
                ]
              },
            ],
          },
          {
            label: 'Contribution',
            collapsed: true,
            items: [
              'guides/contribution/code-of-conduct',
              'guides/contribution/workflow',
              'guides/contribution/coding-style',
              'guides/contribution/build-environment',
              'guides/contribution/changelog',
              'guides/contribution/documentation',
              'guides/contribution/security',
            ],
          },
          {
            label: 'Development',
            collapsed: true,
            items: [
              'guides/development/build-from-source',
              'guides/development/build-the-docker-image',
              'guides/development/write-a-node-plugin',
            ],
          },
        ],
      },
      {
        label: 'Contribution',
        collapsed: true,
        items: [
          'guides/contribution/code-of-conduct',
          'guides/contribution/workflow',
          'guides/contribution/coding-style',
          'guides/contribution/build-environment',
          'guides/contribution/changelog',
          'guides/contribution/documentation',
          'guides/contribution/security',
        ],
      },
      {
        label: 'Development',
        collapsed: true,
        items: [
          'guides/development/build-from-source',
          'guides/development/build-the-docker-image',
          'guides/development/write-a-node-plugin',
        ],
      },
    ],
  },
  {
    label: 'Tutorials',
    autogenerate: { directory: 'tutorials' },
  },
  {
    label: 'Explanations',
    items: [
      {
        label: 'Architecture',
        autogenerate: { directory: 'explanations/architecture' },
      },
      'explanations/configuration',
      'explanations/enrichment',
      'explanations/packages',
      'explanations/glossary',
      'explanations/faqs',
    ],
  },
  {
    label: 'Reference',
    items: [
      {
        label: 'Language',
        items: [
          'reference/language/statements',
          'reference/language/expressions',
          'reference/language/types',
        ],
      },
      'reference/configuration',
      'reference/platform-cli',
      {
        label: 'API',
        items: openAPISidebarGroups,
      },
    ],
  },
];

export const integrations_sidebar = [
  {
    label: 'Integrations',
    items: [
      {
        label: 'Amazon',
        items: [
          'integrations/amazon',
          'integrations/amazon/msk',
          'integrations/amazon/s3',
          'integrations/amazon/security-lake',
          'integrations/amazon/sqs',
        ],
      },
      {
        label: 'Google',
        items: [
          'integrations/google/cloud-storage',
          'integrations/google/pubsub',
        ],
      },
      {
        label: 'Microsoft',
        items: [
          {
            label: 'Azure',
            items: [
              'integrations/microsoft/azure/blob-storage',
              'integrations/microsoft/azure/log-analytics',
            ],
          },
          'integrations/microsoft/defender',
          'integrations/microsoft/windows-event-logs',
        ],
      },
      'integrations/amqp',
      'integrations/elasticsearch',
      'integrations/email',
      'integrations/file',
      'integrations/fluent-bit',
      'integrations/ftp',
      'integrations/graylog',
      'integrations/http',
      'integrations/kafka',
      'integrations/nic',
      'integrations/opensearch',
      'integrations/snowflake',
      'integrations/splunk',
      'integrations/suricata',
      'integrations/tcp',
      'integrations/udp',
      'integrations/velociraptor',
      'integrations/zeek',
      'integrations/zeromq',
      'integrations/zscaler',
    ],
  },
];
