# Virelia

Free, open-source URL shortener with analytics and UTM support from the developer of [AnonHost](https://github.com/keircn/AnonHost)

### Nothing to see here

While the project is currently in a usable state, it's nowhere near production. Feel free to run it on your machine if you're interested in helping out with development.

### Installation

We use bun. Don't use it if you wish not to, but make sure to gitignore your lockfiles as we don't want a mess of 13 different package managers in the project root.

```
cp .env.example .env # and fill out the variables, obviously
```

then to install the darned thing

```
bun i # or pnpm (npm sucks and yarn fell off)
bun run build
bun run start
```

### Etc

Couple quick notes:

- oAuth is optional, betterauth just has good support for it. We likely will only use GitHub oAuth in production as GCP is a mess
- I am quite particular about my projects, so be prepared for pedantic code review comments
- You can contact me at any time by [Email](mailto:keircn@proton.me) or by [Discord](https://discord.com/users/1000571225808048188)
- Obligatory `I use Arch BTW`
