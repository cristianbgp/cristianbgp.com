import { JsonViewer } from "@/components/json-tree-viewer";
import { useDebouncedState } from "@/hooks/use-debounced-state";
import { parseJsonInput } from "@/lib/json-input";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/hooks/use-theme";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

const sampleData = {
  string: "Hello, world!",
  number: 42,
  boolean: true,
  null: null,
  object: {
    nested: {
      value: "This is nested",
      array: [1, 2, 3],
    },
    empty: {},
  },
  array: [
    "string",
    123,
    false,
    {
      key: "value",
    },
    ["nested", "array"],
  ],
  longText:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.",
  createdAt: new Date("2025-06-26"),
};

export default function JsonViewerPlayground() {
  const { theme } = useTheme();
  const [jsonInput, setJsonInput] = useDebouncedState(
    JSON.stringify(sampleData, null, 2),
    200,
  );
  const parsedInput = useMemo(() => parseJsonInput(jsonInput), [jsonInput]);
  const [lastValidData, setLastValidData] = useState<unknown>(sampleData);

  useEffect(() => {
    if (parsedInput.ok) {
      setLastValidData(parsedInput.value);
    }
  }, [parsedInput]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 p-6 lg:grid-cols-2 gap-4 min-h-[calc(100vh-14rem)]">
        <div className="border flex-1 rounded-lg p-4 bg-card flex flex-col h-[calc(100vh-14rem)]">
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center">
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                <span className="sr-only">Loading editor…</span>
              </div>
            }
          >
            <MonacoEditor
              loading={
                <div className="flex flex-1 items-center justify-center">
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                  <span className="sr-only">Loading editor…</span>
                </div>
              }
              height="100%"
              defaultLanguage="json"
              language="json"
              defaultValue={jsonInput}
              onChange={(value) => setJsonInput(value ?? "")}
              theme={theme === "dark" ? "vs-dark" : "light"}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "off",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                lineNumbersMinChars: 3,
                bracketPairColorization: { enabled: true },
              }}
            />
          </Suspense>
          {!parsedInput.ok ? (
            <p
              className="mt-3 text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              Invalid JSON: {parsedInput.message}
            </p>
          ) : null}
        </div>
        <div className="border flex-1 rounded-lg p-4 bg-card overflow-auto h-[calc(100vh-14rem)]">
          <JsonViewer data={lastValidData} rootName="data" />
        </div>
      </div>
    </div>
  );
}
