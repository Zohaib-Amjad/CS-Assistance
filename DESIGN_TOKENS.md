# CyberGuard AI Design Tokens

Derived from the visual references in `design-ref/` and FullHD layout specifications.

## 1. Color Palette

### Brand & Accents
| Token | Hex / HSL | Usage |
|---|---|---|
| `color-primary` | `#4F46E5` (`243 75% 59%`) | Primary brand color, hero CTAs, active nav links, focus rings |
| `color-primary-hover` | `#4338CA` (`244 64% 53%`) | Primary button hover state |
| `color-primary-subtle`| `#EEF2FF` (`240 100% 97%`)| Active sidebar item background, badge backgrounds, pill highlights |
| `color-secondary` | `#7C3AED` (`262 83% 58%`) | Secondary gradients, accent highlights, AI badge gradient |
| `color-accent` | `#6366F1` (`239 84% 67%`) | Gradients, radar charts, security score meter |

### Backgrounds & Surfaces
| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `bg-page` | `#F6F7FF` | `#0B0F19` | Application main canvas |
| `bg-card` | `#FFFFFF` | `#111827` | Dashboard metric cards, analysis boxes |
| `bg-sidebar` | `#FFFFFF` | `#0F172A` | Desktop navigation sidebar |
| `bg-header` | `rgba(255,255,255,0.85)` | `rgba(15,23,42,0.85)` | Sticky topbar with glassmorphism backdrop-blur |
| `bg-subtle` | `#F8FAFC` | `#1E293B` | Table headers, secondary code boxes, chat bubbles |

### Borders & Dividers
| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `border-subtle` | `#E0E4FF` | `#1E293B` | Card outlines, input fields, container dividers |
| `border-active` | `#6366F1` | `#4F46E5` | Active inputs, selected quiz options, focused tabs |

### Typography & Text
| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `text-primary` | `#0F172A` | `#F8FAFC` | Headlines, primary card numbers, strong labels |
| `text-secondary` | `#475569` | `#94A3B8` | Body copy, card descriptions, quiz questions |
| `text-muted` | `#64748B` | `#64748B` | Timestamps, placeholders, breadcrumb secondary |

### Status & Feedback Tints
| Status | Hex | Light Tint Bg | Usage |
|---|---|---|---|
| **Safe / Clean** | `#16A34A` | `#DCFCE7` | Low phishing risk, strong passwords, passed quizzes |
| **Warning / Suspicious** | `#F59E0B` | `#FEF3C7` | Medium risk, moderate password, unverified links |
| **Danger / Malicious** | `#DC2626` | `#FEE2E2` | Phishing detected, compromised password, blocked domain |
| **Info / AI** | `#2563EB` | `#DBEAFE` | AI recommendations, assistant prompts, telemetry |

---

## 2. Radii & Geometry
- **Cards & Containers**: `2xl` (16px / `1rem`)
- **Interactive Buttons / Inputs**: `xl` (12px / `0.75rem`)
- **Pills / Badges / Avatars**: `full` (9999px)
- **Modal Dialogs / Drawers**: `3xl` (24px / `1.5rem`)

---

## 3. Shadows & Glassmorphism
- **Card Shadow**: `0 1px 3px 0 rgba(79, 70, 229, 0.04), 0 4px 12px 0 rgba(79, 70, 229, 0.03)`
- **Floating Popover**: `0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(224, 228, 255, 0.8)`
- **Glass Effect**: `backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.85);`
