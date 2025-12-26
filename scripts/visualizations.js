/**
 * Visualizations Module - Animated neural network, computational graphs, and more
 */

// ==========================================================================
// Animated Forward/Backward Pass Visualization
// ==========================================================================
const AnimatedNetworkViz = {
    canvas: null,
    ctx: null,
    layers: [2, 3, 2, 1],
    neurons: [],
    connections: [],
    animationId: null,
    mode: 'forward', // 'forward', 'backward', 'paused'
    step: 0,
    maxSteps: 100,
    speed: 2,
    values: {},
    gradients: {},

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.buildNetwork();
        this.initValues();
        this.draw();
        
        window.addEventListener('resize', () => {
            this.resize();
            this.buildNetwork();
            this.draw();
        });
    },

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = Math.min(rect.width - 40, 800);
        this.canvas.height = 350;
    },

    buildNetwork() {
        this.neurons = [];
        this.connections = [];
        
        const layerSpacing = this.canvas.width / (this.layers.length + 1);
        
        // Create neurons
        for (let l = 0; l < this.layers.length; l++) {
            const x = layerSpacing * (l + 1);
            const spacing = this.canvas.height / (this.layers[l] + 1);
            
            for (let n = 0; n < this.layers[l]; n++) {
                const y = spacing * (n + 1);
                this.neurons.push({
                    x, y,
                    layer: l,
                    index: n,
                    id: `${l}-${n}`,
                    value: 0,
                    gradient: 0,
                    activated: false
                });
            }
        }
        
        // Create connections
        for (let l = 0; l < this.layers.length - 1; l++) {
            const fromNeurons = this.neurons.filter(n => n.layer === l);
            const toNeurons = this.neurons.filter(n => n.layer === l + 1);
            
            fromNeurons.forEach(from => {
                toNeurons.forEach(to => {
                    this.connections.push({
                        from,
                        to,
                        weight: (Math.random() - 0.5) * 2,
                        flowProgress: 0,
                        flowDirection: 'none'
                    });
                });
            });
        }
    },

    initValues() {
        // Set random input values
        this.neurons.filter(n => n.layer === 0).forEach(n => {
            n.value = Math.random();
        });
    },

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    },

    forwardPass() {
        for (let l = 1; l < this.layers.length; l++) {
            const layerNeurons = this.neurons.filter(n => n.layer === l);
            const prevNeurons = this.neurons.filter(n => n.layer === l - 1);
            
            layerNeurons.forEach(neuron => {
                let sum = 0;
                this.connections
                    .filter(c => c.to.id === neuron.id)
                    .forEach(conn => {
                        sum += conn.from.value * conn.weight;
                    });
                neuron.value = this.sigmoid(sum);
            });
        }
    },

    backwardPass() {
        // Output layer gradient (assuming MSE loss)
        const outputNeurons = this.neurons.filter(n => n.layer === this.layers.length - 1);
        outputNeurons.forEach(n => {
            const target = 1; // Example target
            n.gradient = (n.value - target) * n.value * (1 - n.value);
        });
        
        // Hidden layers
        for (let l = this.layers.length - 2; l >= 0; l--) {
            const layerNeurons = this.neurons.filter(n => n.layer === l);
            const nextNeurons = this.neurons.filter(n => n.layer === l + 1);
            
            layerNeurons.forEach(neuron => {
                let gradSum = 0;
                this.connections
                    .filter(c => c.from.id === neuron.id)
                    .forEach(conn => {
                        gradSum += conn.to.gradient * conn.weight;
                    });
                neuron.gradient = gradSum * neuron.value * (1 - neuron.value);
            });
        }
    },

    animate() {
        if (this.mode === 'paused') return;
        
        this.step++;
        
        if (this.mode === 'forward') {
            // Animate forward flow
            const progress = this.step / this.maxSteps;
            const currentLayer = Math.floor(progress * this.layers.length);
            
            this.connections.forEach(conn => {
                if (conn.from.layer < currentLayer) {
                    conn.flowProgress = 1;
                    conn.flowDirection = 'forward';
                } else if (conn.from.layer === currentLayer) {
                    conn.flowProgress = (progress * this.layers.length) % 1;
                    conn.flowDirection = 'forward';
                } else {
                    conn.flowProgress = 0;
                }
            });
            
            this.neurons.forEach(n => {
                n.activated = n.layer <= currentLayer;
            });
            
            if (this.step >= this.maxSteps) {
                this.forwardPass();
                this.step = 0;
                this.mode = 'backward';
            }
        } else if (this.mode === 'backward') {
            // Animate backward flow
            const progress = this.step / this.maxSteps;
            const currentLayer = this.layers.length - 1 - Math.floor(progress * this.layers.length);
            
            this.connections.forEach(conn => {
                if (conn.to.layer > currentLayer) {
                    conn.flowProgress = 1;
                    conn.flowDirection = 'backward';
                } else if (conn.to.layer === currentLayer) {
                    conn.flowProgress = (progress * this.layers.length) % 1;
                    conn.flowDirection = 'backward';
                } else {
                    conn.flowProgress = 0;
                }
            });
            
            if (this.step >= this.maxSteps) {
                this.backwardPass();
                this.step = 0;
                this.mode = 'forward';
                this.initValues();
            }
        }
        
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    },

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const colors = {
            forward: '#4ecdc4',
            backward: '#c44569',
            neutral: 'rgba(255,255,255,0.1)',
            neuronActive: '#d4a853',
            neuronInactive: '#2a2a36'
        };
        
        // Draw connections
        this.connections.forEach(conn => {
            ctx.beginPath();
            ctx.moveTo(conn.from.x, conn.from.y);
            ctx.lineTo(conn.to.x, conn.to.y);
            
            if (conn.flowDirection === 'forward' && conn.flowProgress > 0) {
                const gradient = ctx.createLinearGradient(
                    conn.from.x, conn.from.y,
                    conn.to.x, conn.to.y
                );
                gradient.addColorStop(0, colors.forward);
                gradient.addColorStop(conn.flowProgress, colors.forward);
                gradient.addColorStop(Math.min(1, conn.flowProgress + 0.01), colors.neutral);
                gradient.addColorStop(1, colors.neutral);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
            } else if (conn.flowDirection === 'backward' && conn.flowProgress > 0) {
                const gradient = ctx.createLinearGradient(
                    conn.to.x, conn.to.y,
                    conn.from.x, conn.from.y
                );
                gradient.addColorStop(0, colors.backward);
                gradient.addColorStop(conn.flowProgress, colors.backward);
                gradient.addColorStop(Math.min(1, conn.flowProgress + 0.01), colors.neutral);
                gradient.addColorStop(1, colors.neutral);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
            } else {
                ctx.strokeStyle = colors.neutral;
                ctx.lineWidth = 1;
            }
            
            ctx.stroke();
        });
        
        // Draw neurons
        this.neurons.forEach(neuron => {
            // Glow effect
            if (neuron.activated || this.mode === 'backward') {
                const glowColor = this.mode === 'forward' ? colors.forward : colors.backward;
                const gradient = ctx.createRadialGradient(
                    neuron.x, neuron.y, 0,
                    neuron.x, neuron.y, 30
                );
                gradient.addColorStop(0, glowColor);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(neuron.x, neuron.y, 30, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Neuron body
            ctx.fillStyle = neuron.activated ? colors.neuronActive : colors.neuronInactive;
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, 18, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = neuron.activated ? colors.neuronActive : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Value/gradient display
            ctx.fillStyle = '#fff';
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (this.mode === 'backward' && neuron.gradient !== 0) {
                ctx.fillText(neuron.gradient.toFixed(2), neuron.x, neuron.y);
            } else if (neuron.value !== 0) {
                ctx.fillText(neuron.value.toFixed(2), neuron.x, neuron.y);
            }
        });
        
        // Draw labels
        ctx.fillStyle = '#6b6660';
        ctx.font = '12px "Sora", sans-serif';
        ctx.textAlign = 'center';
        
        const labels = ['Input', 'Hidden 1', 'Hidden 2', 'Output'];
        const layerSpacing = this.canvas.width / (this.layers.length + 1);
        for (let l = 0; l < this.layers.length; l++) {
            ctx.fillText(labels[l], layerSpacing * (l + 1), this.canvas.height - 15);
        }
        
        // Draw mode indicator
        ctx.font = 'bold 14px "Sora", sans-serif';
        ctx.fillStyle = this.mode === 'forward' ? colors.forward : colors.backward;
        ctx.textAlign = 'left';
        ctx.fillText(
            this.mode === 'forward' ? '▶ Forward Pass' : '◀ Backward Pass',
            20, 25
        );
    },

    play() {
        this.mode = this.mode === 'paused' ? 'forward' : this.mode;
        this.animate();
    },

    pause() {
        this.mode = 'paused';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    },

    stepForward() {
        this.pause();
        this.step += 10;
        if (this.step >= this.maxSteps) {
            if (this.mode === 'forward') {
                this.forwardPass();
                this.mode = 'backward';
            } else {
                this.backwardPass();
                this.mode = 'forward';
                this.initValues();
            }
            this.step = 0;
        }
        this.draw();
    },

    reset() {
        this.pause();
        this.step = 0;
        this.mode = 'forward';
        this.initValues();
        this.connections.forEach(c => {
            c.flowProgress = 0;
            c.flowDirection = 'none';
        });
        this.neurons.forEach(n => {
            n.activated = false;
            n.gradient = 0;
        });
        this.draw();
    }
};

