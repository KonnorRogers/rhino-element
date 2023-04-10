import { assert, fixture, html } from '@open-wc/testing';
import { RhinoElement } from "./rhino-element.js";

export class Button extends RhinoElement {
  static baseName = "test-button"
  static properties = {
    type: { attribute: true, default: "button" },
    value: { attribute: true },
    appearance: { attribute: true }
  }
  static shadowDOM = `
    <style>
      button {
        background-color: rebeccapurple;
        color: white;
      }

      button[appearance="primary"] {
        background-color: green;
      }
    </style>

    <button
      {%- for attribute in attributes %}
        {{ attribute[0] }}="{{ attribute[1] }}"
      {%- endfor %}
    >
      <slot></slot>
    </button>
  `
}

test("Should set attributes on initial run", async () => {
  Button.define()
  const el = await fixture(html`<test-button value="1">Hi there</test-button>`)
  assert.equal(el.value, "1")
})

test("Should set attributes if element defined before JS", async () => {
  const el = await fixture(html`<test-button value="1">Hi there</test-button>`)
  Button.define()
  assert.equal(el.value, "1")
})

test("Should set default values", async () => {
  const el = await fixture(html`<test-button value="1">Hi there</test-button>`)
  Button.define()
  assert.equal(el.type, "button")
})

test("Should update attribute when property changes", async () => {
  Button.define()
  const el = await fixture(html`<test-button value="2">Hi there</test-button>`)
  el.value = 4
  assert.equal(el.getAttribute("value"), "4")
})

test("Should update property when attribute changes", async () => {
  Button.define()
  const el = await fixture(html`<test-button value="2">Hi there</test-button>`)
  el.setAttribute("value", "4")
  assert.equal(el.value, "4")
})
