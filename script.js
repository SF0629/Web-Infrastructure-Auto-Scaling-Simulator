const state = {
    isRunning: false,
    trafficMode: 'normal',
    autoScaling: true,
    rps: 0,
    servers: [],
    maxServers: 10,
    minServers: 2,
    serverIdCounter: 3,
    highCpuDuration: 0,
    lowCpuDuration: 0,
    simulationInterval: null,
    lastCpuLogTime: {}
};

const elements = {
    serversContainer: document.getElementById('serversContainer'),
    rpsValue: document.getElementById('rpsValue'),
    serverCount: document.getElementById('serverCount'),
    avgCpu: document.getElementById('avgCpu'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    logConsole: document.getElementById('logConsole'),
    startBtn: document.getElementById('startBtn'),
    surgeBtn: document.getElementById('surgeBtn'),
    resetBtn: document.getElementById('resetBtn'),
    autoScaleBtn: document.getElementById('autoScaleBtn')
};

function getTimestamp() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
}

function log(message, level = 'info') {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const levelPrefixes = {
        info: '[INFO]',
        warn: '[WARN]',
        error: '[ERROR]',
        success: '[SUCCESS]',
        purple: '[SCALE]'
    };
    
    logEntry.innerHTML = `
        <span class="log-time">[${getTimestamp()}]</span>
        <span class="log-${level}">${levelPrefixes[level] || '[INFO]'}</span>
        <span>${message}</span>
    `;
    
    elements.logConsole.appendChild(logEntry);
    elements.logConsole.scrollTop = elements.logConsole.scrollHeight;
}

function createServer(id) {
    return {
        id: id,
        name: `Web-${String(id).padStart(2, '0')}`,
        cpu: 0,
        status: 'normal',
        requests: 0
    };
}

function renderServer(server, isNew = false) {
    const card = document.createElement('div');
    card.className = `server-card ${server.status}${isNew ? ' new' : ''}`;
    card.id = `server-${server.id}`;
    
    card.innerHTML = `
        <div class="server-name">
            <svg class="server-icon" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm4-4H6v-2h10v2zm0-4H6V7h10v2z"/>
            </svg>
            ${server.name}
        </div>
        <div class="server-cpu">${Math.round(server.cpu)}%</div>
        <div class="cpu-bar-container">
            <div class="cpu-bar" style="width: ${server.cpu}%"></div>
        </div>
        <div class="server-status">${server.status}</div>
    `;
    
    elements.serversContainer.appendChild(card);
}

function updateServerDisplay(server) {
    const card = document.getElementById(`server-${server.id}`);
    if (!card) return;
    
    card.className = `server-card ${server.status}`;
    card.querySelector('.server-cpu').textContent = `${Math.round(server.cpu)}%`;
    card.querySelector('.cpu-bar').style.width = `${server.cpu}%`;
    card.querySelector('.server-status').textContent = server.status;
}

function addServer() {
    if (state.servers.length >= state.maxServers) {
        log(`Maximum server limit (${state.maxServers}) reached!`, 'warn');
        return false;
    }
    
    const newServer = createServer(state.serverIdCounter++);
    state.servers.push(newServer);
    renderServer(newServer, true);
    
    log(`New server ${newServer.name} initialized`, 'purple');
    log(`Auto Scaling: Added ${newServer.name} to handle increased load`, 'success');
    
    return true;
}

function initializeServers() {
    elements.serversContainer.innerHTML = '';
    state.servers = [];
    state.serverIdCounter = 3;
    state.lastCpuLogTime = {};
    state.lowCpuDuration = 0;
    
    for (let i = 1; i <= 2; i++) {
        const server = createServer(i);
        state.servers.push(server);
        renderServer(server);
    }
}

function generateTraffic() {
    if (!state.isRunning) return;
    
    if (state.trafficMode === 'surge') {
        state.rps = Math.floor(Math.random() * 501) + 500;
    } else {
        state.rps = Math.floor(Math.random() * 51) + 50;
    }
    
    distributeRequests();
    updateDashboard();
    
    if (state.autoScaling) {
        checkAutoScaling();
    }
}

function distributeRequests() {
    if (state.servers.length === 0) return;
    
    const requestsPerServer = Math.floor(state.rps / state.servers.length);
    const remainder = state.rps % state.servers.length;
    
    const now = Date.now();
    
    state.servers.forEach((server, index) => {
        server.requests = requestsPerServer + (index < remainder ? 1 : 0);
        
        let cpu = (server.requests / 20) * 10;
        cpu += (Math.random() - 0.5) * 5;
        
        server.cpu = Math.max(0, Math.min(100, cpu));
        
        if (server.cpu >= 85) {
            server.status = 'overloaded';
        } else if (server.cpu >= 70) {
            server.status = 'warning';
        } else {
            server.status = 'normal';
        }
        
        updateServerDisplay(server);
        
        if (server.cpu >= 85) {
            if (!state.lastCpuLogTime[server.id] || now - state.lastCpuLogTime[server.id] > 5000) {
                log(`${server.name} CPU usage reached ${Math.round(server.cpu)}%`, 'warn');
                state.lastCpuLogTime[server.id] = now;
            }
        }
    });
}

