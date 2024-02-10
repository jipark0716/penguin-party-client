export async function get(ids: number[]): Promise<UserCollectionResponse> {
    const url = new URL('http://20.214.207.225:5000/api/users')
    ids.forEach(id => url.searchParams.set('ids[]', String(id)))
    const response = await fetch(url)
    return await response.json() as Promise<UserCollectionResponse>;
}

interface UserCollectionResponse {
    code: number,
    message: string
    collect: User[]
}

interface User {
    id: number
    name: string
    avatar: string
}