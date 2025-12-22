# Call of Cthulhu 7e Character Creator / Creador de Personajes CoC 7e 

<div align="center">

[![Status](https://img.shields.io/badge/Status-In_Development-green)]()
[![Tech](https://img.shields.io/badge/Built_with-Next.js-black)]()
[![License](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-blue)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**[ 🇺🇸 English Version ](#english) | [ 🇪🇸 Versión en Español ](#español)**

</div>

---

<a id="english"></a>

## 🇺🇸 Call of Cthulhu 7th Edition Character Creator

A modern, interactive, and Progressive Web App (PWA) designed to facilitate the creation and management of investigators for the tabletop role-playing game **Call of Cthulhu 7th Edition**.

### ✨ Key Features

#### 📝 Character Management
- **Guided Creation:** Generate characteristics (STR, DEX, POW, etc.) manually or via integrated dice rolls.
- **Auto Calculation:** Derived stats like Hit Points, Sanity, Magic Points, Build, and Damage Bonus are calculated automatically.
- **Occupation System:**
  - Complete database of occupations (1920s, Modern, etc.).
  - Automatic calculation of occupation points based on characteristics formulas.
  - Interactive modal for selecting occupational skills, specializations, and point distribution.
  - Support for custom occupations.
- **Game Eras:** Support for 1920s, Modern, and Dark Ages settings.

#### 🎲 Integrated Tools
- **Interactive 3D Dice:** Real physics engine (`@3d-dice/dice-box`) to roll dice directly within the UI.
- **Improvement Rolls:** Guided system for investigator development phases (experience rolls).
- **Inventory Management:** Track equipment, cash, and assets.

#### 💾 Storage & Sync
- **Local Mode:** Characters are saved in the browser's LocalStorage by default.
- **Google Drive Sync:** Optional integration to save and synchronize your sheets across devices using your Google account.

#### 🌍 Accessibility & UX
- **Bilingual:** Fully translated interface in **English 🇺🇸** and **Spanish 🇪🇸**.
- **Dark/Light Mode:** Adapts to system preferences or user toggle.
- **PWA (Progressive Web App):** Installable as a native-like app on desktop and mobile.
- **Responsive Design:** Optimized for phones, tablets, and desktops.

### 🛠️ Tech Stack

This project is built using the latest web development technologies:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) (based on Radix UI)
- **Icons:** [Lucide React](https://lucide.dev/)
- **3D Dice:** [@3d-dice/dice-box](https://github.com/3d-dice/dice-box)
- **State & Forms:** Native React Hooks.

### 🚀 Installation & Local Deployment

Follow these steps to run the project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/cthulhu-7e-character-creator.git
    cd cthulhu-7e-character-creator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or if using pnpm
    pnpm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory. You will need to configure Google credentials if you want to test cloud sync:
    ```env
    NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open in browser:**
    Visit `http://localhost:3000` to see the app.

---

## ⚖️ License & Legal Disclaimer

<div align="center">

[![License](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-blue)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Trademark](https://img.shields.io/badge/Trademark-Chaosium_Inc.-red)]()

</div>

### 🇺🇸 English

This is an **unofficial fan-made tool** created to assist players of the tabletop role-playing game *Call of Cthulhu® 7th Edition*.

*Call of Cthulhu* and the *Chaosium* logo are registered trademarks of **Chaosium Inc.**  
All rights to those names, systems, and related intellectual property belong to Chaosium Inc.

This project is **not affiliated with, endorsed, or sponsored** by Chaosium Inc.

The software and its code are © **CthulhuBuilder**, licensed under the  
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

This tool does **not distribute or reproduce any copyrighted game content**
(text, art, or rule excerpts).  
It only references publicly known mechanics for compatibility purposes.

Commercial use, redistribution, or monetization of this software is **not permitted** without express written consent from **CthulhuBuilder**.

If you wish to learn more about Chaosium or *Call of Cthulhu*, visit  
🔗 [https://www.chaosium.com](https://www.chaosium.com)

---

### 🇪🇸 Español

Esta es una **herramienta no oficial creada por fans** para ayudar a los jugadores de *La Llamada de Cthulhu® 7ª Edición*.

*La Llamada de Cthulhu* y el logotipo de *Chaosium* son marcas registradas de **Chaosium Inc.**  
Todos los derechos sobre dichos nombres, sistemas y propiedad intelectual pertenecen a Chaosium Inc.

Este proyecto **no está afiliado, respaldado ni patrocinado** por Chaosium Inc.

El software y su código son © **CthulhuBuilder**, publicados bajo la  
[Licencia Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es).

Esta herramienta **no distribuye ni reproduce contenido con copyright**
del juego (texto, arte o reglas).  
Solo hace referencia a mecánicas conocidas públicamente con fines de compatibilidad.

El uso, redistribución o monetización comercial de este software **no está permitido** sin el consentimiento expreso por escrito de **CthulhuBuilder**.

Para más información sobre Chaosium o *La Llamada de Cthulhu*, visita  
🔗 [https://www.chaosium.com](https://www.chaosium.com)

---

> **Optional notice / Aviso opcional:**  
> Portions of this software use mechanics covered under the **BRP Open Game License**, © Chaosium Inc.

---

[Go to Spanish Version / Ir a la versión en Español](#español)

<br>
<br>
<hr>
<br>
<br>

<a id="español"></a>

## 🇪🇸 Creador de Personajes - La Llamada de Cthulhu 7ª Edición

*(Contenido igual que arriba, mantenido bilingüe para coherencia.)*

