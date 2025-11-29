#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <PubSubClient.h>
#include <HTTPClient.h>

#define SS_PIN 5
#define RST_PIN 0

MFRC522 rfid(SS_PIN, RST_PIN);
WiFiMulti wifiMulti;
WiFiClient espClient;
PubSubClient client(espClient);

const char* ssid = "kaicyn";
const char* password = "fuckeduplife";
const char* mqttServer = "10.142.232.22";
const int mqttPort = 1883;
const char* backendURL = "http://10.142.232.22/esp32/insert.php";
const char* mqttTopic = "RFID_LOGIN";

void connectWiFi() {
  Serial.print("Connecting to WiFi...");
  wifiMulti.addAP(ssid, password);
  while (wifiMulti.run() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
}

void mqttCallback(char* topic, byte* message, unsigned int length) {
  Serial.print("MQTT Message: ");
  for (int i = 0; i < length; i++) Serial.print((char)message[i]);
  Serial.println();
}

void mqttReconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32_RFID")) {
      Serial.println("connected!");
      client.subscribe("RFID_LOGIN");
    } else {
      Serial.print("Failed, retrying in 1 second...");
      delay(1000);
    }
  }
}

String sendRfidToBackend(String rfid_data) {
  HTTPClient http;
  String payload = "{\"rfid_data\":\"" + rfid_data + "\"}";

  http.begin(backendURL);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(payload);
  String response = "";

  if (httpResponseCode > 0) {
    response = http.getString();
    Serial.println("Response from backend: " + response);
  } else {
    Serial.println("Error in sending POST request: " + String(httpResponseCode));
    response = "{\"status\":\"error\",\"message\":\"HTTP error\"}";
  }

  http.end();
  return response;
}

void publishMQTT(String statusText) {
  if (!client.connected()) mqttReconnect();
  if (client.connected()) {
    Serial.println("Publishing to topic: " + String(mqttTopic));
    Serial.println("Status: " + statusText);
    client.publish(mqttTopic, statusText.c_str(), true);
  }
}

void setup() {
  Serial.begin(115200);
  SPI.begin(18, 19, 23);
  rfid.PCD_Init();
  Serial.println("RFID Ready!");

  WiFi.mode(WIFI_STA);
  connectWiFi();

  client.setServer(mqttServer, mqttPort);
  client.setCallback(mqttCallback);
}

void loop() {
  if (!client.connected()) mqttReconnect();
  client.loop();

  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String scannedUID = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
      scannedUID += String(rfid.uid.uidByte[i], HEX);
    }
    scannedUID.toUpperCase();

    Serial.print("Card scanned: ");
    Serial.println(scannedUID);

    String response = sendRfidToBackend(scannedUID);

    String statusText = "RFID NOT FOUND";
    if (response.indexOf("\"rfid_status\":1") != -1) statusText = "1";
    else if (response.indexOf("\"rfid_status\":0") != -1) statusText = "0";

    publishMQTT(statusText);

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }

  delay(50);
}
