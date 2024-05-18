# Discord Bot with SQLite Logging

This Discord bot logs users joining specific voice channels to a SQLite database and notifies specified users.

## Features

- Logs users joining specific voice channels.
- Notifies specified users.
- Supports slash commands.

## Prerequisites

- Node.js (v14+)
- npm
- SQLite3

## Installation

1. **Install Dependencies:**

    ```bash
    npm install
    ```

2. **Setup Environment Variables:**

    Create a `.env` file in the root directory and add:

    ```env
    BOT_TOKEN=your-discord-bot-token
    CHANNEL_NAMES=channel1,channel2,channel3
    NOTIFY_USERS=user_id1,user_id2
    ```

## Bot Commands

- `/test`: Replies with a test message.

## Project Structure

- `index.js`: Main bot logic.
- `.env`: Environment variables file.
- `data.db`: SQLite database file (auto-created).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For issues or questions, open an issue in the repository.
