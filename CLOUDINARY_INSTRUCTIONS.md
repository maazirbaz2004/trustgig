# How to Fix "Upload preset not found"

This happens because the unsigned upload preset hasn't been created in your Cloudinary account yet! Cloudinary requires you to explicitly allow "unsigned" uploads by creating a preset.

Since I don't have access to your Cloudinary dashboard, here is the quick 30-second fix to create the preset:

1. Log into your **Cloudinary Console**.
2. Click the **Settings** icon (gear icon) in the bottom left.
3. Go to the **Upload** settings on the left sidebar.
4. Scroll down to the **Upload presets** section and click **Add upload preset**.
5. Set the **Upload preset name** to exactly: `trustgig_uploads`
6. Change the **Signing Mode** to **Unsigned**.
7. Click **Save** at the top right.

Try clicking the upload button on TrustGig one more time after you've saved that preset, and it will work perfectly!
