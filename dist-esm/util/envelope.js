"use strict";
if (x.isAudioData()) {
    x.AudioData;
}
else if (x.isAudioMetadata()) {
    x.AudioMetadata;
}
else {
    const kind = x.kind;
    const payload = x[kind]; // only allowed when the other options are exhausted
}
//# sourceMappingURL=envelope.js.map