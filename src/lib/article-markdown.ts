import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import ts from "typescript";

type Node = {
  type: string;
  name?: string;
  value?: string;
  url?: string;
  children?: Node[];
  attributes?: { name?: string; value?: string | null | { value: string } }[];
  position?: { start: { offset?: number }; end: { offset?: number } };
};

type TreeItem = { type: string; name: string; children?: TreeItem[] };

// Read literal data without executing any expressions from the MDX source.
function literal(node: ts.Expression): unknown {
  if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(node.properties.map((property) => {
      if (!ts.isPropertyAssignment(property) ||
          !(ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))) {
        throw new Error("Markdown export requires literal component data");
      }
      return [property.name.text, literal(property.initializer)];
    }));
  }
  throw new Error("Markdown export does not execute MDX expressions");
}

function treeText(items: TreeItem[], prefix = ""): string {
  return items.map((item, index) => {
    const last = index === items.length - 1;
    const line = `${prefix}${last ? "└── " : "├── "}${item.name}${item.type === "folder" ? "/" : ""}`;
    return item.children?.length
      ? `${line}\n${treeText(item.children, prefix + (last ? "    " : "│   "))}`
      : line;
  }).join("\n");
}

export function articleBodyToMarkdown(
  body: string,
  { mdx = true, resolveAsset = (path: string) => path, articleUrl }: {
    mdx?: boolean;
    resolveAsset?: (path: string) => string;
    articleUrl: string;
  },
): string {
  const parser = unified().use(remarkParse);
  if (mdx) parser.use(remarkMdx);
  const root = parser.parse(body) as Node;
  const assets = new Map<string, string>();

  for (const node of root.children ?? []) {
    if (node.type !== "mdxjsEsm") continue;
    const file = ts.createSourceFile("imports.ts", node.value ?? "", ts.ScriptTarget.Latest);
    for (const statement of file.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
        const name = statement.importClause?.name?.text;
        const path = statement.moduleSpecifier.text;
        if (name && /\.(png|jpe?g|webp|gif|svg|mp4)(\?url)?$/i.test(path)) {
          assets.set(name, resolveAsset(path.replace(/\?url$/, "")));
        }
      }
    }
  }

  function attr(node: Node, name: string): string {
    const value = node.attributes?.find((attribute) => attribute.name === name)?.value;
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
      const asset = assets.get(value.value.trim());
      if (asset) return asset;
      throw new Error(`Unsupported ${name} expression in Markdown export`);
    }
    return "";
  }

  function convert(node: Node): string {
    const start = node.position?.start.offset ?? 0;
    const end = node.position?.end.offset ?? body.length;
    const children = () => (node.children ?? []).map(convert).join("");
    if (node.type === "mdxjsEsm") return "";
    if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
      throw new Error("Add a Markdown representation for this MDX expression");
    }
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      if (node.name === "FaviconLink") return `[${children()}](${attr(node, "href")})`;
      if (node.name === "Image" || node.name === "img") return `![${attr(node, "alt")}](${attr(node, "src")})`;
      if (node.name === "FileTree") {
        const value = node.attributes?.find((attribute) => attribute.name === "data")?.value;
        if (!value || typeof value !== "object") throw new Error("FileTree requires literal data");
        const file = ts.createSourceFile("tree.ts", `const data = ${value.value}`, ts.ScriptTarget.Latest);
        const statement = file.statements[0];
        if (!ts.isVariableStatement(statement)) throw new Error("Invalid FileTree data");
        const expression = statement.declarationList.declarations[0].initializer;
        if (!expression) throw new Error("Missing FileTree data");
        return `\n\n\`\`\`text\n${treeText(literal(expression) as TreeItem[])}\n\`\`\`\n\n`;
      }
      if (node.name === "video") {
        const source = node.children?.find((child) => child.name === "source");
        const url = attr(node, "src") || (source ? attr(source, "src") : "");
        return url ? `[Video](${url})` : children();
      }
      if (node.name === "svg") return "";
      if (node.name && /^[A-Z]/.test(node.name)) throw new Error(`Missing Markdown conversion for ${node.name}`);
      return children();
    }
    if ((node.type === "link" || node.type === "image" || node.type === "definition") && node.url?.startsWith("/")) {
      return body.slice(start, end).replace(node.url, new URL(node.url, articleUrl).href);
    }
    // Preserve original Markdown, including fenced code, spacing and inline code.
    let output = "";
    let cursor = start;
    for (const child of node.children ?? []) {
      const childStart = child.position?.start.offset;
      const childEnd = child.position?.end.offset;
      if (childStart === undefined || childEnd === undefined) continue;
      output += body.slice(cursor, childStart) + convert(child);
      cursor = childEnd;
    }
    return output + body.slice(cursor, end);
  }

  return convert(root).trim();
}

export function buildArticleMarkdown(data: {
  title: string; description: string; date: Date; lang: string;
}, body: string): string {
  const dateLabel = data.lang === "es" ? "Publicado" : "Published";
  const languageLabel = data.lang === "es" ? "Idioma" : "Language";
  return `# ${data.title}\n\n${data.description}\n\n${dateLabel}: ${data.date.toISOString().slice(0, 10)}\n${languageLabel}: ${data.lang}\n\n${body}\n`;
}
