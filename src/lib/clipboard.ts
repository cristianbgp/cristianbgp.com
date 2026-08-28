type ClipboardWriter = {
  writeText: (text: string) => Promise<void>;
};

export async function copyTextToClipboard(
  clipboard: ClipboardWriter | undefined,
  text: string,
): Promise<"copied" | "error"> {
  if (!clipboard) return "error";

  try {
    await clipboard.writeText(text);
    return "copied";
  } catch {
    return "error";
  }
}
