# Radial card

A circular progress ring card for displaying sensor values, percentages, or any numeric entity. Designed to scale to

<img width="1121" height="1227" alt="image" src="https://github.com/user-attachments/assets/a0f62714-200e-4892-bc31-7e2c7a924fc3" />

## Installation

### HACS (recommended)

1. In Home Assistant, go to **HACS → Frontend → ⋮ → Custom repositories**
2. Add this repository URL and set the category to **Lovelace**
3. Click **Download** on the radial-card entry
4. Restart Home Assistant

### Manual

1. Copy `radial-card.js` to your Home Assistant `config/www/` folder.
2. Add the resource in your Lovelace dashboard:
   - **Settings → Dashboards → Resources → Add Resource**
   - URL: `/local/radial-card.js`
   - Type: `JavaScript module`

## Configuration

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | string | — | HA entity ID to read the value from |
| `value` | number | — | Static value (use instead of `entity`) |
| `min` | number | `0` | Minimum value of the range |
| `max` | number | `100` | Maximum value of the range |
| `unit` | string | — | Unit appended to the auto-generated value text |
| `text` | string | auto | Override the primary text displayed in the ring |
| `label` | string | — | Secondary label below the value text |
| `title` | string | — | Card title shown above the ring |
| `size` | number | `200` | Diameter of the ring in pixels |
| `padding` | number | `16` | Inner padding of the card in pixels |
| `stroke_width` | number | `10` | Thickness of the ring stroke in pixels |
| `color` | string | `var(--primary-color)` | Ring fill color |
| `track_color` | string | `var(--divider-color)` | Background track color |
| `font_size` | number | `22` | Font size of the primary value text |
| `label_font_size` | number | `13` | Font size of the secondary label |
| `text_color` | string | `var(--primary-text-color)` | Color of the primary value text |
| `label_color` | string | `var(--secondary-text-color)` | Color of the secondary label |
| `background` | string | `var(--card-background-color)` | Card background color |
| `start_angle` | number | `-90` | Rotation of the ring start point in degrees |
| `interactions` | list | — | Tap/hold/double-tap actions (see below) |

Either `entity` or `value` is required.

## Interactions

Attach actions to `tap`, `hold` (500 ms), or `double_tap` events by adding an `interactions` list.

```yaml
interactions:
  - trigger: tap        # tap | hold | double_tap  (default: tap)
    action: more-info   # see action reference below
```

| Action | Extra fields | Description |
|---|---|---|
| `more-info` | `entity` (optional) | Open the HA more-info dialog. Defaults to the card's entity. |
| `toggle` | `entity` (optional) | Toggle the entity. |
| `call-service` | `service`, `service_data` | Call any HA service. `service` is `domain.service` format. |
| `navigate` | `path` | Navigate to a Lovelace path. |
| `url` | `url`, `target` | Open a URL. `target` defaults to `_blank`. |
| `none` | — | Explicit no-op. |

## Examples

**Live entity:**
```yaml
type: custom:daires-hass-cards-radial-card
title: CPU Usage
entity: sensor.cpu_usage
unit: "%"
label: CPU
color: "#03a9f4"
```

**Static value with custom range:**
```yaml
type: custom:daires-hass-cards-radial-card
title: Storage
value: 380
min: 0
max: 500
text: "380 GB"
label: Used
color: "#9c27b0"
track_color: "#f3e5f5"
stroke_width: 14
```

**Battery indicator:**
```yaml
type: custom:daires-hass-cards-radial-card
title: Battery
entity: sensor.phone_battery
unit: "%"
label: Charging
color: "#4caf50"
track_color: "#e8f5e9"
```

**With interactions:**
```yaml
type: custom:daires-hass-cards-radial-card
title: CPU Usage
entity: sensor.cpu_usage
unit: "%"
label: CPU
interactions:
  - trigger: tap
    action: more-info
  - trigger: hold
    action: navigate
    path: /lovelace/system
```

## Demo

Open `demo.html` in a browser to preview the card without Home Assistant.
