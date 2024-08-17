export enum ZalgoMode {
  TOP,
  BOTTOM,
  MIRROR,
}

export class ZalgoTextGenerator {
  private combiningChars: string[] = [];

  constructor(mode: ZalgoMode) {
    if (this.combiningChars.length === 0) {
      /**
       * Creates an array with the combining diacritical marks present in the BMP (plane 0) of unicode.
       * See: https://en.wikipedia.org/wiki/Combining_character depending on the selected mode
       */
      switch (mode) {
        case ZalgoMode.TOP:
          this.generateTopDiacritics();
          break;
        case ZalgoMode.BOTTOM:
          this.generateBottomDiacritics();
          break;
        case ZalgoMode.MIRROR:
          this.generateMirroredDiacritics();
          break;
      }
    }
  }

  public enhanceText(
    text: string,
    powerPerChar: number[] | Uint8Array
  ): string {
    /**
     * Enhances each character in the text with a given number of
     * zalgo characters defined by the `powerPerChar` array.
     */
    const result: string[] = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      result.push(
        char + this.generateCombiningCharacterSequence(powerPerChar[i])
      );
    }

    return result.join("");
  }

  private generateCombiningCharacterSequence(
    numCombiningChars: number
  ): string {
    /**
     * Randomly pick a number of diacritics equal to 'numCombiningChars'
     * and return a string.
     */

    // Pre-condition: numConbiningChars needs to be an integer
    numCombiningChars = numCombiningChars ? Math.floor(numCombiningChars) : 0;

    const resultingZalgo: string[] = [];
    for (let i = 0; i < numCombiningChars; i++) {
      const randomIndex = Math.floor(
        Math.random() * this.combiningChars.length
      );
      resultingZalgo.push(this.combiningChars[randomIndex]);
    }
    return resultingZalgo.join("");
  }

  private generateTopDiacritics() {
    for (let i = 768; i < 790; i++) {
      this.combiningChars.push(String.fromCharCode(i));
    }
  }

  private generateBottomDiacritics() {
    throw new Error("Not implemented");
  }

  private generateMirroredDiacritics() {
    for (let i = 768; i < 879; i++) {
      this.combiningChars.push(String.fromCharCode(i));
    }
  }
}
