import { CLOUD_THEMES, CloudThemeColors, CloudThemeId } from './CloudTheme';

export class CloudAssetFactory {
  private static instance: CloudAssetFactory;

  // Cached pre-rendered cloud sprites per theme
  private topCanopyCanvases: Map<CloudThemeId, HTMLCanvasElement[]> = new Map();
  private largeCloudCanvases: Map<CloudThemeId, HTMLCanvasElement[]> = new Map();
  private mediumCloudCanvases: Map<CloudThemeId, HTMLCanvasElement[]> = new Map();
  private smallCloudCanvases: Map<CloudThemeId, HTMLCanvasElement[]> = new Map();
  private puffCanvases: Map<CloudThemeId, HTMLCanvasElement[]> = new Map();

  private constructor() {
    this.preGenerateAllThemes();
  }

  public static getInstance(): CloudAssetFactory {
    if (!CloudAssetFactory.instance) {
      CloudAssetFactory.instance = new CloudAssetFactory();
    }
    return CloudAssetFactory.instance;
  }

  private preGenerateAllThemes() {
    const themeIds: CloudThemeId[] = ['default', 'sunset', 'night', 'fantasy'];
    for (const id of themeIds) {
      const theme = CLOUD_THEMES[id];
      this.topCanopyCanvases.set(id, [
        this.generateTopCanopy(theme, 0),
        this.generateTopCanopy(theme, 1),
      ]);
      this.largeCloudCanvases.set(id, [
        this.generateVolumetricCloud(theme, 720, 520, 0),
        this.generateVolumetricCloud(theme, 720, 520, 1),
      ]);
      this.mediumCloudCanvases.set(id, [
        this.generateVolumetricCloud(theme, 520, 380, 2),
        this.generateVolumetricCloud(theme, 520, 380, 3),
      ]);
      this.smallCloudCanvases.set(id, [
        this.generateVolumetricCloud(theme, 340, 260, 4),
        this.generateVolumetricCloud(theme, 340, 260, 5),
      ]);
      this.puffCanvases.set(id, [
        this.generateVolumetricCloud(theme, 240, 190, 6),
        this.generateVolumetricCloud(theme, 240, 190, 7),
      ]);
    }
  }

  /**
   * Top Cloud Canopy:
   * Sweeping bank of billowing cumulus clouds that overhang from the top of the screen.
   * Guarantees 100% thick, billowy coverage of the status bar, notch, and header.
   */
  private generateTopCanopy(theme: CloudThemeColors, variant: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 460;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const w = canvas.width;
    const h = canvas.height;

    // Solid ceiling foundation with sky lavender gradient
    const ceilGrad = ctx.createLinearGradient(0, 0, 0, 220);
    ceilGrad.addColorStop(0, '#ffffff');
    ceilGrad.addColorStop(0.6, theme.secondary);
    ceilGrad.addColorStop(1.0, theme.shadow);
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(0, 0, w, 140);

    // Billow mounds hanging downwards from the ceiling
    const billows = variant === 0 ? [
      { x: w * 0.08, y: 120, r: 160 },
      { x: w * 0.22, y: 170, r: 180 },
      { x: w * 0.38, y: 220, r: 200 },
      { x: w * 0.55, y: 230, r: 210 },
      { x: w * 0.72, y: 190, r: 190 },
      { x: w * 0.88, y: 140, r: 170 },
      { x: w * 0.98, y: 90, r: 140 },
      { x: w * 0.30, y: 240, r: 160 },
      { x: w * 0.46, y: 260, r: 170 },
      { x: w * 0.64, y: 240, r: 160 },
    ] : [
      { x: w * 0.04, y: 100, r: 150 },
      { x: w * 0.18, y: 160, r: 180 },
      { x: w * 0.35, y: 210, r: 200 },
      { x: w * 0.50, y: 250, r: 220 },
      { x: w * 0.68, y: 220, r: 200 },
      { x: w * 0.84, y: 170, r: 180 },
      { x: w * 0.96, y: 110, r: 150 },
      { x: w * 0.42, y: 270, r: 160 },
      { x: w * 0.60, y: 260, r: 165 },
    ];

    // Render billows with rich volumetric colors (white top, lavender underbelly)
    this.paintBillowCluster(ctx, billows, theme);

    return canvas;
  }

