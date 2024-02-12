export async function get(ids: number[]): Promise<User[]> {
    const url = new URL('http://20.214.207.225:5000/api/users')
    ids.forEach(id => url.searchParams.append('ids[]', String(id)))
    const response = await fetch(url, {
        headers: {
            // @ts-ignore
            'Authorization': `Bearer ${await window.auth.getToken()}`,
        }
    })
    const result = await (await response.json() as Promise<UserCollectionResponse>);
    return result.collect;
}

interface UserCollectionResponse {
    code: number,
    message: string
    collect: User[]
}

export interface User {
    id: number
    name: string
    avatar: string
}