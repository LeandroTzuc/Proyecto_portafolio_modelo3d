# 🚀 3D Interactive Web Portfolio

Welcome to my professional portfolio! This project is an immersive web experience showcasing my skills in Frontend development and 3D graphics integration directly in the browser.

## 👤 Author

**Leandro Emilio Tzuc Rodriguez**

## ✨ Core Features

* **🎮 Interactive 3D Scene**: A detailed representation of a gamer room using Three.js, featuring `.glb` model loading, smooth camera orbiting, and realistic textures.
* **🎥 Featured Project**: An interactive section displaying a login interface enriched with advanced Rive animations and a seamlessly integrated looping video.
* **📱 Fully Responsive Design**: A modern, fluid interface perfectly adapted to deliver an optimal user experience across mobile devices, tablets, and desktops.

## 🛠️ Tech Stack & Libraries

* 🟠 **HTML5**
* 🔵 **CSS3**
* 🟡 **JavaScript ES6**
* 🧊 **Three.js**
* 🎬 **Rive**

## 🚀 Local Setup Instructions

> ⚠️ **Important Note on CORS:** You cannot simply double-click the `index.html` file to run this project. Browsers block the loading of local 3D files (`file:///` protocol) due to Cross-Origin Resource Sharing (CORS) security policies.

To run this project locally, you need a local web server:

**Using VS Code (Recommended):**
1.  Install the **Live Server** extension in Visual Studio Code.
2.  Open the project folder in VS Code.
3.  Right-click on `index.html` and select **"Open with Live Server"**.
4.  The portfolio will automatically open in your default browser (usually at `http://127.0.0.1:5500`).

**Using Node.js/npm (Alternative):**
1.  Ensure you have Node.js installed.
2.  Open your terminal in the project directory.
3.  Run `npx serve` or `npx http-server`.
4.  Open the provided localhost URL in your browser.

## 🔄 How to Update the 3D Model

Want to use your own custom 3D model from Blender? Follow these steps:

1.  **Export from Blender:** In Blender, go to `File > Export > glTF 2.0 (.glb/.gltf)`. Choose the `.glb` format for a single, packed file.
2.  **Rename your file:** Ensure your exported file is named identically to the one referenced in your code (e.g., `Habitacion.glb`).
3.  **Replace the existing model:** Copy your new `.glb` file into the project directory, overwriting the existing file.
4.  **Clear Browser Cache:** This is **crucial**. Browsers aggressively cache 3D models. To see your changes, you must perform a hard refresh on the page. Press `Ctrl + F5` (Windows/Linux) or `Cmd + Shift + R` (Mac) to clear the cache and reload the new model.

## 🎨 3D Assets Credits

The 3D models used in this interactive scene are sourced from Sketchfab. Special thanks to the creators:

*   [Connor's Tomahawk](https://sketchfab.com/3d-models/connors-tomahawk-18f3f8640d444f709a697d091813425b)
*   [Ezio Auditore Figurine](https://sketchfab.com/3d-models/ezio-auditore-figurine-a3e3b9d9a99e441ab0de59297bb4f266)
*   [Nendoroid](https://sketchfab.com/3d-models/nendoroid-515b195e31484f6a829defa637fe6c60)
*   [Audifonos04 (Gaming Headphones)](https://sketchfab.com/3d-models/audifonos04-576cecb8f6624818869f03bbf1218adb)

## 📬 Contact

If you're interested in my work or want to get in touch, feel free to send me an email:

* 📧 **Email**: [tzucrodriguez2005@gmail.com](mailto:tzucrodriguez2005@gmail.com)
