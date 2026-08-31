export function getInternalToolPageIssues(html: string, title: string) {
  const issues: string[] = [];
  const headingCount = html.match(/<h1(?:\s|>)/g)?.length ?? 0;

  if (!html.includes("data-page-header")) {
    issues.push("missing the standard page header");
  }
  if (!html.includes(title)) {
    issues.push(`missing the expected title: ${title}`);
  }
  if (headingCount !== 1) {
    issues.push(`expected one h1 but found ${headingCount}`);
  }

  return issues;
}
