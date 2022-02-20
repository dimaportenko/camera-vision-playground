//
//  TextRecognitionProcessorPlugin.m
//  CameraVision
//
//  Created by Dmytro on 17.02.2022.
//

#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/Frame.h>

#import <AVFoundation/AVFoundation.h>

@import MLImage;
@import MLKit;

@interface TextRecognitionProcessorPlugin : NSObject
@end

@implementation TextRecognitionProcessorPlugin

+ (NSMutableDictionary *)getFrameDictionary:(CGRect)frame {
  NSMutableDictionary *rect = [NSMutableDictionary dictionary];
  
  [rect setValue:[NSNumber numberWithFloat:frame.origin.x] forKey:@"left"];
  [rect setValue:[NSNumber numberWithFloat:frame.origin.y] forKey:@"top"];
  [rect setValue:[NSNumber numberWithFloat:frame.size.width] forKey:@"width"];
  [rect setValue:[NSNumber numberWithFloat:frame.size.height] forKey:@"height"];
  
  return rect;
}


static inline id textRecognition(Frame* frame, NSArray* args) {
  CMSampleBufferRef buffer = frame.buffer;
  UIImageOrientation orientation = frame.orientation;
  MLKVisionImage *visionImage = [[MLKVisionImage alloc] initWithBuffer:buffer];
  
  
  MLKTextRecognizer *textRecognizer = [MLKTextRecognizer textRecognizer];
  
  NSError *error = nil;
  MLKText *result = [textRecognizer resultsInImage:visionImage error:&error];
  NSMutableDictionary *response = [NSMutableDictionary dictionary];
  
  
  if (error != nil || result == nil) {
    return nil;
  }
  
  CVImageBufferRef cvImage = CMSampleBufferGetImageBuffer(buffer);
  CIImage *ciImage = [CIImage imageWithCVPixelBuffer:cvImage];
  
  
  [response setValue:[NSNumber numberWithFloat:ciImage.extent.size.width] forKey:@"width"];
  [response setValue:[NSNumber numberWithFloat:ciImage.extent.size.height] forKey:@"height"];
  
  NSMutableArray *blocks = [NSMutableArray array];
  // Recognized text
  //    NSString *resultText = result.text;
  for (MLKTextBlock *block in result.blocks) {
    NSMutableDictionary *blockDict = [NSMutableDictionary dictionary];
    [blockDict setValue:block.text forKey:@"text"];
    [blockDict setValue:[TextRecognitionProcessorPlugin getFrameDictionary:block.frame] forKey:@"rect"];
    
    
    NSMutableArray *lines = [NSMutableArray array];
    for (MLKTextLine *line in block.lines) {
      NSMutableDictionary *lineDict = [NSMutableDictionary dictionary];
      [lineDict setValue:line.text forKey:@"text"];
      [lineDict setValue:[TextRecognitionProcessorPlugin getFrameDictionary:line.frame] forKey:@"rect"];
      
      [lines addObject:lineDict];
    }
    [blockDict setValue:lines forKey:@"lines"];
    [blocks addObject:blockDict];
  }
  
  [response setValue:blocks forKey:@"blocks"];
  
  
  // code goes here
  return response;
}

VISION_EXPORT_FRAME_PROCESSOR(textRecognition)

@end
