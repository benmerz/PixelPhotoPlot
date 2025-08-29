// app.js

// Minimal 3D scatter plot for RGB using canvas
let rgbPoints = [];
let angleY = 0.7, angleX = 0.7; // initial rotation
let dragging = false, lastX = 0, lastY = 0;

function draw3DRGBPlot() {
    const canvas = document.getElementById('rgbPlot3d');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw axes
    ctx.save();
    ctx.translate(200, 200);
    // Axes: R=X, G=Y, B=Z
    const axes = [
        {v:[255,0,0], color:'red', label:'R'},
        {v:[0,255,0], color:'green', label:'G'},
        {v:[0,0,255], color:'blue', label:'B'}
    ];
    axes.forEach(ax => {
        const [x,y] = project3D(ax.v[0], ax.v[1], ax.v[2]);
        ctx.strokeStyle = ax.color;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(x,y); ctx.stroke();
        ctx.fillStyle = ax.color;
        ctx.fillText(ax.label, x*1.1, y*1.1);
    });
    // Draw points
    for (let i=0; i<rgbPoints.length; ++i) {
        const p = rgbPoints[i];
        const [x, y] = project3D(p[0], p[1], p[2]);
        ctx.fillStyle = `rgb(${p[0]},${p[1]},${p[2]})`;
        ctx.fillRect(x-1, y-1, 2, 2);
    }
    ctx.restore();
}

function project3D(rx, gy, bz) {
    // Center and scale
    let x = rx - 128, y = gy - 128, z = bz - 128;
    // Rotate
    let x1 = x*Math.cos(angleY) - z*Math.sin(angleY);
    let z1 = x*Math.sin(angleY) + z*Math.cos(angleY);
    let y1 = y*Math.cos(angleX) - z1*Math.sin(angleX);
    let z2 = y*Math.sin(angleX) + z1*Math.cos(angleX);
    // Perspective
    let scale = 1.5 + z2/300;
    return [x1*scale, y1*scale];
}

document.getElementById('rgbPlot3d').addEventListener('mousedown', function(e) {
    dragging = true; lastX = e.offsetX; lastY = e.offsetY;
});
document.getElementById('rgbPlot3d').addEventListener('mouseup', function(e) {
    dragging = false;
});
document.getElementById('rgbPlot3d').addEventListener('mouseleave', function(e) {
    dragging = false;
});
document.getElementById('rgbPlot3d').addEventListener('mousemove', function(e) {
    if (!dragging) return;
    let dx = e.offsetX - lastX, dy = e.offsetY - lastY;
    angleY += dx * 0.01;
    angleX += dy * 0.01;
    lastX = e.offsetX; lastY = e.offsetY;
    draw3DRGBPlot();
});

document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    const reader = new FileReader();
    reader.onload = function(event) {
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    img.onload = function() {
        const canvas = document.getElementById('imageCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        // Get pixel data
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        rgbPoints = [];
        // Sample up to 100x100 pixels for performance
        let stepY = Math.ceil(img.height/100), stepX = Math.ceil(img.width/100);
        for (let y = 0; y < img.height; y += stepY) {
            for (let x = 0; x < img.width; x += stepX) {
                const idx = (y * img.width + x) * 4;
                const red = data[idx];
                const green = data[idx + 1];
                const blue = data[idx + 2];
                rgbPoints.push([red, green, blue]);
            }
        }
        draw3DRGBPlot();
    };
});
