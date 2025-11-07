import mqtt from 'mqtt';
const BROKER = 'ws://broker.emqx.io:8083/mqtt';
const TOPIC = 'RFID_LOGIN';
export function initMQTT(onMessageReceived){
  try {
    const client = mqtt.connect(BROKER);
    client.on('connect', ()=> console.log('MQTT connected'));
    client.subscribe(TOPIC);
    client.on('message', (topic, message)=>{
      if(topic === TOPIC){
        onMessageReceived(message.toString());
      }
    });
    return { client };
  } catch(e){
    console.warn('MQTT init error', e);
    return { client: null };
  }
}
export function sendToggleMessage(id, status){
  console.log('MQTT publish placeholder', { id, status });
}
