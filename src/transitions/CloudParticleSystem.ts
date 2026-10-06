import { CloudThemeColors } from './CloudTheme';

export interface LightRay {
  angle: number;
  length: number;
  width: number;
  alpha: number;
  pulsePhase: number;
}

export interface MotionStreak {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  width: number;
  alpha: number;
  color: string;
}

export interface GlowParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulseSpeed: number;
  pulse: number;
}

export interface DriftingPuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  alpha: number;
  spriteIndex: number;
}

export class CloudParticleSystem {
  private lightRays: LightRay[] = [];
  private motionStreaks: MotionStreak[] = [];
  private glowParticles: GlowParticle[] = [];
  private driftingPuffs: DriftingPuff[] = [];

  constructor() {
    this.initRays();
    this.initGlowParticles();
  }

  private initRays() {
    this.lightRays = [];
    const rayCount = 12;
    for (let i = 0; i < rayCount; i++) {
      const angle = (Math.PI * 0.2) + (i / rayCount) * (Math.PI * 0.6); // fan downwards from top-center
      this.lightRays.push({
        angle,
        length: 600 + Math.random() * 400,
        width: 40 + Math.random() * 50,
        alpha: 0.15 + Math.random() * 0.25,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  private initGlowParticles() {
    this.glowParticles = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      this.glowParticles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.04,
        vy: -0.02 - Math.random() * 0.05,
        size: 3 + Math.random() * 5,
        alpha: 0.3 + Math.random() * 0.5,
        pulseSpeed: 2 + Math.random() * 3,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  public reset(width: number, height: number, theme: CloudThemeColors) {
    this.motionStreaks = [];
    const streakCount = 10;
    const streakColors = theme.motionStreak;

    for (let i = 0; i < streakCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 400 + Math.random() * 500;
      this.motionStreaks.push({
        x: width * 0.5 + (Math.random() - 0.5) * 80,
        y: height * 0.45 + (Math.random() - 0.5) * 80,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 60 + Math.random() * 100,
        width: 2.5 + Math.random() * 2.5,
        alpha: 0.5 + Math.random() * 0.4,
        color: streakColors[i % streakColors.length],
      });
    }

    this.driftingPuffs = [];
    for (let i = 0; i < 8; i++) {
      this.driftingPuffs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 20,
        scale: 0.5 + Math.random() * 0.6,
        alpha: 0.4 + Math.random() * 0.4,
        spriteIndex: i % 2,
      });
    }
  }

  public update(delta: number, width: number, height: number) {
    // 1. Update Light Rays
    for (const ray of this.lightRays) {
      ray.pulsePhase += delta * 2.5;
    }

    // 2. Update Motion Streaks (travel outward during fly-through)
    for (const s of this.motionStreaks) {
      s.x += s.vx * delta;
      s.y += s.vy * delta;
      s.length += delta * 60;
    }

    // 3. Update Glow Particles
    for (const g of this.glowParticles) {
      g.x += g.vx * delta;
      g.y += g.vy * delta;
      g.pulse += g.pulseSpeed * delta;
      if (g.y < -0.1) g.y = 1.1;
      if (g.x < -0.1) g.x = 1.1;
      if (g.x > 1.1) g.x = -0.1;
    }

    // 4. Update Drifting Puffs
    for (const p of this.driftingPuffs) {
      p.x += p.vx * delta;
      p.y += p.vy * delta;
    }
  }

  /**
   * Renders volumetric Light Rays radiating from center-top
   */
  public renderLightRays(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number,
    theme: CloudThemeColors
  ) {
    if (intensity <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const originX = width * 0.5;
    const originY = height * 0.35;

    // Center radiant burst bloom
    const coreGlow = ctx.createRadialGradient(originX, originY, 0, originX, originY, width * 0.6);
    coreGlow.addColorStop(0, 'rgba(255, 255, 255, ' + (0.65 * intensity) + ')');
    coreGlow.addColorStop(0.3, theme.coreGlow);
    coreGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(originX, originY, width * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Radiant fan rays
    for (const ray of this.lightRays) {
      const alpha = ray.alpha * (0.8 + Math.sin(ray.pulsePhase) * 0.2) * intensity;
      const endX = originX + Math.cos(ray.angle) * ray.length;
      const endY = originY + Math.sin(ray.angle) * ray.length;

      const grad = ctx.createLinearGradient(originX, originY, endX, endY);
      grad.addColorStop(0, 'rgba(255, 255, 255, ' + alpha + ')');
      grad.addColorStop(0.6, theme.lightRay);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = ray.width;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Renders Motion Streaks during fly-through phase (0.4s - 0.8s)
   */
  public renderMotionStreaks(
    ctx: CanvasRenderingContext2D,
    intensity: number
  ) {
    if (intensity <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const s of this.motionStreaks) {
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      if (speed === 0) continue;
      const dirX = s.vx / speed;
      const dirY = s.vy / speed;

      const tailX = s.x - dirX * s.length;
      const tailY = s.y - dirY * s.length;

      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.7, s.color);
      grad.addColorStop(1, 'rgba(255, 255, 255, ' + (s.alpha * intensity) + ')');

      ctx.strokeStyle = grad;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Renders floating Glow Particles
   */
  public renderGlowParticles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    alphaMultiplier: number
  ) {
    if (alphaMultiplier <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const g of this.glowParticles) {
      const px = g.x * width;
      const py = g.y * height;
      const currentAlpha = g.alpha * (0.6 + Math.sin(g.pulse) * 0.4) * alphaMultiplier;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, g.size * 2);
      grad.addColorStop(0, 'rgba(255, 255, 255, ' + currentAlpha + ')');
      grad.addColorStop(0.5, 'rgba(253, 230, 138, ' + (currentAlpha * 0.6) + ')');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, g.size * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
