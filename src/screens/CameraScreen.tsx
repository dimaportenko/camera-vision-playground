/**
 * Created by Dima Portenko on 22.12.2021
 */
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, View} from 'react-native';
import {Camera} from 'react-native-vision-camera';
import Reanimated from 'react-native-reanimated';
import {CameraComponent} from '../components/CameraComponent';

interface CameraScreenProps {}

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

export const CameraScreen = (props: CameraScreenProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPersmissions = async () => {
      const cameraPermission = await Camera.getCameraPermissionStatus();

      if (cameraPermission === 'authorized') {
        setLoading(false);
      } else {
        const newCameraPermission = await Camera.requestCameraPermission();

        if (newCameraPermission === 'authorized') {
          setLoading(false);
        } else {
          Alert.alert(
            'Error',
            'Your have to provide Camera permission to continue use the App',
          );
        }
      }
    };

    getPersmissions();
  }, []);

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <CameraComponent />;
};
