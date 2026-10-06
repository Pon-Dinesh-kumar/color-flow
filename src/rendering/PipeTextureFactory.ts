import * as THREE from 'three';

export class PipeTextureFactory {
  private static rotationTexture: THREE.CanvasTexture | null = null;
  private static lockTexture: THREE.CanvasTexture | null = null;
  private static blockerTexture: THREE.CanvasTexture | null = null;
  private static glassReflectionTexture: THREE.CanvasTexture | null = null;

  /**
   * Generates the crisp white circular double-arrow rotation badge on cobalt blue
   * exactly matching the reference image's "Rotatable Junction (Manual Rotate)".
   */
  public static getRotationBadgeTexture(): THREE.CanvasTexture {
    if (this.rotationTexture) return this.rotationTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Transparent background
    ctx.clearRect(0, 0, 256, 256);

    // Outer subtle cyan glow
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;

    // Center circular badge
    ctx.beginPath();
    ctx.arc(128, 128, 100, 0, Math.PI * 2);
    ctx.fillStyle = '#0284c7';
    ctx.fill();

    // Inner bright gradient
    const grad = ctx.createLinearGradient(60, 60, 200, 200);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(1, '#0369a1');
    ctx.beginPath();
    ctx.arc(128, 128, 92, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Reset shadow for crisp icon
    ctx.shadowBlur = 0;

    // Draw circular double-arrow rotation symbol
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';

    // Top arc
    ctx.beginPath();
    ctx.arc(128, 128, 54, -Math.PI * 0.8, -Math.PI * 0.1);
    ctx.stroke();

    // Top arrow head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(164, 82);
    ctx.lineTo(194, 94);
    ctx.lineTo(176, 120);
    ctx.closePath();
    ctx.fill();

    // Bottom arc
    ctx.beginPath();
    ctx.arc(128, 128, 54, Math.PI * 0.2, Math.PI * 0.9);
    ctx.stroke();

    // Bottom arrow head
    ctx.beginPath();
    ctx.moveTo(92, 174);
    ctx.lineTo(62, 162);
    ctx.lineTo(80, 136);
    ctx.closePath();
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.rotationTexture = texture;
    return texture;
  }

  /**
   * Generates white padlock symbol for Locked Pipe
   */
  public static getLockTexture(): THREE.CanvasTexture {
    if (this.lockTexture) return this.lockTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 256);

    // Dark rounded square badge
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(28, 28, 200, 200, 40);
    ctx.fill();

    // Chrome border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Shackle
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(128, 100, 36, Math.PI, 0);
    ctx.lineTo(164, 130);
    ctx.moveTo(92, 100);
    ctx.lineTo(92, 130);
    ctx.stroke();

    // Padlock body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(80, 125, 96, 75, 16);
    ctx.fill();

    // Keyhole
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(128, 155, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(124, 155);
    ctx.lineTo(132, 155);
    ctx.lineTo(135, 178);
    ctx.lineTo(121, 178);
    ctx.closePath();
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    this.lockTexture = texture;
    return texture;
  }

  /**
   * Generates red square with white X for Blocker
   */
  public static getBlockerTexture(): THREE.CanvasTexture {
    if (this.blockerTexture) return this.blockerTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 256);

    // Red rounded box
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(32, 32, 192, 192, 36);
    ctx.fill();

    // White X
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(76, 76);
    ctx.lineTo(180, 180);
    ctx.moveTo(180, 76);
    ctx.lineTo(76, 180);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    this.blockerTexture = texture;
    return texture;
  }
}
