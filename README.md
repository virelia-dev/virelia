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

### Notes

- oAuth is optional, betterauth just has good support for it. We likely will only use GitHub oAuth in production as GCP is a mess
- I am quite particular about my projects, so be prepared for pedantic code review comments
- You can contact me at any time by [Email](mailto:keircn@proton.me) or by [Discord](https://discord.com/users/1000571225808048188)
- Obligatory `I use Arch BTW`

### Roadmap

I'm too lazy to write a proper roadmap, but this should be good enough for now

## Small features

- [x] **Custom Domains** - Allow users to use their own domains for short links
- [x] **QR Code Generation** - Add QR codes for each URL
- [x] **Link Expiry Management** - Better UI for setting/managing expiration dates
- [x] **URL Tags/Categories** - Organize links with tags for better management
- [x] **Copy to Clipboard** - One-click copying of shortened URLs

## UX Improvements

- [x] **Dark/Light Mode Toggle** - Improve the theme switching experience
- [x] **Keyboard Shortcuts** - Quick actions (Cmd+K for command palette, etc.)
- [x] **Bulk Operations** - Select multiple URLs for delete/edit/export
- [x] **Search & Filters** - Find URLs by title, tags, date, or original URL
- [ ] **Export Analytics** - Download analytics data as CSV/PDF/etc

## Advanced Stuff - long term goals

- [x] **UTM Parameter Builder** - Generate and append UTM parameters (source, medium, campaign, etc.) to URLs for campaign tracking
- [ ] **Link-in-Bio Pages** - Create custom landing pages with multiple links
- [x] **Password Protected Links** - Secure sensitive URLs with passwords
- [ ] **Geographic Targeting** - Redirect based on user location
- [ ] **A/B Testing** - Split traffic between different destination URLs

## Analytics

- [x] **Real-time Analytics** - Live click tracking dashboard
- [ ] **Click Heatmaps** - Visual representation of click patterns
- [ ] **Conversion Tracking** - Track goals and conversions
- [ ] **API Access** - REST API for developers
- [ ] **Webhook Notifications** - Real-time notifications for clicks/click milestones
