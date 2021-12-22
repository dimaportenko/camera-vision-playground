package com.cameravision.textrecognitionpackage;

import androidx.camera.core.ImageProxy;

import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;

/**
 * Created by Dmytro Portenko on 22.12.2021.
 */
public class TextRecognitionProcessorPlugin extends FrameProcessorPlugin {
    @Override
    public Object callback(ImageProxy image, Object[] params) {
        // code goes here
        return "test return value from Java frame processor";
    }

    TextRecognitionProcessorPlugin() {
        super("textRecognition");
    }
}
