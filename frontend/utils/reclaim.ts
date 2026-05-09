import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

const APP_ID = "0xFfa3FA1730a6228D70C0c833c889B479E72014Cc";
const APP_SECRET = "0x114cbb1ce07bb214d5abab3bfefe2523cf6eef2ae9916dd9de715547b188ce92";
const GITHUB_PROVIDER_ID = "6d3f6753-7ee6-49ee-a545-62f1b1822ae5";

export async function generateReclaimProof(
  onSuccess: (proof: unknown) => void
) {
  try {
    const reclaimProofRequest = await ReclaimProofRequest.init(
      APP_ID,
      APP_SECRET,
      GITHUB_PROVIDER_ID
    );

    const requestUrl = await reclaimProofRequest.getRequestUrl();

    reclaimProofRequest.startSession({
      onSuccess: (proof) => {
        console.log('Proof received:', proof);
        onSuccess(proof);
      },
      onError: (error) => {
        console.error('Proof failed:', error);
      },
    });

    return requestUrl;

  } catch (error) {
    console.error('Reclaim init error:', error);
    throw error;
  }
}