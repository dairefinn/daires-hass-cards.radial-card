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

  _primaryEntity() {
    return this._config.entity ?? null;
  }

  _handleInteraction(trigger) {
    const interaction = (this._config.interactions ?? []).find(
      (i) => (i.trigger ?? "tap") === trigger
    );
    if (!interaction) return;
    const { action } = interaction;
    if (action === "more-info") {
      const entityId = interaction.entity ?? this._primaryEntity();
      if (!entityId) return;
      this.dispatchEvent(new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }));
    } else if (action === "toggle") {
      const entityId = interaction.entity ?? this._primaryEntity();
      if (!entityId || !this._hass) return;
      this._hass.callService("homeassistant", "toggle", { entity_id: entityId });
    } else if (action === "call-service") {
      if (!interaction.service || !this._hass) return;
      const [domain, service] = interaction.service.split(".");
      this._hass.callService(domain, service, interaction.service_data ?? {});
    } else if (action === "navigate") {
      if (!interaction.path) return;
      window.history.pushState(null, "", interaction.path);
      this.dispatchEvent(new CustomEvent("location-changed", { bubbles: true, composed: true }));
    } else if (action === "url") {
      if (!interaction.url) return;
      window.open(interaction.url, interaction.target ?? "_blank");
    }
  }

  _attachInteractionListeners() {
    const interactions = this._config?.interactions;
    if (!interactions?.length) return;

    if (this._tapTimer) {
      clearTimeout(this._tapTimer);
      this._tapTimer = null;
      this._tapCount = 0;
    }

    const card = this.shadowRoot.querySelector(".card");
    if (!card) return;

    const triggers = new Set(interactions.map((i) => i.trigger ?? "tap"));
    card.style.cursor = "pointer";

    if (triggers.has("tap") || triggers.has("double_tap")) {
      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        this._tapCount = (this._tapCount ?? 0) + 1;
        if (this._tapCount === 1) {
          this._tapTimer = setTimeout(() => {
            this._tapCount = 0;
            this._tapTimer = null;
            this._handleInteraction("tap");
          }, 250);
        } else {
          clearTimeout(this._tapTimer);
          this._tapTimer = null;
          this._tapCount = 0;
          this._handleInteraction("double_tap");
        }
      });
    }

    if (triggers.has("hold")) {
      let holdTimer;
      const startHold = () => { holdTimer = setTimeout(() => this._handleInteraction("hold"), 500); };
      const cancelHold = () => clearTimeout(holdTimer);
      card.addEventListener("mousedown", startHold);
      card.addEventListener("mouseup", cancelHold);
      card.addEventListener("mouseleave", cancelHold);
      card.addEventListener("touchstart", startHold, { passive: true });
      card.addEventListener("touchend", cancelHold);
      card.addEventListener("touchcancel", cancelHold);
    }
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
          height: 100%;
        }
        ha-card {
          height: 100%;
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
          height: 100%;
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
          max-height: min(${size}px, 100%);
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
    this._attachInteractionListeners();
  }
}

customElements.define("daires-hass-cards-radial-card", RadialCard);
