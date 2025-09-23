export interface HttpRequest {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

export interface HttpResponse<T = unknown> {
  status: number
  statusText: string
  data: T
  headers: Record<string, string>
}

export type HttpError = {
  message: string
  status?: number
  code?: string
}

export class HttpClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL = '', defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    }
  }

  async request<T = unknown>(config: HttpRequest): Promise<HttpResponse<T>> {
    const url = this.baseURL + config.url
    const headers = { ...this.defaultHeaders, ...config.headers }
    try {
      const response = await fetch(url, {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined
      })
      const data = await response.json()
      return {
        status: response.status,
        statusText: response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries())
      }
    } catch (error) {
      throw {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'NETWORK_ERROR'
      } as HttpError
    }
  }

  get<T = unknown>(url: string, config?: Partial<HttpRequest>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' })
  }

  post<T = unknown>(url: string, body?: unknown, config?: Partial<HttpRequest>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', body })
  }

  put<T = unknown>(url: string, body?: unknown, config?: Partial<HttpRequest>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', body })
  }

  delete<T = unknown>(url: string, config?: Partial<HttpRequest>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' })
  }
}

export function createHttpClient(baseURL?: string, headers?: Record<string, string>): HttpClient {
  return new HttpClient(baseURL, headers)
}