  /**
   * Generates Volumetric Fluffy Clouds with authentic colors & soft pillowy volume:
   * - Crisp white sun-kissed crowns
   * - Rich periwinkle & lavender underbellies and crevice depth (matching reference image)
   * - Soft feathered cumulus edges (NO hard bubble circles!)
   */
  private generateVolumetricCloud(
    theme: CloudThemeColors,
    width: number,
    height: number,
    seed: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const cx = width / 2;
    const cy = height * 0.56;
    const scale = width / 720;

    // Organic arrangement of 16-24 overlapping billows that form a fluffy cumulus cloud
    const billows: { x: number; y: number; r: number }[] = [];

    // Foundation billows (bottom of cloud with deepest lavender/periwinkle shading)
    const baseCount = 6;
    for (let i = 0; i < baseCount; i++) {
      const bx = cx + ((i - 2.5) * 85 + ((seed * 19 + i * 29) % 30 - 15)) * scale;
      const by = cy + (40 + ((seed * 37 + i * 17) % 25 - 12)) * scale;
      const br = (120 + ((seed * 11 + i * 23) % 30 - 15)) * scale;
      billows.push({ x: bx, y: by, r: br });
    }

    // Mid-level billowing mounds
    const midCount = 7;
    for (let i = 0; i < midCount; i++) {
      const mx = cx + ((i - 3) * 70 + ((seed * 31 + i * 41) % 25 - 12)) * scale;
      const my = cy - (15 + ((seed * 43 + i * 19) % 30)) * scale;
      const mr = (130 + ((seed * 23 + i * 37) % 35 - 17)) * scale;
      billows.push({ x: mx, y: my, r: mr });
    }

    // Top crowning cumulus lobes (bright sun-lit puffy domes)
    const topCount = 5;
    for (let i = 0; i < topCount; i++) {
      const tx = cx + ((i - 2) * 75 + ((seed * 47 + i * 23) % 25 - 12)) * scale;
      const ty = cy - (75 + ((seed * 53 + i * 13) % 35)) * scale;
      const tr = (140 + ((seed * 29 + i * 31) % 30 - 15)) * scale;
      billows.push({ x: tx, y: ty, r: tr });
    }

    // Flank softening puffs
    billows.push({ x: cx - 230 * scale, y: cy + 10 * scale, r: 95 * scale });
    billows.push({ x: cx + 230 * scale, y: cy + 10 * scale, r: 95 * scale });
    billows.push({ x: cx - 150 * scale, y: cy - 90 * scale, r: 105 * scale });
    billows.push({ x: cx + 150 * scale, y: cy - 90 * scale, r: 105 * scale });

    this.paintBillowCluster(ctx, billows, theme);

    return canvas;
  }

