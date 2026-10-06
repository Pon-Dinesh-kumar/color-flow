import { AudioManager } from '../engine/AudioManager';

class CloudTransitionAudioImpl {
  /**
   * Keep the old cloud sound only (AudioManager.playCloudWhoosh())
   */
  public playStart() {
    AudioManager.playCloudWhoosh();
  }

  public playCover() {
    // Keep clean - old sound only
  }

  public playFlyThrough() {
    // Keep clean - old sound only
  }

  public playReveal() {
    AudioManager.playCloudWhoosh();
  }

  public playComplete() {
    // Keep clean - old sound only
  }
}

export const CloudTransitionAudio = new CloudTransitionAudioImpl();
