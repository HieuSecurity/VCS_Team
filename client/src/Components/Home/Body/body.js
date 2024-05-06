import Posts from "./Posts/posts";
import Search from "./Search/search";
import "./body.css";
function Body() {
  return (
    <div className="Body">
      <Search />
      <Posts />
    </div>
  );
}

export default Body;
