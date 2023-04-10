import { Liquid } from 'liquidjs/dist/liquid.browser.esm';

export class LiquidEngine {
  static start = () => {
    if (this.__engine__ == null) {
      this.__engine__ = new Liquid()
    }

    return this.__engine__
  }
}