// ==========================================================================
// Computational Graph Visualization
// ==========================================================================
const CompGraphViz = {
    container: null,
    mode: 'forward',
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
    },
    
    render() {
        const nodes = [
            { id: 'x', label: 'x', value: 2, gradient: 1, x: 50, y: 150, type: 'input' },
            { id: 'y', label: 'y', value: 3, gradient: 1, x: 50, y: 250, type: 'input' },
            { id: 'z', label: 'z', value: 4, gradient: 7, x: 50, y: 350, type: 'input' },
            { id: 'q', label: 'q = x + y', value: 5, gradient: 4, x: 250, y: 200, type: 'op' },
            { id: 'f', label: 'f = q × z', value: 20, gradient: 1, x: 450, y: 250, type: 'output' }
        ];
        
        const edges = [
            { from: 'x', to: 'q', localGrad: '∂q/∂x = 1' },
            { from: 'y', to: 'q', localGrad: '∂q/∂y = 1' },
            { from: 'q', to: 'f', localGrad: '∂f/∂q = z = 4' },
            { from: 'z', to: 'f', localGrad: '∂f/∂z = q = 5' }
        ];
        
        const isForward = this.mode === 'forward';
        const primaryColor = isForward ? '#4ecdc4' : '#c44569';
        
        let svg = `
        <svg viewBox="0 0 550 400" style="width: 100%; height: 300px;">
            <defs>
                <marker id="arrowhead-${isForward ? 'fwd' : 'bwd'}" markerWidth="10" markerHeight="7" 
                        refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="${primaryColor}"/>
                </marker>
            </defs>
        `;
        
        // Draw edges
        edges.forEach(edge => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            
            svg += `
            <line x1="${fromNode.x + 40}" y1="${fromNode.y}" 
                  x2="${toNode.x - 40}" y2="${toNode.y}"
                  stroke="${primaryColor}" stroke-width="2"
                  marker-end="url(#arrowhead-${isForward ? 'fwd' : 'bwd'})"/>
            <text x="${(fromNode.x + toNode.x) / 2}" y="${(fromNode.y + toNode.y) / 2 - 10}"
                  fill="#6b6660" font-size="10" text-anchor="middle" font-family="JetBrains Mono">
                ${edge.localGrad}
            </text>
            `;
        });
        
        // Draw nodes
        nodes.forEach(node => {
            const fillColor = node.type === 'input' ? '#1a1a26' : 
                             node.type === 'output' ? '#2a1a26' : '#1a2626';
            const strokeColor = node.type === 'output' ? '#d4a853' : primaryColor;
            
            svg += `
            <g class="comp-node" data-node="${node.id}">
                <rect x="${node.x - 35}" y="${node.y - 25}" width="70" height="50" rx="8"
                      fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
                <text x="${node.x}" y="${node.y - 8}" fill="#e8e6e3" font-size="11" 
                      text-anchor="middle" font-family="Sora">${node.label}</text>
                <text x="${node.x}" y="${node.y + 12}" fill="${primaryColor}" font-size="12" 
                      text-anchor="middle" font-family="JetBrains Mono" font-weight="bold">
                    ${isForward ? node.value : '∇' + node.gradient}
                </text>
            </g>
            `;
        });
        
        svg += '</svg>';
        
        // Mode indicator
        svg += `
        <div style="text-align: center; margin-top: 1rem; font-family: var(--font-mono); font-size: 0.85rem;">
            <span style="color: ${primaryColor}; font-weight: 600;">
                ${isForward ? '▶ Forward: Computing values' : '◀ Backward: Computing gradients'}
            </span>
        </div>
        `;
        
        this.container.innerHTML = svg;
    },
    
    setMode(mode) {
        this.mode = mode;
        this.render();
    }
};