  /**
   * Core Volumetric Cloud Painter:
   * Paints realistic, billowy cumulus clouds with rich color depth:
   * 1. Soft atmospheric base
   * 2. Deep periwinkle/lavender underbellies
   * 3. Solid creamy white cloud body
   * 4. Soft sunlit crowns and golden rim highlights
   * 5. Smooth feathered edges (never looks like hard-edged bubbles)
   */
  private paintBillowCluster(
    ctx: CanvasRenderingContext2D,
    billows: { x: number; y: number; r: number }[],
    theme: CloudThemeColors
  ) {
    // PASS 1: Ambient Underbelly & Crevice Shadow Depth (Rich Lavender & Sky Blue)
    // This gives the cloud its authentic colors and grounding volume
    for (const b of billows) {
      const grad = ctx.createRadialGradient(
        b.x,
        b.y + b.r * 0.35,
        b.r * 0.1,
        b.x,
        b.y + b.r * 0.35,
        b.r * 1.05
      );
      grad.addColorStop(0, theme.shadow);
      grad.addColorStop(0.55, theme.secondary);
      grad.addColorStop(0.85, 'rgba(147, 197, 253, 0.4)');
      grad.addColorStop(1.0, 'rgba(147, 197, 253, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y + b.r * 0.35, b.r * 1.05, 0, Math.PI * 2);
      ctx.fill();
    }

    // PASS 2: Solid Pure White Cloud Body with Soft Feathered Edge
    // Merges all billows into a single dense, cottony cloud mass
    for (const b of billows) {
      const grad = ctx.createRadialGradient(
        b.x - b.r * 0.1,
        b.y - b.r * 0.15,
        b.r * 0.2,
        b.x,
        b.y,
        b.r
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.70, '#ffffff');
      grad.addColorStop(0.88, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // PASS 3: Lower-Half Volumetric Shadow Glaze (Restores Rich Lavender Underbelly)
    // Applies soft periwinkle glaze across the lower section so the cloud has strong form contrast
    for (const b of billows) {
      const underGrad = ctx.createRadialGradient(
        b.x,
        b.y + b.r * 0.45,
        0,
        b.x,
        b.y + b.r * 0.3,
        b.r * 0.9
      );
      underGrad.addColorStop(0, theme.shadow);
      underGrad.addColorStop(0.5, theme.secondary);
      underGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = underGrad;
      ctx.beginPath();
      ctx.arc(b.x, b.y + b.r * 0.45, b.r * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // PASS 4: Sunlit Crown & Golden Peach Rim Highlight (Top Mounds)
    // Soft, diffuse light that washes across upper billows (NO sharp circular specular rings!)
    for (const b of billows) {
      const topGrad = ctx.createRadialGradient(
        b.x - b.r * 0.15,
        b.y - b.r * 0.35,
        0,
        b.x - b.r * 0.15,
        b.y - b.r * 0.35,
        b.r * 0.8
      );
      topGrad.addColorStop(0, '#ffffff');
      topGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.9)');
      topGrad.addColorStop(0.75, theme.warmHighlight); // subtle warm golden peach rim
      topGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.15, b.y - b.r * 0.35, b.r * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // PASS 5: Soft Atmospheric Perimeter Feathering
    // Dissolves any remaining circular boundaries into soft, dreamy cloud mist
    ctx.save();
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < billows.length; i += 2) {
      const b = billows[i];
      const mist = ctx.createRadialGradient(b.x, b.y, b.r * 0.85, b.x, b.y, b.r * 1.15);
      mist.addColorStop(0, '#ffffff');
      mist.addColorStop(0.5, theme.secondary);
      mist.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = mist;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- ACCESSORS ---
  public getTopCanopy(themeId: CloudThemeId = 'default', index = 0): HTMLCanvasElement {
    const list = this.topCanopyCanvases.get(themeId) || this.topCanopyCanvases.get('default')!;
    return list[index % list.length];
  }

  public getLargeCloud(themeId: CloudThemeId = 'default', index = 0): HTMLCanvasElement {
    const list = this.largeCloudCanvases.get(themeId) || this.largeCloudCanvases.get('default')!;
    return list[index % list.length];
  }

  public getMediumCloud(themeId: CloudThemeId = 'default', index = 0): HTMLCanvasElement {
    const list = this.mediumCloudCanvases.get(themeId) || this.mediumCloudCanvases.get('default')!;
    return list[index % list.length];
  }

  public getSmallCloud(themeId: CloudThemeId = 'default', index = 0): HTMLCanvasElement {
    const list = this.smallCloudCanvases.get(themeId) || this.smallCloudCanvases.get('default')!;
    return list[index % list.length];
  }

  public getCloudPuff(themeId: CloudThemeId = 'default', index = 0): HTMLCanvasElement {
    const list = this.puffCanvases.get(themeId) || this.puffCanvases.get('default')!;
    return list[index % list.length];
  }
}
