import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HlsVideo from './HlsVideo';

const hlsMocks = vi.hoisted(() => ({
  attachMedia: vi.fn(),
  destroy: vi.fn(),
  isSupported: vi.fn(() => true),
  loadSource: vi.fn(),
  on: vi.fn(),
}));

vi.mock('hls.js/light', () => ({
  default: class MockHls {
    static Events = { MANIFEST_PARSED: 'manifestParsed' };
    static isSupported = hlsMocks.isSupported;

    attachMedia = hlsMocks.attachMedia;
    destroy = hlsMocks.destroy;
    loadSource = hlsMocks.loadSource;
    on = hlsMocks.on;
  },
}));

describe('HlsVideo cleanup', () => {
  afterEach(() => {
    cleanup();
    hlsMocks.isSupported.mockReturnValue(true);
    vi.restoreAllMocks();
  });

  it('removes the native loadedmetadata listener when unmounted', async () => {
    hlsMocks.isSupported.mockReturnValue(false);
    vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('maybe');
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
    const addListener = vi.spyOn(HTMLMediaElement.prototype, 'addEventListener');
    const removeListener = vi.spyOn(HTMLMediaElement.prototype, 'removeEventListener');

    const { unmount } = render(<HlsVideo src="https://example.com/video.m3u8" />);

    await waitFor(() => {
      expect(addListener).toHaveBeenCalledWith('loadedmetadata', expect.any(Function));
    });
    const loadedMetadataCall = addListener.mock.calls
      .filter(([eventName]) => eventName === 'loadedmetadata')
      .at(-1);

    unmount();

    expect(loadedMetadataCall).toBeDefined();
    expect(removeListener).toHaveBeenCalledWith(
      'loadedmetadata',
      loadedMetadataCall?.[1],
    );
  });

  it('loads HLS light dynamically and destroys it when unmounted', async () => {
    const { unmount } = render(<HlsVideo src="https://example.com/video.m3u8" />);

    await waitFor(() => expect(hlsMocks.loadSource).toHaveBeenCalledWith('https://example.com/video.m3u8'));

    unmount();

    expect(hlsMocks.attachMedia).toHaveBeenCalled();
    expect(hlsMocks.destroy).toHaveBeenCalled();
  });
});
