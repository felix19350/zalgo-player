import {
  Ref,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { ZalgoMode, ZalgoTextGenerator } from "./ZalgoTextGenerator";

/**
 * The expected properties of the ZalgoPlayer component.
 *
 * @interface ZalgoPlayerProps
 * @member {string} mediaUrl is used to select the media that will be played.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio#src for
 * additional details on the usage of the src attribute in Audio Element.
 * @member {number} refreshRateMs OPTIONAL desired refresh rate.The code will adapt
 * and to try and honor this refresh rate. The minimum refresh rate corresponds
 * to the refresh rate given by requestAnimationFrame. If this field is not set the
 * code will default to the default requestAnimationFrame behavior.
 * @member {number} numColumns the number of "buckets" that the analyer FFT will
 * yield. Each bucket will be displayed as a vertical bar. The number MUST be between
 * 2^4 and 2^14.
 * @member {ZalgoMode} mode the display mode of the player determines which combining
 * characters are used so that the bars grow only to the top (TOP), only to the
 * bottom (BOTTOM) or mirrored top and bottom (MIRROR)
 * @member {number} maxCharacterPerCol maximum number of combining characters per column.
 * In combination with the applied style determines the maximum height of the bar.
 * @member {CssModule} styles CSS Module styles. Please consult the README or demo app
 * for an example of the styles that should be implemented.
 **/
interface ZalgoPlayerProps {
  mediaUrl: string;
  refreshRateMs: number | undefined;
  numColumns: number;
  mode: ZalgoMode;
  maxCharacterPerCol: number;
  styles: {
    readonly [key: string]: string;
  };
}

export const ZalgoPlayer = (props: ZalgoPlayerProps) => {
  const zalgoTextGenerator: MutableRefObject<ZalgoTextGenerator> = useRef(
    new ZalgoTextGenerator(props.mode)
  );

  const audioNode: Ref<HTMLAudioElement> = useRef(null);
  const analyser: MutableRefObject<AnalyserNode | null> = useRef(null);
  const intervalId: MutableRefObject<number> = useRef(-1);

  const [isSetupDone, setIsSetupDone] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyzerBar, setAnalyzerBar] = useState("-".repeat(props.numColumns));

  // Setup the audio processing pipeline. Needs only to be done once.
  useEffect(() => {
    if (audioNode.current !== null && analyser.current == null) {
      const context = new AudioContext();
      const theAnalyser = context.createAnalyser();
      const source = context.createMediaElementSource(audioNode.current);
      // build the audio processing graph
      source.connect(theAnalyser);
      theAnalyser.connect(context.destination);
      analyser.current = theAnalyser;
      setIsSetupDone(true);
    }
  }, [isSetupDone]);

  const render = useCallback(() => {
    setAnalyzerBar(
      calculateNextEqualizerStateFft(
        // We can afford to ignore the null check because this is asserted in the
        // conditions of following `useEffect` call.
        // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
        analyser.current!!,
        zalgoTextGenerator.current,
        props.numColumns * 2,
        props.maxCharacterPerCol
      )
    );
    requestAnimationFrame(render);
  }, [props.maxCharacterPerCol, props.numColumns]);

  // Update the analyzerBar
  useEffect(() => {
    const shouldRenderFrame = props.refreshRateMs ? true : true;
    if (
      analyser.current != null &&
      intervalId.current == -1 &&
      isPlaying &&
      shouldRenderFrame
    ) {
      intervalId.current = requestAnimationFrame(render);
    }
  }, [isPlaying, analyzerBar, props.refreshRateMs, render]);

  const onPlay = () => {
    setIsPlaying(true);
  };

  const onPause = () => {
    setIsPlaying(false);
    if (intervalId.current !== -1) {
      // clearInterval(intervalId.current);
      cancelAnimationFrame(intervalId.current);
      intervalId.current = -1;
    }
  };

  return (
    <div className={props.styles.zalgoPlayer}>
      <div className={props.styles.analyzerArea}>{analyzerBar}</div>
      <center>
        <div id="audio" className={props.styles.audioControl}>
          <audio
            controls
            id="audio-control"
            ref={audioNode}
            onPlay={onPlay}
            onPause={onPause}
            src={props.mediaUrl}
            crossOrigin="anonymous"
          ></audio>
        </div>
      </center>
    </div>
  );
};

const calculateNextEqualizerStateFft = (
  analyser: AnalyserNode,
  zalgoTextGenerator: ZalgoTextGenerator,
  fftSize: number,
  maxChars: number
): string => {
  // The FFT size determines how many "bins" we have for the
  // frequency doman: frequencyBinCount = fftSize/2
  if (fftSize % 2 !== 0 && fftSize >= 2 ** 5 && fftSize <= 2 ** 15) {
    throw Error(
      "Invalid FFT Size. Expected FFT sizes should be divisible by 2. See: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize"
    );
  }

  analyser.fftSize = fftSize;
  const freqsArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqsArray);
  const randomString = "-".repeat(freqsArray.length);
  const charactersPerBucket = new Array(freqsArray.length).fill(0);
  // Each bucket produced by the FFT gives out a value between [0, 255]
  // This should be normalized in a [0, maxChars] range
  for (let i = 0; i < freqsArray.length; i++) {
    charactersPerBucket[i] += (freqsArray[i] * maxChars) / 255;
  }
  return zalgoTextGenerator.enhanceText(randomString, charactersPerBucket);
};
