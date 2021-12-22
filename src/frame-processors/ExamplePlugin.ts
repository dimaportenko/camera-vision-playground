/* global __textRecognition */
import type {Frame} from 'react-native-vision-camera';

declare let _WORKLET: true | undefined;

export function textRecognition(frame: Frame): string[] {
  'worklet';
  if (!_WORKLET)
    throw new Error('textRecognition must be called from a frame processor!');

  // @ts-expect-error because this function is dynamically injected by VisionCamera
  return __textRecognition(frame);
}
