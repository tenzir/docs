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
        ],
      },
    ],
  },
  {
    label: 'Integrations',
    items: [
      {
        label: 'Amazon',
        autogenerate: { directory: 'integrations/amazon' },
      },
    ],
  },
  {
    label: 'API',
    items: openAPISidebarGroups,
  },
  // NB: this needs to come *last* in the array. Otherwise, the auto-switching
  // isn't working!
  {
    label: 'navbar',
    items: [
      { label: 'Docs', link: '/' },
      { label: 'Integrations', link: 'integrations/amazon/security-lake' },
      { label: 'API', link: 'api/node' },
    ],
  },
];