function checkAutoScaling() {
    const avgCpu = calculateAverageCpu();
    
    if (avgCpu >= 80) {
        if (state.servers.length < state.maxServers) {
            state.highCpuDuration += 100;
            state.lowCpuDuration = 0;
            
            if (state.highCpuDuration >= 5000) {
                log(`Average CPU (${Math.round(avgCpu)}%) exceeded 80% for 5 seconds`, 'warn');
                addServer();
                state.highCpuDuration = 0;
                
                setTimeout(() => {
                    distributeRequests();
                    updateDashboard();
                }, 500);
            }
        }
    } 
    else if (avgCpu <= 30) {
        if (state.servers.length > state.minServers) {
            state.lowCpuDuration += 100;
            state.highCpuDuration = 0;
            
            if (state.lowCpuDuration >= 10000) {
                log(`Average CPU (${Math.round(avgCpu)}%) below 30% for 10 seconds - removing idle server`, 'info');
                removeServer();
                state.lowCpuDuration = 0;
                
                setTimeout(() => {
                    distributeRequests();
                    updateDashboard();
                }, 500);
            }
        }
    } else {
        state.highCpuDuration = Math.max(0, state.highCpuDuration - 100);
        state.lowCpuDuration = Math.max(0, state.lowCpuDuration - 100);
    }
}

function removeServer() {
    if (state.servers.length <= state.minServers) return false;
    
    const removedServer = state.servers.pop();
    const card = document.getElementById(`server-${removedServer.id}`);
    if (card) {
        card.remove();
    }
    
    log(`Server ${removedServer.name} removed due to low traffic`, 'warn');
    log(`Auto Scaling: Reduced to ${state.servers.length} servers`, 'success');
    
    return true;
}

function calculateAverageCpu() {
    if (state.servers.length === 0) return 0;
    const total = state.servers.reduce((sum, s) => sum + s.cpu, 0);
    return total / state.servers.length;
}

function updateDashboard() {
    const avgCpu = calculateAverageCpu();
    
    elements.rpsValue.innerHTML = `${state.rps}<span class="stat-unit">RPS</span>`;
    elements.serverCount.innerHTML = `${state.servers.length}<span class="stat-unit">units</span>`;
    elements.avgCpu.innerHTML = `${Math.round(avgCpu)}<span class="stat-unit">%</span>`;
    
    let systemStatus = 'STABLE';
    let statusClass = 'stable';
    
    if (state.trafficMode === 'surge' || avgCpu >= 70) {
        if (state.highCpuDuration >= 3000 && state.autoScaling) {
            systemStatus = 'SCALING';
            statusClass = 'scaling';
        } else if (avgCpu >= 85) {
            systemStatus = 'CRITICAL';
            statusClass = 'critical';
        } else if (avgCpu >= 70) {
            systemStatus = 'HIGH LOAD';
            statusClass = 'warning';
        }
    }
    
    elements.statusText.textContent = systemStatus;
    elements.statusText.className = `status-text ${statusClass}`;
    elements.statusDot.className = `status-dot ${statusClass}`;
    
    elements.avgCpu.className = 'stat-value';
    if (avgCpu >= 85) {
        elements.avgCpu.classList.add('critical');
    } else if (avgCpu >= 70) {
        elements.avgCpu.classList.add('warning');
    }
}

elements.startBtn.addEventListener('click', () => {
    if (!state.isRunning) {
        state.isRunning = true;
        elements.startBtn.textContent = 'Pause';
        elements.startBtn.classList.remove('primary');
        
        const mode = state.trafficMode === 'surge' ? 'SURGE' : 'NORMAL';
        const action = elements.startBtn.textContent === 'Resume' ? 'resumed' : 'started';
        log(`Simulation ${action}. Traffic mode: ${mode} (${state.trafficMode === 'surge' ? '500-1000' : '50-100'} RPS)`, 'info');
        
        state.simulationInterval = setInterval(generateTraffic, 100);
    } else {
        state.isRunning = false;
        elements.startBtn.textContent = 'Resume';
        
        log('Simulation paused.', 'info');
        log(`Traffic mode preserved: ${state.trafficMode.toUpperCase()}`, 'info');
        
        if (state.simulationInterval) {
            clearInterval(state.simulationInterval);
        }
    }
});

elements.surgeBtn.addEventListener('click', () => {
    if (!state.isRunning) {
        log('Please start simulation first', 'warn');
        return;
    }
    
    if (state.trafficMode === 'normal') {
        state.trafficMode = 'surge';
        elements.surgeBtn.classList.add('active');
        log('TRAFFIC SURGE ACTIVATED! (500-1000 RPS)', 'error');
    } else {
        state.trafficMode = 'normal';
        elements.surgeBtn.classList.remove('active');
        log('Traffic normalized to NORMAL mode (50-100 RPS)', 'success');
    }
});

elements.resetBtn.addEventListener('click', () => {
    state.isRunning = false;
    state.trafficMode = 'normal';
    state.rps = 0;
    state.highCpuDuration = 0;
    state.lastCpuLogTime = {};
    
    if (state.simulationInterval) {
        clearInterval(state.simulationInterval);
    }
    
    elements.startBtn.textContent = 'Start Simulation';
    elements.startBtn.classList.add('primary');
    elements.surgeBtn.classList.remove('active');
    
    initializeServers();
    updateDashboard();
    
    elements.logConsole.innerHTML = '';
    log('System reset. Simulator ready.', 'info');
});

elements.autoScaleBtn.addEventListener('click', () => {
    state.autoScaling = !state.autoScaling;
    
    if (state.autoScaling) {
        elements.autoScaleBtn.textContent = 'Auto Scaling: ON';
        elements.autoScaleBtn.classList.add('active');
        log('Auto Scaling enabled', 'success');
    } else {
        elements.autoScaleBtn.textContent = 'Auto Scaling: OFF';
        elements.autoScaleBtn.classList.remove('active');
        log('Auto Scaling disabled - manual scaling only', 'warn');
    }
});

initializeServers();
updateDashboard();

log('System initialized with 2 web servers', 'info');
log('Click "Start Simulation" to begin traffic generation', 'info');
