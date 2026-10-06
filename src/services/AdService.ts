export interface AdResult {
  rewardEarned: boolean;
  adClosed: boolean;
}

class AdServiceImpl {
  public async showRewardedAd(placement: string): Promise<AdResult> {
    // Mock rewarded ad experience for casual architecture
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ rewardEarned: true, adClosed: true });
      }, 500);
    });
  }

  public async showInterstitial(placement: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  }
}

export const AdService = new AdServiceImpl();
