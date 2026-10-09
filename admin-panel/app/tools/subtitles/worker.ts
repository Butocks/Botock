import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
  static instance: any = null;

  static async getInstance(progress_callback: any) {
    if (this.instance === null) {
      this.instance = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
        progress_callback
      });
    }
    return this.instance;
  }
}

self.addEventListener('message', async (e) => {
    const { type, audioData } = e.data;
    if (type !== 'generate') return;

    try {
        self.postMessage({ status: 'loading', message: 'Loading model (this might take a minute on first load)...' });
        
        let transcriber = await PipelineSingleton.getInstance((progress: any) => {
            self.postMessage({ status: 'progress', progress });
        });

        self.postMessage({ status: 'processing', message: 'Transcribing audio...' });

        // Run inference
        const output = await transcriber(audioData, {
            chunk_length_s: 30,
            stride_length_s: 5,
            return_timestamps: true, // Segment timestamps
        });

        self.postMessage({ status: 'done', output });
    } catch (error: any) {
        self.postMessage({ status: 'error', error: error.message });
    }
});
