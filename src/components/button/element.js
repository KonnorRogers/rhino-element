import { BaseElement } from "../../internal/base-element";

export class Button extends BaseElement {
  static baseName = "rhino-button"
  static properties = {
    type: { attribute: true },
    value: { attribute: true},
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
