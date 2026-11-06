# Đóng gói StudioLive

## Chuẩn bị

```bash
cd app
npm install
npm start            # chạy thử bản phát triển
```

## Lệnh đóng gói

| Lệnh | Tạo ra (trong `dist/`) | Chạy được trên |
|---|---|---|
| `npm run dist:mac` | `StudioLive-<ver>-mac-arm64.dmg/.zip`, `StudioLive-<ver>-mac-x64.dmg/.zip` | macOS |
| `npm run dist:win` | `StudioLive-Setup-<ver>-win-x64.exe` (bộ cài) | Windows, hoặc Mac chip Apple **đã cài Rosetta** (máy này đã cài) |

Bộ cài Windows dùng NSIS; trên Mac chip Apple cần Rosetta để chạy công cụ `makensis`:

```bash
softwareupdate --install-rosetta --agree-to-license
```

Đổi số phiên bản: sửa `"version"` trong `package.json` trước khi đóng gói.

## Không ký số (unsigned)

- **Mac**: cấu hình `"identity": "-"` → ký **ad-hoc** (bắt buộc để chạy trên chip Apple), không notarize. Người dùng mở lần đầu bằng chuột phải → Mở, hoặc `xattr -cr /Applications/StudioLive.app` (xem `HUONG-DAN-CAI-DAT.md`).
- **Windows**: không ký → SmartScreen cảnh báo lần đầu, người dùng bấm “More info → Run anyway”.
- Muốn bỏ các cảnh báo này: mua chứng chỉ Apple Developer (99 USD/năm, ký + notarize) và chứng chỉ ký mã Windows (OV/EV), rồi thêm cấu hình ký vào `package.json`.

## Tự kiểm tra bản đã đóng gói (không hiện cửa sổ)

```bash
STUDIO_SELFTEST=/tmp/kq.json "dist/mac-arm64/StudioLive.app/Contents/MacOS/StudioLive"; cat /tmp/kq.json
```

Kết quả đúng: `server`, `health`, `overlay`, `chuaAssets`, `decoder` đều `true`. Lưu ý: app chỉ chạy một bản cùng lúc, hãy tắt StudioLive đang mở trước khi tự kiểm tra.

## Module native

`bufferutil` / `utf-8-validate` (đi kèm thư viện `websocket`) dùng bản dựng sẵn (`prebuilds/`) cho từng hệ điều hành, nên cấu hình đặt `"npmRebuild": false`. Nếu lỡ chạy biên dịch lại trên Mac, xoá `node_modules/bufferutil/build` và `node_modules/utf-8-validate/build` trước khi đóng gói Windows.
