import mqtt from 'mqtt';


const BROKER = 'ws://broker.emqx.io:8083/mqtt';
const TOPIC = 'RFID_LOGIN';


let client;

export function initMQTT(onMessageReceived) {
  if (client) {
    return { client };
  }

  client = mqtt.connect(BROKER);

  client.on('connect', () => {
    console.log('MQTT connected');
    client.subscribe(TOPIC, (err) => {
      if (err) {
        console.error('Error subscribing to topic:', err);
      } else {
        console.log(`Subscribed to topic: ${TOPIC}`);
      }
    });
  });

  client.on('message', (topic, message) => {
    if (topic === TOPIC) {
      onMessageReceived(message.toString());
    }
  });

  return { client };
}

export function sendToggleMessage(id, status) {
  if (!client) {
    console.error('MQTT client not initialized');
    return;
  }

  const message = JSON.stringify({ id, status });
  client.publish(TOPIC, message, (err) => {
    if (err) {
      console.error('Error publishing message:', err);
    } else {
      console.log('Message published to topic:', TOPIC);
    }
  });
}

export function disconnectMQTT() {
  if (client && client.connected) {
    client.end(() => {
      console.log('MQTT client disconnected');
    });
  }
}
