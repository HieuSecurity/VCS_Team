import React from "react";
import { useHistory } from "react-router-dom";
import PostTable from "./PostTable";

const PostTableWrapper = () => {
  const history = useHistory();
  return <PostTable history={history} />;
};

export default PostTableWrapper;
