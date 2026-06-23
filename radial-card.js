class RadialCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  setConfig(config) {
    if (!config.entity && config.value === undefined) {
      throw new Error("You must define either 'entity' or 'value'");
    }
    this._config = config;
    this._render();
  }

  getCardSize() {
    return 3;
  }

  _getValue() {
    const config = this._config;

    if (config.value !== undefined) {
      return parseFloat(config.value);
    }

    if (this._hass && config.entity) {
      const state = this._hass.states[config.entity];
      if (state) return parseFloat(state.state);
    }

    return 0;
  }

  _render() {
    const config = this._config;
    const value = this._getValue();
    const min = config.min ?? 0;
    const max = config.max ?? 100;
    const clamped = Math.min(Math.max(value, min), max);
    const percent = ((clamped - min) / (max - min)) * 100;

    const size = config.size ?? 200;
    const padding = config.padding ?? 16;
    const strokeWidth = config.stroke_width ?? 10;
    const radius = 59 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const dash = (percent / 100) * circumference;
    const color = config.color ?? "var(--primary-color, #03a9f4)";
    const trackColor = config.track_color ?? "var(--divider-color, #e0e0e0)";
    const textLine1 = config.text ?? (config.entity ? `${Math.round(clamped)}${config.unit ?? ""}` : "");
    const textLine2 = config.label ?? "";
    const fontSize1 = config.font_size ?? 22;
    const fontSize2 = config.label_font_size ?? 13;
    const textColor = config.text_color ?? "var(--primary-text-color, #212121)";
    const labelColor = config.label_color ?? "var(--secondary-text-color, #727272)";
    const background = config.background ?? "var(--card-background-color, #fff)";
    const rotate = config.start_angle ?? -90;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .card {
          background: ${background};
          border-radius: 12px;
          padding: ${padding}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .title {
          font-size: 14px;
          font-weight: 500;
          color: var(--secondary-text-color, #727272);
          margin-bottom: 12px;
          text-align: center;
        }
        .radial-wrapper {
          position: relative;
          width: min(${size}px, 100%);
          aspect-ratio: 1 / 1;
        }
        svg {
          transform: rotate(${rotate}deg);
          width: 100%;
          height: 100%;
        }
        .track {
          fill: none;
          stroke: ${trackColor};
          stroke-width: ${strokeWidth};
        }
        .progress {
          fill: none;
          stroke: ${color};
          stroke-width: ${strokeWidth};
          stroke-linecap: round;
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${circumference - dash};
          transition: stroke-dashoffset 0.6s ease;
        }
        .center-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .value-text {
          font-size: ${fontSize1}px;
          font-weight: 600;
          color: ${textColor};
          line-height: 1.1;
        }
        .label-text {
          font-size: ${fontSize2}px;
          color: ${labelColor};
          margin-top: 2px;
        }
      </style>
      <ha-card>
        <div class="card">
          ${config.title ? `<div class="title">${config.title}</div>` : ""}
          <div class="radial-wrapper">
            <svg viewBox="0 0 120 120">
              <circle class="track" cx="60" cy="60" r="${radius}" />
              <circle class="progress" cx="60" cy="60" r="${radius}" />
            </svg>
            <div class="center-text">
              ${textLine1 ? `<span class="value-text">${textLine1}</span>` : ""}
              ${textLine2 ? `<span class="label-text">${textLine2}</span>` : ""}
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }
}

customElements.define("daires-hass-cards-radial-card", RadialCard);
