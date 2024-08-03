import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, SafeAreaView, Switch } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import io from 'socket.io-client';

// ip: 100.67.89.206
const SOCKET_SERVER_URL = 'http://100.67.89.206:4000';

const { width, height } = Dimensions.get('window');

const GyroTest = () => {
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [previousGyroYData, setPreviousGyroYData] = useState(0);
  const [controlledDotPosition, setControlledDotPosition] = useState({
    x: width / 2 - 25,
    y: height / 2 - 25,
  });

  const socket = useRef(null);

  useEffect(() => {
    // Establish socket connection once
    if (!socket.current) {
      socket.current = io(SOCKET_SERVER_URL);

      socket.current.on('connect', () => {
        console.log('Client connected');
      });

      socket.current.on('disconnect', () => {
        console.log('Client disconnected');
      });
    }

    return () => {
      // Clean up the socket connection when the component unmounts
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    let subscription;

    if (gyroEnabled) {
      subscription = Gyroscope.addListener((gyroscopeData) => {
        console.log([previousGyroYData, gyroscopeData.y]);

        setGyroData(gyroscopeData);

        setControlledDotPosition((prevPosition) => ({
          x: prevPosition.x - gyroscopeData.y * 4,
          y: prevPosition.y - gyroscopeData.x * 4,
        }));

        // Send gyroscope data to the Node.js server
        // [Float last value, float current value] - Y Values.
        if (socket.current && socket.current.connected) {
          const socketData = [previousGyroYData, gyroscopeData.y];
          console.log('Sending data to server:', socketData);
          socket.current.emit('gyroscopeData', JSON.stringify(socketData));
        }

        // Update the previousGyroYData state with the current y value
        setPreviousGyroYData(gyroscopeData.y);
      });

      Gyroscope.setUpdateInterval(100); // Adjust the update interval if needed
    } else {
      subscription?.remove();
    }

    return () => {
      subscription?.remove();
    };
  }, [gyroEnabled, previousGyroYData]);

  const handleGyroToggle = () => {
    setGyroEnabled(!gyroEnabled);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Gyroscope-2</Text>
      <View style={styles.switchContainer}>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={gyroEnabled ? '#f5dd4b' : '#f4f3f4'}
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
          transform: [{ translateX: controlledDotPosition.x }, { translateY: controlledDotPosition.y }],
        }}
      />
    </SafeAreaView>
  );
};

export default GyroTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
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
    backgroundColor: 'red',
    position: 'absolute',
    top: height / 2 - 30,
    left: width / 2 - 30,
  },
  controlledDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'blue',
    position: 'absolute',
  },
});
