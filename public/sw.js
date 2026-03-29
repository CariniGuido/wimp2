self.addEventListener('push', function (event) {
    if (!event.data) return
  
    const data = event.data.json()
  
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon.svg',
        badge: '/icon-dark-32x32.png',
        data: data.url ? { url: data.url } : undefined,
      })
    )
  })
  
  self.addEventListener('notificationclick', function (event) {
    event.notification.close()
    const url = event.notification.data?.url || '/dashboard'
    event.waitUntil(clients.openWindow(url))
  })