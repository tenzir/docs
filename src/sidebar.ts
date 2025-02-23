import { openAPISidebarGroups } from 'starlight-openapi'

export const sidebar = [
  {
    label: 'Docs',
    items: [
      {
        label: 'Guides',
        items: [{ label: 'Quickstart', slug: 'guides/quickstart' }],
      },
      {
        label: 'Tutorials',
        autogenerate: { directory: 'tutorials' },
      },
      {
        label: 'Explanations',
        autogenerate: { directory: 'explanations' },
      },
      {
        label: 'Reference',
        items: [
          {
            label: 'Language',
            autogenerate: { directory: 'reference/language' },
          },
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
      { label: 'Overview', slug: 'integrations' },
      {
        label: 'Integrations',
        items: [
          {
            label: 'Amazon',
            items: [
              { label: 'MSK', slug: 'integrations/amazon/msk' },
              { label: 'S3', slug: 'integrations/amazon/s3' },
              { label: 'Security Lake', slug: 'integrations/amazon/security-lake' },
              { label: 'SQS', slug: 'integrations/amazon/sqs' },
            ],
          },
          {
            label: 'Google',
            items: [
              { label: 'Cloud Storage', slug: 'integrations/google/cloud-storage' },
              { label: 'Pub/Sub', slug: 'integrations/google/pubsub' },
            ],
          },
          {
            label: 'Microsoft',
            items: [
              {
                label: 'Azure',
                items: [
                  { label: 'Blob Storage', slug: 'integrations/microsoft/azure/blob-storage' },
                  { label: 'Log Analytics', slug: 'integrations/microsoft/azure/log-analytics' },
                ],
              },
              { label: 'Defender', slug: 'integrations/microsoft/defender' },
              { label: 'Windows Event Logs', slug: 'integrations/microsoft/windows-event-logs' },
            ],
          },
          { label: 'AMQP', slug: 'integrations/amqp' },
          { label: 'Elasticsearch', slug: 'integrations/elasticsearch' },
          { label: 'Email', slug: 'integrations/email' },
          { label: 'File', slug: 'integrations/file' },
          { label: 'Fluent Bit', slug: 'integrations/fluent-bit' },
          { label: 'FTP', slug: 'integrations/ftp' },
          { label: 'Graylog', slug: 'integrations/graylog' },
          { label: 'HTTP(S)', slug: 'integrations/http' },
          { label: 'Kafka', slug: 'integrations/kafka' },
          { label: 'Network Interface', slug: 'integrations/nic' },
          { label: 'OpenSearch', slug: 'integrations/opensearch' },
          { label: 'Snowflake', slug: 'integrations/snowflake' },
          { label: 'Splunk', slug: 'integrations/splunk' },
          { label: 'Suricata', slug: 'integrations/suricata' },
          { label: 'TCP', slug: 'integrations/tcp' },
          { label: 'UDP', slug: 'integrations/udp' },
          { label: 'Velociraptor', slug: 'integrations/velociraptor' },
          { label: 'Zeek', slug: 'integrations/zeek' },
          { label: 'ZeroMQ', slug: 'integrations/zeromq' },
          { label: 'Zscaler', slug: 'integrations/zscaler' },
        ],
      }
    ]
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
