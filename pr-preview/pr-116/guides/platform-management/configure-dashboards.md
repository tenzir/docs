# Configure dashboards

You can pre-define dashboards for your [static workspaces](/guides/platform-management/configure-workspaces#define-static-workspaces). This practice provides users with ready-to-use visualizations when they access the workspace.

Use the `dashboards` key in your workspace configuration:

workspace.yaml

```yaml
workspaces:
  static0:
    name: Example Workspace
    # Other workspace configuration...
    dashboards:
      dashboard1: # Unique dashboard identifier
        name: Example Dashboard # Display name in the UI
        cells: # Dashboard cells/widgets
          - name: Partition Summary # Cell name
            definition: | # Pipeline to execute
              partitions
              where not internal
              summarize events=sum(events), schema
              sort -events
            type: table # Visualization type (table, bar, line, etc.)
            x: 0 # X-coordinate in the dashboard grid
            y: 0 # Y-coordinate in the dashboard grid
            w: 12 # Width in grid units
            h: 12 # Height in grid units
```

Dashboard Coordinates

The dashboard grid has a width of 24 units. When you position cells, ensure that `x + w ≤ 24`. This prevents cells from extending beyond the grid.

Users can modify these dashboards via the UI after their initial setup. However, the platform resets any changes to the configuration-defined state when it restarts.