# Subtitle Maker

A modern web application for creating and viewing subtitles, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Editor Mode**
  - Upload text files to generate subtitles
  - Upload audio files for timing reference
  - Generate SRT format subtitles
  - Copy or download generated subtitles
  - Real-time preview

- **Viewer Mode**
  - Upload audio files
  - Upload subtitle files (SRT format)
  - Theater mode for better viewing experience
  - Real-time subtitle synchronization

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- React Hooks
- Modern JavaScript APIs (File API, Audio API)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx    # Root layout component
│   └── page.tsx      # Home page component
├── components/
│   ├── EditorMode.tsx   # Editor mode component
│   └── ViewerMode.tsx   # Viewer mode component
└── styles/
    └── globals.css      # Global styles and Tailwind imports
```

## Contributing

Feel free to submit issues and enhancement requests! 