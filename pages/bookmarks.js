import Bookmark from "../components/Bookmark";
import { bookmarks } from "../utils/getBookmarks";

export default function Bookmarks() {
  return (
    <>
      <h1>Bookmarks</h1>
      {bookmarks.map((bookmark) => (
        <Bookmark key={bookmark.url} bookmark={bookmark} />
      ))}
    </>
  );
}
