import { FileIcon, FolderIcon } from "../components/icons";
import { styled } from "../stitches.config";
import Card from "./Card";

function sortByName(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

function sortByType(a, b) {
  if ((a.type === "file" || a.type === "directory") && b.type === "folder") {
    return -1;
  }

  if (a.type === "folder" && (b.type === "file" || b.type === "directory")) {
    return 1;
  }

  return 0;
}

function mapChildren(children, level = 0) {
  return children
    .sort(sortByName)
    .sort(sortByType)
    .map((item) => {
      if (item.type === "file") {
        return <File level={level} key={item.name + item.type} {...item} />;
      }
      if (item.type === "directory" || item.type === "folder") {
        return <Folder level={level} key={item.name + item.type} {...item} />;
      }
      return null;
    });
}

function calcIndents(level) {
  return Array.from({ length: level }, (_, index) => <Indent key={index} />);
}

const Span = styled("span", {
  fontSize: "0.9em",
});

function Name(props) {
  return <Span>{props.children}</Span>;
}

const IdentSpan = styled("span", {
  display: "inline-block",
  width: "30px",
  height: "35px",
  lineHeight: "35px",
  backgroundImage:
    "linear-gradient(to right, transparent 11px, rgb(234, 234, 234) 11px, rgb(234, 234, 234) 12px, transparent 12px)",
  verticalAlign: "top",
  backgroundRepeat: "no-repeat",
});

function Indent() {
  return <IdentSpan />;
}

const IconI = styled("i", {
  marginRight: "0.25em",
  display: "inline-flex",
});

function Icon({ kind }) {
  return <IconI>{kind === "file" ? <FileIcon /> : <FolderIcon />}</IconI>;
}

const FileLi = styled("li", {
  display: "flex",
  alignItems: "center",
});

const FileDiv = styled("div", {
  height: "30px",
  display: "flex",
  alignItems: "center",
  ":hover": { fontWeight: "bold" },
});

function File(props) {
  return (
    <FileLi>
      {calcIndents(props.level)}
      <FileDiv>
        <Icon kind={props.type} />
        <Name>{props.name}</Name>
      </FileDiv>
    </FileLi>
  );
}

const FolderSummary = styled("div", {
  display: "flex",
  alignItems: "center",
});

const FolderSummaryContainer = styled("summary", {
  display: "flex",
  alignItems: "center",
  outline: "none",
  ":hover": { fontWeight: "bold", cursor: "pointer" },
  "::-webkit-details-marker": { display: "none" },
});

const FolderUl = styled("ul", {
  listStyleType: "none",
  paddingLeft: 0,
});

function Folder(props) {
  return (
    <li>
      <details open={!props.close}>
        <FolderSummaryContainer>
          <FolderSummary>
            {calcIndents(props.level)}
            <Icon kind={props.type} />
            <Name>{props.name}</Name>
          </FolderSummary>
        </FolderSummaryContainer>
        <FolderUl>{mapChildren(props.children, props.level + 1)}</FolderUl>
      </details>
    </li>
  );
}

const FileTreeUl = styled("ul", {
  listStyleType: "none",
  paddingLeft: 0,
});

function FileTree(props) {
  return (
    <Card styles={{ margin: "3em 0px" }}>
      <FileTreeUl>{mapChildren(JSON.parse(props.children), 0)}</FileTreeUl>
    </Card>
  );
}

export default FileTree;
