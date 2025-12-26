/**
 * Interactive Module - Quizzes, Calculators, and Gradient Checking
 */

// ==========================================================================
// Quiz System
// ==========================================================================
const QuizSystem = {
    quizzes: {},
    
    register(quizId, questions) {
        this.quizzes[quizId] = {
            questions,
            currentQuestion: 0,
            score: 0,
            answered: false
        };
    },
    
    render(quizId, containerId) {
        const quiz = this.quizzes[quizId];
        const container = document.getElementById(containerId);
        if (!quiz || !container) return;
        
        const q = quiz.questions[quiz.currentQuestion];
        
        container.innerHTML = `
            <div class="quiz-header">
                <div class="quiz-title">📝 Quick Check</div>
                <div class="quiz-progress">
                    Question ${quiz.currentQuestion + 1} of ${quiz.questions.length}
                </div>
            </div>
            <div class="quiz-question">${q.question}</div>
            <div class="quiz-options">
                ${q.options.map((opt, i) => `
                    <div class="quiz-option" data-index="${i}" onclick="QuizSystem.selectOption('${quizId}', ${i})">
                        <div class="quiz-option-marker">${String.fromCharCode(65 + i)}</div>
                        <div class="quiz-option-text">${opt}</div>
                    </div>
                `).join('')}
            </div>
            <div class="quiz-feedback" id="${quizId}-feedback">
                <div class="quiz-feedback-title"></div>
                <div class="quiz-feedback-text"></div>
            </div>
            <div class="quiz-actions">
                <button class="btn btn-small btn-secondary" onclick="QuizSystem.checkAnswer('${quizId}')" 
                        id="${quizId}-check" ${quiz.answered ? 'disabled' : ''}>
                    Check Answer
                </button>
                <button class="btn btn-small btn-primary" onclick="QuizSystem.nextQuestion('${quizId}')"
                        id="${quizId}-next" style="display: ${quiz.answered ? 'inline-flex' : 'none'}">
                    ${quiz.currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Finish'}
                </button>
            </div>
        `;
    },
    
    selectOption(quizId, index) {
        const quiz = this.quizzes[quizId];
        if (quiz.answered) return;
        
        document.querySelectorAll(`#${quizId}-container .quiz-option`).forEach((opt, i) => {
            opt.classList.toggle('selected', i === index);
        });
        quiz.selectedAnswer = index;
    },
    
    checkAnswer(quizId) {
        const quiz = this.quizzes[quizId];
        if (quiz.answered || quiz.selectedAnswer === undefined) return;
        
        const q = quiz.questions[quiz.currentQuestion];
        const correct = quiz.selectedAnswer === q.correct;
        
        if (correct) quiz.score++;
        quiz.answered = true;
        
        // Update options
        document.querySelectorAll(`#${quizId}-container .quiz-option`).forEach((opt, i) => {
            if (i === q.correct) {
                opt.classList.add('correct');
            } else if (i === quiz.selectedAnswer && !correct) {
                opt.classList.add('incorrect');
            }
        });
        
        // Show feedback
        const feedback = document.getElementById(`${quizId}-feedback`);
        feedback.className = `quiz-feedback show ${correct ? 'correct' : 'incorrect'}`;
        feedback.querySelector('.quiz-feedback-title').textContent = correct ? '✓ Correct!' : '✗ Not quite';
        feedback.querySelector('.quiz-feedback-text').textContent = q.explanation;
        
        // Show next button
        document.getElementById(`${quizId}-check`).disabled = true;
        document.getElementById(`${quizId}-next`).style.display = 'inline-flex';
    },
    
    nextQuestion(quizId) {
        const quiz = this.quizzes[quizId];
        
        if (quiz.currentQuestion < quiz.questions.length - 1) {
            quiz.currentQuestion++;
            quiz.answered = false;
            quiz.selectedAnswer = undefined;
            this.render(quizId, `${quizId}-container`);
        } else {
            // Show final score
            const container = document.getElementById(`${quizId}-container`);
            const percent = Math.round((quiz.score / quiz.questions.length) * 100);
            
            container.innerHTML = `
                <div class="quiz-header">
                    <div class="quiz-title">📊 Quiz Complete!</div>
                </div>
                <div style="text-align: center; padding: 2rem 0;">
                    <div style="font-size: 3rem; color: var(--accent-gold); font-family: var(--font-display); font-weight: 700;">
                        ${quiz.score}/${quiz.questions.length}
                    </div>
                    <div style="font-size: 1.2rem; color: var(--text-secondary); margin-top: 0.5rem;">
                        ${percent >= 80 ? 'Excellent work!' : percent >= 60 ? 'Good job!' : 'Keep practicing!'}
                    </div>
                </div>
                <div class="quiz-actions" style="justify-content: center;">
                    <button class="btn btn-primary" onclick="QuizSystem.reset('${quizId}')">
                        Try Again
                    </button>
                </div>
            `;
        }
    },
    
    reset(quizId) {
        const quiz = this.quizzes[quizId];
        quiz.currentQuestion = 0;
        quiz.score = 0;
        quiz.answered = false;
        quiz.selectedAnswer = undefined;
        this.render(quizId, `${quizId}-container`);
    }
};

