// Settings data from ImageMax
export const SEEDANCE_MODELS = [
  {
    name: "seedance-1-lite",
    value: "seedance-1-lite",
  },
  {
    name: "seedance-1-pro",
    value: "seedance-1-pro",
  },
];

export const SEEDANCE_DURATIONS = [
  {
    name: "5",
    value: 5,
  },
  {
    name: "10",
    value: 10,
  },
];

export const SEEDANCE_LITE_RESOLUTIONS = [
  {
    name: "480p",
    value: "480p",
  },
  {
    name: "720p",
    value: "720p",
  },
];

export const SEEDANCE_PRO_RESOLUTIONS = [
  {
    name: "480p",
    value: "480p",
  },
  {
    name: "1080p",
    value: "1080p",
  },
];

export const GEN4_MODELS = [
  {
    name: "Gen4 Image",
    value: "gen4-image",
    model: "runwayml/gen4-image"
  },
  {
    name: "Gen4 Image Turbo",
    value: "gen4-image-turbo",
    model: "runwayml/gen4-image-turbo"
  }
];

export const GEN4_ASPECT_RATIOS = [
  { label: "16:9", value: "16:9" },
  { label: "4:3", value: "4:3" },
  { label: "1:1", value: "1:1" },
  { label: "3:4", value: "3:4" },
  { label: "9:16", value: "9:16" }
];

export const GEN4_RESOLUTIONS = [
  { label: "720p", value: "720p" },
  { label: "1080p", value: "1080p" },
  { label: "4K", value: "4k" }
];

export const defaultSettings = {
  seedance: {
    model: "seedance-1-lite",
    resolution: "480p",
    duration: 5,
    cameraFixed: false,
  },
  kontext: {
    model: "dev" as "dev" | "max",
  },
  gen4: {
    model: "gen4-image",
    defaultAspectRatio: "16:9",
    defaultResolution: "1080p",
    autoDetectAspectRatio: true
  },
  general: {
    autoSave: true,
    showCostEstimates: true,
    maxConcurrentJobs: 3,
  },
};