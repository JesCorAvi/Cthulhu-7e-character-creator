import type { Character } from "./character-types"

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
const SCOPES = "https://www.googleapis.com/auth/drive.file"

// Boundary constante para multipart
const BOUNDARY = "-------314159265358979323846"

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
    setTimeout(() => initGoogleDrive(onInit), 500)
    return
  }

  gapi.load("client", async () => {
      await gapi.client.init({
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

    tokenClient.callback = (resp: any) => {
      if (resp.error) reject(resp)
      else resolve()
    }

    tokenClient.requestAccessToken({ prompt: "" })
  })
}

export const signOutFromGoogle = () => {
  const google = (window as any).google
  const token = (window as any).gapi?.client?.getToken()?.access_token
  if (google && token) {
    google.accounts.oauth2.revoke(token, () => {
      console.log("Access token revoked")
      ;(window as any).gapi.client.setToken(null)
    })
  }
}

// --- Helper de Seguridad ---
const ensureClientReady = () => {
  const gapi = (window as any).gapi
  if (!gapi?.client?.drive) {
    throw new Error("Google API cliente no está listo.")
  }
  const token = gapi.client.getToken()
  if (!token) {
    throw new Error("No hay token de acceso. El usuario debe iniciar sesión.")
  }
}

// --- Operaciones de Archivos ---

const findFileByCharId = async (charId: string) => {
  ensureClientReady()
  try {
    const response = await (window as any).gapi.client.drive.files.list({
      q: `appProperties has { key='charId' and value='${charId}' } and trashed = false`,
      fields: "files(id, name, appProperties)",
    })
    return response.result.files[0]
  } catch (e) {
    console.error("Error buscando archivo en Drive:", JSON.stringify(e))
    return null
  }
}

export const saveCharacterToDrive = async (character: Character): Promise<void> => {
  ensureClientReady()
  const fileContent = JSON.stringify(character)
  const existingFile = await findFileByCharId(character.id)

  const metadata = {
    name: `${character.name || "Sin Nombre"} - Cthulhu 7e.json`,
    mimeType: "application/json",
    appProperties: {
      charId: character.id,
      type: "cthulhu_character",
    },
  }

  const accessToken = (window as any).gapi.client.getToken().access_token

  // SOLUCIÓN: Cabecera correcta para multipart
  const headers = new Headers({
    Authorization: "Bearer " + accessToken,
    "Content-Type": `multipart/related; boundary=${BOUNDARY}`,
  })

  if (existingFile) {
    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`, {
      method: "PATCH",
      headers: headers,
      body: createMultipartBody(metadata, fileContent),
    })
  } else {
    await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: headers,
      body: createMultipartBody(metadata, fileContent),
    })
  }
}

export const getCharactersFromDrive = async (): Promise<Character[]> => {
  try {
    ensureClientReady()

    const response = await (window as any).gapi.client.drive.files.list({
      q: "appProperties has { key='type' and value='cthulhu_character' } and trashed = false",
      fields: "files(id, name)",
    })

    const files = response.result.files
    if (!files) return []

    const characters: Character[] = []

    await Promise.all(
      files.map(async (file: any) => {
        try {
          const contentResp = await (window as any).gapi.client.drive.files.get({
            fileId: file.id,
            alt: "media",
          })
          
          let rawContent = contentResp.result || contentResp.body
          let char: Character | null = null

          // Intento 1: Parseo directo (Archivos limpios)
          try {
             if (typeof rawContent === 'object') {
                 char = rawContent
             } else {
                 char = JSON.parse(rawContent)
             }
          } catch (e) {
             // Intento 2: Rescate de archivos "sucios" (Multipart guardado como texto)
             console.warn(`Archivo ${file.id} corrupto, intentando reparar...`)
             if (typeof rawContent === 'string' && rawContent.includes(BOUNDARY)) {
                // Buscamos el segundo bloque JSON que contiene los datos reales
                const parts = rawContent.split(BOUNDARY)
                // Partes esperadas: [vacío, metadatos, contenido, --]
                if (parts.length >= 3) {
                    // Limpiamos cabeceras del content-type del fragmento
                    const jsonPart = parts[2].substring(parts[2].indexOf('{'))
                    char = JSON.parse(jsonPart)
                }
             }
          }

          if (char && char.id) {
            characters.push(char)
          }
        } catch (e) {
          console.error(`Error loading file ${file.id}`, e)
        }
      }),
    )

    return characters
  } catch (error: any) {
    if (error.message && error.message.includes("No hay token")) {
      console.warn("Intento de fetch sin token (esperando login).")
    } else {
      console.error("Error crítico obteniendo personajes de Drive:", error)
    }
    return []
  }
}

export const deleteCharacterFromDrive = async (charId: string): Promise<void> => {
  ensureClientReady()
  const existingFile = await findFileByCharId(charId)
  if (existingFile) {
    await (window as any).gapi.client.drive.files.delete({
      fileId: existingFile.id,
    })
  }
}

const createMultipartBody = (metadata: any, content: string) => {
  const delimiter = "\r\n--" + BOUNDARY + "\r\n"
  const close_delim = "\r\n--" + BOUNDARY + "--"

  return (
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    content +
    close_delim
  )
}