/**
 * Created by Dima Portenko on 17.07.2021
 */
import React, {useMemo} from 'react';
import {StyleSheet, View, Text, LayoutRectangle} from 'react-native';
import {Line, Response} from '../frame-processors/TextRecognitionPlugin';

interface ResponseRendererProps {
  response: Response;
  scale: number;
  layout: LayoutRectangle | undefined;
}

export const ResponseRenderer = ({
  response,
  scale,
  layout,
}: ResponseRendererProps) => {
  if (!layout || !response) {
    return null;
  }

  return (
    <View
      // style={StyleSheet.absoluteFillObject}
      style={{
        position: 'absolute',
        width: layout.width,
        height: layout.height,
        top: layout.y,
        left: layout.x,
      }}>
      {response.blocks.map(block =>
        block.lines.map(line => {
          return <Block line={line} scale={scale} key={JSON.stringify(line)} />;
        }),
      )}
    </View>
  );
};

interface BlockProps {
  line: Line;
  scale: number;
}

export const Block = ({line, scale}: BlockProps) => {
  const rect = useMemo(() => {
    return {
      left: line.rect.left * scale,
      top: line.rect.top * scale,
      height: line.rect.height * scale,
      width: line.rect.width * scale,
    };
  }, [line, scale]);

  return (
    <View
      style={{
        position: 'absolute',
        borderWidth: 1,
        borderColor: 'red',
        // ...line.rect,
        ...rect,
      }}>
      <Text style={{color: 'blue'}}>{line.text}</Text>
    </View>
  );
};
