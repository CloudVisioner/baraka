console.log("Orders admin javascript file loaded");

$(document).ready(function() {
  console.log("Orders page ready, buttons should be available");
  
  // Use event delegation for dynamically loaded buttons
  $(document).on("click", ".approve-order-btn", async function (e) {
    e.preventDefault();
    const orderId = $(this).data("order-id");
    const approveButton = $(this);
    const orderCard = approveButton.closest('[style*="background: white"]');
    const rejectButton = orderCard.find(".reject-order-btn");
    
    if (!confirm("Are you sure you want to approve this order?")) {
      return;
    }
    
    // Disable both buttons immediately to prevent double-click
    approveButton.prop("disabled", true);
    rejectButton.prop("disabled", true);
    
    // Update button styles
    approveButton.css({
      "opacity": "0.7",
      "cursor": "not-allowed",
      "transform": "scale(0.98)",
      "box-shadow": "none"
    });
    rejectButton.css({
      "opacity": "0.5",
      "cursor": "not-allowed"
    });
    
    // Update button content
    approveButton.html('<span style="font-size: 16px; margin-right: 6px;">⏳</span><span>Processing...</span>');
    
    try {
      const response = await axios.post("/admin/order/approve", {
        orderId: orderId
      });
      
      if (response.status === 200 && response.data.data) {
        // Success - show feedback before reload
        approveButton.css({
          "background": "linear-gradient(135deg, #34c759 0%, #30d158 100%)",
          "opacity": "1"
        });
        approveButton.html('<span style="font-size: 18px; margin-right: 6px;">✓</span><span>Approved!</span>');
        
        setTimeout(() => {
          location.reload();
        }, 800);
      } else {
        throw new Error("Approval failed");
      }
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Order approval failed!";
      alert(message);
      
      // Re-enable buttons on error
      approveButton.prop("disabled", false);
      rejectButton.prop("disabled", false);
      approveButton.css({
        "opacity": "1",
        "cursor": "pointer",
        "transform": "scale(1)",
        "box-shadow": "0 2px 8px rgba(52, 199, 89, 0.3)"
      });
      rejectButton.css({
        "opacity": "1",
        "cursor": "pointer"
      });
      approveButton.html('<span style="font-size: 18px; margin-right: 6px;">✓</span><span>Approve</span>');
    }
  });

  $(document).on("click", ".reject-order-btn", async function (e) {
    e.preventDefault();
    const orderId = $(this).data("order-id");
    const rejectButton = $(this);
    const orderCard = rejectButton.closest('[style*="background: white"]');
    const approveButton = orderCard.find(".approve-order-btn");
    
    if (!confirm("Are you sure you want to reject this order? This action cannot be undone.")) {
      return;
    }
    
    // Disable both buttons immediately to prevent double-click
    approveButton.prop("disabled", true);
    rejectButton.prop("disabled", true);
    
    // Update button styles
    rejectButton.css({
      "opacity": "0.7",
      "cursor": "not-allowed",
      "transform": "scale(0.98)",
      "box-shadow": "none"
    });
    approveButton.css({
      "opacity": "0.5",
      "cursor": "not-allowed"
    });
    
    // Update button content
    rejectButton.html('<span style="font-size: 16px; margin-right: 6px;">⏳</span><span>Processing...</span>');
    
    try {
      const response = await axios.post("/admin/order/reject", {
        orderId: orderId
      });
      
      if (response.status === 200 && response.data.data) {
        // Success - show feedback before reload
        rejectButton.css({
          "background": "linear-gradient(135deg, #ff3b30 0%, #ff453a 100%)",
          "opacity": "1"
        });
        rejectButton.html('<span style="font-size: 18px; margin-right: 6px;">✗</span><span>Rejected!</span>');
        
        setTimeout(() => {
          location.reload();
        }, 800);
      } else {
        throw new Error("Rejection failed");
      }
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Order rejection failed!";
      alert(message);
      
      // Re-enable buttons on error
      approveButton.prop("disabled", false);
      rejectButton.prop("disabled", false);
      rejectButton.css({
        "opacity": "1",
        "cursor": "pointer",
        "transform": "scale(1)",
        "box-shadow": "0 2px 8px rgba(255, 59, 48, 0.3)"
      });
      approveButton.css({
        "opacity": "1",
        "cursor": "pointer"
      });
      rejectButton.html('<span style="font-size: 18px; margin-right: 6px;">✗</span><span>Reject</span>');
    }
  });
  
  // Add hover effects for better UX
  $(document).on("mouseenter", ".approve-order-btn:not(:disabled)", function() {
    $(this).css({
      "transform": "translateY(-2px)",
      "box-shadow": "0 4px 12px rgba(52, 199, 89, 0.4)"
    });
  });
  
  $(document).on("mouseleave", ".approve-order-btn:not(:disabled)", function() {
    $(this).css({
      "transform": "translateY(0)",
      "box-shadow": "0 2px 8px rgba(52, 199, 89, 0.3)"
    });
  });
  
  $(document).on("mouseenter", ".reject-order-btn:not(:disabled)", function() {
    $(this).css({
      "transform": "translateY(-2px)",
      "box-shadow": "0 4px 12px rgba(255, 59, 48, 0.4)"
    });
  });
  
  $(document).on("mouseleave", ".reject-order-btn:not(:disabled)", function() {
    $(this).css({
      "transform": "translateY(0)",
      "box-shadow": "0 2px 8px rgba(255, 59, 48, 0.3)"
    });
  });
});
