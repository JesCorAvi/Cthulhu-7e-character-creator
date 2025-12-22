# Cthulhu 7e Character Creator / Creador de Personajes CoC 7e 

<div align="center">

[![Status](https://img.shields.io/badge/Status-In_Development-green)]()
[![Tech](https://img.shields.io/badge/Built_with-Next.js-black)]()
[![License](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-blue)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

🌐 **Live Demo:** [https://cthulhubuilder.pages.dev/](https://cthulhubuilder.pages.dev/)

**[ 🇺🇸 English Version ](#english) | [ 🇪🇸 Versión en Español ](#español)**

</div>
---

<a id="english"></a>

## 🇺🇸 Cthulhu 7th Edition Character Creator

A modern, interactive, and Progressive Web App (PWA) designed to facilitate the creation and management of investigators for the tabletop role-playing game **Cthulhu 7th Edition**.

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

### 📄 Full License Text (English)

**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**

You are free to:
- **Share** — copy and redistribute the material in any medium or format  
- **Adapt** — remix, transform, and build upon the material  

Under the following terms:
- **Attribution** — You must give appropriate credit.  
- **NonCommercial** — You may not use the material for commercial purposes.  
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license.  

No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

Full legal text: [https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)  
© **CthulhuBuilder**

---

<a id="español"></a>

## 🇪🇸 Creador de Personajes - Cthulhu 7ª Edición

Una aplicación web moderna, interactiva y progresiva (PWA) diseñada para facilitar la creación y gestión de investigadores para el juego de rol **La Llamada de Cthulhu 7ª Edición**.

### ✨ Características Principales

#### 📝 Gestión de Personajes
- **Creación Guiada:** Generación de características (FUE, DES, POD, etc.) manual o mediante tiradas de dados integradas.
- **Cálculo Automático:** Derivados como Puntos de Vida, Cordura, Magia, Corpulencia y Bonificador de Daño se calculan automáticamente.
- **Sistema de Ocupaciones:**
  - Base de datos completa de ocupaciones (Años 20, Actualidad, etc.).
  - Cálculo automático de puntos de ocupación basados en fórmulas de características.
  - Modal interactivo para selección de habilidades de ocupación, especialidades y distribución de puntos.
  - Soporte para ocupaciones personalizadas.
- **Eras de Juego:** Soporte para Años 20, Actualidad y Edad Oscura (Dark Ages).

#### 🎲 Herramientas Integradas
- **Dados 3D Interactivos:** Motor de física real (`@3d-dice/dice-box`) para lanzar dados directamente en la interfaz.
- **Tiradas de Mejora:** Sistema guiado para las fases de desarrollo de investigadores (tiradas de experiencia).
- **Gestión de Inventario:** Control de equipo, dinero y posesiones.

#### 💾 Almacenamiento y Sincronización
- **Modo Local:** Los personajes se guardan en el almacenamiento local del navegador (LocalStorage) por defecto.
- **Google Drive Sync:** Integración opcional para guardar y sincronizar tus fichas en la nube a través de tu cuenta de Google.

#### 🌍 Accesibilidad y UX
- **Bilingüe:** Interfaz totalmente traducida al **Español 🇪🇸** e **Inglés 🇺🇸**.
- **Tema Oscuro/Claro:** Adaptable a las preferencias del sistema o del usuario.
- **PWA (Progressive Web App):** Instalable como aplicación nativa en escritorio y móviles.
- **Diseño Responsivo:** Optimizado para funcionar en teléfonos, tablets y ordenadores.

### 🛠️ Tecnologías Utilizadas

Este proyecto ha sido construido utilizando las últimas tecnologías de desarrollo web:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/) (basado en Radix UI)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Dados 3D:** [@3d-dice/dice-box](https://github.com/3d-dice/dice-box)
- **Estado y Formularios:** React Hooks nativos.

### 🚀 Instalación y Despliegue Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/cthulhu-7e-character-creator.git
    cd cthulhu-7e-character-creator
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o si usas pnpm
    pnpm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto. Necesitarás configurar las credenciales de Google si quieres probar la sincronización en la nube:
    ```env
    NEXT_PUBLIC_GOOGLE_API_KEY=tu_api_key_de_google
    ```

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

5.  **Abrir en el navegador:**
    Visita `http://localhost:3000` para ver la aplicación.

---

## ⚖️ Licencia y Renuncia de Responsabilidad

<div align="center">

[![License](https://img.shields.io/badge/Licencia-CC_BY--NC--SA_4.0-blue)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
[![Trademark](https://img.shields.io/badge/Marca_Registrada-Chaosium_Inc.-red)]()

</div>

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

### 📄 Texto Completo de la Licencia (Español)

**Licencia Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)**

Usted es libre de:
- **Compartir** — copiar y redistribuir el material en cualquier medio o formato.  
- **Adaptar** — remezclar, transformar y crear a partir del material.  

Bajo los siguientes términos:
- **Atribución** — Debe otorgar el crédito apropiado.  
- **NoComercial** — No puede utilizar el material con fines comerciales.  
- **CompartirIgual** — Si remezcla, transforma o crea a partir del material, debe distribuir su contribución bajo la misma licencia.

Sin restricciones adicionales — No puede aplicar términos legales o medidas tecnológicas que restrinjan legalmente a otros de hacer algo que la licencia permita.

Texto legal completo: [https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.es](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.es)  
© **CthulhuBuilder**

---

> **Aviso opcional:**  
> Algunas partes de este software utilizan mecánicas cubiertas por la **BRP Open Game License**, © Chaosium Inc.

---

[Go to English Version / Ir a la versión en Inglés](#english)

<br>
</div>
