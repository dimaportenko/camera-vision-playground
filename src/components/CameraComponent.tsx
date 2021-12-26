/**
 * Created by Dima Portenko on 22.12.2021
 */
import React, {useEffect, useState} from 'react';
import {
  LayoutRectangle,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {Canvas, Path} from '@shopify/react-native-skia';
import Reanimated, {runOnJS, useSharedValue} from 'react-native-reanimated';
import {
  Block,
  Response,
  textRecognition,
} from '../frame-processors/TextRecognitionPlugin';
import {ResponseRenderer} from './ResponseRenderer';

interface CameraComponentProps {}

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

export const CameraComponent = (props: CameraComponentProps) => {
  const [isActive, setIsActive] = useState(true);

  const [layout, setLayout] = useState<LayoutRectangle | undefined>(undefined);
  const [resposneLayout, setResponseLayout] = useState<
    LayoutRectangle | undefined
  >(undefined);
  const [response, setResponse] = useState<Response | undefined>({
    width: 0,
    height: 0,
    blocks: [],
  });

  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );
  const devices = useCameraDevices();
  const device = devices[cameraPosition];

  useEffect(() => {
    if (response && layout) {
      const responseAspect = response.height / response.width;
      const layoutAspect = layout.height / layout.width;
      if (responseAspect > layoutAspect) {
        setResponseLayout({
          ...layout,
          height: layout.width * responseAspect,
          y: -0.5 * (layout.width * responseAspect - layout.height),
        });
      } else if (responseAspect < layoutAspect) {
        setResponseLayout({
          ...layout,
          width: layout.height / responseAspect,
          x: -0.5 * (layout.height / responseAspect - layout.width),
        });
      } else {
        setResponseLayout(layout);
      }
    }
  }, [response, layout]);

  // useEffect(() => {
  //   if (response && layout && resposneLayout) {
  //     console.log(response.width, response.height)
  //     console.log(layout.width, layout.height)
  //     console.log(resposneLayout.width, resposneLayout.height)
  //   }
  // }, [response, layout, resposneLayout]);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const ocrResponse = textRecognition(frame);
    // console.log(`Return Values: ${JSON.stringify(ocrResponse)}`);
    if (ocrResponse?.blocks?.length > 0) {
      runOnJS(setResponse)(ocrResponse);
    }
  }, []);

  return (
    <>
      {!!device && (
        <View
          style={StyleSheet.absoluteFill}
          onLayout={event => {
            setLayout(event.nativeEvent.layout);
            console.log('event.nativeEvent.layout', event.nativeEvent.layout);
          }}>
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
            frameProcessorFps={2}
            // onFrameProcessorPerformanceSuggestionAvailable={onFrameProcessorSuggestionAvailable}
          />
          {/*{!!response.value && (*/}
          {/*  <ResponseRenderer*/}
          {/*    response={response}*/}
          {/*    scale={windowWidth / response.width}*/}
          {/*  />*/}
          {/*)}*/}
          {/*<Canvas style={StyleSheet.absoluteFill}>*/}
          {/*  <Path*/}
          {/*    // path={ocrPath.value}*/}
          {/*    path="M67 417 L94 417 L94 423 L67 423 Z"*/}
          {/*    color="lightblue"*/}
          {/*  />*/}
          {/*</Canvas>*/}
          {!!(response && resposneLayout) && (
            <ResponseRenderer
              response={response}
              scale={resposneLayout.width / response.width}
              layout={resposneLayout}
            />
          )}
        </View>
      )}
    </>
  );
};
