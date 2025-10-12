class MediaStreamManager {
    private activeStreams: Set<MediaStream> = new Set();

    register(stream: MediaStream): void {
        this.activeStreams.add(stream);
    }

    unregister(stream: MediaStream): void {
        if (this.activeStreams.has(stream)) {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
            this.activeStreams.delete(stream);
        }
    }

    stopAll(): void {
        this.activeStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
        });

        this.activeStreams.clear();
    }

    getActiveCount(): number {
        return this.activeStreams.size;
    }

    getActiveStreams(): MediaStream[] {
        return Array.from(this.activeStreams);
    }
}

export const mediaStreamManager = new MediaStreamManager();
