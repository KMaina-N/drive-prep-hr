'use client'
// pages/404.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import Head from 'next/head';

// --- Constants and Configuration ---
const CAR_WIDTH = 40;
const CAR_HEIGHT = 70;
const LANE_WIDTH = 80;         // Width of a single driving lane
const SIDEWALK_WIDTH = 40;     // Width of sidewalk on one side
const ROAD_SECTION_WIDTH = LANE_WIDTH * 2; // Two lanes for main vertical traffic flow
const INTERSECTION_SIZE = 200; // Size of an intersection square (both X and Y)
const BLOCK_LENGTH = 400;      // Length of a city block segment between intersections

const PLAYER_ACCELERATION_RATE = 0.00005; // Rate at which car speeds up
const PLAYER_BRAKE_RATE = 0.0001;     // Rate at which car slows down
const PLAYER_FRICTION_RATE = 0.00001; // Constant drag on speed
const PLAYER_ANGULAR_FRICTION_RATE = 0.00005; // Friction for rotational speed
const PLAYER_MAX_SPEED = 3;        // Max car speed (units per frame time)
const PLAYER_MAX_ANGULAR_VELOCITY = 0.003; // Max turning rate in radians per frame time
const PLAYER_STEERING_ACCELERATION = 0.00005; // How fast steering applies angular velocity

const TRAFFIC_CAR_TYPES = [
    { src: '/traffic-car-red.png', baseSpeed: 1.8 },
    { src: '/traffic-car-blue.png', baseSpeed: 2.2 },
    { src: '/traffic-car-green.png', baseSpeed: 1.5 },
];
const TRAFFIC_CAR_SPAWN_INTERVAL = 2000; // Milliseconds between traffic car spawns
const TRAFFIC_CAR_LOOK_AHEAD_DISTANCE = CAR_HEIGHT * 3; // How far traffic looks ahead for other cars/lights
const TRAFFIC_TURNING_SPEED = 0.0015; // How fast traffic cars turn

const FPS = 60;
const FRAME_TIME = 1000 / FPS;

// --- Type Definitions ---
interface Car {
    id: string;             // Unique ID for all cars
    x: number;              // Center X position on canvas
    y: number;              // Center Y position on canvas
    worldX: number;         // Absolute X position in the infinite world
    worldY: number;         // Absolute Y position in the infinite world
    speed: number;          // Current forward speed
    rotation: number;       // Current visual rotation in radians (0 = up, positive clockwise)
    angularVelocity: number; // Current turning rate
    width: number;
    height: number;
    image: HTMLImageElement | null;
    isTraffic?: boolean;    // True if it's a traffic car
    targetLaneX?: number;   // For traffic cars to stay centered in lane (unused in this iteration)
    turnIntent?: 'left' | 'right' | 'straight' | null; // What traffic car plans to do at intersection
    turningStage?: 'pre-turn' | 'turning' | 'post-turn' | null; // State of traffic car turn
    destinationRotation?: number; // What rotation to aim for after a turn for traffic cars
}

type TrafficLightState = 'red' | 'green';

interface TrafficLight {
    id: string;
    worldX: number; // Absolute X position in world
    worldY: number; // Absolute Y position in world
    state: TrafficLightState;
    timer: number;
    duration: number; // How long it stays in current state
    affectedLanes: { minX: number; maxX: number; }[]; // Lanes it controls (X-coords of lane bounds)
}

interface GameState {
    playerCar: Car;
    trafficCars: Car[];
    trafficLights: TrafficLight[];
    worldScrollX: number; // Represents the global horizontal scroll
    worldScrollY: number; // Represents the global vertical scroll
    lastTrafficSpawnTime: number;
    keysPressed: { [key: string]: boolean };
    lastTimestamp: number;
    frameAccumulator: number;
}

// --- Utility Functions ---
function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Function for AABB collision detection (basic rectangle check)
function checkCollision(car1: Car, car2: Car): boolean {
    // Simple AABB for collision detection (ignores rotation for simplicity)
    const car1Left = car1.x - car1.width / 2;
    const car1Right = car1.x + car1.width / 2;
    const car1Top = car1.y - car1.height / 2;
    const car1Bottom = car1.y + car1.height / 2;

    const car2Left = car2.x - car2.width / 2;
    const car2Right = car2.x + car2.width / 2;
    const car2Top = car2.y - car2.height / 2;
    const car2Bottom = car2.y + car2.height / 2;

    return car1Left < car2Right &&
           car1Right > car2Left &&
           car1Top < car2Bottom &&
           car1Bottom > car2Top;
}

// --- Game Object Rendering Functions ---

