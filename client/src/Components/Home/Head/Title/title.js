import "../Title/title.css"; // Import the CSS file for styling

function Title() {
  // Function to handle click event
  const handleClick = () => {
    window.location.href = "/"; // Navigate to "/"
  };

  return (
    <div className="Title">
      <span>
        {/* Using onClick event to handle navigation */}
        <h5 onClick={handleClick}>Phongtro123</h5> là nơi tuyệt vời để xem thông tin trọ và đăng thông tin cho thuê trọ số 1 tại TP.HCM!
      </span>
    </div>
  );
}

export default Title;
