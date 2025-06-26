import { JsonViewer } from "@/components/json-tree-viewer";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useDebouncedState } from "@/hooks/use-debounced-state";

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
  const [jsonInput, setJsonInput] = useDebouncedState(
    JSON.stringify(sampleData, null, 2),
    200
  );

  const getParsedData = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      return parsed;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid JSON", {
        id: "invalid-json",
      });
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 p-6 lg:grid-cols-2 gap-4 min-h-[calc(100vh-12rem)]">
        <div className="border flex-1 rounded-lg p-4 bg-card flex flex-col h-[calc(100vh-12rem)]">
          <Textarea
            defaultValue={jsonInput}
            onChange={(e) => setJsonInput(e.currentTarget.value)}
            className="font-mono flex-1 resize-none"
            placeholder="Enter your JSON here..."
          />
        </div>
        <div className="border flex-1 rounded-lg p-4 bg-card overflow-auto h-[calc(100vh-12rem)]">
          <JsonViewer data={getParsedData()} rootName="data" />
        </div>
      </div>
    </div>
  );
}
