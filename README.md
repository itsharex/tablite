<h1 align="center">
  <img src="./docs/AppIcon.png">
  <div>Tablite</div>
</h1>

🪶 An ai driven lightweight database GUI for a better development experience built on `Tauri`.

## Features

- Lightweight and cross-platform build
- Natural language querying with multi-LLMs support
- Modern and easy-to-use interface
- Local data storage for secure (except for sending schema to your LLM provider)

Supported databases:

- SQLite
- MySQL

Supported LLMs:

- Gemini 2.0 Flash
- Gemini 1.5 Pro
- Gemini 1.5 Flash
- DeepSeek V3
- DeepSeek R1
- OpenRouter (Tools supported)

![Screenshot](./docs/Screenshot.png)

## Installation

You can download [Windows and Mac desktop app here](https://github.com/tmg0/tablite/releases)

For MacOS user with M1 or later, you need to execute the following command in terminal to allow the application downloaded form the internet:

```
sudo xattr -r -d com.apple.quarantine /Applications/Tablite.app
```

Or use the `x64` version in release page to bypass this issue.

## Development

```
pnpm install && pnpm tauri dev
```

## Roadmap

Ranking here very subjective and based on personal pain points.

### Milestone 1 - `table structure`

- View or edit columns and table index
- Create or delete table

### Milestone 2 - `form create connection`

Support create connection by a form instead of a connection string

- MySQL
- SQLite
- Postgres

### Milestone 3 - `chat with tables`

- Ai assistant

## License

[MIT](./LICENSE) License © 2024-PRESENT [Tamago](https://github.com/tmg0)
