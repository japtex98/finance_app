import axios from 'axios'

const instance = axios.create({
    baseURL: '/api'
})

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

instance.interceptors.response.use(
    (resp) => resp,
    (error) => {
        const message = error?.response?.data?.error?.message || error?.response?.data?.message || error.message
        return Promise.reject(new Error(message))
    }
)

function unwrap(promise) {
    return promise.then((r) => {
        // 204 No Content
        if (r.status === 204) return null
        const payload = r.data
        if (payload && typeof payload === 'object') {
            if ('pagination' in payload) {
                return { items: payload.data, pagination: payload.pagination }
            }
            if ('data' in payload) return payload.data
        }
        return payload
    })
}

export const api = {
    get: (url, params) => unwrap(instance.get(url, { params })),
    post: (url, data) => unwrap(instance.post(url, data)),
    put: (url, data) => unwrap(instance.put(url, data)),
    delete: (url) => unwrap(instance.delete(url))
} 