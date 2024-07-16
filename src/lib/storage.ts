export const save = async (key: string, value: any) => {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      resolve(true)
    })
  })
}

export const get = async <T>(key: string): Promise<T> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      resolve(result[key] as T)
    })
  })
}
