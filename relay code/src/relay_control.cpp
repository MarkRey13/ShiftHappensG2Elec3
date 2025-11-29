#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "kaicyn";
const char* password = "fuckeduplife";

const char* mqttServer = "10.142.232.22";
const int mqttPort = 1883;
const char* listenTopic = "RFID_LOGIN";

#define RELAY_PIN 27   

WiFiClient espClient;
PubSubClient client(espClient);

void connectWiFi() {
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void mqttCallback(char* topic, byte* message, unsigned int length) {
  String msg = "";
  for (int i = 0; i < length; i++) msg += (char)message[i];

  Serial.print("Topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  Serial.println(msg);

  
  if (msg == "1") {
    digitalWrite(RELAY_PIN, LOW);    
    Serial.println("RELAY ON (status = 1)");
  } 
  else if (msg == "0") {
    digitalWrite(RELAY_PIN, HIGH);   
    Serial.println("RELAY OFF (status = 0)");
  }
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT... ");

    if (client.connect("ESP32_RELAY")) {
      Serial.println("Connected!");
      client.subscribe(listenTopic);
      Serial.println("Subscribed to: RFID_LOGIN");
    } else {
      Serial.print("Failed. Retrying...");
      delay(1000);
    }
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);

  
  digitalWrite(RELAY_PIN, HIGH);  

  connectWiFi();

  client.setServer(mqttServer, mqttPort);
  client.setCallback(mqttCallback);
}

void loop() {
  if (!client.connected()) reconnectMQTT();
  client.loop();
}
