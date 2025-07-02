import { File, Folder, Files } from "@/components/animate-ui/components/files";

type FileTreeData = {
  type: "folder" | "file";
  name: string;
  defaultOpen?: string[];
  children?: FileTreeData[];
};

function FileTreeItem({ item }: { item: FileTreeData }) {
  if (item.type === "folder") {
    return (
      <Folder name={item.name} defaultOpen={item.defaultOpen}>
        {item.children?.map((child) => (
          <FileTreeItem key={child.name} item={child} />
        ))}
      </Folder>
    );
  }
  return <File name={item.name} />;
}

export default function FileTree({
  data,
  defaultOpen,
}: {
  data: FileTreeData[];
  defaultOpen?: string[];
}) {
  return (
    <Files className="max-w-[500px] w-full not-prose" defaultOpen={defaultOpen}>
      {data.map((item) => (
        <FileTreeItem key={item.name} item={item} />
      ))}
    </Files>
  );
}
