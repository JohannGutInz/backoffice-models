"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { LinkListInput } from "@/components/ui/LinkListInput";
import { GalleryImageUpload, type GalleryImageUploadHandle } from "@/components/models/GalleryImageUpload";
import { GalleryVideoUpload, type GalleryVideoUploadHandle } from "@/components/models/GalleryVideoUpload";

const MAX_CASUAL_PHOTOS = 5;
const MAX_BOOK_PHOTOS = 5;
const MAX_EVENT_PHOTOS = 8;
const MAX_CAMPAIGN_LINKS = 5;

interface Field<T> {
  value: T;
  onChange: (value: T) => void;
  error?: string;
}

interface ModelMediaFieldsProps {
  modelId?: string;
  casualPhotos: Field<string[]>;
  bookPhotos: Field<string[]>;
  eventPhotos: Field<string[]>;
  presentationVideo: Field<string>;
  campaignLinks: Field<string[]>;
}

export interface ModelMediaFieldsHandle {
  resolvePending(): Promise<{
    casualPhotoUrls: string[];
    bookPhotoUrls: string[];
    eventPhotoUrls: string[];
    presentationVideoUrl: string;
  }>;
}

export const ModelMediaFields = forwardRef<ModelMediaFieldsHandle, ModelMediaFieldsProps>(function ModelMediaFields(
  { modelId, casualPhotos, bookPhotos, eventPhotos, presentationVideo, campaignLinks },
  ref,
) {
  const casualRef = useRef<GalleryImageUploadHandle>(null);
  const bookRef = useRef<GalleryImageUploadHandle>(null);
  const eventRef = useRef<GalleryImageUploadHandle>(null);
  const videoRef = useRef<GalleryVideoUploadHandle>(null);

  useImperativeHandle(ref, () => ({
    async resolvePending() {
      const [casualPhotoUrls, bookPhotoUrls, eventPhotoUrls, resolvedVideos] = await Promise.all([
        casualRef.current?.resolvePending(casualPhotos.value) ?? Promise.resolve(casualPhotos.value),
        bookRef.current?.resolvePending(bookPhotos.value) ?? Promise.resolve(bookPhotos.value),
        eventRef.current?.resolvePending(eventPhotos.value) ?? Promise.resolve(eventPhotos.value),
        videoRef.current?.resolvePending(presentationVideo.value ? [presentationVideo.value] : []) ??
          Promise.resolve(presentationVideo.value ? [presentationVideo.value] : []),
      ]);
      return {
        casualPhotoUrls,
        bookPhotoUrls,
        eventPhotoUrls,
        presentationVideoUrl: resolvedVideos[0] ?? "",
      };
    },
  }));

  return (
    <>
      <Card>
        <CardHeader title="Fotos caseras" subtitle="Fotos naturales, sin producción." />
        <div className="px-5 pb-5">
          <GalleryImageUpload
            ref={casualRef}
            value={casualPhotos.value}
            onChange={casualPhotos.onChange}
            max={MAX_CASUAL_PHOTOS}
            modelId={modelId}
            label="Fotos caseras"
          />
          {casualPhotos.error && <p className="mt-1.5 text-xs text-red-500">{casualPhotos.error}</p>}
        </div>
      </Card>

      <Card>
        <CardHeader title="Fotos de book" subtitle="Fotos profesionales de tu portafolio." />
        <div className="px-5 pb-5">
          <GalleryImageUpload
            ref={bookRef}
            value={bookPhotos.value}
            onChange={bookPhotos.onChange}
            max={MAX_BOOK_PHOTOS}
            modelId={modelId}
            label="Fotos de book"
          />
          {bookPhotos.error && <p className="mt-1.5 text-xs text-red-500">{bookPhotos.error}</p>}
        </div>
      </Card>

      <Card>
        <CardHeader title="Fotos de eventos" subtitle="Fotos en eventos donde hayas trabajado." />
        <div className="px-5 pb-5">
          <GalleryImageUpload
            ref={eventRef}
            value={eventPhotos.value}
            onChange={eventPhotos.onChange}
            max={MAX_EVENT_PHOTOS}
            modelId={modelId}
            label="Fotos de eventos"
          />
          {eventPhotos.error && <p className="mt-1.5 text-xs text-red-500">{eventPhotos.error}</p>}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Video de presentación"
          subtitle="Un video corto presentándote — quién eres, qué haces, cómo te expresas."
        />
        <div className="px-5 pb-5">
          <GalleryVideoUpload
            ref={videoRef}
            value={presentationVideo.value ? [presentationVideo.value] : []}
            onChange={(urls) => presentationVideo.onChange(urls[0] ?? "")}
            max={1}
            modelId={modelId}
            label="Video de presentación"
          />
          {presentationVideo.error && <p className="mt-1.5 text-xs text-red-500">{presentationVideo.error}</p>}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Links a videos de campañas"
          subtitle="Comparte links de YouTube, Vimeo u otras plataformas donde aparezcas como modelo."
        />
        <div className="px-5 pb-5">
          <LinkListInput
            label="Links de campañas"
            hint={`(máximo ${MAX_CAMPAIGN_LINKS})`}
            value={campaignLinks.value}
            onChange={campaignLinks.onChange}
            max={MAX_CAMPAIGN_LINKS}
            placeholder="https://youtube.com/…"
            error={campaignLinks.error}
          />
        </div>
      </Card>
    </>
  );
});
