import morphdom from "morphdom";
import { LiquidEngine }  from "./liquid-engine.js"
/**
 * @example
 *   class MyElement extends RhinoElement {
 *     static baseName = "my-element"
 *     static properties = {
 *       value: { reflect: true, default: "1" }
 *       name: { reflect: true }
 *       id: {
 *         reflect: true
 *         onChange(prev, current) {
 *           console.log({ element: this, prev, current })
 *         }
 *       }
 *       state: {}
 *     }
 *     static shadowDOM = `<template shadowrootmode="open">
 *       <style></style>
 *       <div>{{ value }}</div>
 *     </template>`
 *     static lightDOM = `I'm rendered above <my-element>`
 *   }
 *
 *   MyElement.define() // => <my-element>
 *   MyElement.define("my-element-2") // => <my-element-2>
 *   MyElement.define("my-element-2", customRegistry) // Registers to a custom registry
 *   MyElement.define("my-element-3", null, { <RegistrationOptions> }) // Registers with additional options.
 *
 */
export class RhinoElement extends HTMLElement {
	/** @type {string[]} */
  static get observedAttributes() {
    const properties = this.properties

    if (properties == null || properties.length <= 0) return []

    return Object.keys(properties).filter((propName) => properties[propName].attribute || properties[propName].reflect === true);
  }

  /** @type {CustomElementRegistry} */
  static customElementRegistry = window.customElements

  /**
   * The default name for element. IE: "button", "fly-in-panel"
   * @type {string}
   */
  static baseName

  /**
   * @param {string} [name]
   * @param {CustomElementConstructor} [ctor]
   * @param {ElementDefinitionOptions} [options]
   */
  static define (
    name,
    ctor,
    options
  ) {
    if (name == null) name = this.baseName
    if (ctor == null) ctor = this

    // Can't register twice.
    if (this.customElementRegistry.get(name)) return

  // creates anonymous class due to a limitation of CEs only allowing 1 class definition.
    this.customElementRegistry.define(name, toAnonymousClass(ctor), options)
  }


	/**
	 * @param {string} name - Property name
   * @param {string} prev - Previous attribute value
   * @param {string} current - Current attribute value
	 */
  attributeChangedCallback(name, prev, current) {
    const properties = this.constructor.properties;

    if (properties[name] && prev !== current) {
      this[name] = current
      properties[name]?.onChange?.call(this, prev, current);
    }
  }

  static finalized = false

  constructor() {
    super();

    // this.updateComplete = this.__createDeferredPromise();

    const properties = this.constructor.properties

    if (this.constructor.finalized) {
      this.setDefaultProperties()
		  return
    }

    this.constructor.finalized = true

    // Add reactive properties
    const obj = {}
    for (const [propertyName, propertyObject] of Object.entries(properties)) {
      obj[propertyName] = {
        get() {
          return this[`__${propertyName}__`];
        },
        set(val) {
        	// Do equality check. Perhaps we could add a hook here?
          if (this[propertyName] === val) {
            return;
          }

          this[`__${propertyName}__`] = val;

					if (propertyObject.attribute || propertyObject.reflect === true) {
          	this.setAttribute(propertyObject.attribute || propertyName, val);
          }
        }
      };
    }

    this.setDefaultProperties()
    Object.defineProperties(this.constructor.prototype, obj);
  }

  connectedCallback () {
		let shadow = null

    try {
    	const internals = this.attachInternals()
			shadow = internals.shadowRoot;
    } catch (_e) {
    	// no-op
    } finally {
    	if (shadow == null) {
      	this.attachShadow({
        	mode: 'open'
      	});
      }
    }

    const properties = this.constructor.properties
    Object.keys(properties).forEach((propName) => {
      this[propName] = this.getAttribute(propName)
    })

    // Do we need to "await" this?
    this.render()
  }

  setDefaultProperties () {
    const properties = this.constructor.properties
    for (const [propertyName, propertyObject] of Object.entries(properties)) {
      this[propertyName] = propertyObject.default
    }
  }

  async compile () {
    const engine = LiquidEngine.start()

    const properties = {}
    Object.entries(this.constructor.properties).forEach(([property, obj]) => {
      properties[obj.attribute || property] = this[property]
    })

    const [
      shadowDOM,
      // lightDOM
    ] = await Promise.allSettled([
        engine.parseAndRender(this.constructor.shadowDOM, { attributes: properties }),
      // engine.parseAndRender(this.constructor.lightDOM, properties)
    ])

    return {
      shadowDOM,
      // lightDOM
    }
  }

  async render () {
    const {
      shadowDOM,
      // lightDOM
    } = await this.compile()

    const el = document.createElement("div")
    el.innerHTML = shadowDOM.value
    morphdom(this.shadowRoot, el)
    // this.shadowRoot.innerHTML = shadowDOM.value

    // el.innerHTML = lightDOM.value
    // morphdom(this.firstElementSibling, lightDOM)
  }

  get __finalized__ () {
    return false
  }

  // async requestUpdate() {
  //   if (!this.updateRequested) {
  //     this.updateRequested = true;
  //     this.updateRequested = new Promise((resolve) => resolve(false));
  //     this.update();
  //     this.__resolve();
  //     this.updateComplete = this.__createDeferredPromise();
  //   }
  // }

  update() {
    this.render()
  }

  // __createDeferredPromise() {
  //   return new Promise((resolve) => {
  //     this.__resolve = resolve;
  //   });
  // }
}

/** @type {import("../types").toAnonymousClass} */
function toAnonymousClass (klass) {
  return class extends klass {}
}