// ==========================================================================
// Backprop Calculator
// ==========================================================================
const BackpropCalculator = {
    // Network weights (fixed for demo)
    W1: [[0.1, 0.2], [0.3, 0.4]],
    b1: [0.1, 0.1],
    W2: [0.5, 0.6],
    b2: 0.1,
    
    sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
    },
    
    compute(x1, x2, y, lr) {
        // Forward pass
        const z1_1 = this.W1[0][0] * x1 + this.W1[0][1] * x2 + this.b1[0];
        const z1_2 = this.W1[1][0] * x1 + this.W1[1][1] * x2 + this.b1[1];
        const a1_1 = this.sigmoid(z1_1);
        const a1_2 = this.sigmoid(z1_2);
        
        const z2 = this.W2[0] * a1_1 + this.W2[1] * a1_2 + this.b2;
        const yhat = this.sigmoid(z2);
        
        const loss = 0.5 * Math.pow(y - yhat, 2);
        
        // Backward pass
        const dL_da2 = -(y - yhat);
        const da2_dz2 = yhat * (1 - yhat);
        const delta2 = dL_da2 * da2_dz2;
        
        const dW2_1 = delta2 * a1_1;
        const dW2_2 = delta2 * a1_2;
        
        const dz1_1 = this.W2[0] * delta2 * a1_1 * (1 - a1_1);
        const dz1_2 = this.W2[1] * delta2 * a1_2 * (1 - a1_2);
        
        return {
            forward: { z1_1, z1_2, a1_1, a1_2, z2, yhat, loss },
            backward: { delta2, dW2_1, dW2_2, dz1_1, dz1_2 },
            updates: {
                W2_0_new: this.W2[0] - lr * dW2_1,
                W2_1_new: this.W2[1] - lr * dW2_2
            }
        };
    },
    
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        this.renderControls(container);
        this.update();
    },
    
    renderControls(container) {
        container.innerHTML = `
            <div class="demo-title">🔬 Interactive Backprop Calculator</div>
            <div class="demo-controls">
                <div class="control-group">
                    <label>Input x₁</label>
                    <input type="range" id="bp-x1" min="0" max="1" step="0.1" value="0.5">
                    <div class="control-value" id="bp-x1-val">0.5</div>
                </div>
                <div class="control-group">
                    <label>Input x₂</label>
                    <input type="range" id="bp-x2" min="0" max="1" step="0.1" value="0.3">
                    <div class="control-value" id="bp-x2-val">0.3</div>
                </div>
                <div class="control-group">
                    <label>Target y</label>
                    <input type="range" id="bp-y" min="0" max="1" step="0.1" value="1">
                    <div class="control-value" id="bp-y-val">1.0</div>
                </div>
                <div class="control-group">
                    <label>Learning Rate η</label>
                    <input type="range" id="bp-lr" min="0.1" max="2" step="0.1" value="0.5">
                    <div class="control-value" id="bp-lr-val">0.5</div>
                </div>
            </div>
            <div class="demo-output" id="bp-output"></div>
        `;
        
        // Add event listeners
        ['x1', 'x2', 'y', 'lr'].forEach(param => {
            document.getElementById(`bp-${param}`).addEventListener('input', () => this.update());
        });
    },
    
    update() {
        const x1 = parseFloat(document.getElementById('bp-x1').value);
        const x2 = parseFloat(document.getElementById('bp-x2').value);
        const y = parseFloat(document.getElementById('bp-y').value);
        const lr = parseFloat(document.getElementById('bp-lr').value);
        
        document.getElementById('bp-x1-val').textContent = x1.toFixed(1);
        document.getElementById('bp-x2-val').textContent = x2.toFixed(1);
        document.getElementById('bp-y-val').textContent = y.toFixed(1);
        document.getElementById('bp-lr-val').textContent = lr.toFixed(1);
        
        const result = this.compute(x1, x2, y, lr);
        
        document.getElementById('bp-output').innerHTML = `
            <div style="color: var(--accent-cyan); margin-bottom: 0.5rem; font-weight: 600;">▶ Forward Pass</div>
            <div>z¹ = [${result.forward.z1_1.toFixed(4)}, ${result.forward.z1_2.toFixed(4)}]</div>
            <div>a¹ = [${result.forward.a1_1.toFixed(4)}, ${result.forward.a1_2.toFixed(4)}]</div>
            <div>z² = ${result.forward.z2.toFixed(4)}</div>
            <div style="color: var(--accent-gold);">ŷ = ${result.forward.yhat.toFixed(4)}</div>
            <div style="color: var(--accent-magenta);">Loss = ${result.forward.loss.toFixed(6)}</div>
            
            <div style="color: var(--accent-magenta); margin: 1rem 0 0.5rem; font-weight: 600;">◀ Backward Pass</div>
            <div>δ² = ${result.backward.delta2.toFixed(6)}</div>
            <div>∂L/∂W² = [${result.backward.dW2_1.toFixed(6)}, ${result.backward.dW2_2.toFixed(6)}]</div>
            <div>δ¹ = [${result.backward.dz1_1.toFixed(6)}, ${result.backward.dz1_2.toFixed(6)}]</div>
            
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--bg-tertiary);">
                <div style="color: var(--text-muted); font-size: 0.8rem;">Weight Updates (η = ${lr}):</div>
                <div>W²[0]: ${this.W2[0]} → <span style="color: var(--accent-green)">${result.updates.W2_0_new.toFixed(4)}</span></div>
                <div>W²[1]: ${this.W2[1]} → <span style="color: var(--accent-green)">${result.updates.W2_1_new.toFixed(4)}</span></div>
            </div>
        `;
    }
};