// ==========================================================================
// Activation Function Explorer
// ==========================================================================
const ActivationExplorer = {
    canvas: null,
    ctx: null,
    currentFn: 'sigmoid',
    inputValue: 0,
    
    functions: {
        sigmoid: {
            fn: x => 1 / (1 + Math.exp(-x)),
            derivative: x => {
                const s = 1 / (1 + Math.exp(-x));
                return s * (1 - s);
            },
            name: 'Sigmoid',
            formula: 'σ(x) = 1/(1+e⁻ˣ)',
            color: '#4ecdc4'
        },
        tanh: {
            fn: x => Math.tanh(x),
            derivative: x => 1 - Math.pow(Math.tanh(x), 2),
            name: 'Tanh',
            formula: 'tanh(x) = (eˣ-e⁻ˣ)/(eˣ+e⁻ˣ)',
            color: '#5b7cfa'
        },
        relu: {
            fn: x => Math.max(0, x),
            derivative: x => x > 0 ? 1 : 0,
            name: 'ReLU',
            formula: 'ReLU(x) = max(0, x)',
            color: '#d4a853'
        },
        leakyRelu: {
            fn: x => x > 0 ? x : 0.01 * x,
            derivative: x => x > 0 ? 1 : 0.01,
            name: 'Leaky ReLU',
            formula: 'LReLU(x) = max(0.01x, x)',
            color: '#c44569'
        }
    },
    
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.draw();
        
        window.addEventListener('resize', () => {
            this.resize();
            this.draw();
        });
        
        // Mouse interaction
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            this.inputValue = this.screenToMath(x);
            this.draw();
            this.updateInfo();
        });
        
        // Touch interaction for mobile
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            this.inputValue = this.screenToMath(x);
            this.draw();
            this.updateInfo();
        }, { passive: false });
        
        this.canvas.addEventListener('touchstart', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            this.inputValue = this.screenToMath(x);
            this.draw();
            this.updateInfo();
        });
    },
    
    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = Math.min(container.offsetWidth - 40, 600);
        this.canvas.height = 300;
    },
    
    mathToScreen(x) {
        const scale = this.canvas.width / 10;
        return this.canvas.width / 2 + x * scale;
    },
    
    screenToMath(screenX) {
        const scale = this.canvas.width / 10;
        return (screenX - this.canvas.width / 2) / scale;
    },
    
    mathToScreenY(y) {
        const scale = this.canvas.height / 4;
        return this.canvas.height / 2 - y * scale;
    },
    
    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // Background
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, w, h);
        
        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        
        for (let x = -5; x <= 5; x++) {
            const sx = this.mathToScreen(x);
            ctx.beginPath();
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx, h);
            ctx.stroke();
        }
        
        for (let y = -2; y <= 2; y++) {
            const sy = this.mathToScreenY(y);
            ctx.beginPath();
            ctx.moveTo(0, sy);
            ctx.lineTo(w, sy);
            ctx.stroke();
        }
        
        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        
        // X axis
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        
        // Y axis
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
        
        const fnData = this.functions[this.currentFn];
        
        // Draw function
        ctx.strokeStyle = fnData.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let sx = 0; sx < w; sx++) {
            const x = this.screenToMath(sx);
            const y = fnData.fn(x);
            const sy = this.mathToScreenY(y);
            
            if (sx === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        
        // Draw derivative (dashed)
        ctx.strokeStyle = fnData.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        
        for (let sx = 0; sx < w; sx++) {
            const x = this.screenToMath(sx);
            const y = fnData.derivative(x);
            const sy = this.mathToScreenY(y);
            
            if (sx === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        
        // Draw point
        const px = this.mathToScreen(this.inputValue);
        const py = this.mathToScreenY(fnData.fn(this.inputValue));
        const pdy = this.mathToScreenY(fnData.derivative(this.inputValue));
        
        // Vertical line
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, h);
        ctx.stroke();
        
        // Point on function
        ctx.fillStyle = fnData.color;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Point on derivative
        ctx.fillStyle = fnData.color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(px, pdy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Legend
        ctx.font = '12px "Sora", sans-serif';
        ctx.fillStyle = fnData.color;
        ctx.fillText('— f(x)', 20, 25);
        ctx.fillStyle = fnData.color;
        ctx.globalAlpha = 0.5;
        ctx.fillText('--- f\'(x)', 20, 45);
        ctx.globalAlpha = 1;
    },
    
    updateInfo() {
        const infoEl = document.getElementById('activation-info');
        if (!infoEl) return;
        
        const fnData = this.functions[this.currentFn];
        const y = fnData.fn(this.inputValue);
        const dy = fnData.derivative(this.inputValue);
        
        infoEl.innerHTML = `
            <span style="color: var(--text-muted)">x =</span> 
            <span style="color: var(--accent-gold)">${this.inputValue.toFixed(3)}</span>
            &nbsp;&nbsp;
            <span style="color: var(--text-muted)">f(x) =</span>
            <span style="color: ${fnData.color}">${y.toFixed(4)}</span>
            &nbsp;&nbsp;
            <span style="color: var(--text-muted)">f'(x) =</span>
            <span style="color: ${fnData.color}">${dy.toFixed(4)}</span>
        `;
    },
    
    setFunction(fnName) {
        if (this.functions[fnName]) {
            this.currentFn = fnName;
            this.draw();
            this.updateInfo();
        }
    }
};

// ==========================================================================
// Basic Neural Network Visualization (from original)
// ==========================================================================
const BasicNetworkViz = {
    canvas: null,
    ctx: null,
    layers: [3, 4, 4, 2],
    neurons: [],
    hoveredNeuron: null,
    isTouching: false,
    
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.buildNeurons();
        this.draw();
        
        window.addEventListener('resize', () => {
            this.resize();
            this.buildNeurons();
            this.draw();
        });
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isTouching) return; // Ignore mouse during touch
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleInteraction(x, y);
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            if (!this.isTouching) {
                this.hoveredNeuron = null;
                this.draw();
            }
        });
        
        // Touch support for mobile - with better handling
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isTouching = true;
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.handleInteraction(x, y);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.handleInteraction(x, y);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            // Keep the highlight visible for a moment after touch ends
            setTimeout(() => {
                this.isTouching = false;
                this.hoveredNeuron = null;
                this.draw();
            }, 1500);
        });
        
        this.canvas.addEventListener('touchcancel', () => {
            this.isTouching = false;
            this.hoveredNeuron = null;
            this.draw();
        });
    },
    
    handleInteraction(x, y) {
        // Scale coordinates for device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        const scaleX = this.canvas.width / this.canvas.offsetWidth;
        const scaleY = this.canvas.height / this.canvas.offsetHeight;
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        
        this.hoveredNeuron = null;
        // Larger touch target for mobile (30px instead of 20px)
        const touchRadius = this.isTouching ? 35 : 25;
        
        for (const neuron of this.neurons) {
            const dist = Math.sqrt((scaledX - neuron.x) ** 2 + (scaledY - neuron.y) ** 2);
            if (dist < touchRadius) {
                this.hoveredNeuron = neuron;
                break;
            }
        }
        this.draw();
    },
    
    buildNeurons() {
        this.neurons = [];
        const layerSpacing = this.canvas.width / (this.layers.length + 1);
        
        for (let l = 0; l < this.layers.length; l++) {
            const x = layerSpacing * (l + 1);
            const spacing = this.canvas.height / (this.layers[l] + 1);
            
            for (let i = 0; i < this.layers[l]; i++) {
                const y = spacing * (i + 1);
                this.neurons.push({ x, y, layer: l, index: i });
            }
        }
    },
    
    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = Math.min(container.offsetWidth - 60, 700);
        this.canvas.height = 400;
    },
    
    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const layerSpacing = this.canvas.width / (this.layers.length + 1);
        const colors = ['#4ecdc4', '#5b7cfa', '#c44569', '#d4a853'];
        
        // Draw connections
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        
        for (let l = 0; l < this.layers.length - 1; l++) {
            const x1 = layerSpacing * (l + 1);
            const x2 = layerSpacing * (l + 2);
            const spacing1 = this.canvas.height / (this.layers[l] + 1);
            const spacing2 = this.canvas.height / (this.layers[l + 1] + 1);
            
            for (let i = 0; i < this.layers[l]; i++) {
                for (let j = 0; j < this.layers[l + 1]; j++) {
                    ctx.beginPath();
                    ctx.moveTo(x1, spacing1 * (i + 1));
                    ctx.lineTo(x2, spacing2 * (j + 1));
                    ctx.stroke();
                }
            }
        }
        
        // Highlight hovered connections FIRST (so they appear behind neurons)
        if (this.hoveredNeuron) {
            const l = this.hoveredNeuron.layer;
            
            ctx.strokeStyle = 'rgba(212, 168, 83, 0.8)';
            ctx.lineWidth = 3;
            
            // Forward connections
            if (l < this.layers.length - 1) {
                const spacing2 = this.canvas.height / (this.layers[l + 1] + 1);
                for (let j = 0; j < this.layers[l + 1]; j++) {
                    ctx.beginPath();
                    ctx.moveTo(this.hoveredNeuron.x, this.hoveredNeuron.y);
                    ctx.lineTo(layerSpacing * (l + 2), spacing2 * (j + 1));
                    ctx.stroke();
                }
            }
            
            // Backward connections
            if (l > 0) {
                const spacing1 = this.canvas.height / (this.layers[l - 1] + 1);
                for (let i = 0; i < this.layers[l - 1]; i++) {
                    ctx.beginPath();
                    ctx.moveTo(layerSpacing * l, spacing1 * (i + 1));
                    ctx.lineTo(this.hoveredNeuron.x, this.hoveredNeuron.y);
                    ctx.stroke();
                }
            }
        }
        
        // Draw neurons
        for (const neuron of this.neurons) {
            const { x, y, layer: l } = neuron;
            const isHovered = this.hoveredNeuron && 
                              this.hoveredNeuron.x === x && 
                              this.hoveredNeuron.y === y;
            
            // Glow (bigger for hovered)
            const glowSize = isHovered ? 35 : 25;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
            gradient.addColorStop(0, isHovered ? '#d4a853' : colors[l]);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Body
            ctx.fillStyle = isHovered ? '#2a2a36' : '#12121a';
            ctx.beginPath();
            ctx.arc(x, y, isHovered ? 18 : 15, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = isHovered ? '#d4a853' : colors[l];
            ctx.lineWidth = isHovered ? 3 : 2;
            ctx.stroke();
        }
        
        // Labels
        ctx.fillStyle = '#6b6660';
        ctx.font = '12px "Sora", sans-serif';
        ctx.textAlign = 'center';
        
        const labels = ['Input', 'Hidden 1', 'Hidden 2', 'Output'];
        for (let l = 0; l < this.layers.length; l++) {
            ctx.fillText(labels[l], layerSpacing * (l + 1), this.canvas.height - 15);
        }
        
        // Show touch hint on mobile
        if (this.hoveredNeuron && this.isTouching) {
            ctx.fillStyle = 'rgba(212, 168, 83, 0.9)';
            ctx.font = 'bold 11px "Sora", sans-serif';
            ctx.fillText(
                `Layer ${this.hoveredNeuron.layer + 1}, Neuron ${this.hoveredNeuron.index + 1}`,
                this.hoveredNeuron.x,
                this.hoveredNeuron.y - 30
            );
        }
    }
};

// Export
window.AnimatedNetworkViz = AnimatedNetworkViz;
window.CompGraphViz = CompGraphViz;
window.ActivationExplorer = ActivationExplorer;
window.BasicNetworkViz = BasicNetworkViz;

