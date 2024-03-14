type MediaRecord = InspectableUnknownEnvelope | AudioMetadataEnvelope | AudioDataEnvelope;

interface UnknownEnvelope {
  kind: string;
  isAudioData(): this is AudioDataEnvelope;
  isAudioMetadata(): this is AudioMetadataEnvelope;
}

interface AudioMetadataEnvelope extends UnknownEnvelope {
  kind: "AudioMetadata";
  AudioMetadata: AudioMetadata;
}

interface AudioDataEnvelope extends UnknownEnvelope {
  kind: "AudioData";
  AudioData: AudioData;
}

type InspectableUnknownEnvelope = UnknownEnvelope & Record<string, unknown>;

interface AudioMetadata {
  subscriptionId: string;
  sampleRate: number;
  format: string;
}

interface AudioData {
  timestamp: Date;
  participantRawId: string;
  data: Uint8Array;
  format: number;
}

interface AudioUnknown extends Record<string, unknown> {}

declare var x: MediaRecord;

if (x.isAudioData()) {
  x.AudioData;
} else if (x.isAudioMetadata()) {
  x.AudioMetadata;
} else {
  const kind = x.kind;
  const payload = x[kind]; // only allowed when the other options are exhausted
}