// ==========================================================================
// Gradient Checking Demo
// ==========================================================================
const GradientChecker = {
    epsilon: 0.0001,
    
    // Simple function: f(x) = x^2 + 3x + 1
    f(x) {
        return x * x + 3 * x + 1;
    },
    
    // Analytical gradient: f'(x) = 2x + 3
    analyticalGrad(x) {
        return 2 * x + 3;
    },
    
    // Numerical gradient using central difference
    numericalGrad(x) {
        return (this.f(x + this.epsilon) - this.f(x - this.epsilon)) / (2 * this.epsilon);
    },
    
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="visualization-title">🔍 Gradient Checking Demo</div>
            <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.95rem;">
                Compare analytical gradients with numerical approximations to verify correctness.
            </p>
            
            <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <div style="font-family: var(--font-mono); font-size: 0.9rem;">
                    <span style="color: var(--text-muted)">Function:</span> 
                    <span style="color: var(--accent-cyan)">f(x) = x² + 3x + 1</span>
                </div>
                <div style="font-family: var(--font-mono); font-size: 0.9rem; margin-top: 0.5rem;">
                    <span style="color: var(--text-muted)">Analytical derivative:</span> 
                    <span style="color: var(--accent-magenta)">f'(x) = 2x + 3</span>
                </div>
            </div>
            
            <div class="demo-controls">
                <div class="control-group">
                    <label>Input x</label>
                    <input type="range" id="gc-x" min="-5" max="5" step="0.1" value="2">
                    <div class="control-value" id="gc-x-val">2.0</div>
                </div>
                <div class="control-group">
                    <label>Epsilon (ε)</label>
                    <input type="range" id="gc-eps" min="-6" max="-2" step="1" value="-4">
                    <div class="control-value" id="gc-eps-val">1e-4</div>
                </div>
            </div>
            
            <div class="demo-output" id="gc-output"></div>
            
            <div style="margin-top: 1rem; padding: 1rem; background: rgba(46, 204, 113, 0.1); border: 1px solid var(--accent-green); border-radius: 8px;">
                <div style="color: var(--accent-green); font-weight: 600; margin-bottom: 0.5rem;">How it works:</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">
                    Numerical gradient ≈ (f(x+ε) - f(x-ε)) / 2ε<br>
                    If |analytical - numerical| < 1e-7, gradients are likely correct.
                </div>
            </div>
        `;
        
        document.getElementById('gc-x').addEventListener('input', () => this.update());
        document.getElementById('gc-eps').addEventListener('input', () => this.update());
        
        this.update();
    },
    
    update() {
        const x = parseFloat(document.getElementById('gc-x').value);
        const epsPow = parseInt(document.getElementById('gc-eps').value);
        this.epsilon = Math.pow(10, epsPow);
        
        document.getElementById('gc-x-val').textContent = x.toFixed(1);
        document.getElementById('gc-eps-val').textContent = `1e${epsPow}`;
        
        const analytical = this.analyticalGrad(x);
        const numerical = this.numericalGrad(x);
        const diff = Math.abs(analytical - numerical);
        const relError = diff / Math.max(Math.abs(analytical), Math.abs(numerical), 1e-8);
        
        const isGood = relError < 1e-5;
        
        document.getElementById('gc-output').innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 0.25rem;">Analytical Gradient</div>
                    <div style="color: var(--accent-cyan); font-size: 1.2rem; font-weight: 600;">
                        ${analytical.toFixed(8)}
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.75rem;">f'(${x}) = 2(${x}) + 3</div>
                </div>
                <div>
                    <div style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 0.25rem;">Numerical Gradient</div>
                    <div style="color: var(--accent-magenta); font-size: 1.2rem; font-weight: 600;">
                        ${numerical.toFixed(8)}
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.75rem;">(f(${(x + this.epsilon).toFixed(4)}) - f(${(x - this.epsilon).toFixed(4)})) / 2ε</div>
                </div>
            </div>
            
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--bg-tertiary);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: var(--text-muted); font-size: 0.8rem;">Absolute Difference</div>
                        <div style="font-family: var(--font-mono);">${diff.toExponential(4)}</div>
                    </div>
                    <div>
                        <div style="color: var(--text-muted); font-size: 0.8rem;">Relative Error</div>
                        <div style="font-family: var(--font-mono);">${relError.toExponential(4)}</div>
                    </div>
                    <div style="padding: 0.5rem 1rem; border-radius: 4px; font-weight: 600;
                                background: ${isGood ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'};
                                color: ${isGood ? 'var(--accent-green)' : 'var(--accent-red)'};">
                        ${isGood ? '✓ PASS' : '✗ CHECK'}
                    </div>
                </div>
            </div>
        `;
    }
};

