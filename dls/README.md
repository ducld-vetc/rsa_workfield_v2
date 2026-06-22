# Tasco DLS — Mobile

Thư viện UI mobile (Tasco DLS v1.2) dùng cho app Tài xế cứu hộ.

| File | Mô tả |
|------|--------|
| `tokens.css` | CSS variables (brand `#25a55e`, spacing, typography) |
| `components.tsx` | React components: button, field, chip, top nav, sheet… |
| `components.css` | Styles cho components |

Nguồn token: `../Test/tasco-dls-v1.2.json` (repo RSA).

## Dùng trong app

```tsx
import '@dls/tokens.css';
import '@dls/components.css';
import { DlsBrandButton, DlsTopNav } from '@dls/components';
```
