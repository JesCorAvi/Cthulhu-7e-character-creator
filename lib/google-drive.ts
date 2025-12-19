// lib/google-drive.ts
import type { Character } from "./character-types"

// AHORA LEE LA VARIABLE DE ENTORNO
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "" 

// Configuración de la API
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
const SCOPES = "https://www.googleapis.com/auth/drive.file"

let tokenClient: any
let gapiInited = false
let gisInited = false

export const initGoogleDrive = (onInit: (success: boolean) => void) => {
  if (typeof window === "undefined") return

  if (!CLIENT_ID) {
    console.error("Falta la variable de entorno NEXT_PUBLIC_GOOGLE_CLIENT_ID")
    return
  }

  const gapi = (window as any).gapi
  const google = (window as any).google

  if (!gapi || !google) {
    // Reintentar si las librerías aún no han cargado
    setTimeout(() => initGoogleDrive(onInit), 500)
    return
  }

  gapi.load("client", async () => {
    await gapi.client.init({
      apiKey: API_KEY, // Opcional, pero recomendado si la tienes
      discoveryDocs: DISCOVERY_DOCS,
    })
    gapiInited = true
    checkAuth()
  })

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async (resp: any) => {
      if (resp.error !== undefined) {
        throw resp
      }
      // Token recibido correctamente
    },
  })
  gisInited = true

  function checkAuth() {
    if (gapiInited && gisInited) onInit(true)
  }
}

export const signInToGoogle = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject("Google Client not initialized")

    // Sobrescribimos el callback temporalmente para capturar este login específico
    tokenClient.callback = (resp: any) => {
      if (resp.error) reject(resp)
      resolve()
    }

    // 'prompt: ""' intenta loguear sin popup si ya hay sesión.
    // Si falla o es la primera vez, Google mostrará el popup automáticamente o pedirá 'consent'.
    tokenClient.requestAccessToken({ prompt: "" })
  })
}

export const signOutFromGoogle = () => {
  const google = (window as any).google
  // Revocar el token actual si existe
  const token = (window as any).gapi?.client?.getToken()?.access_token
  if (google && token) {
    google.accounts.oauth2.revoke(token, () => {
      console.log("Access token revoked")
      // Limpiar token localmente
      ;(window as any).gapi.client.setToken(null)
    })
  }
}

// --- Operaciones de Archivos ---

// Busca un archivo por la ID interna del personaje (guardado en appProperties)
const findFileByCharId = async (charId: string) => {
  try {
    const response = await (window as any).gapi.client.drive.files.list({
      q: `appProperties has { key='charId' and value='${charId}' } and trashed = false`,
      fields: "files(id, name, appProperties)",
    })
    return response.result.files[0]
  } catch (e) {
    console.error("Error buscando archivo:", e)
    return null
  }
}

export const saveCharacterToDrive = async (character: Character): Promise<void> => {
  const fileContent = JSON.stringify(character)
  // Intentar encontrar si ya existe en Drive
  const existingFile = await findFileByCharId(character.id)

  const metadata = {
    name: `${character.name || "Sin Nombre"} - Cthulhu 7e.json`,
    mimeType: "application/json",
    // appProperties: metadatos ocultos para no depender del nombre del archivo
    appProperties: {
      charId: character.id,
      type: "cthulhu_character",
    },
  }

  const accessToken = (window as any).gapi.client.getToken().access_token

  if (existingFile) {
    // ACTUALIZAR (PATCH)
    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`, {
      method: "PATCH",
      headers: new Headers({ Authorization: "Bearer " + accessToken }),
      body: createMultipartBody(metadata, fileContent),
    })
  } else {
    // CREAR (POST)
    await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + accessToken }),
      body: createMultipartBody(metadata, fileContent),
    })
  }
}

export const getCharactersFromDrive = async (): Promise<Character[]> => {
  // Buscar archivos marcados con nuestro tipo
  const response = await (window as any).gapi.client.drive.files.list({
    q: "appProperties has { key='type' and value='cthulhu_character' } and trashed = false",
    fields: "files(id, name)",
  })

  const files = response.result.files
  const characters: Character[] = []

  // Descargar contenido en paralelo
  await Promise.all(
    files.map(async (file: any) => {
      try {
        const contentResp = await (window as any).gapi.client.drive.files.get({
          fileId: file.id,
          alt: "media",
        })
        // Asumimos que el contenido es el JSON del personaje
        const char = contentResp.result
        // Aseguramos que tenga ID, por si acaso
        if (char && typeof char === "object") {
           characters.push(char)
        }
      } catch (e) {
        console.error(`Error loading file ${file.id}`, e)
      }
    }),
  )

  return characters
}

export const deleteCharacterFromDrive = async (charId: string): Promise<void> => {
  const existingFile = await findFileByCharId(charId)
  if (existingFile) {
    await (window as any).gapi.client.drive.files.delete({
      fileId: existingFile.id,
    })
  }
}

// Helper para construir el cuerpo multipart (metadata + JSON content)
const createMultipartBody = (metadata: any, content: string) => {
  const boundary = "-------314159265358979323846"
  const delimiter = "\r\n--" + boundary + "\r\n"
  const close_delim = "\r\n--" + boundary + "--"

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    content +
    close_delim

  return multipartRequestBody
}