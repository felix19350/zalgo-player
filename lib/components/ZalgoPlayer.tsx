import {
  Ref,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { ZalgoMode, ZalgoTextGenerator } from "./ZalgoTextGenerator";

interface ZalgoPlayerProps {
  mediaUrl: string;
  refreshRateMs: number | undefined;
  fftSize: number;
  mode: ZalgoMode;
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
  const [analyzerBar, setAnalyzerBar] = useState("-".repeat(props.fftSize / 2));

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
        // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
        analyser.current!!,
        zalgoTextGenerator.current,
        props.fftSize
      )
    );
    requestAnimationFrame(render);
  }, [props.fftSize]);

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
  fftSize: number
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
  const zalgoPowers = new Array(freqsArray.length).fill(0);
  // TODO: each bucket has a number between 0 - 255 normalize the height to reduce the number of characters displayed
  for (let i = 0; i < freqsArray.length; i++) {
    zalgoPowers[i] += freqsArray[i] / 2;
  }
  return zalgoTextGenerator.enhanceText(randomString, zalgoPowers);
};
