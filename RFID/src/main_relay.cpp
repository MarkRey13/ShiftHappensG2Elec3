#include <WiFi.h>
#include <PubSubClient.h>

#define RELAY_PIN 4

WiFiClient espClient;
PubSubClient client(espClient);

const char* ssid = "Cloud Control Network";
const char* password = "ccv7network";
const char* mqttServer = "broker.emqx.io";
const int mqttPort = 1883;

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  client.setServer(mqttServer, mqttPort);
  client.setCallback(mqttCallback);
}

void mqttCallback(char* topic, byte* message, unsigned int length) {
  if (String(topic) == "RFID_LOGIN") {
    char msg[length + 1];
    for (int i = 0; i < length; i++) {
      msg[i] = (char)message[i];
    }
    msg[length] = '\0';

    if (String(msg) == "1") {
      digitalWrite(RELAY_PIN, HIGH); // bulb on ni sha
    } else {
      digitalWrite(RELAY_PIN, LOW);  // bulb off
    }
  }
}

void loop() {
  if (!client.connected()) {
    while (!client.connected()) {
      client.connect("ESP32_Client");
    }
  }
  client.loop();
}
