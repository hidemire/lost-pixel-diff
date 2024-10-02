# lost-pixel-diff

This is a simple wrapper around the [lost-pixel](https://github.com/lost-pixel/lost-pixel) tool. The wrapper allows visual regression testing for Storybook components locally.

<div align="center">
    <img
        src="https://github.com/user-attachments/assets/e241278b-8fb8-4077-82eb-7d61b5f7261f"
        alt="drawing"
        height="400"
    />
</div>

```lost-pixel-diff``` uses the [lostpixel/lost-pixel](https://hub.docker.com/r/lostpixel/lost-pixel) docker image to generate the screenshots.
Before starting, make sure that the docker daemon is running.

<img width="50%" alt="image" src="https://github.com/user-attachments/assets/7f25fe13-53a6-4c7c-b691-0b0a632c09d2"><img width="50%" alt="image" src="https://github.com/user-attachments/assets/b343c295-7e4e-4392-8728-ceb5df06f239">

## Development

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-docker/)

### Install and build the frontend app

```bash
cd frontend
npm install
npm run build
```

### Run the backend server

```bash
cargo run -- --help # to see the available options
```
