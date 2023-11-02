export class GithubUser {
    static async search(username) {
        const endpoint = `https://api.github.com/users/${username}`
        try {
            const data = await fetch(endpoint)
            const { login, name, public_repos, followers } = await data.json()
            if(login == undefined) {
                throw new Error('Usuário não encontrado')
            }
            return ({
                login,
                name,
                public_repos,
                followers
            })
        } catch (err) {
            console.error(err)
            alert(`Não foi possível buscar o usuário ${username}. Erro: ${err.message}`)
        }
    }
}
