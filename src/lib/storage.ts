export const StorageKeys: { [key: string]: string } = {
  SearchQueue: 'searchQueue',
  SearchNotes: 'searchNotes',
}

export const save = async (key: string, value: any) => {
  console.log(key, JSON.stringify(value))
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      resolve(true)
    })
  })
}

export const insert = async (
  key: string,
  value: any,
  duplicate?: (value: any) => boolean
) => {
  const data = await get(key)
  if (Array.isArray(data)) {
    if (!duplicate || !data.find(duplicate)) {
      data.push(value)
      return save(key, data)
    }
  }
  return save(key, [value])
}

export const get = async <T>(key: string): Promise<T> => {
  console.log(key)
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      resolve(result[key] as T)
    })
  })
}
