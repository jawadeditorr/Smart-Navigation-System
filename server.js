const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

app.use(express.static('public'));

app.get('/api/navigate', (req, res) => {
    const { src, dest } = req.query;

    if (src === undefined || dest === undefined) {
        return res.status(400).json({ error: 'Source and destination are required' });
    }

    const command = process.platform === 'win32' 
        ? `.\\DijkstrasAlgo.exe ${src} ${dest}`
        : `./DijkstrasAlgo.exe ${src} ${dest}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing algorithm: ${error}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        try {
            // Output format:
            // Distance:1210
            // Path:0,3,11,12,
            
            const lines = stdout.trim().split('\n');
            const distanceLine = lines.find(l => l.startsWith('Distance:'));
            const pathLine = lines.find(l => l.startsWith('Path:'));

            if (!distanceLine || !pathLine) {
                throw new Error("Invalid output format from C++ program");
            }

            const distance = parseInt(distanceLine.split(':')[1]);
            const pathStr = pathLine.split(':')[1];
            
            // Remove empty strings and convert to numbers
            const pathIds = pathStr.split(',').filter(id => id.trim() !== '').map(id => parseInt(id));

            // Map IDs to city names and get road names
            const resultPath = [];
            
            for (let i = 0; i < pathIds.length; i++) {
                const currentId = pathIds[i];
                const node = {
                    id: currentId,
                    name: data.cities[currentId].name
                };

                if (i < pathIds.length - 1) {
                    const nextId = pathIds[i+1];
                    const roadKey = `${currentId}-${nextId}`;
                    node.roadToNext = data.roads[roadKey] || "Unknown";
                }

                resultPath.push(node);
            }

            res.json({
                distance: distance,
                path: resultPath
            });

        } catch (e) {
            console.error(e);
            console.log("Raw stdout:", stdout);
            res.status(500).json({ error: 'Failed to parse algorithm output' });
        }
    });
});

app.get('/api/data', (req, res) => {
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
