/**
 * The founder's streaming rules for a MEGA file (test-mega-findings item 6, admin brief 4.4): at or under 720p and 5 Mbps is
 * ready; above 1080p or 15 Mbps is too heavy; in between is heavy; without size or length it is unknown. Grades never block
 * a save. HEVC and other video codecs browsers cannot play block publishing (V2-SPEC C5).
 */
import type { MegaMeta, MegaWarning, StreamGrade } from './admin.ts';

export function streamGrade(meta: Pick<MegaMeta, 'width' | 'height' | 'durationMs' | 'bitrate'> | null | undefined): StreamGrade {
  if (!meta || !meta.width || !meta.height || !meta.durationMs) return 'unknown';
  const short = Math.min(meta.width, meta.height);
  const mbps = (meta.bitrate ?? 0) / 1e6;
  if (short <= 720 && mbps <= 5) return 'ready';
  if (short > 1080 || mbps > 15) return 'too-heavy';
  return 'heavy';
}

/** Video and audio sample-entry codes from MegaMeta.codec ('avc1+mp4a'). */
export function codecParts(codec: string | null | undefined): { video: string | null; audio: string | null } {
  if (!codec) return { video: null, audio: null };
  const [video, audio] = codec.split('+');
  return { video: video || null, audio: audio || null };
}

const PLAYABLE_VIDEO = /* @__PURE__ */ new Set(['avc1', 'avc3']);
const HEVC = /* @__PURE__ */ new Set(['hvc1', 'hev1']);
/** Sound browsers play in MP4: AAC (and Opus or FLAC, which Chrome and Firefox play). */
const PLAYABLE_AUDIO = /* @__PURE__ */ new Set(['mp4a', 'Opus', 'fLaC']);

/** False for HEVC or a video codec browsers cannot play. A file whose header was not read counts as playable (unknown). */
export function isPlayable(meta: Pick<MegaMeta, 'codec'> | null | undefined): boolean {
  const { video } = codecParts(meta?.codec);
  return !video || PLAYABLE_VIDEO.has(video);
}

/** "4K", "1440p", "1080p", "720p", "480p", or "<n>p" below that, from the short side. */
export function resolutionLabel(width: number | null, height: number | null): string | null {
  if (!width || !height) return null;
  const short = Math.min(width, height);
  if (short >= 2160) return '4K';
  if (short >= 1440) return '1440p';
  if (short >= 1080) return '1080p';
  if (short >= 720) return '720p';
  if (short >= 480) return '480p';
  return `${short}p`;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}

const mbpsText = (bitrate: number | null) => `${((bitrate ?? 0) / 1e6).toFixed(1)}`;

/** The one line under the MEGA field for a grade (admin brief 4.4; the UI may reword it). */
export function gradeLabel(grade: StreamGrade, meta: MegaMeta | null | undefined): string {
  if (!meta || grade === 'unknown') return "Couldn't read the video's size and length. It may still play.";
  const res = resolutionLabel(meta.width, meta.height) ?? 'This video';
  const n = mbpsText(meta.bitrate);
  const size = formatBytes(meta.size);
  if (grade === 'ready') return `Ready to stream. ${res} at ${n} Mbps, ${size}.`;
  if (grade === 'heavy') return `This is ${res} at ${n} Mbps (${size}). Upload a 720p version for smooth playback and to save MEGA bandwidth.`;
  return `This is ${res} at ${n} Mbps (${size}), much heavier than the site needs, and phones will buffer. Upload a 720p H.264 version, about 2.5 to 5 Mbps.`;
}

/**
 * One warning per problem the header shows: HEVC, another video codec, an audio codec browsers may not play, no sound, the
 * index at the end, no header at all. Size and bitrate are the grade's job (gradeLabel), not warnings.
 */
export function megaWarnings(meta: MegaMeta | null | undefined): MegaWarning[] {
  const out: MegaWarning[] = [];
  if (!meta) return out;
  const { video, audio } = codecParts(meta.codec);
  if (!meta.codec || !meta.width || !meta.height || !meta.durationMs) {
    out.push({ code: 'no-header-info', message: "Couldn't read the video's size and length. It may still play." });
  }
  if (video && HEVC.has(video)) {
    out.push({ code: 'hevc', message: "This file uses HEVC (H.265), which many browsers can't play. It can stay a draft; export it as H.264 to publish." });
  } else if (video && !PLAYABLE_VIDEO.has(video)) {
    out.push({ code: 'video-codec', message: `This file's video is ${video}, which browsers can't play. It can stay a draft; export it as H.264 to publish.` });
  }
  if (meta.codec && video && !audio) out.push({ code: 'no-audio', message: 'This file has no sound.' });
  else if (audio && !PLAYABLE_AUDIO.has(audio)) out.push({ code: 'audio-codec', message: `Its sound is ${audio}, which Chrome may not play. Export with AAC audio.` });
  if (meta.fastStart === false) {
    out.push({ code: 'not-fast-start', message: 'The file\'s index is at the end, so it starts late. Export with "fast start" (sometimes called "optimise for web").' });
  }
  return out;
}
