// @ts-check
/**
 * Extract a normalized, stable representation of the @mnemom/types public API
 * surface from the package entry point (src/index.ts), using the TypeScript
 * type-checker.
 *
 * Output format: one line per exported symbol, sorted by name:
 *
 *   <name>\t<kind>\t<normalized-type-text>
 *
 * The normalized type text comes from the type-checker, so it is independent of
 * source formatting, comments, and declaration ordering — only a real change to
 * the *shape* of a public symbol moves its line. That keeps the committed
 * baseline (api-surface.txt) diffable and free of cosmetic churn.
 *
 * Reading from src/index.ts (the same entry tsup bundles) rather than the
 * rolled-up dist/index.d.ts gives the checker full type information: re-exported
 * `interface`/`type` symbols resolve to their real declared structure instead of
 * collapsing to `any` (which they do when read back from a .d.ts whose export
 * list re-exports type-only aliases).
 *
 * This is the snapshot half of the breaking-diff gate; diff-surface.mjs is the
 * classifier. See ./README.md.
 *
 * Usage:
 *   node scripts/api-surface/extract-surface.mjs [path/to/index.ts] [--out FILE]
 *
 * Defaults to reading src/index.ts and writing to stdout.
 */
import ts from "typescript";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

function parseArgs(argv) {
  const args = { entry: "src/index.ts", out: null };
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--out") {
      args.out = rest[++i];
    } else if (!a.startsWith("--")) {
      args.entry = a;
    }
  }
  return args;
}

/** Resolve through `export { X } from` / alias indirection to the real symbol. */
function resolveSymbol(checker, symbol) {
  if (symbol.getFlags() & ts.SymbolFlags.Alias) {
    return checker.getAliasedSymbol(symbol);
  }
  return symbol;
}

/**
 * True if a type is declared in *our own* source (not a TS lib or a
 * node_modules dependency). We only recurse into locally-declared object types;
 * primitive/library types (string, Error, Date, Intl.*) are rendered flat so the
 * surface stays scoped to the contract this package owns, and a `message: string`
 * field never explodes into the entire String prototype.
 */
function isLocalType(type) {
  const symbol = type.aliasSymbol || type.getSymbol();
  const decls = symbol && symbol.getDeclarations();
  if (!decls || decls.length === 0) return false;
  return decls.every((d) => {
    const file = d.getSourceFile();
    return !file.isDeclarationFile && !file.fileName.includes("node_modules");
  });
}

function renderType(checker, type, location, depth) {
  const TF =
    ts.TypeFormatFlags.NoTruncation |
    ts.TypeFormatFlags.UseFullyQualifiedType |
    ts.TypeFormatFlags.WriteArrayAsGenericType |
    ts.TypeFormatFlags.InTypeAlias;

  const props = checker.getPropertiesOfType(type);
  const callSigs = checker.getSignaturesOfType(type, ts.SignatureKind.Call);
  const ctorSigs = checker.getSignaturesOfType(type, ts.SignatureKind.Construct);

  // Expand only "plain object" shapes that WE declare. Anything with
  // call/construct signatures, a union/intersection, a primitive, or a
  // library/dependency declaration is rendered flat — its flat `typeToString`
  // form already carries the discriminating detail (a literal union, a function
  // signature, `string`, `Error`, …) without dragging in foreign prototypes.
  const isLocalObject =
    props.length > 0 &&
    callSigs.length === 0 &&
    ctorSigs.length === 0 &&
    !(type.flags & (ts.TypeFlags.Union | ts.TypeFlags.Intersection)) &&
    (depth === 0 || isLocalType(type));

  if (!isLocalObject || depth > 6) {
    return checker.typeToString(type, location, TF);
  }

  const members = props
    .map((prop) => {
      const optional = (prop.getFlags() & ts.SymbolFlags.Optional) !== 0;
      const decl = prop.valueDeclaration || (prop.declarations && prop.declarations[0]);
      let memberType = "unknown";
      try {
        const t = checker.getTypeOfSymbolAtLocation(prop, decl || location);
        memberType = renderType(checker, t, decl || location, depth + 1);
      } catch {
        memberType = "unknown";
      }
      return `${prop.getName()}${optional ? "?" : ""}: ${memberType}`;
    })
    .sort((a, b) => a.localeCompare(b, "en"));

  return `{ ${members.join("; ")} }`;
}

/**
 * Render an exported symbol to a stable, normalized signature string.
 * Equivalent shapes serialize identically regardless of how they were authored.
 */
function renderSymbol(checker, exportName, rawSymbol) {
  const symbol = resolveSymbol(checker, rawSymbol);
  const flags = symbol.getFlags();
  const decl = symbol.declarations && symbol.declarations[0];

  // Coarse "kind" so a rename across kinds (interface -> const, etc.) registers
  // as a change even when the serialized type happens to look similar.
  let kind = "value";
  if (flags & ts.SymbolFlags.TypeAlias) kind = "type";
  else if (flags & ts.SymbolFlags.Interface) kind = "interface";
  else if (flags & ts.SymbolFlags.Class) kind = "class";
  else if (flags & ts.SymbolFlags.RegularEnum || flags & ts.SymbolFlags.ConstEnum) kind = "enum";
  else if (flags & ts.SymbolFlags.Function) kind = "function";
  else if (flags & ts.SymbolFlags.Module) kind = "namespace";

  let typeText = "";
  if (decl) {
    try {
      if (flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.Class | ts.SymbolFlags.TypeAlias)) {
        const declaredType = checker.getDeclaredTypeOfSymbol(symbol);
        typeText = renderType(checker, declaredType, decl, 0);
      } else {
        const valueType = checker.getTypeOfSymbolAtLocation(symbol, decl);
        typeText = renderType(checker, valueType, decl, 0);
      }
    } catch (e) {
      typeText = `<unresolved: ${e instanceof Error ? e.message : String(e)}>`;
    }
  }

  typeText = typeText.replace(/\s+/g, " ").trim();
  return { name: exportName, kind, typeText };
}

function main() {
  const { entry, out } = parseArgs(process.argv);
  const entryPath = resolve(process.cwd(), entry);

  const program = ts.createProgram([entryPath], {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    baseUrl: dirname(entryPath),
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entryPath);
  if (!source) {
    console.error(`extract-surface: could not load ${entryPath}.`);
    process.exit(2);
  }

  const moduleSymbol = checker.getSymbolAtLocation(source);
  if (!moduleSymbol) {
    console.error(`extract-surface: no module symbol for ${entryPath} — is it a module?`);
    process.exit(2);
  }

  const exports = checker.getExportsOfModule(moduleSymbol);
  const lines = exports
    .map((sym) => renderSymbol(checker, sym.getName(), sym))
    .map(({ name, kind, typeText }) => `${name}\t${kind}\t${typeText}`)
    .sort((a, b) => a.localeCompare(b, "en"));

  const header = [
    "# @mnemom/types public API surface — GENERATED, do not hand-edit.",
    "# Regenerate: npm run api:surface (extracts from src/index.ts via tsc).",
    "# Format: <name>\\t<kind>\\t<normalized-type>. One exported symbol per line.",
    `# Export count: ${lines.length}`,
  ].join("\n");

  const content = `${header}\n${lines.join("\n")}\n`;

  if (out) {
    writeFileSync(resolve(process.cwd(), out), content, "utf8");
    console.error(`extract-surface: wrote ${lines.length} exports to ${out}`);
  } else {
    process.stdout.write(content);
  }
}

main();
