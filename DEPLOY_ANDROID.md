# Deploy and publish guide

## Web deployment

This project is configured to deploy automatically with GitHub Pages through `.github/workflows/deploy-pages.yml`.

After pushing to `main`:

1. Open the repository on GitHub.
2. Go to **Settings** -> **Pages**.
3. Set the source to **GitHub Actions**.
4. Wait for the workflow to finish.
5. Open the published site URL.

## Install as an app (PWA)

Once the site is live on GitHub Pages:

- Open it in Chrome or Edge.
- Choose **Install app** or **Add to Home Screen**.

## Android app with Capacitor

This repository includes Capacitor configuration and an Android project.

### Useful commands

- `npm run build:web` - build the static files into `www`
- `npm run android:sync` - copy the latest web files into Android
- `npm run android:open` - open the Android project in Android Studio

### Build an APK or AAB

1. Install **Android Studio**.
2. Open the project with `npm run android:open`.
3. Let Android Studio download the required SDK packages.
4. Use **Build** -> **Generate App Bundles or APKs**.
5. Choose **Android App Bundle (AAB)** for Play Store upload.

## Publish to Google Play

1. Create or sign in to your **Google Play Console** account.
2. Create a new app.
3. Upload the generated `.aab` file.
4. Complete store listing, privacy policy, screenshots, and content rating.
5. Submit for review.

## GitHub Student Developer Pack

Your Student Developer Pack is useful for hosting, cloud credits, and dev tools, but it does not replace:

- Google Play Console account
- Apple Developer account

It helps with development and deployment infrastructure, while app-store publishing still uses the platform owner's developer program.