// Renders a single city block segment (road and surrounding buildings/grass)
const renderCityBlock = (ctx: CanvasRenderingContext2D, renderX: number, renderY: number, canvasWidth: number) => {
    // Background (grass/buildings on edges)
    ctx.fillStyle = '#567d46'; // Green grass
    ctx.fillRect(renderX, renderY, canvasWidth, BLOCK_LENGTH); // Fill entire segment with green first

    const roadVerticalStartX = (canvasWidth - ROAD_SECTION_WIDTH) / 2;
    const sidewalkLeftStartX = roadVerticalStartX - SIDEWALK_WIDTH;
    const sidewalkRightStartX = roadVerticalStartX + ROAD_SECTION_WIDTH;

    // Vertical Road Surface
    ctx.fillStyle = '#4a4a4a'; // Dark gray road
    ctx.fillRect(renderX + roadVerticalStartX, renderY, ROAD_SECTION_WIDTH, BLOCK_LENGTH);

    // Vertical Sidewalks
    ctx.fillStyle = '#8f8f8f'; // Gray sidewalk
    ctx.fillRect(renderX + sidewalkLeftStartX, renderY, SIDEWALK_WIDTH, BLOCK_LENGTH);
    ctx.fillRect(renderX + sidewalkRightStartX, renderY, SIDEWALK_WIDTH, BLOCK_LENGTH);

    // Lane lines (dashed) on vertical road
    ctx.strokeStyle = '#ffffff'; // White for lane lines
    ctx.lineWidth = 4;
    ctx.setLineDash([40, 40]);
    ctx.beginPath();
    ctx.moveTo(renderX + roadVerticalStartX + LANE_WIDTH, renderY);
    ctx.lineTo(renderX + roadVerticalStartX + LANE_WIDTH, renderY + BLOCK_LENGTH);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // --- Draw buildings/trees on the sides (simplified) ---
    const buildingColor = '#7f7f7f'; // Grey for buildings
    const windowColor = '#aaaaaa';
    const treeTrunkColor = '#3c2a21';
    const treeFoliageColor = '#4a6d36';

    const buildingSpacing = 150;
    const buildingWidth = 60;
    const buildingHeight = 100;
    const treeWidth = 40;
    const treeHeight = 60;

    // Left side buildings/trees
    for (let i = 0; i < BLOCK_LENGTH / buildingSpacing; i++) {
        const currentY = renderY + i * buildingSpacing;

        // Building
        ctx.fillStyle = buildingColor;
        ctx.fillRect(renderX + sidewalkLeftStartX - buildingWidth - 20, currentY + 20, buildingWidth, buildingHeight);
        ctx.fillStyle = windowColor;
        ctx.fillRect(renderX + sidewalkLeftStartX - buildingWidth - 10, currentY + 30, buildingWidth - 20, buildingHeight / 4);

        // Tree
        ctx.fillStyle = treeTrunkColor;
        ctx.fillRect(renderX + sidewalkLeftStartX - treeWidth / 2, currentY + 20 + buildingHeight + 10, 10, treeHeight / 2);
        ctx.fillStyle = treeFoliageColor;
        ctx.beginPath();
        ctx.arc(renderX + sidewalkLeftStartX, currentY + 20 + buildingHeight + 10, treeWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Right side buildings/trees
    for (let i = 0; i < BLOCK_LENGTH / buildingSpacing; i++) {
        const currentY = renderY + i * buildingSpacing;

        // Building
        ctx.fillStyle = buildingColor;
        ctx.fillRect(renderX + sidewalkRightStartX + SIDEWALK_WIDTH + 20, currentY + 20, buildingWidth, buildingHeight);
        ctx.fillStyle = windowColor;
        ctx.fillRect(renderX + sidewalkRightStartX + SIDEWALK_WIDTH + 30, currentY + 30, buildingWidth - 20, buildingHeight / 4);

        // Tree
        ctx.fillStyle = treeTrunkColor;
        ctx.fillRect(renderX + sidewalkRightStartX + SIDEWALK_WIDTH + treeWidth / 2, currentY + 20 + buildingHeight + 10, 10, treeHeight / 2);
        ctx.fillStyle = treeFoliageColor;
        ctx.beginPath();
        ctx.arc(renderX + sidewalkRightStartX + SIDEWALK_WIDTH + treeWidth / 2, currentY + 20 + buildingHeight + 10, treeWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    }
};

// Renders an intersection with horizontal road markings
const renderIntersection = (ctx: CanvasRenderingContext2D, renderX: number, renderY: number, canvasWidth: number) => {
    const roadVerticalStartX = (canvasWidth - ROAD_SECTION_WIDTH) / 2;
    const totalRoadAreaWidth = ROAD_SECTION_WIDTH + SIDEWALK_WIDTH * 2;

    // Main intersection asphalt (square area)
    ctx.fillStyle = '#3a3a3a'; // Slightly darker for intersection
    ctx.fillRect(renderX + roadVerticalStartX - SIDEWALK_WIDTH, renderY, totalRoadAreaWidth, INTERSECTION_SIZE);

    // Vertical lane lines crossing the intersection (solid)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 4;
    ctx.setLineDash([]); // Solid lines
    ctx.beginPath();
    ctx.moveTo(renderX + roadVerticalStartX + LANE_WIDTH, renderY);
    ctx.lineTo(renderX + roadVerticalStartX + LANE_WIDTH, renderY + INTERSECTION_SIZE);
    ctx.stroke();

    // Horizontal road (crossing the main vertical road)
    const horizontalRoadWidth = totalRoadAreaWidth;
    const horizontalRoadStartX = renderX + roadVerticalStartX - SIDEWALK_WIDTH;
    const horizontalRoadCenterY = renderY + INTERSECTION_SIZE / 2;

    ctx.fillStyle = '#4a4a4a'; // Same as vertical road
    ctx.fillRect(horizontalRoadStartX, horizontalRoadCenterY - LANE_WIDTH, horizontalRoadWidth, LANE_WIDTH * 2);

    // Horizontal lane line (dashed) on the cross road
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.setLineDash([40, 40]);
    ctx.beginPath();
    ctx.moveTo(horizontalRoadStartX, horizontalRoadCenterY);
    ctx.lineTo(horizontalRoadStartX + horizontalRoadWidth, horizontalRoadCenterY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Zebra crossings (white stripes) for pedestrians
    ctx.fillStyle = '#ffffff';
    const numStripes = 5;
    const stripeGap = 10;
    const stripeLength = LANE_WIDTH * 0.8 / numStripes;

    // Top vertical zebra crossing (entering intersection)
    for (let i = 0; i < numStripes; i++) {
        ctx.fillRect(renderX + roadVerticalStartX - SIDEWALK_WIDTH + 5 + i * (stripeLength + stripeGap), renderY + 10, stripeLength, 10);
    }
    // Bottom vertical zebra crossing (exiting intersection)
    for (let i = 0; i < numStripes; i++) {
        ctx.fillRect(renderX + roadVerticalStartX - SIDEWALK_WIDTH + 5 + i * (stripeLength + stripeGap), renderY + INTERSECTION_SIZE - 20, stripeLength, 10);
    }
    // Left horizontal zebra crossing
    for (let i = 0; i < numStripes; i++) {
        ctx.fillRect(horizontalRoadStartX + 10, renderY + LANE_WIDTH + 5 + i * (stripeLength + stripeGap), 10, stripeLength);
    }
     // Right horizontal zebra crossing
     for (let i = 0; i < numStripes; i++) {
        ctx.fillRect(horizontalRoadStartX + horizontalRoadWidth - 20, renderY + LANE_WIDTH + 5 + i * (stripeLength + stripeGap), 10, stripeLength);
    }
};


const renderTrafficLight = (ctx: CanvasRenderingContext2D, light: TrafficLight, worldScrollX: number, worldScrollY: number) => {
    const canvas = ctx.canvas;
    // Calculate on-screen positions relative to world scroll
    const lightXOnScreen = light.worldX - worldScrollX;
    const lightYOnScreen = light.worldY - worldScrollY;

    // Don't render if completely off-screen
    if (lightXOnScreen < -50 || lightXOnScreen > canvas.width + 50 ||
        lightYOnScreen < -50 || lightYOnScreen > canvas.height + 50) return;

    // Light pole
    ctx.fillStyle = '#555555';
    ctx.fillRect(lightXOnScreen - 5, lightYOnScreen - 40, 10, 60);

    // Light casing
    ctx.fillStyle = '#333333';
    ctx.fillRect(lightXOnScreen - 15, lightYOnScreen - 45, 30, 30);

    // Light circle
    if (light.state === 'red') {
        ctx.fillStyle = 'red';
    } else {
        ctx.fillStyle = 'green';
    }
    ctx.beginPath();
    ctx.arc(lightXOnScreen, lightYOnScreen - 30, 10, 0, Math.PI * 2);
    ctx.fill();
};

// Renders a car sprite
const renderCar = (ctx: CanvasRenderingContext2D, car: Car, worldScrollX: number, worldScrollY: number) => {
    if (!car.image) return;

    // Player car has fixed canvas (x,y), traffic cars move with world
    const xOnScreen = car.isTraffic ? car.worldX - worldScrollX : car.x;
    const yOnScreen = car.isTraffic ? car.worldY - worldScrollY : car.y;

    ctx.save();
    ctx.translate(xOnScreen, yOnScreen);
    ctx.rotate(car.rotation);
    ctx.drawImage(car.image, -car.width / 2, -car.height / 2, car.width, car.height);
    ctx.restore();
};

// --- Game Logic and Updates ---

const updateGame = (state: GameState, deltaTime: number, trafficCarImages: HTMLImageElement[]): GameState => {
    const newState = { ...state };
    const { playerCar, keysPressed } = newState;
    const canvas = document.querySelector('canvas');
    if (!canvas) return newState;

    // --- Update Player Car Physics ---
    // Apply steering acceleration (affecting angularVelocity)
    if (keysPressed['a'] || keysPressed['A'] || keysPressed['ArrowLeft']) {
        playerCar.angularVelocity = Math.max(-PLAYER_MAX_ANGULAR_VELOCITY, playerCar.angularVelocity - PLAYER_STEERING_ACCELERATION * deltaTime);
    } else if (keysPressed['d'] || keysPressed['D'] || keysPressed['ArrowRight']) {
        playerCar.angularVelocity = Math.min(PLAYER_MAX_ANGULAR_VELOCITY, playerCar.angularVelocity + PLAYER_STEERING_ACCELERATION * deltaTime);
    } else {
        // Apply angular friction when not steering
        if (playerCar.angularVelocity > 0) {
            playerCar.angularVelocity = Math.max(0, playerCar.angularVelocity - PLAYER_ANGULAR_FRICTION_RATE * deltaTime);
        } else if (playerCar.angularVelocity < 0) {
            playerCar.angularVelocity = Math.min(0, playerCar.angularVelocity + PLAYER_ANGULAR_FRICTION_RATE * deltaTime);
        }
    }

    // Apply rotation based on angular velocity
    playerCar.rotation += playerCar.angularVelocity * deltaTime;

    // Normalize rotation to stay within 0 to 2*PI
    playerCar.rotation %= (2 * Math.PI);
    if (playerCar.rotation < 0) playerCar.rotation += (2 * Math.PI);

    // Acceleration/Braking
    if (keysPressed['w'] || keysPressed['W'] || keysPressed['ArrowUp']) {
        playerCar.speed += PLAYER_ACCELERATION_RATE * deltaTime;
    } else if (keysPressed['s'] || keysPressed['S'] || keysPressed['ArrowDown']) {
        playerCar.speed -= PLAYER_BRAKE_RATE * deltaTime;
    } else {
        // Apply linear friction
        if (playerCar.speed > 0) {
            playerCar.speed = Math.max(0, playerCar.speed - PLAYER_FRICTION_RATE * deltaTime);
        } else if (playerCar.speed < 0) {
            playerCar.speed = Math.min(0, playerCar.speed + PLAYER_FRICTION_RATE * deltaTime);
        }
    }

    // Clamp linear speed
    playerCar.speed = Math.min(PLAYER_MAX_SPEED, Math.max(-PLAYER_MAX_SPEED / 2, playerCar.speed));

    // Calculate movement components based on current rotation
    const moveX = Math.sin(playerCar.rotation) * playerCar.speed;
    const moveY = -Math.cos(playerCar.rotation) * playerCar.speed; // Negative because Y-axis points down

    // Update player car's canvas position
    playerCar.x += moveX;
    playerCar.y += moveY;

    // Update player car's world position (important for collision with traffic/lights)
    playerCar.worldX += moveX;
    playerCar.worldY += moveY;

    // Keep player car within canvas bounds
    playerCar.x = Math.max(CAR_WIDTH / 2, Math.min(canvas.width - CAR_WIDTH / 2, playerCar.x));
    playerCar.y = Math.max(CAR_HEIGHT / 2, Math.min(canvas.height - CAR_HEIGHT / 2, playerCar.y));

    // --- Update World Scrolling ---
    // World scrolls based on the player car's *fixed* position relative to the center of the canvas
    const centerCanvasX = canvas.width / 2;
    const centerCanvasY = canvas.height / 2;

    // Adjust world scroll so player car stays near center
    newState.worldScrollX = playerCar.worldX - centerCanvasX;
    newState.worldScrollY = playerCar.worldY - centerCanvasY;


    // --- Update Traffic Cars ---
    newState.lastTrafficSpawnTime += deltaTime;
    if (newState.lastTrafficSpawnTime >= TRAFFIC_CAR_SPAWN_INTERVAL) {
        newState.lastTrafficSpawnTime = 0;
        const randomType = TRAFFIC_CAR_TYPES[Math.floor(Math.random() * TRAFFIC_CAR_TYPES.length)];
        const roadVerticalStartX = (canvas.width - ROAD_SECTION_WIDTH) / 2;

        // Spawn a new traffic car in one of the two main vertical lanes
        const spawnLaneIndex = Math.floor(Math.random() * 2); // 0 for left, 1 for right lane
        const spawnXOnCanvas = roadVerticalStartX + (spawnLaneIndex * LANE_WIDTH) + LANE_WIDTH / 2;

        // Randomly decide turn intent (straight, left, right)
        const turnOptions: ('straight' | 'left' | 'right')[] = ['straight', 'straight', 'left', 'right']; // Bias towards straight
        const turnIntent = turnOptions[Math.floor(Math.random() * turnOptions.length)];

        newState.trafficCars.push({
            id: uuidv4(),
            x: spawnXOnCanvas, // Canvas X is fixed for initial spawn
            y: -CAR_HEIGHT, // Canvas Y is not used for traffic cars movement
            worldX: newState.worldScrollX + spawnXOnCanvas, // Calculate initial worldX
            worldY: newState.worldScrollY - (BLOCK_LENGTH + INTERSECTION_SIZE) * 1.5 - CAR_HEIGHT * 2, // Spawn well above visible area
            speed: PLAYER_MAX_SPEED * randomType.baseSpeed,
            rotation: 0, // Initially facing up (straight)
            angularVelocity: 0,
            width: CAR_WIDTH,
            height: CAR_HEIGHT,
            image: trafficCarImages[TRAFFIC_CAR_TYPES.indexOf(randomType)],
            isTraffic: true,
            turnIntent: turnIntent,
            turningStage: null,
            destinationRotation: undefined,
        });
    }

    // Update existing traffic cars
    newState.trafficCars = newState.trafficCars.filter(trafficCar => {
        // Remove cars far off-screen (below)
        if (trafficCar.worldY - newState.worldScrollY > canvas.height + CAR_HEIGHT * 2) {
            return false;
        }

        let effectiveSpeed = trafficCar.speed;
        let effectiveAngularVelocity = trafficCar.angularVelocity;

        // --- Traffic AI Logic ---
        // 1. Check for traffic lights
        const roadVerticalStartX = (canvas.width - ROAD_SECTION_WIDTH) / 2;
        const roadCenter = roadVerticalStartX + ROAD_SECTION_WIDTH / 2; // Not really used for lights affecting lanes

        for (const light of newState.trafficLights) {
            // Check if traffic car is approaching a red light in its affected lane
            const distanceToLightY = trafficCar.worldY - light.worldY;
            const horizontalRangeLight = Math.abs(trafficCar.worldX - light.worldX);

            if (light.state === 'red' && horizontalRangeLight < LANE_WIDTH && // Is it in the general path of the light
                distanceToLightY > -TRAFFIC_CAR_LOOK_AHEAD_DISTANCE && distanceToLightY < CAR_HEIGHT) {
                
                effectiveSpeed = Math.min(effectiveSpeed, Math.max(0, (distanceToLightY / TRAFFIC_CAR_LOOK_AHEAD_DISTANCE) * trafficCar.speed));
                if (effectiveSpeed < 0.1 && distanceToLightY < CAR_HEIGHT * 0.5) effectiveSpeed = 0; // Hard stop close to light
            }
        }

        // 2. Check for other cars ahead
        const allOtherCars = [newState.playerCar, ...newState.trafficCars.filter(c => c.id !== trafficCar.id)];
        for (const otherCar of allOtherCars) {
            const distanceY = trafficCar.worldY - otherCar.worldY;
            const horizontalDistance = Math.abs(trafficCar.worldX - otherCar.worldX);

            if (distanceY > CAR_HEIGHT * 0.5 && distanceY < TRAFFIC_CAR_LOOK_AHEAD_DISTANCE && horizontalDistance < CAR_WIDTH * 0.8) {
                // If car is too close ahead, slow down
                if (trafficCar.speed > otherCar.speed) {
                    effectiveSpeed = otherCar.speed; // Match speed of car in front
                }
            }
        }

        // 3. Traffic car turning logic at intersections
        const intersectionWorldY = Math.round(newState.worldScrollY / (BLOCK_LENGTH + INTERSECTION_SIZE)) * (BLOCK_LENGTH + INTERSECTION_SIZE);
        const distanceToIntersectionCenterY = trafficCar.worldY - (intersectionWorldY + BLOCK_LENGTH + INTERSECTION_SIZE / 2); // Distance to center of intersection

        // Define intersection boundaries for turning logic
        const intersectionTopBoundary = intersectionWorldY + BLOCK_LENGTH;
        const intersectionBottomBoundary = intersectionWorldY + BLOCK_LENGTH + INTERSECTION_SIZE;

        if (trafficCar.worldY > intersectionTopBoundary - CAR_HEIGHT && trafficCar.worldY < intersectionBottomBoundary + CAR_HEIGHT) {
            // Car is approaching or inside an intersection
            if (!trafficCar.turningStage && trafficCar.turnIntent) {
                trafficCar.turningStage = 'pre-turn';
                trafficCar.speed = Math.min(trafficCar.speed, PLAYER_MAX_SPEED * 0.8); // Slow down for turn
                trafficCar.angularVelocity = 0;

                if (trafficCar.turnIntent === 'left') {
                    trafficCar.destinationRotation = Math.PI * 1.5; // To face left
                } else if (trafficCar.turnIntent === 'right') {
                    trafficCar.destinationRotation = Math.PI * 0.5; // To face right
                } else { // straight
                    trafficCar.destinationRotation = 0; // Keep facing up
                }
            }

            if (trafficCar.turningStage === 'pre-turn' && distanceToIntersectionCenterY < CAR_HEIGHT / 2) {
                // Once at center of intersection, start turning
                trafficCar.turningStage = 'turning';
            }

            if (trafficCar.turningStage === 'turning') {
                // Gradually turn towards destination rotation
                const angleDiff = trafficCar.destinationRotation! - trafficCar.rotation;
                if (Math.abs(angleDiff) > 0.05) { // Small threshold for "close enough"
                    effectiveAngularVelocity = (angleDiff > 0 ? 1 : -1) * TRAFFIC_TURNING_SPEED;
                } else {
                    trafficCar.rotation = trafficCar.destinationRotation!; // Snap to destination
                    effectiveAngularVelocity = 0;
                    trafficCar.turningStage = 'post-turn';
                }
            }
        } else if (trafficCar.turningStage === 'post-turn' && trafficCar.worldY > intersectionBottomBoundary + CAR_HEIGHT) {
            // Once clear of intersection, reset turning state and intent
            trafficCar.turningStage = null;
            trafficCar.turnIntent = null;
            trafficCar.rotation = 0; // Snap back to straight for vertical roads
        }

        // Update traffic car's rotation and position
        trafficCar.rotation += effectiveAngularVelocity * deltaTime;
        trafficCar.worldX += Math.sin(trafficCar.rotation) * effectiveSpeed;
        trafficCar.worldY -= Math.cos(trafficCar.rotation) * effectiveSpeed; // Negative for Y-down

        return true; // Keep car in array
    });

    // --- Collision Detection and Response (Player vs Traffic) ---
    newState.trafficCars.forEach(trafficCar => {
        // Create temporary car objects with canvas-relative positions for collision check
        const playerCarOnScreen = { ...playerCar }; // Player's (x,y) is already screen-relative
        const trafficCarOnScreen = { ...trafficCar,
            x: trafficCar.worldX - newState.worldScrollX,
            y: trafficCar.worldY - newState.worldScrollY
        };

        if (checkCollision(playerCarOnScreen, trafficCarOnScreen)) {
            // Simple collision response: reduce speed and push apart
            playerCar.speed *= 0.7; // Player loses more speed
            trafficCar.speed *= 0.7; // Traffic also loses speed

            // Calculate overlap and push apart
            const dx = playerCarOnScreen.x - trafficCarOnScreen.x;
            const dy = playerCarOnScreen.y - trafficCarOnScreen.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const minDistance = (CAR_WIDTH + CAR_HEIGHT) / 2 * 0.7; // Approximate combined radius

            if (dist < minDistance && dist > 0) {
                const overlap = minDistance - dist;
                const nx = dx / dist; // Normalized separation vector
                const ny = dy / dist;

                playerCar.x += nx * overlap / 2;
                playerCar.y += ny * overlap / 2;

                // For traffic car, adjust its world position
                trafficCar.worldX -= nx * overlap / 2;
                trafficCar.worldY -= ny * overlap / 2;
            }
        }
    });


    // --- Update Traffic Lights ---
    newState.trafficLights.forEach(light => {
        light.timer += deltaTime;
        if (light.timer >= light.duration) {
            light.state = light.state === 'red' ? 'green' : 'red';
            light.timer = 0;
            light.duration = light.state === 'red' ? 3000 : 5000; // Red for 3s, Green for 5s
        }
    });

    return newState;
};

// --- Main Game Component ---

const Game = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const playerCarImage = useRef<HTMLImageElement | null>(null);
    const trafficCarImages = useRef<HTMLImageElement[]>([]);
    const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);

    const gameState = useRef<GameState>({
        playerCar: {
            id: 'player', x: 0, y: 0, worldX: 0, worldY: 0, speed: 0, rotation: 0, angularVelocity: 0,
            width: CAR_WIDTH, height: CAR_HEIGHT, image: null
        },
        trafficCars: [],
        trafficLights: [],
        worldScrollX: 0,
        worldScrollY: 0,
        lastTrafficSpawnTime: 0,
        keysPressed: {},
        lastTimestamp: 0,
        frameAccumulator: 0,
    });

    // Asset Loading & Initial Setup
    useEffect(() => {
        const loadAssetsAndSetup = async () => {
            const playerImg = new Image();
            playerImg.src = '/player-car.png';
            const playerLoaded = new Promise(resolve => { playerImg.onload = resolve; playerImg.onerror = () => console.error('Failed to load player-car.png'); });

            const trafficImagePromises = TRAFFIC_CAR_TYPES.map(type => {
                return new Promise<HTMLImageElement>(resolve => {
                    const img = new Image();
                    img.src = type.src;
                    img.onload = () => resolve(img);
                    img.onerror = () => {
                        console.error(`Failed to load ${type.src}`);
                        resolve(img);
                    };
                });
            });
            const loadedTrafficImgs = await Promise.all(trafficImagePromises);

            playerCarImage.current = playerImg;
            trafficCarImages.current = loadedTrafficImgs;
            gameState.current.playerCar.image = playerImg;

            setIsAssetsLoaded(true);

            // Initial game state setup after canvas is available
            const canvas = canvasRef.current;
            if (canvas) {
                // Player car starts near bottom center of screen
                gameState.current.playerCar.x = canvas.width / 2;
                gameState.current.playerCar.y = canvas.height - 150;
                // Initialize player's world position based on its screen position and current scroll
                gameState.current.playerCar.worldX = gameState.current.worldScrollX + gameState.current.playerCar.x;
                gameState.current.playerCar.worldY = gameState.current.worldScrollY + gameState.current.playerCar.y;


                // Initialize traffic lights in world coordinates
                const roadVerticalStartX = (canvas.width - ROAD_SECTION_WIDTH) / 2;
                const trafficLightLaneCenter = roadVerticalStartX + ROAD_SECTION_WIDTH / 2;
                const affectedLanes = [{ minX: roadVerticalStartX, maxX: roadVerticalStartX + ROAD_SECTION_WIDTH }];

                gameState.current.trafficLights = [
                    {   id: uuidv4(),
                        worldX: gameState.current.worldScrollX + trafficLightLaneCenter,
                        worldY: gameState.current.worldScrollY + canvas.height / 2 + INTERSECTION_SIZE / 2, // At first intersection
                        state: 'green',
                        timer: 0,
                        duration: 5000,
                        affectedLanes: affectedLanes
                    },
                    {  id: uuidv4(),
                        worldX: gameState.current.worldScrollX + trafficLightLaneCenter,
                        worldY: gameState.current.worldScrollY + canvas.height / 2 - BLOCK_LENGTH - INTERSECTION_SIZE / 2, // At second intersection
                        state: 'red',
                        timer: 2000, // Staggered start
                        duration: 3000,
                        affectedLanes: affectedLanes
                    }
                ];

                // Spawn an initial traffic car
                const randomType = TRAFFIC_CAR_TYPES[Math.floor(Math.random() * TRAFFIC_CAR_TYPES.length)];
                const roadSpawnX = roadVerticalStartX + LANE_WIDTH / 2; // Spawn in left vertical lane
                const initialTrafficWorldY = gameState.current.worldScrollY - (BLOCK_LENGTH + INTERSECTION_SIZE) * 1.5 - CAR_HEIGHT * 2; // Far above
                const initialTrafficWorldX = gameState.current.worldScrollX + roadSpawnX;

                gameState.current.trafficCars.push({
                    id: uuidv4(),
                    x: 0, y: 0, // Canvas (x,y) not used for traffic cars
                    worldX: initialTrafficWorldX,
                    worldY: initialTrafficWorldY,
                    speed: PLAYER_MAX_SPEED * randomType.baseSpeed,
                    rotation: 0, // Facing up
                    angularVelocity: 0,
                    width: CAR_WIDTH,
                    height: CAR_HEIGHT,
                    image: trafficCarImages.current[TRAFFIC_CAR_TYPES.indexOf(randomType)],
                    isTraffic: true,
                    turnIntent: 'straight', // Start going straight
                    turningStage: null,
                    destinationRotation: undefined,
                });
            }
        };
        loadAssetsAndSetup();
    }, []); // Run once on component mount

    // Keyboard Input Handlers
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        gameState.current.keysPressed[e.key.toLowerCase()] = true;
    }, []);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        gameState.current.keysPressed[e.key.toLowerCase()] = false;
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    // Game Loop
    useEffect(() => {
        if (!isAssetsLoaded) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const gameLoop = (timestamp: DOMHighResTimeStamp) => {
            if (!gameState.current.lastTimestamp) gameState.current.lastTimestamp = timestamp;
            const deltaTime = timestamp - gameState.current.lastTimestamp;
            gameState.current.lastTimestamp = timestamp;

            gameState.current.frameAccumulator += deltaTime;

            // Update game state at a fixed rate (e.g., 60 FPS)
            while (gameState.current.frameAccumulator >= FRAME_TIME) {
                gameState.current = updateGame(gameState.current, FRAME_TIME, trafficCarImages.current);
                gameState.current.frameAccumulator -= FRAME_TIME;
            }

            // --- Rendering ---
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = '#87CEEB'; // Sky background
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Render repeating city grid segments
            const segmentHeight = BLOCK_LENGTH + INTERSECTION_SIZE;
            const segmentWidth = ROAD_SECTION_WIDTH + SIDEWALK_WIDTH * 2;

            // Determine which world segments are currently visible or near visible
            const firstVisibleSegmentY = Math.floor(gameState.current.worldScrollY / segmentHeight) * segmentHeight;
            const firstVisibleSegmentX = Math.floor(gameState.current.worldScrollX / segmentWidth) * segmentWidth;

            // Render multiple segments around the visible area to create infinite scroll illusion
            for (let j = -2; j <= 2; j++) { // Vertical segments
                for (let i = -2; i <= 2; i++) { // Horizontal segments
                    const currentBlockWorldY = firstVisibleSegmentY + j * segmentHeight;
                    const currentBlockWorldX = firstVisibleSegmentX + i * segmentWidth;

                    const renderXOnScreen = currentBlockWorldX - gameState.current.worldScrollX;
                    const renderYOnScreen = currentBlockWorldY - gameState.current.worldScrollY;

                    // Only render if segment is somewhat visible
                    if (renderXOnScreen > -segmentWidth && renderXOnScreen < ctx.canvas.width + segmentWidth &&
                        renderYOnScreen > -segmentHeight && renderYOnScreen < ctx.canvas.height + segmentHeight) {

                        renderCityBlock(ctx, renderXOnScreen, renderYOnScreen, ctx.canvas.width);
                        renderIntersection(ctx, renderXOnScreen, renderYOnScreen + BLOCK_LENGTH, ctx.canvas.width);
                    }
                }
            }

            // Render Traffic Cars
            gameState.current.trafficCars.forEach(car => {
                renderCar(ctx, car, gameState.current.worldScrollX, gameState.current.worldScrollY);
            });

            // Render Traffic Lights
            gameState.current.trafficLights.forEach(light => {
                renderTrafficLight(ctx, light, gameState.current.worldScrollX, gameState.current.worldScrollY);
            });

            // Render Player Car
            // Player car is rendered at its fixed canvas (x,y)
            renderCar(ctx, gameState.current.playerCar, 0, 0);

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        gameLoop(0); // Start the loop

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isAssetsLoaded]); // Rerun effect when assets are loaded

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#2563eb', // Blue background for the page
            fontFamily: 'sans-serif',
            color: 'white',
            overflow: 'hidden' // Prevent scrollbars
        }}>
            <Head>
                <title>404 - Roadblock!</title>
            </Head>
            <h1 style={{ marginBottom: '10px', fontSize: '2.5rem' }}>404 - Roadblock Ahead! 🚦</h1>
            <p style={{ marginBottom: '30px', fontSize: '1.2rem' }}>Looks like this page took a wrong turn. Drive on!</p>

            <canvas
                ref={canvasRef}
                width={500} // Fixed canvas width for game area
                height={700} // Fixed canvas height
                style={{
                    border: '4px solid #333',
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    maxWidth: '90vw', // Responsive width for overall container
                    maxHeight: '80vh', // Responsive height for overall container
                }}
            ></canvas>

            <div style={{ marginTop: '20px', fontSize: '1.1rem', background: 'rgba(0,0,0,0.2)', padding: '15px 25px', borderRadius: '8px' }}>
                <p><strong>Hotkeys:</strong></p>
                <p><strong>W / Arrow Up</strong>: Gas 🚀</p>
                <p><strong>S / Arrow Down</strong>: Brake 🛑</p>
                <p><strong>A / Arrow Left</strong>: Steer Left ⬅️</p>
                <p><strong>D / Arrow Right</strong>: Steer Right ➡️</p>
            </div>
        </div>
    );
};

export default Game;
