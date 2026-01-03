console.log("Signup frontend javascript file");

$(function () {
  const fileTarget = $(".file-box .upload-hidden");
  let filename;

  fileTarget.on("change", function () {
    if (window.FileReader) { // built-in browser feature that allows you to read files
      const uploadFile = $(this)[0].files[0], //It takes the first file that the user selected in the file input box and stores it in a variable called uploadFile.
      fileType = uploadFile["type"],
      validImageType = ["image/jpeg", "image/jpg", "image/png"];
      if (!validImageType.includes(fileType)) {
        alert("Please only insert jpeg, jpg or png");
      } else {
        if (uploadFile) {
          console.log(URL.createObjectURL(uploadFile));
          $(".upload-img-frame")
            .attr("src", URL.createObjectURL(uploadFile))
            .addClass("success");
        }
        filename = $(this)[0].files[0].name;
      }
      $(this).siblings(".upload-name").val(filename); // putting img name on input
    }
  });
});

function validateSignupForm() {
  const memberNick = $(".member-nick").val(),
  memberPhone = $(".member-phone").val(),
  memberPassword = $(".member-password").val(),
  confirmPassword = $(".confirm-password").val();

  if (
    memberNick === "" ||
    memberPhone === "" ||
    memberPassword === "" ||
    confirmPassword === ""
  ) {
    alert("Please resert all required inputs");
    return false;
  }

  if (memberPassword !== confirmPassword) {
    alert("Password differs, please check!");
    return false;
  }

  const memberImage = $(".member-image")?.get(0)?.files(0)
    ? $(".member-image")?.name
    : null;
  if(!memberImage) {
    alert("Please insert restaurant image");
    return false;
  }
}
