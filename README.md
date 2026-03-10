# Teleprompter Screen

A smooth, professional teleprompter web application with butter-smooth scrolling, real-time controls, and fullscreen mode — perfect for content creators, presenters, and video producers.

## Features

### Scrolling & Visual Polish
- **Smooth requestAnimationFrame scroll engine** — Butter-smooth scrolling with zero jank
- **Gradient fades** at top and bottom for clean text appearance/disappearance
- **Focus line** — Glowing cyan line across the middle showing your reading position
- **Pause overlay** — Pulsing play icon when paused for visual feedback
- **Progress bar** — Shows how far through the script you are

### Main Screen 

<img width="1886" height="812" alt="Screenshot 2026-03-10 222522" src="https://github.com/user-attachments/assets/c7c3a061-91de-473b-b444-f9c6efa09f66" />


### Controls
- **Speed slider** (1–10) with exponential feel — small numbers are slow, big numbers are fast
- **Font size slider** (20–100px) for comfortable reading distances
- **Text alignment** — Left / Center / Right alignment options
- **Mirror mode toggle** — Flip text horizontally for glass teleprompter rigs
- **Focus line toggle** — Show or hide the reading position line

### Playback
- **Play/Pause button** — Big, glowing green button while playing
- **Reset button** — Returns to the top of the script instantly
- **Click-to-play** — Click anywhere on the screen to toggle play/pause

### Fullscreen Mode
- **Full black screen** — Text only, no distractions
- **Floating control bar** — Fades out while playing, reappears on mouse movement
- **In-fullscreen speed control** — Adjust speed without exiting fullscreen
- **Easy exit** — Press Esc or click the exit button

### Save & Load Scripts
- **Unlimited script storage** — Save as many scripts as you want with custom names
- **Persistent storage** — Scripts load from localStorage and persist between sessions
- **Delete scripts** — Remove individual saved scripts easily
- **Ctrl+S shortcut** — Quick save functionality

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** | Play / Pause |
| **↑ / ↓** | Speed up / slow down |
| **→ / ←** | Jump forward / back |
| **R** | Reset to top |
| **M** | Toggle mirror mode |
| **F** | Toggle fullscreen |
| **Ctrl+S** | Save script |

## Getting Started

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Paste or type your script into the text area
4. Press **Space** or click the **Play** button to start scrolling
5. Adjust speed and font size to your preference
6. Use **F** to enter fullscreen mode for presentations

## Usage Tips

- **For glass teleprompters**: Enable mirror mode so the text appears correctly when reflected in the glass
- **Finding your rhythm**: Use the focus line to practice reading at a natural pace
- **Quick adjustments**: The speed slider uses exponential scaling — small tweaks at lower speeds, big changes at higher speeds
- **Multiple scripts**: Save different scripts and load them instantly with the save/load system

## Browser Compatibility

Works on all modern browsers supporting:
- CSS Gradients
- requestAnimationFrame
- localStorage API
- ES6 JavaScript

## License

MIT License — Free to use, modify, and distribute.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

---

**Pro tip**: Practice with your script a few times before recording to find the perfect speed and font size for your reading style! 📹✨
