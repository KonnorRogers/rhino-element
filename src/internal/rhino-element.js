import { ReactiveElement } from "@lit/reactive-element";
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
export class RhinoElement extends ReactiveElement {
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


  static toTemplate () {
    let styles = ""
    const toStyleTag = (str) => `<style>${str}</style>`

    if (Array.isArray(this.styles)) {
      styles = this.styles.map((style) => toStyleTag(style)).join("\n")
    } else if (this.styles) {
      styles = toStyleTag(this.styles)
    }

    return `<template shadowrootmode="open">
      ${styles}
      ${this.shadowDOM}
    </template>`
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

    this.setDefaultProperties()
  }

  setDefaultProperties () {
    const properties = this.constructor.properties
    for (const [propertyName, propertyObject] of Object.entries(properties)) {
      this[propertyName] = propertyObject.default
    }
  }

  get attributesObject () {
    const attributes = {}
    Object.entries(this.constructor.properties).forEach(([property, obj]) => {
      attributes[obj.attribute || property] = this[property]
    })

    return attributes
  }

  async compile () {
    const engine = LiquidEngine.start()

    let shadowDOM = ""

    if (this.constructor.shadowDOM) {
      shadowDOM = await engine.parseAndRender(this.constructor.shadowDOM, { attributes: this.attributesObject })
    }

    this.__template__ = shadowDOM
  }

  __render () {
    let el = document.createElement("div")
    el.innerHTML = this.__template__
    morphdom(this.shadowRoot, el, { childrenOnly: true })
  }

  render () {}

  update(changedProperties) {
    // Setting properties in `render` should not trigger an update. Since
    // updates are allowed after super.update, it's important to call `render`
    // before that.
    this.__render()
    this.render()
    super.update(changedProperties);
  }

  async scheduleUpdate() {
    await this.compile()
    super.scheduleUpdate()
  }
}

/** @type {import("../types").toAnonymousClass} */
function toAnonymousClass (klass) {
  return class extends klass {}
}