// ==========================================================================
// 3D Gradient Descent Visualization (using 2D canvas with perspective)
// ==========================================================================
const GradientDescentViz = {
    canvas: null,
    ctx: null,
    optimizer: 'sgd',
    learningRate: 0.1,
    position: { x: 2, y: 2 },
    velocity: { x: 0, y: 0 },
    momentum: { x: 0, y: 0 },
    path: [],
    animating: false,
    
    // Loss function: f(x,y) = x^2 + y^2 (simple bowl)
    loss(x, y) {
        return x * x + y * y;
    },
    
    gradient(x, y) {
        return { dx: 2 * x, dy: 2 * y };
    },
    
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.reset();
        this.draw();
        
        window.addEventListener('resize', () => {
            this.resize();
            this.draw();
        });
    },
    
    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = Math.min(container.offsetWidth - 40, 500);
        this.canvas.height = 400;
    },
    
    reset() {
        this.position = { x: 2 + (Math.random() - 0.5), y: 2 + (Math.random() - 0.5) };
        this.velocity = { x: 0, y: 0 };
        this.momentum = { x: 0, y: 0 };
        this.path = [{ ...this.position }];
        this.animating = false;
    },
    
    step() {
        const grad = this.gradient(this.position.x, this.position.y);
        
        switch (this.optimizer) {
            case 'sgd':
                this.position.x -= this.learningRate * grad.dx;
                this.position.y -= this.learningRate * grad.dy;
                break;
                
            case 'momentum':
                const beta = 0.9;
                this.momentum.x = beta * this.momentum.x + (1 - beta) * grad.dx;
                this.momentum.y = beta * this.momentum.y + (1 - beta) * grad.dy;
                this.position.x -= this.learningRate * this.momentum.x;
                this.position.y -= this.learningRate * this.momentum.y;
                break;
                
            case 'adam':
                // Simplified Adam
                const b1 = 0.9, b2 = 0.999, eps = 1e-8;
                this.momentum.x = b1 * this.momentum.x + (1 - b1) * grad.dx;
                this.momentum.y = b1 * this.momentum.y + (1 - b1) * grad.dy;
                this.velocity.x = b2 * this.velocity.x + (1 - b2) * grad.dx * grad.dx;
                this.velocity.y = b2 * this.velocity.y + (1 - b2) * grad.dy * grad.dy;
                this.position.x -= this.learningRate * this.momentum.x / (Math.sqrt(this.velocity.x) + eps);
                this.position.y -= this.learningRate * this.momentum.y / (Math.sqrt(this.velocity.y) + eps);
                break;
        }
        
        this.path.push({ ...this.position });
        if (this.path.length > 200) this.path.shift();
    },
    
    animate() {
        if (!this.animating) return;
        
        this.step();
        this.draw();
        
        // Stop if converged
        if (Math.abs(this.position.x) < 0.01 && Math.abs(this.position.y) < 0.01) {
            this.animating = false;
            return;
        }
        
        requestAnimationFrame(() => this.animate());
    },
    
    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // Draw loss surface (contour lines)
        const levels = [0.5, 1, 2, 3, 4, 5, 6, 8];
        const scale = Math.min(w, h) / 8;
        const cx = w / 2;
        const cy = h / 2;
        
        levels.forEach((level, i) => {
            const r = Math.sqrt(level) * scale;
            ctx.strokeStyle = `rgba(212, 168, 83, ${0.1 + i * 0.05})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        // Draw path
        if (this.path.length > 1) {
            ctx.strokeStyle = this.optimizer === 'sgd' ? '#4ecdc4' : 
                              this.optimizer === 'momentum' ? '#5b7cfa' : '#c44569';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            this.path.forEach((p, i) => {
                const sx = cx + p.x * scale;
                const sy = cy + p.y * scale;
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            });
            ctx.stroke();
        }
        
        // Draw current position
        const px = cx + this.position.x * scale;
        const py = cy + this.position.y * scale;
        
        ctx.fillStyle = '#d4a853';
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw minimum point
        ctx.fillStyle = 'rgba(46, 204, 113, 0.5)';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Labels
        ctx.font = '12px "Sora", sans-serif';
        ctx.fillStyle = '#6b6660';
        ctx.textAlign = 'center';
        ctx.fillText('Minimum', cx, cy + 20);
        
        // Info
        ctx.textAlign = 'left';
        ctx.fillStyle = '#e8e6e3';
        ctx.fillText(`Position: (${this.position.x.toFixed(3)}, ${this.position.y.toFixed(3)})`, 10, 20);
        ctx.fillText(`Loss: ${this.loss(this.position.x, this.position.y).toFixed(4)}`, 10, 40);
        ctx.fillText(`Steps: ${this.path.length}`, 10, 60);
    },
    
    setOptimizer(opt) {
        this.optimizer = opt;
        this.reset();
        this.draw();
    },
    
    setLearningRate(lr) {
        this.learningRate = lr;
    },
    
    start() {
        this.animating = true;
        this.animate();
    },
    
    stop() {
        this.animating = false;
    }
};

// Export
window.QuizSystem = QuizSystem;
window.BackpropCalculator = BackpropCalculator;
window.GradientChecker = GradientChecker;
window.GradientDescentViz = GradientDescentViz;

