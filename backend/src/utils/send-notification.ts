export async function sendPushNotification(expoPushToken: string, title: string, body: string, data = {}) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data,
    };
  
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  
    const result = await response.json();
    console.log(result);
}

export async function sendBulkPushNotification(expoPushTokens: string[], title: string, body: string, data = {}) {
    const messages = expoPushTokens.map((token) => ({
        to: token,
        sound: "default",
        title,
        body,
        data,
    }));

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log(result);
}