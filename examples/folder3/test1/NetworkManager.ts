export interface NetworkConfig {
  baseUrl: string
  timeout: number
  retries: number
  headers: Record<string, string>
  interceptors: NetworkInterceptor[]
}

export interface NetworkRequest {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

export interface NetworkResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: NetworkRequest
}

export interface NetworkError {
  message: string
  code?: string
  status?: number
  response?: NetworkResponse
}

export type NetworkInterceptor = {
  request?: (config: NetworkRequest) => NetworkRequest | Promise<NetworkRequest>
  response?: <T>(response: NetworkResponse<T>) => NetworkResponse<T> | Promise<NetworkResponse<T>>
  error?: (error: NetworkError) => NetworkError | Promise<NetworkError>
}

export class NetworkManager {
  private config: NetworkConfig
  private requestQueue: NetworkRequest[] = []
  private isProcessing: boolean = false

  constructor(config: Partial<NetworkConfig> = {}) {
    this.config = {
      baseUrl: '',
      timeout: 10000,
      retries: 3,
      headers: {
        'Content-Type': 'application/json'
      },
      interceptors: [],
      ...config
    }
  }

  async request<T = unknown>(request: NetworkRequest): Promise<NetworkResponse<T>> {
    const fullRequest: NetworkRequest = {
      ...request,
      url: this.buildUrl(request.url),
      headers: { ...this.config.headers, ...request.headers },
      timeout: request.timeout || this.config.timeout
    }
    let processedRequest = fullRequest
    for (const interceptor of this.config.interceptors) {
      if (interceptor.request) {
        processedRequest = await interceptor.request(processedRequest)
      }
    }
    try {
      const response = await this.executeRequest<T>(processedRequest)
      let processedResponse = response
      for (const interceptor of this.config.interceptors) {
        if (interceptor.response) {
          processedResponse = await interceptor.response(processedResponse)
        }
      }
      return processedResponse
    } catch (error) {
      const networkError: NetworkError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'NETWORK_ERROR'
      }
      let processedError = networkError
      for (const interceptor of this.config.interceptors) {
        if (interceptor.error) {
          processedError = await interceptor.error(processedError)
        }
      }
      throw processedError
    }
  }

  get<T = unknown>(url: string, config?: Partial<NetworkRequest>): Promise<NetworkResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' })
  }

  post<T = unknown>(url: string, data?: unknown, config?: Partial<NetworkRequest>): Promise<NetworkResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', body: data })
  }

  put<T = unknown>(url: string, data?: unknown, config?: Partial<NetworkRequest>): Promise<NetworkResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', body: data })
  }

  delete<T = unknown>(url: string, config?: Partial<NetworkRequest>): Promise<NetworkResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' })
  }

  addInterceptor(interceptor: NetworkInterceptor): void {
    this.config.interceptors.push(interceptor)
  }

  removeInterceptor(index: number): boolean {
    if (index >= 0 && index < this.config.interceptors.length) {
      this.config.interceptors.splice(index, 1)
      return true
    }
    return false
  }

  updateConfig(updates: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  getConfig(): NetworkConfig {
    return { ...this.config }
  }

  private buildUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `${this.config.baseUrl}${url.startsWith('/') ? url : `/${url}`}`
  }

  private async executeRequest<T>(request: NetworkRequest): Promise<NetworkResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), request.timeout)
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      const data = await response.json()
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        config: request
      }
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }
}

export function createNetworkManager(config?: Partial<NetworkConfig>): NetworkManager {
  return new NetworkManager(config)
}
