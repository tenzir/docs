# Platform

The **platform** provides *fleet management* for [nodes](/explanations/architecture/node). With an API and web interface, the platform offers user and workspace administration, authentication via external identity providers (IdP), and dashboards consisting of pipeline-powered charts.

There exist three primary entities in the platform:

1. **Users**: Authenticated by an Identity Provider (IdP)
2. **Organizations**: Manage billing/licencse, members, and workspaces
3. **Workspace**: A logical grouping of nodes, secrets, and dashboards.

The diagram below illustrates their relationship.

![Platform Components](/_astro/platform-components.Bpqj86Ga_19DKCs.svg)

A user inside an organization is called a **member**. The organization configures what members have access to what workspaces.

Organizations

Organizations are not available in the free **Community Edition**. Please see [tenzir.com/pricing](https://tenzir.com/pricing) for a detailed feature comparison.

## Data Model

[Section titled “Data Model”](#data-model)

The following diagram visualizes the platform’s data model (highlighted) and how the entities relate to each other with respect to their multiplicities.

![Platform Data Model](/_astro/platform-data-model.BNks0SgU_19DKCs.svg)

It’s important to note that a node can only be part of one workspace. There is no support for “multi-homing” as it would create non-trivial questions about how to reconcile secrets and permissions from multiple workspaces.

## Deployment Modes

[Section titled “Deployment Modes”](#deployment-modes)

Based on the [Edition](https://tenzir.com/pricing) of Tenzir, you have different deployment modes of the platform. The below diagram illustrates the variants.

![Deployment Modes](/_astro/deployment-modes.CUEE2kAI_19DKCs.svg)

* **Community Edition**: geared towards single-user deployments, the Community Edition only associates a personal workspace with every user.
* **Professional Edition**: geared towards small-business deployments, the Professional Edition features organizations for allowing multiple users to collaborate.
* **Enterprise Edition**: geared towards large enterprise deployments, the Enterprise Edition supports multiple additional enterprise features like external secrets management, RBAC, and audit logs.
* **Sovereign Edition**: geared towards on-prem deployments, the Sovereign Edition allows full control over all aspects of the Tenzir Platform, including multiple platform instances, multiple organizations within each platform, and integration with existing on-prem infrastructure.

The Sovereign Edition is best suited for service providers that need strict data segregation, either by deploying one platform instance per customer or by instantiating one organization per customer. Dedicated platforms per customer provide physical data separation at the cost of higher management overhead, whereas an organization-based multi tenancy approach is a logical separation method with shared underlying resources, yet easier to manage.