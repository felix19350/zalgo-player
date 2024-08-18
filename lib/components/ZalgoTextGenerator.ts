export enum ZalgoMode {
  TOP,
  BOTTOM,
  BOTH,
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
        case ZalgoMode.BOTH:
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
    // TODO: Test using a text decoder
    for (let i = 768; i <= 789; i++) {
      this.combiningChars.push(String.fromCharCode(i));
    }
    this.combiningChars.push(String.fromCharCode(794));
    this.combiningChars.push(String.fromCharCode(795));
    for (let i = 829; i <= 836; i++) {
      this.combiningChars.push(String.fromCharCode(i));
    }
    this.combiningChars.push(String.fromCharCode(838));
    this.combiningChars.push(String.fromCharCode(842));
    this.combiningChars.push(String.fromCharCode(843));
    this.combiningChars.push(String.fromCharCode(844));
    this.combiningChars.push(String.fromCharCode(849));

    for (let i = 867; i <= 879; i++) {
      this.combiningChars.push(String.fromCharCode(i));
    }
  }

  private generateBottomDiacritics() {
    // TODO: Test using a text decoder
    for (let i = 790; i <= 793; i++) {
      this.combiningChars.push(String.fromCharCode(i));
    }

    for (let i = 796; i <= 819; i++) {
      this.combiningChars.push(String.fromCharCode(i));
    }
    for (let i = 825; i <= 828; i++) {
      this.combiningChars.push(String.fromCharCode(i));
    }
    this.combiningChars.push(String.fromCharCode(837));
    this.combiningChars.push(String.fromCharCode(839));
    this.combiningChars.push(String.fromCharCode(840));
    this.combiningChars.push(String.fromCharCode(841));
    this.combiningChars.push(String.fromCharCode(845));
    this.combiningChars.push(String.fromCharCode(846));
    for (let i = 851; i <= 854; i++) {
      this.combiningChars.push(String.fromCharCode(i));
    }
  }

  private generateMirroredDiacritics() {
    this.generateTopDiacritics();
    this.generateBottomDiacritics();
  }
}
