# ∇ Understanding Backpropagation

A comprehensive, interactive educational site for understanding backpropagation - the algorithm that powers deep learning.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🌐 Live Demo

**[View the site →](https://naeem1144.github.io/backpropagation)**

## 📖 Overview

This educational resource provides a deep dive into backpropagation with:

- **Rigorous mathematical foundations** - From chain rule to full derivations
- **Interactive visualizations** - See the algorithm in action
- **Hands-on examples** - Work through calculations step-by-step
- **Self-assessment quizzes** - Test your understanding
- **Complete implementation** - Python code from scratch

## ✨ Features

### 📚 Comprehensive Content

| Section | Topics Covered |
|---------|---------------|
| Introduction | Motivation, computational complexity, learning overview |
| Forward Propagation | Neuron computation, layer operations, activation functions |
| Loss Functions | MSE, Binary Cross-Entropy, Categorical Cross-Entropy |
| Chain Rule | Single & multivariate, computational graphs |
| Backpropagation | Error terms (δ), gradient formulas, complete algorithm |
| Worked Example | Full forward/backward pass with real numbers |
| Implementation | NumPy neural network from scratch |
| Advanced Topics | Vanishing gradients, optimizers (SGD, Momentum, Adam) |
| Debugging | Gradient checking, common bugs, best practices |

### 🎮 Interactive Visualizations

- **Animated Forward/Backward Pass** - Watch data flow through the network
- **Computational Graph** - Toggle between values and gradients
- **Activation Function Explorer** - Interactive plots with derivatives
- **Gradient Descent Comparison** - SGD vs Momentum vs Adam
- **Gradient Checking Demo** - Verify analytical vs numerical gradients
- **Interactive Calculator** - Adjust inputs and see all computations

### 🎯 Learning Tools

- **Self-assessment quizzes** after major sections
- **Collapsible reference cards** for formulas
- **Progress tracking** saved to localStorage
- **Section completion** checkmarks

### 🎨 Design & UX

- Beautiful dark theme with gold/cyan accents
- Light mode toggle with system preference detection
- Fully responsive mobile design
- Reading progress indicator
- Keyboard navigation & accessibility features
- Print-friendly stylesheet

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **MathJax** - LaTeX math rendering
- **Canvas API** - Interactive visualizations

## 📁 Project Structure

```
backpropagation/
├── index.html              # Main HTML file
├── styles/
│   └── main.css            # All styles (~1000 lines)
├── scripts/
│   ├── ui.js               # Navigation, theme, progress tracking
│   ├── visualizations.js   # Canvas-based animations
│   └── interactive.js      # Quizzes, calculators, demos
├── assets/                 # Images and static files
└── README.md
```

## 🚀 Getting Started

### View Online
Visit **[naeem1144.github.io/backpropagation](https://naeem1144.github.io/backpropagation)**

### Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Naeem1144/backpropagation.git
   ```

2. Open `index.html` in your browser:
   ```bash
   cd backpropagation
   start index.html   # Windows
   open index.html    # macOS
   xdg-open index.html # Linux
   ```

No build tools or dependencies required!

## 📸 Screenshots

### Hero Section
![Hero](https://via.placeholder.com/800x400/0a0a0f/d4a853?text=Backpropagation+Hero)

### Interactive Visualizations
![Visualizations](https://via.placeholder.com/800x400/12121a/4ecdc4?text=Interactive+Visualizations)

### Math & Code
![Math](https://via.placeholder.com/800x400/1a1a26/c44569?text=Math+%26+Code+Examples)

## 🧮 Key Equations

The core backpropagation equations implemented:

**Error term:**
```
δ[l] = (W[l+1])ᵀ δ[l+1] ⊙ σ'(z[l])
```

**Gradients:**
```
∂L/∂W[l] = δ[l] (a[l-1])ᵀ
∂L/∂b[l] = δ[l]
```

**Weight update:**
```
W[l] ← W[l] - η ∇W[l] L
```

## 📚 Learning Resources

This site covers content from:

- [Rumelhart et al. (1986)](https://www.nature.com/articles/323533a0) - Original backprop paper
- [Neural Networks and Deep Learning](http://neuralnetworksanddeeplearning.com/) - Michael Nielsen
- [CS231n](https://cs231n.github.io/) - Stanford's CNN course
- [Deep Learning Book](https://www.deeplearningbook.org/) - Goodfellow, Bengio, Courville

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs or issues
- Suggest new visualizations or content
- Improve accessibility
- Fix typos or clarify explanations

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- MathJax for beautiful equation rendering
- Google Fonts (Sora, Crimson Pro, JetBrains Mono)
- The deep learning community for educational resources

---

<p align="center">
  Built for deep understanding. Keep learning, keep building.
  <br><br>
  <a href="https://naeem1144.github.io/backpropagation">View Site</a> •
  <a href="https://github.com/Naeem1144/backpropagation/issues">Report Bug</a> •
  <a href="https://github.com/Naeem1144/backpropagation/issues">Request Feature</a>
</p>

