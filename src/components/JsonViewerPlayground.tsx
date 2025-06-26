import { JsonViewer } from "@/components/json-tree-viewer";
import { toast } from "sonner";
import { useDebouncedState } from "@/hooks/use-debounced-state";
import { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

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
    200
  );

  const getParsedData = () => {
    try {
      return JSON.parse(jsonInput);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid input", {
        id: "invalid-input",
      });
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 p-6 lg:grid-cols-2 gap-4 min-h-[calc(100vh-14rem)]">
        <div className="border flex-1 rounded-lg p-4 bg-card flex flex-col h-[calc(100vh-14rem)]">
          <MonacoEditor
            loading={
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            }
            height="100%"
            defaultLanguage="json"
            language="json"
            defaultValue={jsonInput}
            onChange={(value) => {
              toast.dismiss("invalid-input");
              setJsonInput(value ?? "");
            }}
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
        </div>
        <div className="border flex-1 rounded-lg p-4 bg-card overflow-auto h-[calc(100vh-14rem)]">
          <JsonViewer data={getParsedData()} rootName="data" />
        </div>
      </div>
    </div>
  );
}
