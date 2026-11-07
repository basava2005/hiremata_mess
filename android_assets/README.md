# Hiremat Mess (ಹಿರೇಮಠ್ ಮೆಸ್) - Android Studio App Icons

Here are the custom, high-resolution launcher icons for the **Hiremat Mess APK**.

---

## 📁 Included Assets

1. **`ic_launcher-512.png`**: High-resolution (512×512) master app icon for Google Play & Android Studio Image Asset Wizard.
2. **`ic_launcher_round-512.png`**: High-resolution (512×512) circular app icon with transparent background.
3. **`res/` Folder**: Pre-rendered PNG mipmap assets ready to drop directly into Android Studio:
   - `mipmap-mdpi/`: 48×48 px (`ic_launcher.png`, `ic_launcher_round.png`)
   - `mipmap-hdpi/`: 72×72 px (`ic_launcher.png`, `ic_launcher_round.png`)
   - `mipmap-xhdpi/`: 96×96 px (`ic_launcher.png`, `ic_launcher_round.png`)
   - `mipmap-xxhdpi/`: 144×144 px (`ic_launcher.png`, `ic_launcher_round.png`)
   - `mipmap-xxxhdpi/`: 192×192 px (`ic_launcher.png`, `ic_launcher_round.png`)

---

## 🚀 How to Add to Your Android Studio Project

### Method 1 (Easiest - 10 Seconds):
1. Open your Android Studio project.
2. In the Project Explorer on the left, navigate to:
   `app` ➔ `src` ➔ `main` ➔ `res`
3. Copy all the `mipmap-*` folders from `d:\mess\android_assets\res\` and paste/overwrite into your `app/src/main/res/` folder.
4. Clean and Rebuild APK:
   `Build` ➔ `Rebuild Project` ➔ `Build Bundle(s) / APK(s)` ➔ `Build APK(s)`.

---

### Method 2 (Using Android Studio Asset Studio):
1. In Android Studio, right-click on the `app/src/main/res` folder.
2. Select **New** ➔ **Image Asset**.
3. Under **Icon Type**, choose **Launcher Icons (Adaptive and Legacy)**.
4. Under **Source Asset**:
   - Asset Type: **Image**
   - Path: Select `d:\mess\android_assets\ic_launcher-512.png`
   - Resize / Scaling: Adjust slider so the icon fits inside the safe-zone circle (~80%).
5. Click **Next** ➔ **Finish**.
6. Rebuild your APK!

