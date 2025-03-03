import { openAPISidebarGroups } from 'starlight-openapi'

export const sidebar = [
  {
    label: 'Docs',
    items: [
      {
        label: 'Guides',
        items: [
          'guides/quickstart',
          {
            label: 'Setup',
            collapsed: true,
            items: [
              'guides/setup/create-an-account',
              'guides/setup/size-a-node',
              'guides/setup/provision-a-node',
              {
                label: "Deploy a node",
                autogenerate: { directory: 'guides/setup/deploy-a-node' },
              },
              'guides/setup/configure-a-node',
              'guides/setup/start-the-node-api',
              'guides/setup/tune-node-performance',
              'guides/setup/deploy-the-platform',
            ],
          },
          {
            label: 'Usage',
            collapsed: true,
            items: [
              'guides/usage/install-a-package',
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
          {
            label: 'API',
            items: openAPISidebarGroups,
          },
        ],
      },
    ],
  },
  {
    label: 'Integrations',
    items: [
      {
        label: 'Overview',
        slug: 'integrations'
      },
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
    ],
  },
  // NB: this needs to come *last* in the array. Otherwise, the auto-switching
  // isn't working!
  {
    label: 'navbar',
    items: [
      { label: 'Docs', link: '/' },
      { label: 'Integrations', link: '/integrations' },
    ],
  },
];