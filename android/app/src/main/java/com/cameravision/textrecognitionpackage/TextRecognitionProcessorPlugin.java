package com.cameravision.textrecognitionpackage;

import android.annotation.SuppressLint;
import android.graphics.Point;
import android.graphics.Rect;
import android.media.Image;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.camera.core.ImageProxy;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;

import java.util.concurrent.ExecutionException;

/**
 * Created by Dmytro Portenko on 22.12.2021.
 */
public class TextRecognitionProcessorPlugin extends FrameProcessorPlugin {
    public WritableMap getRectMap(Rect rect) {
        WritableMap rectObject = Arguments.createMap();

        rectObject.putInt("left", rect.left);
        rectObject.putInt("top", rect.top);
        rectObject.putInt("width", rect.right - rect.left);
        rectObject.putInt("height", rect.bottom - rect.top);

        return rectObject;
    }
    @Override
    public Object callback(ImageProxy imageProxy, Object[] params) {

        @SuppressLint("UnsafeOptInUsageError") Image mediaImage = imageProxy.getImage();
        if (mediaImage != null) {
            InputImage image =
                InputImage.fromMediaImage(mediaImage, imageProxy.getImageInfo().getRotationDegrees());

            WritableMap response = Arguments.createMap();
            response.putInt("width", image.getWidth());
            response.putInt("height", image.getHeight());

            TextRecognizer recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);


            Task<Text> task =
                recognizer.process(image)
                    .addOnFailureListener(
                        new OnFailureListener() {
                            @Override
                            public void onFailure(@NonNull Exception e) {
                                Log.d("OnFailureListener", e.getMessage());
                            }
                        });
            try {
                Text visionText = Tasks.await(task);
                WritableArray blocks = Arguments.createArray();
                for (Text.TextBlock block : visionText.getTextBlocks()) {
                    WritableMap blockObject = Arguments.createMap();
                    blockObject.putString("text", block.getText());
                    blockObject.putMap("rect", getRectMap(block.getBoundingBox()));

                    WritableArray lines = Arguments.createArray();
                    for (Text.Line line : block.getLines()) {
                        WritableMap lineObject = Arguments.createMap();
                        lineObject.putString("text", line.getText());
                        lineObject.putMap("rect", getRectMap(line.getBoundingBox()));
                        lines.pushMap(lineObject);
                    }
                    blockObject.putArray("lines", lines);
                    blocks.pushMap(blockObject);
                }
                response.putArray("blocks", blocks);
                return response;

            } catch (ExecutionException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        }

        return null;
    }

    TextRecognitionProcessorPlugin() {
        super("textRecognition");
    }
}
