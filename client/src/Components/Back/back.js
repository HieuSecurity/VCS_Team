import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons"; // Import icon faHome
import { Link } from "react-router-dom";
import "../Back/back.css";

function Back() {
  return (
    <div className="Back">
      <Link className="back" to="/">
        <FontAwesomeIcon icon={faHome} /> {/* Sử dụng icon faHome */}
      </Link>
    </div>
  );
}

export default Back;
