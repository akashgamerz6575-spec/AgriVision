// Service to handle browser notifications and scheduled polling
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const showNotification = (title, options) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    // Also try to show it via service worker for background behavior if supported
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/sprout-icon.png',
          badge: '/sprout-icon.png',
          vibrate: [200, 100, 200],
          ...options
        });
      });
    } else {
      new Notification(title, {
        icon: '/sprout-icon.png',
        ...options
      });
    }
  }
};

let pollInterval = null;

export const startAlertPolling = (crops) => {
  if (pollInterval) clearInterval(pollInterval);
  
  pollInterval = setInterval(() => {
    const now = new Date();
    
    crops.forEach(crop => {
      // Check Irrigation
      if (crop.irrigationTime) {
        const irrigationDate = new Date(crop.irrigationTime);
        // If the time is within the last minute
        if (now >= irrigationDate && now.getTime() - irrigationDate.getTime() < 60000) {
          showNotification(`Watering Reminder 💧`, {
            body: `It's time to irrigate your ${crop.cropType}!`,
            tag: `irrigation-${crop.id}`
          });
        }
      }
      
      // Check Harvest
      if (crop.harvestTime) {
        const harvestDate = new Date(crop.harvestTime);
        if (now >= harvestDate && now.getTime() - harvestDate.getTime() < 60000) {
          showNotification(`Harvest Reminder 🌾`, {
            body: `Your ${crop.cropType} is scheduled for harvest today!`,
            tag: `harvest-${crop.id}`
          });
        }
      }
    });
  }, 60000); // Check every minute
};

export const stopAlertPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};
