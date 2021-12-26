/* global __textRecognition */
import type {Frame} from 'react-native-vision-camera';

declare let _WORKLET: true | undefined;

export type Rect = {
  left: number;
  top: number;
  height: number;
  width: number;
};
export type Line = {
  text: string;
  rect: Rect;
};
export type Block = {
  text: string;
  rect: Rect;
  lines: Line[];
};
export type Response = {
  width: number;
  height: number;
  blocks: Block[];
};

export function textRecognition(frame: Frame): Response {
  'worklet';
  if (!_WORKLET)
    throw new Error('textRecognition must be called from a frame processor!');

  // @ts-expect-error because this function is dynamically injected by VisionCamera
  return __textRecognition(frame);
}
