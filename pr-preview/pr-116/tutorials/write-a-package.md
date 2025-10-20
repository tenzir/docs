# Write a package

This tutorial walks you through building a package for an SSL blacklist. Packages bundle pipelines, operators, contexts, and examples. You can [install packages](/guides/basic-usage/install-a-package) from the [Tenzir Library](https://app.tenzir.com/library) or deploy them as code.

## Map the use case

[Section titled “Map the use case”](#map-the-use-case)

We’ll pick an example from the SecOps space: detect malicious certificates listed on the [SSLBL blocklist](https://sslbl.abuse.ch/).

This involves three primary actions:

1. Build a lookup table of SHA-1 hashes that mirror SSLBL data.
2. Extract SHA1 hashes of certificates in OCSF Network Activity events and compare them against the lookup table.
3. Tag matching events with the OCSF OSINT profile, so that downstream tools can escalate the match into an alert or detection finding.

We’ll begin with the managing the lookup table. But first we need to get the package scaffolding in place.

## Create the package scaffold

[Section titled “Create the package scaffold”](#create-the-package-scaffold)

Create a directory named `sslbl` and add the standard package layout:

* sslbl/

  * examples/ Runnable snippets for users

    * …

  * operators/ Reusable building blocks for pipelines

    * …

  * pipelines/ Deployable pipelines

    * …

  * tests/ Integration tests

    * …

  * package.yaml Manifest: metadata, contexts, and inputs

## Add the package manifest

[Section titled “Add the package manifest”](#add-the-package-manifest)

The [`package.yaml`](/packages/sslbl/package.yaml) is the **package manifest**. I contains descriptive metadata, but also the definitions of contexts and inputs, as we shall see below.

### Add descriptive metadata

[Section titled “Add descriptive metadata”](#add-descriptive-metadata)

sslbl/package.yaml

```yaml
name: SSLBL
author: Tenzir
author_icon: https://github.com/tenzir.png
package_icon: |
  https://raw.githubusercontent.com/tenzir/library/main/sslbl/package.svg
description: |
  The [SSLBL](https://sslbl.abuse.ch/) package provides a lookup table with
  SHA1 hashes of blacklisted certificates for TLS monitoring use cases.
```

### Define the lookup table context

[Section titled “Define the lookup table context”](#define-the-lookup-table-context)

Next, add a lookup table context to the manifest. The node creates the context when you install the package.

sslbl/package.yaml

```yaml
contexts:
  sslbl:
    type: lookup-table
    description: |
      A table keyed by SHA1 hashes of SSL certificates on the SSL blocklist.
```

## Add user-defined operators

[Section titled “Add user-defined operators”](#add-user-defined-operators)

Packages give you the ability to implement **user-defined operators** that live right next to Tenzir’s [built-in operators](/reference/operators). These custom operators are an essential capability to scale your data processing, as you can break down complex operations into smaller, testable building blocks.

### Create the user-defined operators

[Section titled “Create the user-defined operators”](#create-the-user-defined-operators)

First, we create an operator that fetches the latest SSL blocklist from the [SSLBL](https://sslbl.abuse.ch/) website. The operator in (/packages/sslbl/operators/fetch.tql) looks as follows:

operators/fetch.tql

```tql
from_http "https://sslbl.abuse.ch/blacklist/sslblacklist.csv" {
  read_csv comments=true, header="timestamp,SHA1,reason"
}
```

The relative path in the packagage defines the operator name. After installing the package, you can call this operator via `sslbl::fetch`. It will produce events of this shape:

```tql
{
  timestamp: 2014-05-04T08:09:56Z,
  SHA1: "b08a4939fb88f375a2757eaddc47b1fb8b554439",
  reason: "Shylock C&C",
}
```

Let’s create another operator to map this data to [OSINT objects](https://schema.ocsf.io/1.6.0/objects/osint)—the standardized representation of an indicators of compromise (IOCs) in OCSF.

operators/ocsf/to\_osint.tql

```tql
confidence = "High"
confidence_id = 3
created_time = move timestamp
malware = [{
  classification_ids: [3],
  classifications: ["Bot"],
  // The source lists the name as "$NAME C&C" and we drop the C&C suffix.
  name: (move reason).split(" ")[0],
}]
value = move SHA1
type = "Hash"
type_id = 4
```

This pipeline translates the original feed into this shape:

```tql
{
  confidence: "High",
  confidence_id: 3,
  created_time: 2014-05-04T08:09:56Z,
  malware: [
    {
      classification_ids: [
        3,
      ],
      classifications: [
        "Bot",
      ],
      name: "Shylock",
    },
  ],
  value: "b08a4939fb88f375a2757eaddc47b1fb8b554439",
  type: "Hash",
  type_id: 4,
}
```

OCSF Verbosity

You may notice that this shape is a lot more verbose than the original event. Don’t worry, it is absolutely normal when upgrading your raw data to a semantically richer representation like OCSF. You can always trim the feed down again later, either automatically with our [`ocsf::trim`](/reference/operators/ocsf/trim) operator or manually by [`drop`](/reference/operators/drop)ping fields. But while the data is in motion, the additional semantics unlock generic analytics when the context of the original source is long gone.

We’re not done yet. Let’s create one final operator that wraps a single fetch into an OCSF event that describes a single collection of IoCs: the [OSINT Inventory Info](https://schema.ocsf.io/1.6.0/classes/osint_inventory_info) event.

operators/ocsf/to\_osint\_inventory\_info.tql

```tql
// Collect a single fetch into an array of OSINT objects.
summarize osint=collect(this)
// Categorization
activity_id = 2
activity_name = "Collect"
category_uid = 5
category_name = "Discovery"
class_uid = 5021
class_name = "OSINT Inventory Info"
severity_id = 1
severity = "Informational"
type_uid = class_uid * 100 + activity_id
// Additional context attributes
actor = {
  app_name: "Tenzir"
}
metadata = {
  product: {
    name: "SSLBL SSL Certificate Blacklist",
    vendor_name: "abuse.ch",
  },
  version: "1.6.0",
}
// Occurence attributes
time = now()
// Apply Tenzir event metadata
@name = "ocsf.osint_inventory_info"
```

We can now call all three operators in one shot to construct an OCSF event:

```tql
sslbl::fetch
sslbl::ocsf::to_osint
sslbl::ocsf::to_osint_inventory_info
```

Now that we have building blocks, let’s combine them into something meaningful.

OCSF Mapping Tutorial

Mapping data to OCSF can feel like a daunting task. Check out our [dedicated tutorial OCSF mapping](/tutorials/map-data-to-ocsf) where we cover OCSF at great length.

## Add deployable pipelines

[Section titled “Add deployable pipelines”](#add-deployable-pipelines)

With our user-defined operators, we get building blocks, but not yet entire pipelines.

We now create a pipeline that downloads SSLBL data and updates the context periodically so that we always have the latest version of the SSLBL data for enrichment.

The `sslbl::fetch` operator just downloads the blacklist entries once. But the remote data source changes periodically, and we want to always work with the latest version. So we turn the one-shot download into a continuous data feed using the [`every`](/reference/operators/every) operator:

sslbl/pipelines/publish-as-ocsf.tql

```tql
every 1h {
  sslbl::fetch
}
sslbl::ocsf::to_osint
sslbl::ocsf::to_osint_inventory_info
publish "ocsf"
```

This is a closed pipeline, meaning, it has an input operator ([`every`](/reference/operators/every)) and an output operator ([`publish`](/reference/operators/publish)). The pipeline produces a new OCSF Inventory Info event every hour and publishes it to the `ocsf` topic so that other pipelines in the same node can consume it. This is a best-practice design pattern to expose data that you may reuse multiple times.

But instead of publishing the data as OCSF events and subscribing to it afterwards, we can directly update the lookup table from the plain OSINT objects:

sslbl/pipelines/update-lookup-table.tql

```tql
every 1h {
  sslbl::fetch
}
sslbl::ocsf::to_osint
context::update "sslbl", key=value
```

Thanks to our user-defined operators, implementing these two different pipelines doesn’t take much effort.

## Add examples

[Section titled “Add examples”](#add-examples)

To illustrate how others can use the package, we encourage package authors to add a few TQL snippets to the `examples` directory in the package.

### Example 1: One-shot lookup table update

[Section titled “Example 1: One-shot lookup table update”](#example-1-one-shot-lookup-table-update)

Here’s a snippet that perform a single fetch followed by an update of the lookup table:

examples/one-shot-update.tql

```tql
---
description: |
  This example demonstrates how to fetch SSLBL data, convert it to OSINT format,
  and update the context with the new data.
---


sslbl::fetch
sslbl::ocsf::to_osint
context::update "sslbl", key=value
```

### Example 2: Enrich with the context

[Section titled “Example 2: Enrich with the context”](#example-2-enrich-with-the-context)

What do we do with feed of SHA1 hashes that correspond to bad certificates? One natural use case is to look at TLS traffic and compare these values with the SHA1 hashes in the feed.

Here’s a pipeline for this:

examples/enrich-network-activity.tql

```tql
---
description: |
  Subscribe to all OCSF events and extract those network events containing SHA-1
  certificate hashes. Correlate those events with the SSLBL database and attach
  the OSINT profile to matching events.
---


subscribe "ocsf"
where category_uid == 4
// Filter out network events that have SHA1 certificate hashes.
where not tls?.certificate?.fingerprints?.where(x => x.algorithm_id == 2).is_empty()
// Convert the list of SHA1 hashes into a record for enrichment. In the future,
// we'd want to enrich also within arrays. When we unroll we unfortunately lose
// all other certificate hash values, so this is sub-optimal.
unroll tls.certificate.fingerprints
enrich "sslbl",
  key=tls.certificate.fingerprints.value,
  into=_tmp
// Slap OSINT profile onto the event on match.
if _tmp != null {
  osint.add(move _tmp)
  metadata.profiles?.add("osint")
} else {
  drop _tmp
}
publish "ocsf-osint"
```

This pipelines hones in on OCSF Network Activity events (`category_uid == 4`) that come with a SHA1 TLS certificate fingerprint (`algorithm_id == 2`). If we have a matche, we add the `osint` profile to the event and publish it to separate topic `ocsf-osint` for further processing.

### Example 3: Show a summary of the dataset

[Section titled “Example 3: Show a summary of the dataset”](#example-3-show-a-summary-of-the-dataset)

examples/top-malware.tql

```tql
---
description: |
  Inspect all data in the context and count the different malware types,
  rendering the result as a pie chart.
---


context::inspect "sslbl"
select malware = value.malware[0].name
top malware
chart_pie x=malware, y=count
```

## Make your package configurable

[Section titled “Make your package configurable”](#make-your-package-configurable)

To make a package more reusable, **inputs** offer a simple templating mechanism to replace variables with user-provided values.

For example, to replace the hard-coded 1-hour refresh cadence with an input, replace the value with `{{ inputs.refresh_interval }}` in the above pipeline:

sslbl/pipelines/update-as-ocsf.tql

```tql
every {{ inputs.refresh_interval }} {
  sslbl::fetch
}
sslbl::ocsf::to_osint
context::update "sslbl", key=value
```

Then add the input to your `package.yaml`:

sslbl/package.yaml

```yaml
inputs:
  refresh_interval:
    name: Time between context updates
    description: |
      How often the pipeline refreshes the SSLBL lookup table.
    default: 1h
```

Users can accept the default or override the value [during installation](/guides/basic-usage/install-a-package), e.g., when using [`package::add`](/reference/operators/package/add):

```tql
package::add "/path/to/sslbl", inputs={refresh_interval: 24h}
```

## Test your package

[Section titled “Test your package”](#test-your-package)

Testing ensures that you always have a working package during development. The earlier you start, the better!

### Add tests for your operators

[Section titled “Add tests for your operators”](#add-tests-for-your-operators)

Since our package ships with user-defined operators, we highly recommend to write tests for them, for the following reasons:

1. You help users gain confidence in the functionality.
2. You provide illustrative input-output pairs.
3. You evolve faster with less regressions.

Yes, writing tests is often boring and cumbersome. But it doesn’t have to be that way! With our purpose-built [test framework](/reference/test-framework) for the Tenzir ecosystem, it is actually fun. 🕺

Let’s bootstrap the `tests` directory:

```sh
mkdir tests
mkdir tests/inputs # files we reference from tests
```

We’ll put a trimmed version of <https://sslbl.abuse.ch/blacklist/sslblacklist.csv> into `tests/inputs/`:

tests/inputs/sslblacklist.csv

```csv
################################################################
# abuse.ch SSLBL SSL Certificate Blacklist (SHA1 Fingerprints) #
# Last updated: 2025-10-08 06:32:12 UTC                        #
#                                                              #
# Terms Of Use: https://sslbl.abuse.ch/blacklist/              #
# For questions please contact sslbl [at] abuse.ch             #
################################################################
#
# Listingdate,SHA1,Listingreason
2025-10-08 06:32:12,e8f4490420d0b0fc554d1296a8e9d5c35eb2b36e,Vidar C&C
2025-10-08 06:12:48,d9b07483491c0748a479308b29c5c754b92d6e06,ACRStealer C&C
2025-10-08 06:10:17,31740cfc82d05c82280fd6cce503543a150e861f,Rhadamanthys C&C
2025-10-08 06:09:30,302ed4eeb28e1e8ca560c645b8eb342498300134,Rhadamanthys C&C
2025-10-08 06:08:57,eaf3a17e7f86a626afcfce9f4a85ac20a7f62a67,Rhadamanthys C&C
2025-10-07 18:25:40,5b7f9db9187f5ccfaf1bcdb49f9d1db0396dabde,ACRStealer C&C
2025-10-07 18:24:31,70cf9d9812b38101361bd8855274bf1766840837,OffLoader C&C
2025-10-07 18:24:30,6e4ea638522aa0f5f6e7f14571f5ff89826f6e07,OffLoader C&C
2025-10-07 06:15:35,fc0afaa2e30b121c2d929827afd69e4c63669ac3,ACRStealer C&C
2025-10-07 06:14:59,7948950f56e714a3ecf853664ffa65ae86a70051,QuasarRAT C&C
2025-10-07 06:14:51,1fcb051a4dfa5999fee4877bbd4141f22b3a4074,AsyncRAT C&C
2025-10-07 05:53:50,e5632523b028288923c241251c9f1b6275e3db61,OffLoader C&C
2025-10-07 05:53:49,8b6d220268c0c6206f4164fb8422bac2653924b4,OffLoader C&C
2025-10-07 05:53:07,9d686b89970266a03647f2118f143ecb47f59188,Rhadamanthys C&C
2025-10-07 05:52:18,89e31fdaeefdaddcf0554e3b3e2d48c1b683abbd,Rhadamanthys C&C
2025-10-07 05:51:35,79a805627bc3b86aa42272728209fc28019de02f,Rhadamanthys C&C
2025-10-06 11:01:21,fc55fdafe2f70b2f409bbf7f89613ca2ca915181,QuasarRAT C&C
2025-10-06 06:44:36,6f932e3a0bf05164eb2bf02cfb5a29c1b210ebb2,Mythic C&C
2025-10-06 06:44:31,8f442060bb10d59eca5d8c9b7cd6d8653a3c3ac8,Vidar C&C
2025-10-06 06:44:27,7cd14588ba5bbeb56ce42f05023bd2f5159d8f19,Vidar C&C
2025-10-06 06:42:52,b36f4c106bf048b68b43b448835f5dab1c982083,QuasarRAT C&C
2025-10-04 10:46:00,bf0b77de0046e53200e5287be0916f6921e86336,ACRStealer C&C
2025-10-04 10:44:54,e33db1f571fdb786ecc8e5a4b43131fdcbe2c0d1,ACRStealer C&C
2025-10-04 10:44:38,c75f347253ebf8a4c26053d2db7ce5bf3e1417f5,QuasarRAT C&C
2025-10-04 10:43:27,fc216972dbec1903de5622107dc97b6c33535074,QuasarRAT C&C
2025-10-04 10:43:21,2e14c326f940b962e2ecefe69a5ee4fc12d26cab,AsyncRAT C&C
```

Let’s test the operator that maps our input to OCSF OSINT objects:

tests/ocsf/to\_osint.tql

```tql
from_file f"{env("TENZIR_INPUTS")}/sslblacklist.csv" {
  read_csv comments=true, header="timestamp,SHA1,reason"
}
sslbl::ocsf::to_osint
head 1
```

We first watch the terminal output it in passthrough mode:

```sh
uvx tenzir-test --passthrough
```

tests/ocsf/to\_osint.txt

```tql
{
  confidence: "High",
  confidence_id: 3,
  created_time: 2025-10-08T06:32:12Z,
  malware: [
    {
      classification_ids: [
        3,
      ],
      classifications: [
        "Bot",
      ],
      name: "Vidar",
    },
  ],
  value: "e8f4490420d0b0fc554d1296a8e9d5c35eb2b36e",
  type: "Hash",
  type_id: 4,
}
```

As expected, a valid OCSF OSINT object. Let’s make confirm this as our new baseline:

```sh
uvx tenzir-test --update
```

This created a [`to_osint.txt`](/packages/sslbl/tests/ocsf/to_osint.txt) file next to the [`to_osint.tql`](/packages/sslbl/tests/ocsf/to_osint.tql) file. Future runs will use this baseline for comparisons.

Continue to test the remaining operators, or add additional tests for some examples.

### Test contexts and node interaction

[Section titled “Test contexts and node interaction”](#test-contexts-and-node-interaction)

Our package defines a context that lives in a node. Writing tests with nodes is a bit more involved than writing tests for stateless operators that we can simply run through the `tenzir` binary.

To test node interactions, we need to use the **suite** concept from the test framework, which spins up a single fixture and then executes a series of tests sequentially against that fixture. With that capability, we can finally test the multi-stage process of updating the context, inspecting it, and using it for an enrichment.

Defining a suite doesn’t take much, just add a `test.yaml` file to a sub-directory that represents the suite of tests. We’ll do this:

* sslbl/tests/context/

  * 01-context-list.tql
  * 02-context-update.tql
  * 03-context-inspect.tql
  * test.yaml

Here’s the test suite definition:

tests/context/test.yaml

```yaml
suite: context
fixtures: [node]
timeout: 30
```

Let’s take a look at our tests:

tests/context/01-context-list.tql

```tql
// Ensure the package installed the context properly.
context::list
```

Then load our input into the node’s lookup table:

tests/context/02-context-update.tql

```tql
from_file f"{env("TENZIR_INPUTS")}/sslblacklist.csv" {
  read_csv comments=true, header="timestamp,SHA1,reason"
}
context::update "sslbl",
  key=SHA1,
  value={time: timestamp, malware: reason}
```

Finally ensure that the lookup table has the expected values:

tests/context/03-context-inspect.tql

```tql
// Summarize the context.
context::inspect "sslbl"
select malware = value.malware
top malware
```

Automatic package installation

When the test harness invokes the `tenzir` (as runner) and `tenzir-node` binary (as fixture), it passes the `--package-dirs` option in both cases. This ensures that user-defined operators are available for testing with the runner and contexts in the fixture. When writing tests, you can simply assume that the package is installed at the node.

## Share and contribute

[Section titled “Share and contribute”](#share-and-contribute)

Phew, you made it! You now have a reusable package. 🎉

Now that you have a package, what’s next?

1. Join our [Discord server](/discord) and showcase the package in the `show-and-tell` channel to gather feedback.
2. If you deem it useful for everyone, open a pull request in our [Community Library on GitHub](https://github.com/tenzir/library). Packages from this library appear automatically in the [Tenzir Library](https://app.tenzir.com/library).
3. Spread the word on social media and tag us so we can amplify it.

AI-based package creation

It’s quite a bit of work to manually create a package. In the age of AI and modern agentic tooling, you have powertools available to fully automate this task. Stay tuned for updates on our [MCP Server](/reference/mcp-server), as we have plans to make package creation a 100% hands-off-keyboard activity.