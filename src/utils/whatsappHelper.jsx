const isMobile = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }
  if (navigator.userAgentData && typeof navigator.userAgentData.mobile !== 'undefined') {
    return navigator.userAgentData.mobile;
  }
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

  let englishMessageText;
  let arabicMessageText;

  if (messageType === 'creation_notification') {
    englishMessageText = `Hello ${displayUserName},\n\nA new payment for ${displayBundleName} amounting to ${displayAmount} has been created. It is due on ${displayDueDate}.\nThank you.`;
    
    arabicMessageText = `أهلاً ${displayUserName},\n\nتم إنشاء دفعة جديدة لـ ${displayBundleName} بمبلغ ${displayAmount}، مستحقة لغاية ${displayDueDate}.\n\nشكراً لك.`;
  } else {
    englishMessageText = `Hello ${displayUserName},\n\nThis is a friendly reminder for your payment regarding ${displayBundleName}, amounting to ${displayAmount}, which is due on ${displayDueDate}. Kindly proceed with the payment at your earliest convenience.\n\nThank you.`;
    
    arabicMessageText = `أهلاً ${displayUserName},\nهذا تذكير بخصوص دفعتك لـ ${displayBundleName}، بمبلغ ${displayAmount}، مستحقة لغاية ${displayDueDate}.\nيرجى الدفع في أقرب وقت ممكن.\n\nشكراً لك.`;
  }
  
  

  const combinedMessageText = `${englishMessageText}\n---\n${arabicMessageText}`;
  
  const encodedMessage = encodeURIComponent(combinedMessageText);

  if (isMobile()) {
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  } else {
    return `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
  }
};