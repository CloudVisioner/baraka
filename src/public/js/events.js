console.log("Events frontend javascript file");

$("#process-btn").on("click", () => {
  $(".dish-container").slideToggle(500, function() {
    $(this).toggleClass("show");
  });
  $("#process-btn").css("display", "none");
});

$("#cancel-btn").on("click", () => {
  $(".dish-container").slideToggle(100, function() {
    $(this).toggleClass("show");
  });
  $("#process-btn").css("display", "flex");
});

$(".delete-event-btn").on("click", async function (e) {
  const eventId = $(this).data("id");
  
  if (!confirm("Are you sure you want to delete this event?")) {
    return;
  }
  
  try {
    const response = await axios.delete(`/admin/event/${eventId}`);
    console.log("response:", response);

    if (response.status === 200) {
      alert("Event deleted successfully!");
      location.reload();
    } else {
      alert("Event deletion failed!");
    }
  } catch (err) {
    console.log(err);
    alert("Event deletion failed!");
  }
});

function validateEventForm() {
  const title = $(".event-title").val();
  const desc = $(".event-desc").val();
  const fullDesc = $(".event-full-desc").val();
  const date = $(".event-date").val();
  const location = $(".event-location").val();
  const img = $(".event-image-input").get(0).files[0];

  if (
    title === "" ||
    desc === "" ||
    fullDesc === "" ||
    date === "" ||
    location === "" ||
    !img
  ) {
    alert("Please fill in all required fields!");
    return false;
  }

  if (title.length > 80) {
    alert("Title must be 80 characters or less!");
    return false;
  }

  if (desc.length > 150) {
    alert("Short description must be 150 characters or less!");
    return false;
  }

  if (fullDesc.length > 1000) {
    alert("Full description must be 1000 characters or less!");
    return false;
  }

  if (date.length > 50) {
    alert("Date must be 50 characters or less!");
    return false;
  }

  if (location.length > 100) {
    alert("Location must be 100 characters or less!");
    return false;
  }

  const host = $(".event-host").val();
  if (host && host.length > 100) {
    alert("Host must be 100 characters or less!");
    return false;
  }

  const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validImageTypes.includes(img.type)) {
    alert("Please upload only JPG, PNG, or WebP images!");
    return false;
  }

  if (img.size > 200000) {
    alert("Image size must be less than 200KB!");
    return false;
  }

  return true;
}

function previewEventImage(input) {
  const file = input.files[0];
  const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!validImageTypes.includes(file.type)) {
    alert("Please insert only jpeg, jpg, png, or webp!");
    input.value = "";
    return;
  }

  if (file.size > 200000) {
    alert("Image size must be less than 200KB!");
    input.value = "";
    return;
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      $("#event-image-section").attr("src", reader.result);
    };
    reader.readAsDataURL(file);
  }
}
