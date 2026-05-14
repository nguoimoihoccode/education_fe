import { useEffect, useRef } from 'react';
import type Hls from 'hls.js';

interface HlsVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

const HlsVideo = ({ src, className = '', style }: HlsVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    let disposed = false;
    const playVideo = () => {
      video.play().catch(() => {});
    };

    const loadHls = async () => {
      const { default: Hls } = await import('hls.js/light');

      if (disposed) return;

      if (Hls.isSupported()) {
        const hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls = hlsInstance;
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, playVideo);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', playVideo);
      }
    };

    void loadHls();

    return () => {
      disposed = true;
      video.removeEventListener('loadedmetadata', playVideo);
      video.removeAttribute('src');
      video.load();
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      style={style}
      autoPlay
      loop
      muted
      playsInline
    />
  );
};

export default HlsVideo;
