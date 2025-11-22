#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <PubSubClient.h>

#define SS_PIN 5
#define RST_PIN 0
MFRC522 rfid(SS_PIN, RST_PIN);
WiFiMulti wifiMulti;
WiFiClient espClient;
PubSubClient client(espClient);

const char* ssid = "Cloud Control Network";   // wifi
const char* password = "ccv7network";         // wifi pass
const char* mqttServer = "broker.emqx.io";    // mqtt broker
const int mqttPort = 1883;

void connectToWiFi() {
  while (wifiMulti.run() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
}

void sendRFIDData(String rfidData) {
  String jsonPayload = "{\"rfid_data\":\"" + rfidData + "\"}";

  client.publish("RFID_LOGIN", jsonPayload.c_str());
  Serial.println("Sent RFID data to MQTT broker: " + rfidData);
}

void setup() {
  Serial.begin(115200);
  SPI.begin(18, 19, 23);
  rfid.PCD_Init();
  Serial.println("RFID Reader initialized");

  WiFi.mode(WIFI_STA);
  wifiMulti.addAP(ssid, password);
  connectToWiFi();

  client.setServer(mqttServer, mqttPort);
  client.setCallback(mqttCallback);
}

void mqttCallback(char* topic, byte* message, unsigned int length) {
  if (String(topic) == "RFID_LOGIN") {
    String msg = "";
    for (int i = 0; i < length; i++) {
      msg += (char)message[i];
    }
    Serial.println("Received: " + msg);
  }
}

void loop() {
  if (!client.connected()) {
    while (!client.connected()) {
      client.connect("ESP32_Client");
    }
  }
  client.loop();

  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String rfidData = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
      rfidData.concat(String(rfid.uid.uidByte[i], HEX));
    }
    rfidData.toUpperCase();
    sendRFIDData(rfidData);
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }
  delay(50);
}
