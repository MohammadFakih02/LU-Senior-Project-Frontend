const isMobile = () => {
    if (typeof navigator === 'undefined') {
      return false; // Default to desktop for SSR or non-browser environments
    }
    // Modern approach (if available)
    if (navigator.userAgentData && typeof navigator.userAgentData.mobile !== 'undefined') {
      return navigator.userAgentData.mobile;
    }
    // Fallback to userAgent string check
    return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  };
  
  export const generateWhatsAppLink = (rawPhoneNumber, details, messageType = 'reminder') => {
      if (!rawPhoneNumber) {
        console.error("WhatsApp: Raw phone number is missing.");
        return null;
      }
      
      const phoneNumber = rawPhoneNumber.replace(/\D/g, '');
      if (!phoneNumber) {
        console.error("WhatsApp: Cleaned phone number is empty (after removing non-digits).");
        return null;
      }
    
      const { amount, dueDate, bundleName, userName } = details;
    
      const displayAmount = amount != null ? `$${Number(amount).toFixed(2)}` : 'N/A';
      const displayDueDate = dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A';
      const displayBundleName = bundleName || 'your service';
      const displayUserName = userName || 'customer';
    
      let messageText;
      if (messageType === 'creation_notification') {
        messageText = `Hello ${displayUserName},\n\nA new payment for ${displayBundleName} amounting to ${displayAmount} has been created. It is due on ${displayDueDate}.\n\nThank you.`;
      } else { // Default to reminder
        messageText = `Hello ${displayUserName},\n\nThis is a friendly reminder for your payment regarding ${displayBundleName}, amounting to ${displayAmount}, which is due on ${displayDueDate}.\n\nKindly proceed with the payment at your earliest convenience.\n\nThank you.`;
      }
      
      const encodedMessage = encodeURIComponent(messageText);
    
      if (isMobile()) {
        // Use wa.me link for mobile, which opens the WhatsApp application directly
        return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      } else {
        // Use web.whatsapp.com for desktop. The desktop app, if installed, can handle this.
        return `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
      }
    };