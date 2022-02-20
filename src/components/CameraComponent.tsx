/**
 * Created by Dima Portenko on 22.12.2021
 */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  LayoutRectangle,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Camera,
  PhotoFile,
  useCameraDevices,
  useFrameProcessor,
  VideoFile,
} from 'react-native-vision-camera';
import {Canvas, Path} from '@shopify/react-native-skia';
import Reanimated, {runOnJS, useSharedValue} from 'react-native-reanimated';
import {
  Block,
  Response,
  textRecognition,
} from '../frame-processors/TextRecognitionPlugin';
import {ResponseRenderer} from './ResponseRenderer';
import {CaptureButton} from './views/CaptureButton';
import {
  CONTENT_SPACING,
  MAX_ZOOM_FACTOR,
  SAFE_AREA_PADDING,
} from '../utils/Constants';
import {StatusBarBlurBackground} from './views/StatusBarBlurBackground';
import {useFocusEffect} from '@react-navigation/native';

interface CameraComponentProps {}

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

const BUTTON_SIZE = 40;

export const CameraComponent = (props: CameraComponentProps) => {
  const camera = useRef<Camera>(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [imageUri, setImageUri] = useState<string>('');

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

  const isPressingButton = useSharedValue(false);

  const isActive = !imageUri;

  const zoom = useSharedValue(0);
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

  const setIsPressingButton = useCallback(
    (_isPressingButton: boolean) => {
      isPressingButton.value = _isPressingButton;
    },
    [isPressingButton],
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (imageUri) {
          setImageUri('');
          return true;
        } else {
          return false;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [imageUri, setImageUri]),
  );

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

  const onMediaCaptured = useCallback(
    (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
      console.log(`Media captured! ${JSON.stringify(media)}`);
      // navigation.navigate('MediaPage', {
      //   path: media.path,
      //   type: type,
      // });
      if (type === 'photo') {
        setImageUri(media.path);
      }
    },
    [],
  );

  const onInitialized = useCallback(() => {
    console.log('Camera initialized!');
    setIsCameraInitialized(true);
  }, []);

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
      ocrResponse.blocks = ocrResponse?.blocks.map(block => {
        block.lines = block.lines.filter(line => /\d/.test(line.text));
        return block;
      });
      runOnJS(setResponse)(ocrResponse);
    }
  }, []);

  return (
    <View style={styles.container}>
      {!!device && (
        <View
          style={StyleSheet.absoluteFill}
          onLayout={event => {
            setLayout(event.nativeEvent.layout);
            console.log('event.nativeEvent.layout', event.nativeEvent.layout);
          }}>
          <ReanimatedCamera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            // format={format}
            // fps={fps}
            // hdr={enableHdr}
            // lowLightBoost={device.supportsLowLightBoost && enableNightMode}
            isActive={isActive}
            onInitialized={onInitialized}
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

      <CaptureButton
        style={styles.captureButton}
        camera={camera}
        onMediaCaptured={onMediaCaptured}
        cameraZoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        // flash={supportsFlash ? flash : 'off'}
        flash={'off'}
        enabled={isCameraInitialized && isActive}
        setIsPressingButton={setIsPressingButton}
      />

      {/*<StatusBarBlurBackground />*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  captureButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: SAFE_AREA_PADDING.paddingBottom,
  },
  button: {
    marginBottom: CONTENT_SPACING,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonRow: {
    position: 'absolute',
    right: SAFE_AREA_PADDING.paddingRight,
    top: SAFE_AREA_PADDING.paddingTop,
  },
  text: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
