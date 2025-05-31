# Scripts Directory

This directory contains utility scripts for maintaining the documentation.

## Overview Generation

The overview generation system automatically creates the main reference pages (functions and operators) from individual documentation files.

### Function Overview Generation

The function overview generation system automatically creates the main functions reference page from individual function documentation files.

### How it works

1. **Individual function files** in `src/content/docs/reference/functions/` contain:
   - Frontmatter with `title` and `category` fields
   - Function description, signature, examples, etc.

2. **Category system** supports:
   - **Subcategories** using forward slashes: `String/Inspection`, `Type System/Conversion`
   - **Multiple categories** for functions that work across domains

3. **Generation script** (`generate-functions-overview.js`):
   - Reads all function files
   - Extracts categories from frontmatter (falls back to hardcoded mapping)
   - Groups functions by category (functions can appear in multiple sections)
   - Generates tables with function name, description, and example
   - Outputs to `src/content/docs/reference/functions.md`

### Scripts

#### `add-function-categories.js`

One-time script used to add category metadata to existing function files. This script:

- Maps function names to their appropriate categories (supports multiple categories)
- Adds `category: <Category Name>` or multi-category YAML arrays to frontmatter
- Reports any functions that couldn't be categorized

**Usage:**
```bash
node scripts/add-function-categories.js
```

#### `generate-functions-overview.js`

Main script that generates the functions overview page from individual function files.

- Reads categories from each function's frontmatter (supports multiple categories)
- Extracts first line of description and first TQL example
- Groups by category and generates markdown tables (functions appear in all relevant categories)
- Categories are sorted alphabetically for predictable organization

**Usage:**
```bash
# Via npm script (recommended)
pnpm run generate:functions-overview

# Or directly
node scripts/generate-functions-overview.js
```

### Operator Overview Generation

The operator overview generation system automatically creates the main operators reference page from individual operator documentation files.

#### `add-operator-categories.js`

One-time script used to add category metadata to existing operator files. This script:

- Maps operator names to their appropriate categories (supports multiple categories)
- Recursively processes operator files in subdirectories (context/, package/, pipeline/)
- Adds `category: <Category Name>` or multi-category YAML arrays to frontmatter
- Reports any operators that couldn't be categorized

**Usage:**
```bash
node scripts/add-operator-categories.js
```

#### `generate-operators-overview.js`

Main script that generates the operators overview page from individual operator files.

- Reads categories from each operator's frontmatter (supports multiple categories)
- Extracts first line of description and first TQL example
- Groups by category and generates markdown tables (operators appear in all relevant categories)
- Categories are sorted alphabetically for predictable organization
- Handles operators in subdirectories (context/, package/, pipeline/)

**Usage:**
```bash
# Via npm script (recommended)
pnpm run generate:operators-overview

# Or directly
node scripts/generate-operators-overview.js
```

### Integration with Update Workflow

The overview generation is integrated into `.github/workflows/update.yaml`:

1. When function and operator files are synced from the main repository
2. `pnpm run generate:functions-overview` and `pnpm run generate:operators-overview` are automatically run
3. The generated overviews are committed along with the updated function and operator files

### Adding New Functions

When adding new function documentation:

1. **Create the function file** in `src/content/docs/reference/functions/`
2. **Add category to frontmatter**:

   **Single category:**
   ```yaml
   ---
   title: my_function
   category: Aggregation
   ---
   ```

   **Multiple categories:**
   ```yaml
   ---
   title: my_function
   category:
     - Record
     - List
   ---
   ```

3. **Run the generator** to update the overview:
   ```bash
   pnpm run generate:functions-overview
   ```

### Adding New Operators

When adding new operator documentation:

1. **Create the operator file** in `src/content/docs/reference/operators/` (or appropriate subdirectory)
2. **Add category to frontmatter**:

   **Single category:**
   ```yaml
   ---
   title: my_operator
   category: Modify
   ---
   ```

   **Multiple categories:**
   ```yaml
   ---
   title: my_operator
   category:
     - Inputs/Events
     - Outputs/Events
   ---
   ```

3. **Run the generator** to update the overview:
   ```bash
   pnpm run generate:operators-overview
   ```

### Category Guidelines

- Use existing categories when possible
- For subcategories, use format: `Main Category/Subcategory`
- Functions can belong to multiple categories if they work across domains
- Examples of multi-category functions:
  - `get` - works on both `Record` and `List`
  - `sort` - works on both `Record` and `List`
  - `where` - both `Aggregation` and `List` function
  - `network` - appears in both `Subnet` and `IP` contexts

- Current main function categories:
  - `Aggregation` - Functions that aggregate data
  - `Record` - Record manipulation functions
  - `List` - List manipulation functions
  - `String` - String functions (with subcategories)
  - `Parsing` - Data parsing functions
  - `Printing` - Data output functions
  - `Time & Date` - Date/time functions
  - `Math` - Mathematical functions
  - `Networking` - Network-related functions
  - `Hashing` - Hash computation functions
  - `Encoding`/`Decoding` - Data encoding functions
  - `Type System` - Type manipulation (with subcategories)
  - `Runtime` - Runtime environment functions

- Current main operator categories:
  - `Modify` - Transform or modify events
  - `Filter` - Filter or limit events
  - `Analyze` - Analyze and aggregate events
  - `Flow Control` - Control pipeline flow
  - `Inputs` - Input sources (with subcategories)
  - `Outputs` - Output destinations (with subcategories)
  - `Parsing` - Parse different data formats
  - `Printing` - Output data in different formats
  - `Charts` - Generate charts and visualizations
  - `Connecting Pipelines` - Inter-pipeline communication
  - `Node` - Node management (with subcategories)
  - `Host Inspection` - Inspect host system
  - `Detection` - Security detection and analysis
  - `Internals` - Internal pipeline management
  - `Encode & Decode` - Compression and decompression
  - `Pipelines` - Pipeline management operations
  - `Contexts` - Context management operations
  - `Packages` - Package management operations
  - `Escape Hatches` - External system integration

### File Structure

```
scripts/
├── README.md                          # This file
├── add-function-categories.js         # One-time function categorization script
├── generate-functions-overview.js     # Function overview generator
├── add-operator-categories.js         # One-time operator categorization script
└── generate-operators-overview.js     # Operator overview generator

src/content/docs/reference/functions/
├── functions.md                       # Generated overview (DO NOT EDIT)
├── count.md                          # Individual function files
├── sum.md                            # (with category metadata)
└── ...

src/content/docs/reference/operators/
├── operators.md                       # Generated overview (DO NOT EDIT)
├── select.md                         # Individual operator files
├── from.md                           # (with category metadata)
├── context/                          # Context operators subdirectory
├── package/                          # Package operators subdirectory
├── pipeline/                         # Pipeline operators subdirectory
└── ...
```

### Maintenance

- The overview files are auto-generated and should not be edited manually
- When function/operator signatures or descriptions change, re-run the respective generator
- Functions and operators automatically appear in all their assigned categories
- Categories are automatically sorted alphabetically - no manual ordering required
- To assign a function/operator to multiple categories, update its frontmatter to use a YAML array
- Both functions and operators support the same multiple category syntax and behavior