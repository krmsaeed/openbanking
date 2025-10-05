/**
 * Global Media Stream Manager
 * Tracks all active media streams to prevent orphaned camera/microphone access
 */

class MediaStreamManager {
    private activeStreams: Set<MediaStream> = new Set();

    /**
     * Register a new media stream
     */
    register(stream: MediaStream): void {
        this.activeStreams.add(stream);
    }

    /**
     * Unregister and stop a media stream
     */
    unregister(stream: MediaStream): void {
        if (this.activeStreams.has(stream)) {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
            this.activeStreams.delete(stream);
        }
    }

    /**
     * Stop all active media streams
     */
    stopAll(): void {
        this.activeStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
        });

        this.activeStreams.clear();
    }

    /**
     * Get count of active streams
     */
    getActiveCount(): number {
        return this.activeStreams.size;
    }

    /**
     * Get all active streams
     */
    getActiveStreams(): MediaStream[] {
        return Array.from(this.activeStreams);
    }
}

// Export singleton instance
export const mediaStreamManager = new MediaStreamManager();
