import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Switch,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Gyroscope } from "expo-sensors";
import io from "socket.io-client";

const SOCKET_SERVER_URL = "http://your-socket-io-server-url";

const { width, height } = Dimensions.get("window");

const GyroTest = () => {
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [controlledDotPosition, setControlledDotPosition] = useState({
    x: width / 2 - 25, // Centering the controlled dot initially
    y: height / 2 - 25,
  });

  const socketRef = useRef();

  // Set up Socket.IO connection
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    let subscription;

    if (gyroEnabled) {
      subscription = Gyroscope.addListener((gyroscopeData) => {
        console.log(gyroscopeData);

        setGyroData(gyroscopeData);

        setControlledDotPosition((prevPosition) => ({
          x: prevPosition.x - gyroscopeData.y * 4,
          y: prevPosition.y - gyroscopeData.x * 4,
        }));
      });

      Gyroscope.setUpdateInterval(100); // Adjust the update interval if needed
    } else {
      subscription?.remove();
    }

    return () => {
      subscription?.remove();
    };
  }, [gyroEnabled]);

  const handleGyroToggle = () => {
    setGyroEnabled(!gyroEnabled);
  };

  // Send gyroscope data to the server every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (gyroEnabled) {
        socketRef.current.emit("gyroscopeData", gyroData);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [gyroEnabled, gyroData]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Gyroscope-2</Text>
      <View style={styles.switchContainer}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={gyroEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={handleGyroToggle}
          value={gyroEnabled}
          style={styles.switch}
        />
      </View>
      <View style={styles.fixedDot} />
      <View
        style={{
          ...styles.controlledDot,
          transform: [
            { translateX: controlledDotPosition.x },
            { translateY: controlledDotPosition.y },
          ],
        }}
      />
    </SafeAreaView>
  );
};

export default GyroTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 80,
  },
  switchContainer: {
    marginBottom: 60,
    marginTop: 64,
  },
  switch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
  },
  fixedDot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "red",
    position: "absolute",
    top: height / 2 - 30,
    left: width / 2 - 30,
  },
  controlledDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "red",
    position: "absolute",
  },
});