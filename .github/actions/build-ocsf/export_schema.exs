output_dir = System.get_env("OUTPUT_DIR")

# Export schema (classes, objects, types)
schema = Schema.export_schema()
File.write!(Path.join(output_dir, "schema.json"), Jason.encode!(schema, pretty: true))

# Export profiles
profiles = Schema.profiles()
File.write!(Path.join(output_dir, "profiles.json"), Jason.encode!(profiles, pretty: true))

# Export extensions
extensions = Schema.extensions()
File.write!(Path.join(output_dir, "extensions.json"), Jason.encode!(extensions, pretty: true))

IO.puts("Exported schema, profiles, and extensions")
