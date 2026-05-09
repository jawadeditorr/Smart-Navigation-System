document.addEventListener('DOMContentLoaded', () => {
    const srcSelect = document.getElementById('src');
    const destSelect = document.getElementById('dest');
    const navigateBtn = document.getElementById('navigate-btn');
    const resultsPanel = document.getElementById('results-panel');
    const pathList = document.getElementById('path-list');
    const distanceDisplay = document.getElementById('distance-display');
    const loading = document.getElementById('loading');
    const errorMsg = document.getElementById('error-msg');
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    const nodesContainer = document.getElementById('nodes-container');
    const baseEdgesGroup = document.getElementById('base-edges');
    const activeEdgesGroup = document.getElementById('active-edges');

    let graphData = null;

    // Theme logic
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Fetch initial data
    fetch('/api/data')
        .then(res => res.json())
        .then(data => {
            graphData = data;
            initializeUI();
        })
        .catch(err => {
            console.error('Failed to load data:', err);
            showError('Failed to load map data.');
        });

    function initializeUI() {
        const cities = Object.entries(graphData.cities);
        
        // Populate dropdowns
        cities.forEach(([id, city]) => {
            const option1 = document.createElement('option');
            option1.value = id;
            option1.textContent = city.name;
            srcSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = id;
            option2.textContent = city.name;
            destSelect.appendChild(option2);
        });

        // Default selection
        srcSelect.value = "0"; // Lahore
        destSelect.value = "12"; // Karachi

        // Render map nodes
        cities.forEach(([id, city]) => {
            const nodeEl = document.createElement('div');
            nodeEl.className = 'map-node';
            nodeEl.id = `node-${id}`;
            nodeEl.style.left = `${(city.x / 700) * 100}%`;
            nodeEl.style.top = `${(city.y / 700) * 100}%`;

            const dot = document.createElement('div');
            dot.className = 'node-dot';

            const label = document.createElement('div');
            label.className = 'node-label';
            
            // Adjust label position for edge cities like Karachi
            if (city.name === 'Karachi' || city.name === 'Hyderabad') {
                label.style.top = '-25px';
            }
            
            label.textContent = city.name;

            nodeEl.appendChild(dot);
            nodeEl.appendChild(label);
            nodesContainer.appendChild(nodeEl);
        });

        // Render base edges
        const drawnEdges = new Set();
        Object.keys(graphData.roads).forEach(edgeStr => {
            const [u, v] = edgeStr.split('-');
            const edgeId1 = `${u}-${v}`;
            const edgeId2 = `${v}-${u}`;
            
            if (!drawnEdges.has(edgeId1) && !drawnEdges.has(edgeId2)) {
                drawnEdges.add(edgeId1);
                
                const cityU = graphData.cities[u];
                const cityV = graphData.cities[v];
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', cityU.x);
                line.setAttribute('y1', cityU.y);
                line.setAttribute('x2', cityV.x);
                line.setAttribute('y2', cityV.y);
                line.setAttribute('class', 'edge-base');
                
                baseEdgesGroup.appendChild(line);
            }
        });
    }

    navigateBtn.addEventListener('click', () => {
        const src = srcSelect.value;
        const dest = destSelect.value;

        if (src === dest) {
            showError('Source and destination cannot be the same.');
            return;
        }

        // Reset UI
        errorMsg.style.display = 'none';
        resultsPanel.classList.remove('visible');
        loading.style.display = 'flex';
        activeEdgesGroup.innerHTML = '';
        document.querySelectorAll('.map-node').forEach(n => n.classList.remove('active'));

        fetch(`/api/navigate?src=${src}&dest=${dest}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to calculate path');
                return res.json();
            })
            .then(data => {
                loading.style.display = 'none';
                displayResults(data.distance, data.path);
                animatePathOnMap(data.path);
            })
            .catch(err => {
                loading.style.display = 'none';
                showError('Error calculating optimal route.');
                console.error(err);
            });
    });

    function displayResults(distance, path) {
        distanceDisplay.textContent = `Distance: ${distance} km`;
        pathList.innerHTML = '';

        path.forEach((node, index) => {
            const li = document.createElement('li');
            li.className = 'path-step';
            li.style.animationDelay = `${index * 0.15}s`;

            const marker = document.createElement('div');
            marker.className = 'step-marker';

            const content = document.createElement('div');
            content.className = 'step-content';

            const cityName = document.createElement('div');
            cityName.className = 'city-name';
            cityName.textContent = node.name;

            content.appendChild(cityName);

            if (node.roadToNext) {
                const road = document.createElement('div');
                road.className = 'road-info';
                road.textContent = `Via ${node.roadToNext}`;
                content.appendChild(road);
            }

            li.appendChild(marker);
            li.appendChild(content);
            pathList.appendChild(li);
        });

        resultsPanel.classList.add('visible');
    }

    function animatePathOnMap(path) {
        let totalLength = 0;

        for (let i = 0; i < path.length - 1; i++) {
            const u = path[i].id;
            const v = path[i + 1].id;
            
            const cityU = graphData.cities[u];
            const cityV = graphData.cities[v];

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', cityU.x);
            line.setAttribute('y1', cityU.y);
            line.setAttribute('x2', cityV.x);
            line.setAttribute('y2', cityV.y);
            line.setAttribute('class', 'edge-active');
            
            // Calculate a rough length for animation timing
            const dx = cityV.x - cityU.x;
            const dy = cityV.y - cityU.y;
            const length = Math.sqrt(dx*dx + dy*dy);
            totalLength += length;

            // Approximate stroke-dasharray based on SVG viewport
            // We use 1000 in CSS to be safe, we just stagger the animation
            line.style.animationDelay = `${i * 0.3}s`;
            
            activeEdgesGroup.appendChild(line);
        }

        // Highlight nodes
        path.forEach((node, i) => {
            const nodeEl = document.getElementById(`node-${node.id}`);
            if (nodeEl) {
                setTimeout(() => {
                    nodeEl.classList.add('active');
                }, i * 300);
            }
        });
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
    }
});
