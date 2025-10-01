'use client';

import { useState } from "react";
import { Maximize2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VideoCarouselProps {
    videos: string[];
    imageId: string;
    onFullscreen?: (url: string) => void;
    onDownload?: (url: string) => void;
}

export const VideoCarousel: React.FC<VideoCarouselProps> = ({
    videos,
    imageId,
    onFullscreen,
    onDownload,
}) => {
    const [carouselIndex, setCarouselIndex] = useState<number>(0);

    if (!videos || videos.length === 0) return null;

    const currentVideoUrl = videos[carouselIndex];

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        const prevIndex = carouselIndex > 0 ? carouselIndex - 1 : videos.length - 1;
        setCarouselIndex(prevIndex);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextIndex = carouselIndex < videos.length - 1 ? carouselIndex + 1 : 0;
        setCarouselIndex(nextIndex);
    };

    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        console.error("Error loading video:", { src: currentVideoUrl, error: e });
        toast({
            title: "Error loading video",
            description: "The video could not be loaded",
            variant: "destructive",
        });
    };

    return (
        <div className="relative group border rounded-lg overflow-hidden bg-white mx-2 mb-2">
            <video
                src={currentVideoUrl}
                controls
                className="w-full h-[200px] object-cover"
                onError={handleVideoError}
            />

            {/* Video Label */}
            <Badge
                variant="outline"
                className="absolute top-2 left-2 pointer-events-none text-xs drop-shadow-lg bg-green-600 text-white border-green-600"
            >
                Video
            </Badge>

            {/* Video Counter */}
            {videos.length > 1 && (
                <Badge
                    variant="outline"
                    className="absolute bottom-2 right-2 pointer-events-none text-xs drop-shadow-lg"
                >
                    {carouselIndex + 1}/{videos.length}
                </Badge>
            )}

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {onFullscreen && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-black/60 text-white hover:bg-black/80"
                        onClick={(e) => {
                            e.stopPropagation();
                            onFullscreen(currentVideoUrl);
                        }}
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                )}
                {onDownload && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-black/60 text-white hover:bg-black/80"
                        onClick={() => onDownload(currentVideoUrl)}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Carousel Navigation */}
            {videos.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-black/60 text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handlePrev}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-black/60 text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleNext}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </>
            )}
        </div>
    );
};
