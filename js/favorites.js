import { GithubUser } from './githubuser.js'

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.localTableName = '@gitfav:users'
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem(this.localTableName)) || []
        this.entries = this.entries.filter(entry => !!entry)
        this.save()
        return this.entries
    }

    async add(username) {
        try {
            if(this.entries && this.entries.length > 0) {
                const userExists = this.entries.find(entry => entry && entry.login && entry.login == username)
                if (userExists) throw new Error(`Usuário ${username} já cadastrado`)
            }

            const githubuser = await GithubUser.search(username)
            if(!githubuser) return
            
            this.entries = [ githubuser, ...this.entries ]
            this.save()
            this.update()    
        } catch (err) {
            console.error(err)
            alert(err.message)
        }
        
    }

    save() {
        localStorage.setItem(this.localTableName, JSON.stringify(this.entries))
    }

    update() {
        console.log('update')
    }

    delete(user) {
        // higher-order function (map, filter, find, reduce)
        const filteredEntries = this.entries
                .filter((entry) =>  (entry.login != user.login))

        this.entries = filteredEntries
        this.save()
        this.update()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')
        this.update()
        this.onadd()
    }

    onadd() {
        const inputUsername = this.root.querySelector('#username')
        const addbutton = this.root.querySelector('.search button')

        addbutton.onclick = (e) => {
            const { value } = inputUsername
            this.add(value)

            inputUsername.value = ''
            inputUsername.focus()
        }

        inputUsername.onkeydown = (e) => {
            if(e.key == 'Enter') {
                addbutton.click()
            }
        }
    }

    update() {
        this.removeAllTr()

        if(this.entries && this.entries.length > 0) {
            this.entries.forEach(user => {
                const row = this.createRow(user)
                this.tbody.append(row)
            })
        }

        this.isNoData()
    }

    createRow(user) {
        if(!user) return

        const tr = document.createElement('tr')
        tr.innerHTML = `
        <td class="user">
            <img src="https://github.com/${user.login}.png" alt="Foto de perfil do ${user.name}">
            <a href="https://github.com/${user.login}" target="_blank">
                <p>${user.name}</p>
                <span>@${user.login}</span>
            </a>
        </td>
        <td class="repositories">${user.public_repos}</td>
        <td class="followers">${user.followers}</td>
        <td><button class="remove">Remover</button></td>
        `
        
        tr.querySelector('.remove').onclick = (e) => {
            const isOk = confirm(`Tem certeza que deseja remover o ${user.name}?`)
            if (isOk) {
                this.delete(user)
            }
        }

        return tr
    }
    
    removeAllTr() {
        this.tbody.querySelectorAll('tr')
            .forEach(tr => {
                tr.remove()
            })
    }

    isNoData() {
        if (this.tbody.querySelectorAll('tr').length == 0) {
            this.root.querySelector('table').classList.add('hidden')
            this.root.querySelector('.no-data').classList.remove('hidden')
        } else {
            this.root.querySelector('table').classList.remove('hidden')
            this.root.querySelector('.no-data').classList.add('hidden')
        }
    }
}
