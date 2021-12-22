/**
 * Created by Dima Portenko on 22.12.2021
 */
import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import Reanimated from 'react-native-reanimated';
import {textRecognition} from '../frame-processors/ExamplePlugin';

interface CameraComponentProps {}

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

export const CameraComponent = (props: CameraComponentProps) => {
  const [isActive, setIsActive] = useState(true);

  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );
  const devices = useCameraDevices();
  const device = devices[cameraPosition];

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const values = textRecognition(frame);
    console.log(`Return Values: ${JSON.stringify(values)}`);
  }, []);

  return (
    <>
      {!!device && (
        <ReanimatedCamera
          // ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          // format={format}
          // fps={fps}
          // hdr={enableHdr}
          // lowLightBoost={device.supportsLowLightBoost && enableNightMode}
          isActive={isActive}
          // onInitialized={onInitialized}
          // onError={onError}
          enableZoomGesture={false}
          // animatedProps={cameraAnimatedProps}
          photo={true}
          video={false}
          audio={false}
          frameProcessor={frameProcessor}
          // frameProcessor={device.supportsParallelVideoProcessing ? frameProcessor : undefined}
          frameProcessorFps={1}
          // onFrameProcessorPerformanceSuggestionAvailable={onFrameProcessorSuggestionAvailable}
        />
      )}
    </>
  );
};
