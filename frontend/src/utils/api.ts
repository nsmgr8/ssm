import wretch from 'wretch'

export const api = wretch('http://localhost:8000')
  .errorType('json')
  .resolve((r) => r.json())
