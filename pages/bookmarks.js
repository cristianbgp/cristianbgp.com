import Bookmark from "../components/Bookmark";
import OGMetas from "../components/OGMetas";
import { bookmarks } from "../utils/getBookmarks";

export default function Bookmarks() {
  return (
    <>
      <OGMetas
        title="Bookmarks"
        description="Cristian Granda"
        extraUrl="/bookmarks"
      />
      <h1>Bookmarks</h1>
      {bookmarks.map((bookmark) => (
        <Bookmark key={bookmark.url} bookmark={bookmark} />
      ))}
    </>
  );
}
