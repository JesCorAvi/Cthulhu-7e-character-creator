"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Definimos los tipos
type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// Diccionario de traducciones
const translations = {
  es: {
    // --- STORAGE ---
    storage_local: "Local",
    storage_local_desc: "En Dispositivo",
    storage_cloud: "Google Drive",
    storage_cloud_desc: "En Nube",
    storage_local_help:
      "Los personajes se guardan solo en este navegador. Si borras el historial o cambias de dispositivo, los perderás.",
    storage_cloud_help:
      "Tus personajes se sincronizan con tu cuenta de Google Drive. Podrás acceder a ellos desde cualquier dispositivo.",

    popup_google_title: "Iniciar sesión con Google",
    popup_google_desc:
      "Por favor, autoriza el inicio de sesión en la ventana emergente.",
    look_here: "¡Mira aquí!",
    popup_check_top_left:
      "La ventana suele aparecer en la esquina superior izquierda.",
    popup_not_visible_btn: "No funciona / No veo la ventana",
    login_blocked_title: "Inicio de sesión bloqueado",
    login_blocked_desc:
      "Brave requiere una autorización manual para el inicio de sesión.",
    brave_new_permission_desc:
      "Brave ha introducido un nuevo “permiso de Inicio de sesión con Google” que pide al usuario confirmar si quiere permitir que el sitio envíe cookies de terceros para el inicio de sesión con Google.",
    solution_title: "Cómo habilitarlo:",

    tut_brave_1:
      "Haz clic en el icono a la izquierda de la barra de direcciones (dos barras paralelas con circulos a los lados).",
    tut_brave_2: 'Selecciona "Configuración del sitio" / Site Settings.',
    tut_brave_3:
      'Busca "Inicio de sesión con Google o Google Sign‑In" en la lista de permisos y cámbialo a Permitir / Allow.',
    tut_brave_4: "Recarga la página y prueba de nuevo.",

    // --- GENERAL UI ---
    popup_error_generic: "Error al iniciar sesión con Google",
    wait_saving: "Espere a que los datos se guarden",
    delete_confirm_title: "Confirmar Eliminación",
    app_title: "Cthulhu Builder",
    app_subtitle: "Creador de Personajes",
    new: "Nuevo",
    connecting: "Conectando...",
    sync_now: "Sincronizar ahora",
    login_required: "Conectar con Google Drive",
    login_msg:
      "Para ver y guardar tus personajes en la nube, necesitamos reconectar con tu cuenta de Google.",
    no_characters: "No hay personajes",
    no_characters_cloud: "No se encontraron personajes en tu Drive.",
    no_characters_local:
      "Crea tu primer investigador para comenzar tu aventura",
    your_investigators: "Tus Investigadores",
    create_char_button: "Crear Personaje",
    new_investigator: "Nuevo Investigador",
    select_era: "Selecciona la época para tu personaje",
    footer_text: "Call of Cthulhu es una marca registrada de Chaosium Inc.",
    back: "Volver",
    edit: "Editar",
    view: "Ver",
    delete: "Eliminar",
    save: "Guardar",
    saved: "Guardado",
    saving: "Guardando...",
    error_save: "Error al guardar",
    cancel: "Cancelar",
    roll_dice: "Tirar Dados",
    auto_roll_desc: "Genera todas las características automáticamente",
    delete_confirm: "¿Estás seguro de eliminar este personaje?",
    backstory_equipment: "Trasfondo y Equipo",
    close: "Cerrar",
    share: "Compartir",
    character_imported_url: "Personaje importado",

    // --- DADOS ---
    loading_physics: "Cargando motor físico...",
    launch_dice: "Lanzar Dados",
    rolling: "Rodando...",

    // --- TABS & FORMULARIOS ---
    tab_backstory: "Trasfondo",
    tab_equipment: "Equipo y Dinero",
    tab_notes: "Notas",
    personal_desc_label: "Descripción Personal",
    personal_desc_ph: "Apariencia física, forma de vestir...",
    ideology_label: "Ideología / Creencias",
    ideology_ph: "Creencias religiosas, políticas, morales...",
    significant_people_label: "Personas Significativas",
    significant_people_ph: "Familiares, amigos, enemigos...",
    significant_places_label: "Lugares Significativos",
    significant_places_ph: "Lugares importantes para el personaje...",
    precious_possessions_label: "Posesiones Preciadas",
    precious_possessions_ph: "Objetos de valor sentimental...",
    traits_label: "Rasgos",
    traits_ph: "Personalidad, manías, hábitos...",
    injuries_label: "Heridas y Cicatrices",
    injuries_ph: "Marcas físicas permanentes...",
    phobias_label: "Fobias y Manías",
    phobias_ph: "Miedos irracionales, obsesiones...",
    arcane_tomes_label: "Tomos Arcanos",
    arcane_tomes_ph: "Libros de los Mitos leídos...",
    strange_encounters_label: "Encuentros con lo Extraño",
    strange_encounters_ph: "Experiencias sobrenaturales...",
    equipment_possessions_label: "Equipo y Posesiones",
    equipment_ph: "Lista de objetos que lleva el personaje...",
    spending_level_label: "Nivel de Gasto",
    spending_level_ph: "Nivel de gasto semanal",
    cash_label: "Dinero en Efectivo",
    cash_ph: "Dinero disponible",
    assets_label: "Bienes y Propiedades",
    assets_ph: "Propiedades, inversiones, vehículos...",
    fellow_investigators_label: "Compañeros Investigadores",
    fellow_investigators_ph: "Otros investigadores del grupo...",
    notes_label: "Notas del Personaje",
    notes_ph: "Notas adicionales, pistas, eventos importantes...",

    // --- CARACTERÍSTICAS ---
    str: "FUE",
    dex: "DES",
    pow: "POD",
    con: "CON",
    app: "APA",
    edu: "EDU",
    siz: "TAM",
    int: "INT",
    mov: "MOV",
    db: "Bon. Daño",
    build: "Corpulencia",
    dodge: "Esquivar",
    half: "½",
    fifth: "⅕",

    // --- DATOS PERSONALES ---
    name: "Nombre",
    player: "Jugador",
    occupation: "Ocupación",
    age: "Edad",
    gender: "Género",
    residence: "Residencia",
    birthplace: "Lugar de Nacimiento",
    unnamed: "Sin nombre",
    manage_skills: "Gestionar Habilidades",
    select_occupation: "Selecciona...",
    custom_occupation: "Personalizada / Otra...",
    new_occupation_placeholder: "Escribe el nombre de la profesión...",

    // --- ESTADOS ---
    hp: "Puntos de Vida",
    sanity: "Cordura",
    luck: "Suerte",
    magic_points: "Puntos de Magia",
    current: "Actual",
    max: "Máx",
    start: "Inicial",
    major_wound: "Herida Grave",
    dying: "Moribundo",
    unconscious: "Inconsciente",
    temp_insanity: "Locura Temp.",
    indef_insanity: "Locura Indef.",

    // --- HABILIDADES ---
    investigator_skills: "Habilidades del Investigador",
    filter_skills: "Filtrar...",
    add_skill: "Añadir",
    total_skills: "Total Habilidades",
    occupation_points: "Puntos de Ocupación",
    personal_points: "P. Personales",
    spent: "gastados",
    available: "disponibles",
    specialization: "Especialización",
    specialties: "Especialidades",
    add_custom: "Añadir...",
    skills_choice: "Habilidades a elección",

    // --- COMBATE ---
    combat: "Combate",
    weapon: "Arma",
    unarmed: "Desarmado",
    regular: "Regular",
    difficult: "Difícil",
    extreme: "Extremo",
    damage: "Daño",
    range: "Alcance",
    attacks: "Atq",
    ammo: "Mun.",
    malfunction: "Avería",
    add_weapon: "Añadir Arma",

    // --- ERAS ---
    era_1920s: "Años 20",
    era_modern: "Actualidad",
    era_darkAges: "Edad Oscura",
    desc_1920s: "La época clásica. Jazz, ley seca y misterios.",
    desc_modern: "Tecnología actual, internet y horrores globales.",
    desc_darkAges: "Superstición medieval y antiguos males.",
    coming_soon: "Próximamente",

    // --- GENERADOR ---
    dice_roller_title: "Tiradas de Características",
    dice_roller_desc:
      "Lanza los dados para determinar las características de tu investigador según las reglas de Call of Cthulhu 7e",
    heroic_method: "Método Heroico",
    heroic_desc: "Tira un dado extra y descarta el más bajo",
    interactive_dice: "Dados 3D Interactivos",
    interactive_desc: "Lanza los dados tú mismo",
    formulas_title: "Fórmulas de tirada:",
    rolls_complete: "Tiradas Completadas",
    next_roll: "Continuar con la siguiente tirada",
    reroll_all: "Volver a tirar",
    apply_results: "Aplicar Resultados",
    click_to_roll: "Haz clic para lanzar los dados",

    // --- MEJORA ---
    improve_title: "Mejorar Habilidad",
    current_value: "Valor actual",
    how_to_proceed: "¿Cómo quieres proceder?",
    how_to_proceed_desc:
      "Puedes tirar los dados para determinar si la habilidad mejora, o introducir manualmente el resultado.",
    roll_dice_button: "Tirar los dados",
    roll_d100_hint: "Lanzar d100 (Decenas + Unidades)",
    manual_input: "O introduce el resultado manualmente:",
    amount_placeholder: "Cantidad a subir",
    apply: "Aplicar",
    check_d100_title: "Tira d100 de Comprobación",
    check_d100_desc_high:
      "Tu habilidad es muy alta (>=95). Solo mejorarás si sacas entre 96 y 100.",
    check_d100_desc_normal:
      "Necesitas sacar más de {value} en el d100 para mejorar.",
    success_msg: "¡Éxito! Puedes mejorar",
    fail_msg: "Fallaste",
    rolled_more: "Sacaste más de {value}",
    needed_more: "Necesitabas más de {value}",
    roll_d10_title: "Tira 1d10 de Mejora",
    roll_d10_desc: "El resultado se sumará a tu habilidad actual.",
    roll_d10_button: "Tirar 1d10 para ver cuánto mejoras",
    skill_improved: "¡Habilidad mejorada!",
    skill_improved_desc: "{name} sube de {old}% a {new}%",
    apply_improvement: "Aplicar mejora",
    continue_no_change: "Continuar (sin cambios)",

    // --- OCUPACIÓN ---
    occupation_choose_stat: "Elige característica:",
    configuration: "Configuración",
    save_and_close: "Guardar y Cerrar",
    define: "Definir",
    base_value_label: "Valor base (%):",
    base_value_hint: "El valor base no se resta de tus puntos de ocupación.",
    credit_rating: "Crédito",
    formula: "Fórmula",
    print: "Imprimir",
    backstory: "Trasfondo",
  },
  en: {
    // --- STORAGE ---
    wait_saving: "Please wait for the data to be saved",
    delete_confirm_title: "Confirm Deletion",
    storage_local: "Local",
    storage_local_desc: "On Device",
    storage_cloud: "Google Drive",
    storage_cloud_desc: "On Cloud",
    storage_local_help:
      "Characters are saved only in this browser. If you clear history or change devices, you will lose them.",
    storage_cloud_help:
      "Your characters are synced with your Google Drive account. You can access them from any device.",

    popup_google_title: "Sign in with Google",
    popup_google_desc: "Please authorize the sign-in in the popup window.",
    look_here: "Look here!",
    popup_check_top_left: "The window usually appears in the top-left corner.",
    popup_not_visible_btn: "Not working / Can't see window",
    login_blocked_title: "Sign-in Blocked",
    login_blocked_desc: "Brave requires manual authorization for sign-in.",
    brave_new_permission_desc:
      "Brave has introduced a new “Google Sign‑In permission” asking the user to confirm if they want to allow the site to send third-party cookies for Google sign-in.",
    solution_title: "How to enable it:",

    tut_brave_1:
      "Click on the icon to the left of the address bar (two parallel bars with circles on the sides).",
    tut_brave_2: 'Select "Site Settings".',
    tut_brave_3:
      'Find "Google Sign‑In" in the permissions list and change it to Allow.',
    tut_brave_4: "Reload the page and try again.",

    // --- GENERAL UI ---
    popup_error_generic: "Error signing in with Google",
    app_title: "Cthulhu Builder",
    app_subtitle: "Character Creator",
    new: "New",
    connecting: "Connecting...",
    sync_now: "Sync Now",
    login_required: "Connect with Google Drive",
    login_msg:
      "To view and save your characters in the cloud, we need to reconnect with your Google account.",
    no_characters: "No characters found",
    no_characters_cloud: "No investigators found in your Google Drive.",
    no_characters_local:
      "Create your first investigator to start your adventure",
    your_investigators: "Your Investigators",
    create_char_button: "Create Character",
    new_investigator: "New Investigator",
    select_era: "Select the era for your character",
    footer_text: "Call of Cthulhu is a registered trademark of Chaosium Inc.",
    back: "Back",
    edit: "Edit",
    view: "View",
    delete: "Delete",
    save: "Save",
    saved: "Saved",
    saving: "Saving...",
    error_save: "Error saving",
    cancel: "Cancel",
    roll_dice: "Roll Dice",
    auto_roll_desc: "Generate all characteristics automatically",
    delete_confirm: "Are you sure you want to delete this character?",
    backstory_equipment: "Backstory & Equipment",
    close: "Close",
    share: "Share",
    character_imported_url: "Character imported",

    // --- DICE ---
    loading_physics: "Loading physics engine...",
    launch_dice: "Roll Dice",
    rolling: "Rolling...",

    // --- TABS & FORM ---
    tab_backstory: "Backstory",
    tab_equipment: "Equipment & Cash",
    tab_notes: "Notes",
    personal_desc_label: "Personal Description",
    personal_desc_ph: "Physical appearance, style of dress...",
    ideology_label: "Ideology / Beliefs",
    ideology_ph: "Religious, political, moral beliefs...",
    significant_people_label: "Significant People",
    significant_people_ph: "Family, friends, enemies...",
    significant_places_label: "Significant Places",
    significant_places_ph: "Important locations for the character...",
    precious_possessions_label: "Treasured Possessions",
    precious_possessions_ph: "Items of sentimental value...",
    traits_label: "Traits",
    traits_ph: "Personality, habits, quirks...",
    injuries_label: "Injuries & Scars",
    injuries_ph: "Permanent physical marks...",
    phobias_label: "Phobias & Manias",
    phobias_ph: "Irrational fears, obsessions...",
    arcane_tomes_label: "Arcane Tomes",
    arcane_tomes_ph: "Mythos books read...",
    strange_encounters_label: "Strange Encounters",
    strange_encounters_ph: "Supernatural experiences...",
    equipment_possessions_label: "Equipment & Possessions",
    equipment_ph: "List of items carried...",
    spending_level_label: "Spending Level",
    spending_level_ph: "Weekly spending level",
    cash_label: "Cash",
    cash_ph: "Available cash",
    assets_label: "Assets",
    assets_ph: "Property, investments, vehicles...",
    fellow_investigators_label: "Fellow Investigators",
    fellow_investigators_ph: "Other investigators in the group...",
    notes_label: "Character Notes",
    notes_ph: "Additional notes, clues, important events...",

    // --- STATS ---
    str: "STR",
    dex: "DEX",
    pow: "POW",
    con: "CON",
    app: "APP",
    edu: "EDU",
    siz: "SIZ",
    int: "INT",
    mov: "MOV",
    db: "Damage Bonus",
    build: "Build",
    dodge: "Dodge",
    half: "½",
    fifth: "⅕",

    // --- PERSONAL DATA ---
    name: "Name",
    player: "Player",
    occupation: "Occupation",
    age: "Age",
    gender: "Gender",
    residence: "Residence",
    birthplace: "Birthplace",
    unnamed: "Unnamed",
    manage_skills: "Manage Skills",
    select_occupation: "Select...",
    custom_occupation: "Custom / Other...",
    new_occupation_placeholder: "Enter profession name...",

    // --- DERIVED ---
    hp: "Hit Points",
    sanity: "Sanity",
    luck: "Luck",
    magic_points: "Magic Points",
    current: "Current",
    max: "Max",
    start: "Start",
    major_wound: "Major Wound",
    dying: "Dying",
    unconscious: "Unconscious",
    temp_insanity: "Temp. Insane",
    indef_insanity: "Indef. Insane",

    // --- SKILLS ---
    investigator_skills: "Investigator Skills",
    filter_skills: "Filter...",
    add_skill: "Add",
    total_skills: "Total Skills",
    occupation_points: "Occupation Points",
    personal_points: "Pers. Points",
    spent: "spent",
    available: "available",
    specialization: "Specialization",
    specialties: "Specialties",
    add_custom: "Add...",
    skills_choice: "Skills of your choice",

    // --- COMBATE ---
    combat: "Combat",
    weapon: "Weapon",
    unarmed: "Unarmed",
    regular: "Regular",
    difficult: "Hard",
    extreme: "Extreme",
    damage: "Damage",
    range: "Range",
    attacks: "Atk",
    ammo: "Ammo",
    malfunction: "Malfunc.",
    add_weapon: "Add Weapon",

    // --- ERAS ---
    era_1920s: "1920s",
    era_modern: "Modern",
    era_darkAges: "Dark Ages",
    desc_1920s: "The classic era. Jazz, prohibition, and mysteries.",
    desc_modern: "Modern tech, internet, and global horrors.",
    desc_darkAges: "Medieval superstition and ancient evils.",
    coming_soon: "Coming Soon",

    // --- ROLLER ---
    dice_roller_title: "Characteristic Rolls",
    dice_roller_desc:
      "Roll the dice to determine your investigator's characteristics according to Call of Cthulhu 7e rules",
    heroic_method: "Heroic Method",
    heroic_desc: "Roll an extra die and drop the lowest",
    interactive_dice: "Interactive 3D Dice",
    interactive_desc: "Roll the dice yourself",
    formulas_title: "Roll Formulas:",
    rolls_complete: "Rolls Complete",
    next_roll: "Continue to next roll",
    reroll_all: "Reroll all",
    apply_results: "Apply Results",
    click_to_roll: "Click to roll dice",

    // --- IMPROVEMENT ---
    improve_title: "Improve Skill",
    current_value: "Current value",
    how_to_proceed: "How do you want to proceed?",
    how_to_proceed_desc:
      "You can roll the dice to see if the skill improves, or enter the result manually.",
    roll_dice_button: "Roll dice",
    roll_d100_hint: "Roll d100 (Tens + Units)",
    manual_input: "Or enter result manually:",
    amount_placeholder: "Amount to increase",
    apply: "Apply",
    check_d100_title: "Roll d100 Check",
    check_d100_desc_high: "Skill is very high (>=95). Improve only on 96-100.",
    check_d100_desc_normal: "Need > {value} on d100 to improve.",
    success_msg: "Success! You can improve",
    fail_msg: "Failed",
    rolled_more: "Rolled > {value}",
    needed_more: "Needed > {value}",
    roll_d10_title: "Roll 1d10 Improvement",
    roll_d10_desc: "The result is added to your current skill value.",
    roll_d10_button: "Roll 1d10 to see improvement",
    skill_improved: "Skill Improved!",
    skill_improved_desc: "{name} increases from {old}% to {new}%",
    apply_improvement: "Apply improvement",
    continue_no_change: "Continue (no changes)",

    // --- OCCUPATION ---
    occupation_choose_stat: "Choose characteristic:",
    configuration: "Configuration",
    save_and_close: "Save and Close",
    define: "Define",
    base_value_label: "Base value (%):",
    base_value_hint:
      "Base value is not subtracted from your occupation points.",
    credit_rating: "Credit Rating",
    formula: "Formula",
    print: "Print",
    backstory: "Backstory",
  },
};

// 1. Creamos el contexto. Inicialmente undefined.
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "cthulhu-builder-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // 2. Estado del idioma. 'es' por defecto.
  const [language, setLanguage] = useState<Language>("es");
  const [isMounted, setIsMounted] = useState(false);

  // 3. Efecto para cargar desde localStorage SOLO en el cliente (una vez)
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language;
      if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
        setLanguage(savedLanguage);
      }
    } catch (e) {
      console.error("Error cargando idioma", e);
    } finally {
      setIsMounted(true);
    }
  }, []);

  // 4. Efecto para guardar cambios en localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language, isMounted]);

  const t = (key: string, params?: Record<string, string | number>) => {
    // @ts-ignore
    let text = translations[language][key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  // 5. Renderizado: IMPORTANTE -> Siempre renderizamos children.
  // No hay condiciones de retorno nulo ni divs extraños.
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 6. Hook personalizado
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
